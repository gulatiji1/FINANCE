from typing import Any

import requests
from cachetools import TTLCache

from app.core.config import get_settings


class NewsService:
    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.news_api_key
        self._timeout = settings.request_timeout_seconds
        self._cache: TTLCache[str, list[dict[str, Any]]] = TTLCache(
            maxsize=500, ttl=settings.news_cache_ttl_seconds
        )

    def get_company_news(self, company_name: str, symbol: str, limit: int = 6) -> list[dict[str, Any]]:
        cache_key = f"{symbol.strip().upper()}::{limit}"
        cached = self._cache.get(cache_key)
        if cached is not None:
            return cached

        if not self._api_key:
            return []

        query = f'"{company_name}" OR "{symbol.strip().upper()}"'
        endpoint = "https://newsapi.org/v2/everything"
        params = {
            "q": query,
            "language": "en",
            "sortBy": "publishedAt",
            "pageSize": limit,
            "apiKey": self._api_key,
        }

        try:
            response = requests.get(endpoint, params=params, timeout=self._timeout)
            response.raise_for_status()
            payload = response.json()
            items = payload.get("articles", [])
        except Exception:
            items = []

        normalized = [
            {
                "title": item.get("title", "Untitled"),
                "source": (item.get("source") or {}).get("name", "Unknown"),
                "published_at": item.get("publishedAt", ""),
                "url": item.get("url", ""),
                "description": item.get("description"),
            }
            for item in items
            if item.get("title") and item.get("url")
        ]
        self._cache[cache_key] = normalized
        return normalized

