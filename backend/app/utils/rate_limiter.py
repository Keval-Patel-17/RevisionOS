import time
from collections import defaultdict
from typing import Dict, List
from fastapi import Request, HTTPException, status
from ..utils.logger import logger

class InMemoryRateLimiter:
    """
    Sliding-window rate limiter per client IP address.
    Protects compute-intensive AI generation and upload endpoints from abuse.
    """
    def __init__(self):
        # Map: route_key -> IP -> list of timestamps
        self._history: Dict[str, Dict[str, List[float]]] = defaultdict(lambda: defaultdict(list))
        self._last_cleanup = time.time()

    def _cleanup_expired(self, current_time: float, window_seconds: float = 120.0):
        """Periodically purge old IP tracking data to prevent memory growth."""
        if current_time - self._last_cleanup < 60.0:
            return
        self._last_cleanup = current_time
        cutoff = current_time - window_seconds
        for route, ip_map in list(self._history.items()):
            for ip, timestamps in list(ip_map.items()):
                valid = [t for t in timestamps if t > cutoff]
                if valid:
                    ip_map[ip] = valid
                else:
                    del ip_map[ip]
            if not ip_map:
                del self._history[route]

    def check(self, request: Request, max_requests: int, window_seconds: float, route_tag: str):
        # Determine client IP (respecting forward headers if present)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        now = time.time()
        self._cleanup_expired(now, window_seconds * 2)

        cutoff = now - window_seconds
        records = self._history[route_tag][client_ip]
        # Filter timestamps within window
        valid_records = [t for t in records if t > cutoff]
        
        if len(valid_records) >= max_requests:
            retry_after = int(window_seconds - (now - valid_records[0])) + 1
            logger.warning(f"Rate limit exceeded for IP {client_ip} on {route_tag} ({len(valid_records)}/{max_requests})")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Maximum {max_requests} requests per {int(window_seconds)}s allowed. Please retry in {retry_after}s.",
                headers={"Retry-After": str(max(1, retry_after))}
            )

        valid_records.append(now)
        self._history[route_tag][client_ip] = valid_records

rate_limiter = InMemoryRateLimiter()

def rate_limit(max_requests: int = 30, window_seconds: float = 60.0, route_tag: str = "default"):
    """FastAPI Dependency for rate limiting endpoints."""
    async def dependency(request: Request):
        rate_limiter.check(request, max_requests, window_seconds, route_tag)
    return dependency
