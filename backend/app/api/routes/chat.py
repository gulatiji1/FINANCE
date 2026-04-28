from fastapi import APIRouter, Depends

from app.dependencies import get_ai_service, get_news_service, get_stock_service
from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import AIService
from app.services.news_service import NewsService
from app.services.stock_service import StockService

router = APIRouter(tags=["chat"])


@router.post("/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest,
    stock_service: StockService = Depends(get_stock_service),
    news_service: NewsService = Depends(get_news_service),
    ai_service: AIService = Depends(get_ai_service),
) -> ChatResponse:
    company_data = None
    analytics = None
    news_items = None

    if payload.symbol:
        company_data = stock_service.get_company_data(payload.symbol)
        analytics = stock_service.get_analytics(payload.symbol)
        company_overview = company_data["overview"]
        news_items = news_service.get_company_news(company_overview["name"], company_overview["symbol"])

    response = ai_service.generate_chat_response(
        question=payload.question,
        company_data=company_data,
        analytics=analytics,
        news_items=news_items,
    )
    return ChatResponse(**response)

