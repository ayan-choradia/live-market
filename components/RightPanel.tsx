'use client';

import { useEffect, useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import axios from 'axios';

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

interface SpeakerNews {
  title: string;
  pubDate: string;
  sentiment: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
}

export default function RightPanel() {
  const [news, setNews] = useState<SpeakerNews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await axios.get('/api/rss');
        const parser = new DOMParser();
        const xml = parser.parseFromString(res.data, 'text/xml');
        const items = Array.from(xml.querySelectorAll('item')).slice(0, 5);
        
        const parsedItems = items.map(item => ({
          title: item.querySelector('title')?.textContent || '',
          pubDate: item.querySelector('pubDate')?.textContent || '',
        }));

        // Use Gemini to analyze sentiment
        const prompt = `Analyze the following Federal Reserve press release headlines and classify their sentiment regarding monetary policy as HAWKISH, DOVISH, or NEUTRAL.
        
        Headlines:
        ${parsedItems.map((item, i) => `${i + 1}. ${item.title}`).join('\n')}
        `;

        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sentiment: {
                    type: Type.STRING,
                    description: "HAWKISH, DOVISH, or NEUTRAL"
                  }
                }
              }
            }
          }
        });

        const sentiments = JSON.parse(response.text || '[]');
        
        const newsWithSentiment = parsedItems.map((item, i) => ({
          ...item,
          sentiment: sentiments[i]?.sentiment || 'NEUTRAL'
        }));

        setNews(newsWithSentiment);
      } catch (err) {
        console.error('Failed to fetch news', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="w-80 bg-zinc-950 border-l border-zinc-800 flex flex-col overflow-y-auto shrink-0">
      {/* CME FedWatch */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">CME FEDWATCH PROBABILITIES</h2>
        <div className="space-y-3 mt-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300">Next Meeting (Cut)</span>
              <span className="text-emerald-400">75%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full" style={{ width: '75%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300">Next Meeting (Hold)</span>
              <span className="text-yellow-400">25%</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded overflow-hidden">
              <div className="bg-yellow-500 h-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* FOMC Countdown */}
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">NEXT FOMC MEETING</h2>
        <div className="text-2xl font-bold text-zinc-200 mt-2">
          14D 08H 45M
        </div>
        <div className="text-xs text-zinc-500 mt-1">March 19-20, 2026</div>
      </div>

      {/* Fed Speakers */}
      <div className="p-4">
        <h2 className="text-zinc-500 text-xs font-bold mb-2">FED SPEAKERS FEED</h2>
        <div className="space-y-4 mt-4">
          {loading ? (
            <div className="text-xs text-zinc-500 animate-pulse">Analyzing sentiment...</div>
          ) : (
            news.map((item, i) => (
              <div key={i} className={`border-l-2 pl-3 ${item.sentiment === 'HAWKISH' ? 'border-red-500' : item.sentiment === 'DOVISH' ? 'border-emerald-500' : 'border-zinc-500'}`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs font-bold ${item.sentiment === 'HAWKISH' ? 'text-red-400' : item.sentiment === 'DOVISH' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {item.sentiment === 'HAWKISH' ? '🦅 HAWKISH' : item.sentiment === 'DOVISH' ? '🕊️ DOVISH' : '⚖️ NEUTRAL'}
                  </span>
                  <span className="text-xs text-zinc-500">{new Date(item.pubDate).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-zinc-300">{item.title}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
