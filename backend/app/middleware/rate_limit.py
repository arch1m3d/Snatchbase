"""
Simple rate limiting middleware for FastAPI
"""
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict
import time
from collections import defaultdict
import threading


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Simple in-memory rate limiting middleware.
    For production, consider using Redis-based rate limiting.
    """

    def __init__(self, app, requests_per_minute: int = 100, requests_per_second: int = 10):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests_per_second = requests_per_second

        # In-memory storage: {ip_address: [(timestamp, count)]}
        self.request_counts: Dict[str, list] = defaultdict(list)
        self.lock = threading.Lock()

    async def dispatch(self, request: Request, call_next):
        # Skip rate limiting for health check endpoint
        if request.url.path in ["/health", "/", "/docs", "/openapi.json"]:
            return await call_next(request)

        # Get client IP
        client_ip = request.client.host if request.client else "unknown"

        current_time = time.time()

        with self.lock:
            # Clean old entries (older than 60 seconds)
            if client_ip in self.request_counts:
                self.request_counts[client_ip] = [
                    (ts, count) for ts, count in self.request_counts[client_ip]
                    if current_time - ts < 60
                ]

            # Count requests in the last minute
            minute_requests = sum(
                count for ts, count in self.request_counts[client_ip]
                if current_time - ts < 60
            )

            # Count requests in the last second
            second_requests = sum(
                count for ts, count in self.request_counts[client_ip]
                if current_time - ts < 1
            )

            # Check rate limits
            if minute_requests >= self.requests_per_minute:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded: {self.requests_per_minute} requests per minute"
                )

            if second_requests >= self.requests_per_second:
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limit exceeded: {self.requests_per_second} requests per second"
                )

            # Record this request
            self.request_counts[client_ip].append((current_time, 1))

        # Process the request
        response = await call_next(request)

        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.requests_per_minute)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.requests_per_minute - minute_requests - 1)
        )

        return response
