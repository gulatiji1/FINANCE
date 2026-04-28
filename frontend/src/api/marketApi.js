import client from "./client";

export async function searchCompanies(query) {
  const { data } = await client.get("/search", { params: { q: query } });
  return data.results || [];
}

export async function getCompany(symbol) {
  const { data } = await client.get(`/company/${symbol}`);
  return data;
}

export async function getAnalytics(symbol) {
  const { data } = await client.get(`/company/${symbol}/analytics`);
  return data;
}

export async function getInsights(symbol) {
  const { data } = await client.get(`/company/${symbol}/insights`);
  return data;
}

export async function getNews(symbol) {
  const { data } = await client.get(`/company/${symbol}/news`);
  return data.items || [];
}

export async function compareCompanies(symbol1, symbol2) {
  const { data } = await client.get("/compare", { params: { symbol1, symbol2 } });
  return data;
}

export async function askChat(question, symbol) {
  const { data } = await client.post("/chat", { question, symbol: symbol || null });
  return data;
}

