
import { ChipDenomination } from './types';

export const DENOMS: ChipDenomination[] = [
  { val: 1000, color: 'bg-amber-500', text: 'text-amber-950', border: 'border-amber-600', glow: 'shadow-amber-500/50' },
  { val: 500, color: 'bg-purple-600', text: 'text-white', border: 'border-purple-700', glow: 'shadow-purple-500/50' },
  { val: 100, color: 'bg-slate-800', text: 'text-slate-100', border: 'border-slate-900', glow: 'shadow-slate-500/20' },
  { val: 25, color: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-700', glow: 'shadow-emerald-500/50' },
  { val: 5, color: 'bg-red-600', text: 'text-white', border: 'border-red-700', glow: 'shadow-red-500/50' },
  { val: 1, color: 'bg-slate-100', text: 'text-slate-900', border: 'border-slate-300', glow: 'shadow-slate-100/50' }
];

export const INITIAL_BANK = 1000;
