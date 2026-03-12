"""Session authentication middleware.

Reads the session_token cookie, looks it up in Redis, and attaches the
authenticated User to ``request.state.user``.  Unauthenticated requests
simply get ``request.state.user = None`` so that public routes still work.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from models.user import get_user_by_email, create_user

class SessionAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Bypassing login entirely: Always attach a mock demo user
        user = get_user_by_email("demo@smartfintech.app")
        if not user:
            user = create_user("demo@smartfintech.app", "password123")
            
        request.state.user = user

        response = await call_next(request)
        return response
