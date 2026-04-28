from functools import lru_cache

from app.services.ai_service import AIService
from app.services.news_service import NewsService
from app.services.stock_service import StockService


@lru_cache
def get_stock_service() -> StockService:
    return StockService()


@lru_cache
def get_news_service() -> NewsService:
    return NewsService()


@lru_cache
def get_ai_service() -> AIService:
    return AIService()

