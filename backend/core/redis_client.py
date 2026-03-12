import redis.asyncio as aioredis
from core.config import settings
import logging

logger = logging.getLogger(__name__)

class MockRedis:
    """A minimal in-memory mockup of Redis and aioredis functionality."""
    def __init__(self):
        self.data = {}
    
    async def get(self, key):
        return self.data.get(key)
    
    async def set(self, key, value, ex=None):
        self.data[key] = value
        return True
    
    async def delete(self, key):
        if key in self.data:
            del self.data[key]
        return True
        
    async def exists(self, key):
        return key in self.data

    async def close(self):
        pass

_redis_client = None

async def get_redis():
    """Return a shared async Redis connection with in-memory fallback."""
    global _redis_client
    if _redis_client is None:
        try:
            client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_timeout=2.0
            )
            # Ping to verify connection
            await client.ping()
            _redis_client = client
            logger.info("Successfully connected to Redis server.")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis ({e}). Falling back to In-Memory storage.")
            _redis_client = MockRedis()
            
    return _redis_client

async def close_redis():
    """Close the Redis connection on shutdown."""
    global _redis_client
    if _redis_client is not None:
        await _redis_client.close()
        _redis_client = None
