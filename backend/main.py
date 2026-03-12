from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from core.redis_client import close_redis
from api.ai_routes import router as ai_router
from api.trading_routes import router as trading_router
from api.learning_routes import router as learning_router
from api.auth_routes import router as auth_router
from api.market_routes import router as market_router
from api.analytics_routes import router as analytics_router
from middleware.auth_middleware import SessionAuthMiddleware
from models.market import start_market_updater


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    start_market_updater()
    yield
    # Shutdown
    await close_redis()


app = FastAPI(
    title="Smart FinTech Assistant API",
    description="AI-powered financial assistant backend with paper trading, portfolio analytics, and learning modules.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session authentication middleware (runs after CORS)
app.add_middleware(SessionAuthMiddleware)

app.include_router(auth_router)
app.include_router(ai_router)
app.include_router(trading_router)
app.include_router(learning_router)
app.include_router(market_router)
app.include_router(analytics_router)


@app.get("/")
async def root():
    return {"message": "Smart FinTech Assistant API", "status": "running"}


@app.get("/api/health")
async def health():
    return {"status": "healthy"}
