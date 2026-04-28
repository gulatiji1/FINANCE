from fastapi import APIRouter, Depends, Query

from app.dependencies import get_ai_service, get_news_service, get_stock_service
from app.schemas.ai import AIInsightsResponse
from app.schemas.analytics import AnalyticsResponse
from app.schemas.company import CompanySearchResponse
from app.schemas.company import CompanyDataResponse
from app.schemas.market import MarketOverviewResponse
from app.schemas.news import NewsResponse
from app.services.ai_service import AIService
from app.services.news_service import NewsService
from app.services.stock_service import StockService
from app.utils.indian_stocks import TOP_INDIAN_STOCKS

router = APIRouter(tags=["company"])


@router.get("/search", response_model=CompanySearchResponse)
def search_company(q: str = Query(..., min_length=1, max_length=40)) -> CompanySearchResponse:
    query = q.strip().lower()
    matches = [
        stock
        for stock in TOP_INDIAN_STOCKS
        if query in stock["symbol"].lower() or query in stock["name"].lower()
    ]
    return CompanySearchResponse(results=matches[:8])


@router.get("/market/overview", response_model=MarketOverviewResponse)
def market_overview(
    limit: int = Query(15, ge=5, le=25),
    stock_service: StockService = Depends(get_stock_service),
) -> MarketOverviewResponse:
    payload = stock_service.get_market_overview(limit=limit)
    return MarketOverviewResponse(**payload)


@router.get("/company/{symbol}", response_model=CompanyDataResponse)
def get_company(symbol: str, stock_service: StockService = Depends(get_stock_service)) -> CompanyDataResponse:
    data = stock_service.get_company_data(symbol)
    return CompanyDataResponse(**data)


@router.get("/company/{symbol}/analytics", response_model=AnalyticsResponse)
def get_analytics(symbol: str, stock_service: StockService = Depends(get_stock_service)) -> AnalyticsResponse:
    analytics = stock_service.get_analytics(symbol)
    return AnalyticsResponse(**analytics)


@router.get("/company/{symbol}/news", response_model=NewsResponse)
def get_company_news(
    symbol: str,
    stock_service: StockService = Depends(get_stock_service),
    news_service: NewsService = Depends(get_news_service),
) -> NewsResponse:
    company = stock_service.get_company_data(symbol)
    overview = company["overview"]
    news_items = news_service.get_company_news(overview["name"], overview["symbol"])
    return NewsResponse(symbol=overview["exchange_symbol"], items=news_items)


@router.get("/company/{symbol}/insights", response_model=AIInsightsResponse)
def get_company_insights(
    symbol: str,
    stock_service: StockService = Depends(get_stock_service),
    news_service: NewsService = Depends(get_news_service),
    ai_service: AIService = Depends(get_ai_service),
) -> AIInsightsResponse:
    company = stock_service.get_company_data(symbol)
    analytics = stock_service.get_analytics(symbol)
    overview = company["overview"]
    news_items = news_service.get_company_news(overview["name"], overview["symbol"])
    insights = ai_service.generate_company_insights(company, analytics, news_items)
    return AIInsightsResponse(symbol=overview["exchange_symbol"], **insights)
