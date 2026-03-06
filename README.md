# QH Liquidity Terminal - Local Setup Guide

This guide will help you set up the application locally or on Vercel.

## Prerequisites

- Node.js 18+
- A FRED API Key (for economic data)

## Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

```env
# FRED API Key: Get one at https://fred.stlouisfed.org/docs/api/api_key.html
FRED_API_KEY="your_fred_api_key"
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment on Vercel

1. Push your code to a GitHub repository.
2. Import the project into Vercel.
3. In the "Environment Variables" section of the project settings, add:
   - `FRED_API_KEY`
4. Deploy!

## Troubleshooting

### Chart Width/Height Warning
This is a known warning from Recharts when the container is still calculating its size. It does not affect the functionality of the app.
