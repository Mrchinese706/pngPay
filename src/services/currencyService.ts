// Frankfurter.app is a free, open-source exchange rate API with no key required.
// Docs: https://www.frankfurter.app/docs/
// PGK (Papua New Guinean Kina) is supported as a base currency.

export type ExchangeRates = {
  aud: number;
  usd: number;
};

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=PGK&to=AUD,USD', {
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Exchange rate API error: ${res.status}`);
    const json = await res.json();
    return {
      aud: json.rates.AUD as number,
      usd: json.rates.USD as number,
    };
  } finally {
    clearTimeout(timeout);
  }
}
