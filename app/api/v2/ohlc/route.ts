import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Ignore SSL certificate errors globally for this route
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const { searchParams } = new URL(request.url);
    const instruments = searchParams.get('instruments');
    const interval = searchParams.get('interval');
    const count = searchParams.get('count');
    const end = searchParams.get('end');
    const start = searchParams.get('start');

    const authHeader = request.headers.get('Authorization');

    const targetUrl = new URL('https://qh-api.corp.hertshtengroup.com/api/v2/ohlc/');
    if (instruments) targetUrl.searchParams.append('instruments', instruments);
    if (interval) targetUrl.searchParams.append('interval', interval);
    if (count) targetUrl.searchParams.append('count', count);
    if (end) targetUrl.searchParams.append('end', end);
    if (start) targetUrl.searchParams.append('start', start);

    const res = await fetch(targetUrl.toString(), {
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {})
      },
      cache: 'no-store'
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        data || { detail: `API Error: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Route OHLC Error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
