import math
from datetime import datetime
from typing import Any

import pandas as pd
import yfinance as yf
from cachetools import TTLCache

from app.core.config import get_settings
from app.core.errors import AppError
from app.utils.symbols import build_symbol_candidates


def _safe_float(value: Any) -> float | None:
    if value is None:
        return None
    try:
        parsed = float(value)
        if math.isnan(parsed):
            return None
        return parsed
    except (TypeError, ValueError):
        return None


def _safe_int(value: Any) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class StockService:
    def __init__(self) -> None:
        settings = get_settings()
        self._resolve_cache: TTLCache[str, str] = TTLCache(maxsize=500, ttl=settings.stock_cache_ttl_seconds)
        self._company_cache: TTLCache[str, dict[str, Any]] = TTLCache(maxsize=500, ttl=settings.stock_cache_ttl_seconds)
        self._analytics_cache: TTLCache[str, dict[str, Any]] = TTLCache(maxsize=500, ttl=settings.stock_cache_ttl_seconds)

    @staticmethod
    def _extract_ceo(info: dict[str, Any]) -> str | None:
        officers = info.get("companyOfficers") or []
        for officer in officers:
            title = str(officer.get("title", "")).lower()
            if "ceo" in title:
                return officer.get("name")
        return None

    @staticmethod
    def _resolve_history(ticker: yf.Ticker) -> pd.DataFrame:
        history = ticker.history(period="5d", interval="1d", auto_adjust=False)
        if history is None or history.empty:
            return pd.DataFrame()
        return history

    def resolve_symbol(self, symbol: str) -> str:
        normalized = symbol.strip().upper()
        if not normalized:
            raise AppError("Symbol is required", status_code=422)

        cached = self._resolve_cache.get(normalized)
        if cached:
            return cached

        for candidate in build_symbol_candidates(normalized):
            ticker = yf.Ticker(candidate)
            try:
                history = self._resolve_history(ticker)
            except Exception:
                history = pd.DataFrame()
            if not history.empty:
                self._resolve_cache[normalized] = candidate
                return candidate

        raise AppError(f"Could not find data for symbol '{symbol}'", status_code=404)

    def _get_ticker_info(self, resolved_symbol: str) -> dict[str, Any]:
        ticker = yf.Ticker(resolved_symbol)
        try:
            info = ticker.info or {}
        except Exception:
            info = {}
        return info

    def _build_chart_data(self, history: pd.DataFrame) -> list[dict[str, Any]]:
        chart_data: list[dict[str, Any]] = []
        for index, row in history.iterrows():
            date_value = index
            if isinstance(date_value, datetime):
                date_key = date_value.strftime("%Y-%m-%d")
            else:
                date_key = str(date_value).split(" ")[0]
            chart_data.append(
                {
                    "date": date_key,
                    "open": _safe_float(row["Open"]) or 0.0,
                    "high": _safe_float(row["High"]) or 0.0,
                    "low": _safe_float(row["Low"]) or 0.0,
                    "close": _safe_float(row["Close"]) or 0.0,
                    "volume": _safe_int(row["Volume"]) or 0,
                }
            )
        return chart_data

    def get_company_data(self, symbol: str, period: str = "1y") -> dict[str, Any]:
        cache_key = f"{symbol.strip().upper()}::{period}"
        cached = self._company_cache.get(cache_key)
        if cached:
            return cached

        resolved_symbol = self.resolve_symbol(symbol)
        ticker = yf.Ticker(resolved_symbol)
        try:
            history = ticker.history(period=period, interval="1d", auto_adjust=False)
        except Exception as exc:
            raise AppError(f"Could not fetch market data for '{resolved_symbol}': {exc}", status_code=502) from exc
        if history is None or history.empty:
            raise AppError(f"No historical data for '{resolved_symbol}'", status_code=404)

        info = self._get_ticker_info(resolved_symbol)
        fast_info = getattr(ticker, "fast_info", {}) or {}
        market_cap = _safe_float(info.get("marketCap")) or _safe_float(fast_info.get("market_cap"))
        company_name = info.get("longName") or info.get("shortName") or symbol.upper()
        ceo = self._extract_ceo(info)

        result = {
            "overview": {
                "symbol": symbol.strip().upper(),
                "exchange_symbol": resolved_symbol,
                "name": company_name,
                "sector": info.get("sector"),
                "market_cap": market_cap,
                "ceo": ceo,
                "description": info.get("longBusinessSummary"),
            },
            "chart_data": self._build_chart_data(history),
            "key_stats": {
                "current_price": _safe_float(info.get("currentPrice")) or _safe_float(fast_info.get("last_price")),
                "previous_close": _safe_float(info.get("previousClose")) or _safe_float(fast_info.get("previous_close")),
                "day_high": _safe_float(info.get("dayHigh")),
                "day_low": _safe_float(info.get("dayLow")),
                "fifty_two_week_high": _safe_float(info.get("fiftyTwoWeekHigh")),
                "fifty_two_week_low": _safe_float(info.get("fiftyTwoWeekLow")),
                "trailing_pe": _safe_float(info.get("trailingPE")),
                "beta": _safe_float(info.get("beta")),
                "revenue": _safe_float(info.get("totalRevenue")),
                "profit_margin": _safe_float(info.get("profitMargins")),
                "roe": _safe_float(info.get("returnOnEquity")),
                "average_volume": _safe_int(info.get("averageVolume")),
            },
        }
        self._company_cache[cache_key] = result
        return result

    @staticmethod
    def _window_return(close: pd.Series, days: int) -> float | None:
        if len(close) <= days:
            return None
        start = close.iloc[-days - 1]
        end = close.iloc[-1]
        if start == 0:
            return None
        return ((end - start) / start) * 100

    def get_analytics(self, symbol: str) -> dict[str, Any]:
        cache_key = symbol.strip().upper()
        cached = self._analytics_cache.get(cache_key)
        if cached:
            return cached

        company_data = self.get_company_data(symbol, period="1y")
        frame = pd.DataFrame(company_data["chart_data"])
        if frame.empty:
            raise AppError("Insufficient price data to compute analytics", status_code=422)

        close = frame["close"]
        daily_returns = close.pct_change().dropna()

        total_return = None
        if len(close) > 1 and close.iloc[0] != 0:
            total_return = ((close.iloc[-1] - close.iloc[0]) / close.iloc[0]) * 100

        volatility = None
        if not daily_returns.empty:
            volatility = float(daily_returns.std() * math.sqrt(252) * 100)

        ma20 = _safe_float(close.rolling(window=20).mean().iloc[-1]) if len(close) >= 20 else None
        ma50 = _safe_float(close.rolling(window=50).mean().iloc[-1]) if len(close) >= 50 else None
        ma200 = _safe_float(close.rolling(window=200).mean().iloc[-1]) if len(close) >= 200 else None

        latest_close = _safe_float(close.iloc[-1])
        trend = "Sideways"
        if ma20 is not None and ma50 is not None and latest_close is not None:
            if ma20 > ma50 and latest_close > ma20:
                trend = "Bullish"
            elif ma20 < ma50 and latest_close < ma20:
                trend = "Bearish"

        payload = {
            "returns": _safe_float(total_return),
            "volatility": _safe_float(volatility),
            "trend": trend,
            "moving_averages": {"ma20": ma20, "ma50": ma50, "ma200": ma200},
            "performance": {
                "one_month": _safe_float(self._window_return(close, 21)),
                "three_month": _safe_float(self._window_return(close, 63)),
                "one_year": _safe_float(self._window_return(close, 252)),
            },
        }
        self._analytics_cache[cache_key] = payload
        return payload

    def get_compare_snapshot(self, symbol: str) -> dict[str, Any]:
        company_data = self.get_company_data(symbol, period="1y")
        analytics = self.get_analytics(symbol)
        key_stats = company_data["key_stats"]
        overview = company_data["overview"]

        return {
            "symbol": overview["exchange_symbol"],
            "name": overview["name"],
            "market_cap": overview.get("market_cap"),
            "revenue": key_stats.get("revenue"),
            "profit_margin": key_stats.get("profit_margin"),
            "roe": key_stats.get("roe"),
            "one_year_return": analytics["performance"]["one_year"],
        }
