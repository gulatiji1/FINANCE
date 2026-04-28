from fastapi import APIRouter, Depends, Query

from app.dependencies import get_ai_service, get_stock_service
from app.schemas.compare import CompareResponse
from app.services.ai_service import AIService
from app.services.stock_service import StockService

router = APIRouter(tags=["compare"])


@router.get("/compare", response_model=CompareResponse)
def compare_companies(
    symbol1: str = Query(..., min_length=1),
    symbol2: str = Query(..., min_length=1),
    stock_service: StockService = Depends(get_stock_service),
    ai_service: AIService = Depends(get_ai_service),
) -> CompareResponse:
    left = stock_service.get_compare_snapshot(symbol1)
    right = stock_service.get_compare_snapshot(symbol2)
    ai_summary = ai_service.generate_comparison_insights(left, right)
    return CompareResponse(left=left, right=right, ai=ai_summary)

