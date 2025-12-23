import threading
import time
from typing import Optional, Dict, Any

class LockService:
    def __init__(self, ttl_seconds: int = 300):
        self._locks: Dict[str, Dict[str, Any]] = {}
        self._ttl = ttl_seconds
        self._lock = threading.Lock()

    def _cleanup(self):
        now = time.time()
        keys = list(self._locks.keys())
        for k in keys:
            info = self._locks.get(k)
            if not info:
                continue
            if info.get('expires_at', 0) <= now:
                del self._locks[k]

    def acquire(self, resource_id: str, locker: Dict[str, Any]) -> Dict[str, Any]:
        with self._lock:
            self._cleanup()
            info = self._locks.get(resource_id)
            now = time.time()
            if info and info.get('expires_at', 0) > now:
                # ya está bloqueado
                return {'ok': False, 'lockedBy': info.get('lockedBy')}
            expires_at = now + self._ttl
            self._locks[resource_id] = {
                'lockedBy': locker,
                'locked_at': now,
                'expires_at': expires_at
            }
            return {'ok': True, 'lockedBy': locker}

    def release(self, resource_id: str, locker_id: Optional[Any] = None) -> bool:
        with self._lock:
            info = self._locks.get(resource_id)
            if not info:
                return True
            # Si se proporciona locker_id, asegúrese de que solo el casillero pueda liberarse.
            if locker_id is not None and str(info.get('lockedBy', {}).get('id')) != str(locker_id):
                return False
            del self._locks[resource_id]
            return True

    def status(self, resource_id: str) -> Dict[str, Any]:
        with self._lock:
            self._cleanup()
            info = self._locks.get(resource_id)
            if not info:
                return {'locked': False}
            return {'locked': True, 'lockedBy': info.get('lockedBy'), 'lockedAt': info.get('locked_at')}


# singleton
_instance: Optional[LockService] = None

def get_lock_service() -> LockService:
    global _instance
    if _instance is None:
        _instance = LockService()
    return _instance
