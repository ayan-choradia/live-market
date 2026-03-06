import axios from 'axios';

const FRED_API_KEY = process.env.NEXT_PUBLIC_FRED_API_KEY;

export const fetchFredData = async (seriesId: string) => {
  if (!FRED_API_KEY) {
    // Return mock data if no key
    return mockFredData(seriesId);
  }

  try {
    const res = await axios.get(`https://api.stlouisfed.org/fred/series/observations`, {
      params: {
        series_id: seriesId,
        api_key: FRED_API_KEY,
        file_type: 'json',
        sort_order: 'desc',
        limit: 30
      }
    });
    return res.data.observations;
  } catch (err) {
    console.error('FRED API Error', err);
    return mockFredData(seriesId);
  }
};

const mockFredData = (seriesId: string) => {
  const data = [];
  let val = seriesId === 'WALCL' ? 7000000 : seriesId === 'RRPONTSYD' ? 500000 : 5;
  for (let i = 0; i < 30; i++) {
    data.push({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: String(val)
    });
    val += (Math.random() - 0.5) * (val * 0.01);
  }
  return data;
};
