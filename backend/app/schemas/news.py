from pydantic import BaseModel


class NewsItem(BaseModel):
    title: str
    source: str
    published_at: str
    url: str
    description: str | None = None


class NewsResponse(BaseModel):
    symbol: str
    items: list[NewsItem]

