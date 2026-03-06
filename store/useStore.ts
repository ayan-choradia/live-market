import { create } from 'zustand';

interface AppState {
  qhToken: string | null;
  setQhToken: (token: string | null) => void;
  selectedProduct: string;
  setSelectedProduct: (product: string) => void;
  interval: string;
  setInterval: (interval: string) => void;
  liquidityScore: number;
  setLiquidityScore: (score: number) => void;
  fedRate: number | null;
  setFedRate: (rate: number | null) => void;
  rrpBalance: number | null;
  setRrpBalance: (balance: number | null) => void;
  sofrRate: number | null;
  setSofrRate: (rate: number | null) => void;
  qtMode: 'QT' | 'QE' | null;
  setQtMode: (mode: 'QT' | 'QE' | null) => void;
}

export const useStore = create<AppState>((set) => ({
  qhToken: process.env.NEXT_PUBLIC_QH_API_TOKEN || 'your_token',
  setQhToken: (token) => set({ qhToken: token }),
  selectedProduct: 'SRAH26',
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  interval: '1D',
  setInterval: (interval) => set({ interval }),
  liquidityScore: 50,
  setLiquidityScore: (score) => set({ liquidityScore: score }),
  fedRate: null,
  setFedRate: (rate) => set({ fedRate: rate }),
  rrpBalance: null,
  setRrpBalance: (balance) => set({ rrpBalance: balance }),
  sofrRate: null,
  setSofrRate: (rate) => set({ sofrRate: rate }),
  qtMode: null,
  setQtMode: (mode) => set({ qtMode: mode }),
}));
