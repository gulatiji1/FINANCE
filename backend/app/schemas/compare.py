from pydantic import BaseModel

from app.schemas.ai import ComparisonInsights


class CompanyCompareSnapshot(BaseModel):
    symbol: str
    name: str
    market_cap: float | None = None
    revenue: float | None = None
    profit_margin: float | None = None
    roe: float | None = None
    one_year_return: float | None = None


class CompareResponse(BaseModel):
    left: CompanyCompareSnapshot
    right: CompanyCompareSnapshot
    ai: ComparisonInsights

