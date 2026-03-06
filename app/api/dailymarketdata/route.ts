import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Ignore SSL certificate errors globally for this route
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const qhcode = searchParams.get('qhcode');

    const authHeader = request.headers.get('Authorization');

    const targetUrl = new URL('https://qh-api.corp.hertshtengroup.com/api/dailymarketdata/');
    if (limit) targetUrl.searchParams.append('limit', limit);
    if (qhcode) targetUrl.searchParams.append('qhcode', qhcode);

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
    console.error('API Route DailyMarketData Error:', error);
    return NextResponse.json(
      { detail: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
