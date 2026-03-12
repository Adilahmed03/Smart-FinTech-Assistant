"""In-memory user store (replace with a real DB in production)."""

import hashlib
import os
import uuid


class User:
    """Simple user model."""

    def __init__(self, email: str, password_hash: str, user_id: str | None = None):
        self.id: str = user_id or uuid.uuid4().hex
        self.email: str = email
        self.password_hash: str = password_hash

    def to_dict(self) -> dict:
        return {"id": self.id, "email": self.email}


# ---------------------------------------------------------------------------
# Password hashing helpers (SHA-256 + salt – swap for bcrypt in production)
# ---------------------------------------------------------------------------

def hash_password(password: str) -> str:
    salt = os.urandom(16).hex()
    hashed = hashlib.sha256(f"{salt}{password}".encode()).hexdigest()
    return f"{salt}${hashed}"


def verify_password(password: str, stored_hash: str) -> bool:
    salt, hashed = stored_hash.split("$", 1)
    return hashlib.sha256(f"{salt}{password}".encode()).hexdigest() == hashed


# ---------------------------------------------------------------------------
# In-memory store  (dict keyed by email)
# ---------------------------------------------------------------------------

_users: dict[str, User] = {}


def create_user(email: str, password: str) -> User | None:
    """Create a new user. Returns None if email already taken."""
    if email in _users:
        return None
    user = User(email=email, password_hash=hash_password(password))
    _users[email] = user
    return user


def get_user_by_email(email: str) -> User | None:
    return _users.get(email)


def get_user_by_id(user_id: str) -> User | None:
    for user in _users.values():
        if user.id == user_id:
            return user
    return None
