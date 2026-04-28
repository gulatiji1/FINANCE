# India Equity AI (NSE/BSE Research Platform)

A modern, responsive, AI-powered financial web app to explore and analyze Indian equities with:

- Real-time market data from `yfinance`
- News context from `NewsAPI`
- AI-generated insights and chat with `Google Gemini`
- FastAPI backend + React frontend

## Features

- Search and explore NSE/BSE stocks
- Company dashboard with:
  - Overview (sector, market cap, leadership, description)
  - Historical chart and volume
  - Returns, volatility, moving averages, trend
  - AI insights: summary, growth, risks, investment insight
  - Latest related news headlines
- Company comparison page:
  - Revenue, margins, ROE, market cap, performance
  - AI comparison summary with key differences
- AI chatbot:
  - Company-specific and general stock questions
  - Structured responses: `Summary`, `Growth`, `Risks`, `Insight`

## Project Structure

```text
backend/
  app/
    api/routes/
      chat.py
      compare.py
      company.py
    core/
      config.py
      errors.py
    schemas/
    services/
      ai_service.py
      news_service.py
      stock_service.py
    utils/
frontend/
  src/
    api/
    components/
    pages/
    styles/
```

## Backend Setup (FastAPI)

1. Create environment file from template:

```bash
cd backend
copy .env.example .env
```

2. Fill keys in `.env`:

- `NEWS_API_KEY`
- `GEMINI_API_KEY`

3. Install and run:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Frontend Setup (React + Vite)

1. Create environment file:

```bash
cd frontend
copy .env.example .env
```

2. Install and run:

```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:5173` and calls backend at `http://localhost:8000/api` by default.

## API Endpoints

- `GET /api/search?q=RELIANCE`
- `GET /api/company/{symbol}`
- `GET /api/company/{symbol}/analytics`
- `GET /api/company/{symbol}/news`
- `GET /api/company/{symbol}/insights`
- `GET /api/compare?symbol1=TCS&symbol2=INFY`
- `POST /api/chat`

## Notes on Reliability

- In-memory TTL caching reduces repeated external API calls and helps with rate limits.
- If NewsAPI or Gemini keys are missing/unavailable:
  - News returns empty list safely.
  - AI routes return structured fallback insights.
- Symbol resolution supports NSE/BSE suffix handling:
  - Automatically tests `.NS`, `.BO`, and raw symbols.
