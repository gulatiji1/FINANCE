from pydantic import BaseModel


class PerformanceWindow(BaseModel):
    one_month: float | None = None
    three_month: float | None = None
    one_year: float | None = None


class MovingAverages(BaseModel):
    ma20: float | None = None
    ma50: float | None = None
    ma200: float | None = None


class AnalyticsResponse(BaseModel):
    returns: float | None = None
    volatility: float | None = None
    trend: str
    moving_averages: MovingAverages
    performance: PerformanceWindow

