import time
from enum import Enum
from typing import Callable, Any, Optional, Dict
import threading

class CircuitState(str, Enum):
    CLOSED = "CLOSED"      # Normal operations: requests flow through
    OPEN = "OPEN"          # Tripped: requests fail fast to fallback
    HALF_OPEN = "HALF_OPEN" # Testing: limited requests allowed to probe recovery

class CircuitBreakerOpenException(Exception):
    """Raised when an operation is attempted while the circuit is OPEN."""
    pass

class ClinicalCircuitBreaker:
    """
    Production-grade Circuit Breaker protecting medical and clinical LLM workflows
    against upstream API outages, rate limits (HTTP 429), and repetitive safety failures.
    Enforces immediate deterministic fail-safe responses when tripped.
    """

    def __init__(
        self,
        name: str = "ClinicalSafetyCircuitBreaker",
        failure_threshold: int = 3,
        recovery_timeout_seconds: float = 30.0,
        half_open_success_threshold: int = 2,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.recovery_timeout_seconds = recovery_timeout_seconds
        self.half_open_success_threshold = half_open_success_threshold

        self._state = CircuitState.CLOSED
        self._failure_count = 0
        self._consecutive_successes = 0
        self._last_failure_time: Optional[float] = None
        self._last_state_change: float = time.time()
        self._last_failure_reason: Optional[str] = None
        self._lock = threading.Lock()

    @property
    def state(self) -> CircuitState:
        with self._lock:
            if self._state == CircuitState.OPEN:
                if self._last_failure_time and (time.time() - self._last_failure_time) >= self.recovery_timeout_seconds:
                    self._state = CircuitState.HALF_OPEN
                    self._consecutive_successes = 0
                    self._last_state_change = time.time()
            return self._state

    def can_execute(self) -> bool:
        current_state = self.state
        return current_state in (CircuitState.CLOSED, CircuitState.HALF_OPEN)

    def record_success(self) -> None:
        with self._lock:
            if self._state == CircuitState.HALF_OPEN:
                self._consecutive_successes += 1
                if self._consecutive_successes >= self.half_open_success_threshold:
                    self._state = CircuitState.CLOSED
                    self._failure_count = 0
                    self._consecutive_successes = 0
                    self._last_state_change = time.time()
                    self._last_failure_reason = None
            elif self._state == CircuitState.CLOSED:
                self._failure_count = 0

    def record_failure(self, reason: str = "Unspecified failure") -> None:
        with self._lock:
            self._failure_count += 1
            self._last_failure_time = time.time()
            self._last_failure_reason = reason

            if self._state in (CircuitState.CLOSED, CircuitState.HALF_OPEN) and self._failure_count >= self.failure_threshold:
                self._state = CircuitState.OPEN
                self._last_state_change = time.time()

    def trip(self, reason: str = "Manual trip") -> None:
        """Manually force open the circuit breaker (e.g. critical safety red-line triggered)."""
        with self._lock:
            self._state = CircuitState.OPEN
            self._failure_count = self.failure_threshold
            self._last_failure_time = time.time()
            self._last_failure_reason = reason
            self._last_state_change = time.time()

    def reset(self) -> None:
        """Reset the circuit breaker to clean CLOSED state."""
        with self._lock:
            self._state = CircuitState.CLOSED
            self._failure_count = 0
            self._consecutive_successes = 0
            self._last_failure_time = None
            self._last_failure_reason = None
            self._last_state_change = time.time()

    def execute(self, func: Callable, *args, **kwargs) -> Any:
        """
        Executes a callable under circuit breaker protection.
        Raises CircuitBreakerOpenException if the circuit is OPEN.
        """
        if not self.can_execute():
            raise CircuitBreakerOpenException(
                f"Circuit breaker '{self.name}' is OPEN. Requests blocked to protect clinical safety."
            )
        try:
            result = func(*args, **kwargs)
            self.record_success()
            return result
        except Exception as e:
            self.record_failure(str(e))
            raise

    def get_fallback_response(self, query: str = "") -> str:
        """
        Returns a deterministic, clinically safe fallback response when circuit is tripped.
        """
        return (
            "⚠️ **Clinical Service Notice**: The autonomous AI triage service is temporarily "
            "operating under safety fallback mode due to circuit protection. "
            "If you have acute or worsening symptoms, please contact emergency services (911 / 112) "
            "or report immediately to your nearest emergency department or urgent care center."
        )

    def get_status(self) -> Dict[str, Any]:
        current = self.state
        return {
            "name": self.name,
            "state": current.value,
            "failure_count": self._failure_count,
            "failure_threshold": self.failure_threshold,
            "recovery_timeout_seconds": self.recovery_timeout_seconds,
            "last_failure_reason": self._last_failure_reason,
            "healthy": current == CircuitState.CLOSED,
        }

_clinical_circuit_breaker: Optional[ClinicalCircuitBreaker] = None

def get_circuit_breaker() -> ClinicalCircuitBreaker:
    global _clinical_circuit_breaker
    if _clinical_circuit_breaker is None:
        _clinical_circuit_breaker = ClinicalCircuitBreaker()
    return _clinical_circuit_breaker
