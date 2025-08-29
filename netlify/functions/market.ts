const handler = async (event: any) => {
  try {
    const symbol = event.queryStringParameters?.symbol?.toUpperCase();
    if (!symbol) {
      return { statusCode: 400, body: JSON.stringify({ ok: false, error: "symbol_required" }) };
    }

    const apiKey = process.env.ALPHA_VANTAGE_KEY;
    if (!apiKey) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: false, provider: "alphavantage", configured: false, message: "Missing ALPHA_VANTAGE_KEY" })
      };
    }

    const avSymbol = symbol.includes(".") ? symbol : `${symbol}.BSE`;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(avSymbol)}&apikey=${apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify({ ok: false, error: "fetch_failed" }) };
    }
    const data = await res.json();
    const quote = (data && (data["Global Quote"] || data["GlobalQuote"])) || null;

    if (!quote) {
      return { statusCode: 200, body: JSON.stringify({ ok: false, provider: "alphavantage", configured: true, message: "no_quote" }) };
    }

    const price = Number(quote["05. price"]) || Number(quote["05.price"]) || Number(quote.price) || 0;
    const change = Number(quote["09. change"]) || Number(quote["09.change"]) || Number(quote.change) || 0;
    const changePercentStr = (quote["10. change percent"] || quote["10.change percent"] || quote.change_percent || "0").toString();
    const changePercent = Number(changePercentStr.replace(/%/g, "")) || 0;

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, symbol, price, change, changePercent, lastUpdate: Date.now() })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: "server_error" }) };
  }
};

export { handler };
