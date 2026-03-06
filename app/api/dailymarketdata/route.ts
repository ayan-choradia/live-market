import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const qhcode = searchParams.get('qhcode');

    const authHeader = request.headers.get('Authorization');

    // Create an HTTPS agent that ignores SSL certificate errors (equivalent to verify=False in Python)
    const httpsAgent = new https.Agent({
      rejectUnauthorized: false,
    });

    const res = await axios.get('https://qh-api.corp.hertshtengroup.com/api/dailymarketdata/', {
      params: {
        limit,
        qhcode
      },
      headers: {
        Authorization: authHeader
      },
      httpsAgent
    });

    return NextResponse.json(res.data);
  } catch (error: any) {
    console.error('API Route DailyMarketData Error:', error.response?.data || error.message);
    
    if (error.response) {
      return NextResponse.json(
        error.response.data,
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { detail: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
