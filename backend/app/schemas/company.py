from pydantic import BaseModel, Field


class CompanyOverview(BaseModel):
    symbol: str
    exchange_symbol: str
    name: str
    sector: str | None = None
    market_cap: float | None = None
    ceo: str | None = None
    description: str | None = None


class ChartPoint(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class CompanyDataResponse(BaseModel):
    overview: CompanyOverview
    chart_data: list[ChartPoint]
    key_stats: dict[str, float | str | None]


class CompanySearchItem(BaseModel):
    symbol: str
    name: str
    sector: str | None = None


class CompanySearchResponse(BaseModel):
    results: list[CompanySearchItem] = Field(default_factory=list)

