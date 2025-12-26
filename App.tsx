
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  User, 
  Users, 
  Coins, 
  TrendingDown, 
  Trash2, 
  Zap, 
  Crown, 
  Play, 
  PlusCircle, 
  ArrowLeft, 
  Copy, 
  Check, 
  Trophy,
  Settings,
  Edit3,
  CreditCard,
  UserCircle,
  Info,
  Globe,
  ExternalLink,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { View, Tab, Player, TableState } from './types';
import { DENOMS, INITIAL_BANK } from './constants';

const LOCAL_USER_ID = 'user_' + Math.random().toString(36).substring(2, 7);

export default function App() {
  const [view, setView] = useState<View>(View.MENU);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TABLE);
  const [roomCode, setRoomCode] = useState('');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [players, setPlayers] = useState<Record<string, Player>>({});
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRoomId) return;

    const syncData = () => {
      try {
        setSyncStatus('syncing');
        const savedPlayers = localStorage.getItem(`room_${currentRoomId}`);
        const currentPlayers = savedPlayers ? JSON.parse(savedPlayers) : {};
        
        if (!currentPlayers[LOCAL_USER_ID]) {
          currentPlayers[LOCAL_USER_ID] = {
            uid: LOCAL_USER_ID,
            name: `PRO_${LOCAL_USER_ID.slice(-3).toUpperCase()}`,
            bank: INITIAL_BANK,
            table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 },
            lastUpdate: Date.now()
          };
          localStorage.setItem(`room_${currentRoomId}`, JSON.stringify(currentPlayers));
        }
        setPlayers(currentPlayers);
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('error');
      }
    };

    syncData();
    const interval = setInterval(syncData, 1000);
    return () => clearInterval(interval);
  }, [currentRoomId]);

  const me = useMemo(() => players[LOCAL_USER_ID] || {
    uid: LOCAL_USER_ID,
    name: 'CARGANDO...',
    bank: 0,
    table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 }
  }, [players]);

  const mesaTotal = useMemo(() => {
    return Object.entries(me.table || {}).reduce((acc, [val, count]) => acc + (Number(val) * (count as number)), 0);
  }, [me.table]);

  const tablePot = useMemo(() => {
    return (Object.values(players) as Player[]).reduce((acc: number, p: Player) => {
      const pTotal = Object.entries(p.table || {}).reduce((sum, [v, c]) => sum + (Number(v) * (c as number)), 0);
      return acc + pTotal;
    }, 0);
  }, [players]);

  const availableBank = (me.bank || 0) - mesaTotal;

  const updateMyData = useCallback((newData: Partial<Player>) => {
    if (!currentRoomId) return;
    const current = JSON.parse(localStorage.getItem(`room_${currentRoomId}`) || '{}');
    const updated = {
      ...current,
      [LOCAL_USER_ID]: { ...current[LOCAL_USER_ID], ...newData, lastUpdate: Date.now() }
    };
    localStorage.setItem(`room_${currentRoomId}`, JSON.stringify(updated));
    setPlayers(updated);
  }, [currentRoomId]);

  const addChip = (val: number) => {
    if (availableBank < val) return;
    const newTable = { ...me.table };
    newTable[val] = (newTable[val] || 0) + 1;
    updateMyData({ table: newTable });
  };

  const allIn = () => {
    let tempBank = availableBank;
    const newTable = { ...me.table };
    [...DENOMS].forEach(d => {
      const count = Math.floor(tempBank / d.val);
      if (count > 0) {
        newTable[d.val] = (newTable[d.val] || 0) + count;
        tempBank -= (count * d.val);
      }
    });
    updateMyData({ table: newTable });
  };

  const handleAction = (type: 'win' | 'lose') => {
    if (type === 'win') {
      const nuevoBanco = (me.bank || 0) + mesaTotal;
      updateMyData({ 
        bank: nuevoBanco,
        table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 } 
      });
    } else {
      const nuevoBanco = (me.bank || 0) - mesaTotal;
      updateMyData({
        bank: nuevoBanco,
        table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 }
      });
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentRoomId || '');
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  if (view === View.MENU) {
    return (
      <div className="flex flex-col min-h-screen bg-[#020617] text-slate-100 items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-sky-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]"></div>
        
        <div className="z-10 w-full max-w-sm space-y-10">
          <div className="text-center relative">
            <h1 className="text-7xl font-black tracking-tighter italic text-white mb-2 leading-none">
              APEX <span className="text-sky-500 drop-shadow-[0_0_20px_rgba(14,165,233,0.6)]">PRO</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 tracking-[0.6em] uppercase">Gestión Elite de Fichas</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => { setCurrentRoomId('SOLO-' + Math.random().toString(36).substring(2, 6).toUpperCase()); setView(View.GAME); }}
              className="group w-full bg-slate-900/40 backdrop-blur-xl border border-white/5 hover:border-sky-500/50 p-6 rounded-3xl flex items-center gap-4 transition-all active:scale-95"
            >
              <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Play size={28} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase italic">Mesa Local</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Inicia rápido sin conexión</p>
              </div>
            </button>

            <button 
              onClick={() => { const id = Math.random().toString(36).substring(2, 8).toUpperCase(); setCurrentRoomId(id); setView(View.GAME); }}
              className="group w-full bg-sky-600 hover:bg-sky-500 p-6 rounded-3xl flex items-center gap-4 transition-all shadow-xl shadow-sky-600/30 active:translate-y-1"
            >
              <div className="bg-white/10 p-4 rounded-2xl text-white">
                <PlusCircle size={28} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase italic text-white">Crear Sala</p>
                <p className="text-[10px] font-bold text-sky-100/60 uppercase tracking-widest">Invita a tus amigos</p>
              </div>
            </button>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ID SALA"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl px-6 py-4 font-mono text-sm focus:outline-none focus:border-sky-500 text-sky-400"
              />
              <button 
                onClick={() => { setCurrentRoomId(roomCode); setView(View.GAME); }}
                disabled={roomCode.length < 3}
                className="bg-white text-slate-950 px-8 rounded-2xl font-black text-xs hover:bg-sky-400 transition-all active:scale-95 disabled:opacity-20"
              >
                ENTRAR
              </button>
            </div>
          </div>

          <div className="bg-slate-900/20 border border-white/5 rounded-3xl p-6 space-y-4">
             <div className="flex items-center gap-3">
                <Globe size={18} className="text-emerald-500" />
                <h2 className="text-[11px] font-black text-white uppercase tracking-widest italic">¿Falla el botón de GitHub?</h2>
             </div>
             <p className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                Si ves el error "Something went wrong", copia el código de los archivos y pégalos manualmente en tu repositorio de GitHub para publicar.
             </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 max-w-md mx-auto border-x border-slate-900 font-sans overflow-hidden shadow-2xl">
      
      <header className="p-6 pb-2 bg-slate-950/90 backdrop-blur-2xl z-40 border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView(View.MENU)} className="bg-slate-900 p-2.5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          
          <div onClick={copyCode} className="flex items-center gap-3 bg-slate-900 border border-white/5 py-2 px-5 rounded-full cursor-pointer hover:bg-slate-800 transition-all active:scale-95 shadow-lg group">
            <div className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500 animate-pulse' : syncStatus === 'syncing' ? 'bg-sky-500 animate-spin' : 'bg-red-500'}`}></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-sky-400 transition-colors">
              SALA: <span className="text-white font-mono ml-1">{currentRoomId}</span>
            </p>
            {copyFeedback ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-500" />}
          </div>

          <button className="bg-slate-900 p-2.5 rounded-xl text-slate-400">
            <Settings size={20} />
          </button>
        </div>
        
        <div className="flex gap-2 p-1.5 bg-slate-900/50 rounded-[1.5rem] border border-white/5">
          {[Tab.TABLE, Tab.BANK, Tab.LOBBY].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 rounded-[1rem] text-[9px] font-black tracking-widest transition-all uppercase flex flex-col items-center gap-1.5 ${activeTab === tab ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/30 scale-105' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === Tab.TABLE && <Coins size={16} />}
              {tab === Tab.BANK && <CreditCard size={16} />}
              {tab === Tab.LOBBY && <Users size={16} />}
              {tab === Tab.TABLE ? 'Mesa' : tab === Tab.BANK ? 'Banco' : 'Lobby'}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth">
        
        {activeTab === Tab.TABLE && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Table Surface */}
            <div className="bg-gradient-to-b from-[#064e3b] to-[#022c22] rounded-[3.5rem] p-10 min-h-[300px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] relative border-[8px] border-slate-900 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
              
              <div className="relative grid grid-cols-3 gap-y-12 gap-x-6 justify-items-center z-10">
                {DENOMS.map(d => (
                  <div key={d.val} className="relative h-20 w-20 flex items-center justify-center">
                    {me.table && (me.table as TableState)[d.val] > 0 ? (
                      <div className="relative group/chip cursor-default">
                        {[...Array(Math.min((me.table as TableState)[d.val], 12))].map((_, i) => (
                          <div 
                            key={i} 
                            style={{ 
                                bottom: i * 3.5 + 'px', 
                                transform: `rotate(${i * 6}deg)`,
                                zIndex: i
                            }}
                            className={`absolute inset-0 w-20 h-20 rounded-full border-[4px] border-dashed border-white/10 shadow-lg ${d.color} flex items-center justify-center font-black text-sm transition-all duration-300 group-hover/chip:translate-y-[-5px]`}
                          >
                            {i === Math.min((me.table as TableState)[d.val], 12) - 1 && (
                                <div className={`${d.text} drop-shadow-lg flex flex-col items-center leading-none`}>
                                    <span>{d.val >= 1000 ? '1K' : d.val}</span>
                                </div>
                            )}
                          </div>
                        ))}
                        <div className="absolute -top-4 -right-4 bg-white text-slate-950 text-[10px] w-8 h-8 flex items-center justify-center rounded-full font-black border-2 border-slate-950 z-[100] shadow-2xl scale-110">
                          {(me.table as TableState)[d.val]}
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center text-[8px] text-white/10 font-black uppercase tracking-tighter">
                        VACÍO
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/90 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-2xl z-20 whitespace-nowrap">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] text-center mb-0.5">Pozo Total en Mesa</p>
                <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">${tablePot.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-sky-400">Disponible</p>
                <p className="text-4xl font-black text-white font-mono tracking-tighter">${availableBank.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-emerald-400">En Juego</p>
                <p className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">${mesaTotal.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {DENOMS.map(d => (
                <button 
                  key={d.val}
                  onClick={() => addChip(d.val)}
                  disabled={availableBank < d.val}
                  className={`relative p-4 rounded-[2.2rem] border transition-all active:scale-90 flex flex-col items-center gap-4 overflow-hidden group shadow-lg ${availableBank < d.val ? 'opacity-10 grayscale' : 'bg-slate-900 border-white/5 hover:border-sky-500/30'}`}
                >
                  <div className={`h-16 w-16 rounded-full ${d.color} shadow-xl border-[4px] ${d.border} flex items-center justify-center font-black text-sm ${d.text}`}>
                    {d.val >= 1000 ? '1K' : d.val}
                  </div>
                  <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase italic group-hover:text-sky-400">Apostar</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={allIn}
                disabled={availableBank <= 0}
                className="w-full py-6 bg-gradient-to-r from-amber-600 to-amber-500 rounded-3xl font-black text-[11px] uppercase tracking-[0.5em] text-amber-950 flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] disabled:opacity-20 transition-all"
              >
                <Zap size={20} fill="currentColor" /> ¡ALL-IN!
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('win')}
                  disabled={mesaTotal <= 0}
                  className="bg-emerald-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-20 transition-all shadow-xl shadow-emerald-600/10"
                >
                  <Trophy size={18} /> ¡GANÉ!
                </button>
                <button 
                  onClick={() => handleAction('lose')}
                  disabled={mesaTotal <= 0}
                  className="bg-red-600 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-20 transition-all shadow-xl shadow-red-600/10"
                >
                  <TrendingDown size={18} /> PERDÍ
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === Tab.BANK && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6">
            <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 text-center shadow-2xl relative overflow-hidden group">
              <h2 className="text-[12px] font-black text-sky-400 uppercase tracking-[0.5em] mb-12">Fondo del Jugador</h2>
              <div className="flex items-center justify-center mb-12">
                <span className="text-5xl font-black text-slate-800 mr-4">$</span>
                <input 
                  type="number" 
                  value={me.bank || 0}
                  onChange={(e) => {
                    const num = parseInt(e.target.value) || 0;
                    if (num < mesaTotal) return;
                    updateMyData({ bank: num });
                  }}
                  className="bg-transparent text-8xl font-black text-white w-full text-center outline-none focus:text-sky-400 font-mono tracking-tighter transition-all"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[100, 500, 1000].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => updateMyData({ bank: (me.bank || 0) + amt })}
                  className="bg-slate-900/60 py-8 rounded-[2.5rem] font-black text-sm border border-white/5 hover:bg-slate-800 text-sky-500 transition-all flex flex-col items-center gap-3 active:scale-95"
                >
                   <PlusCircle size={20} />
                   <span>+${amt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === Tab.LOBBY && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-slate-900/60 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                 <UserCircle size={20} className="text-sky-400" />
                 <h2 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Perfil</h2>
               </div>
               
               <input 
                type="text" 
                value={me.name}
                onChange={(e) => updateMyData({ name: e.target.value.toUpperCase() })}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-5 font-bold text-white outline-none focus:border-sky-500 text-sm uppercase tracking-widest shadow-inner"
              />
            </div>

            <div className="space-y-4">
              <h3 className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">En la Mesa</h3>
              <div className="space-y-4">
                {(Object.values(players) as Player[]).sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0)).map((p: Player) => {
                  const isMe = p.uid === LOCAL_USER_ID;
                  const pMesa = Object.entries(p.table || {}).reduce((acc, [v, c]) => acc + (Number(v) * (c as number)), 0);
                  return (
                    <div key={p.uid} className={`p-6 rounded-[2.5rem] flex justify-between items-center transition-all ${isMe ? 'bg-sky-600/10 border border-sky-500/40' : 'bg-slate-900/40 border border-white/5'}`}>
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${isMe ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                          {isMe ? <Crown size={28} /> : <User size={28} />}
                        </div>
                        <div>
                          <p className="font-black text-base italic uppercase text-white truncate max-w-[120px]">{p.name}</p>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase mt-1">Mesa: ${pMesa.toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-600 uppercase mb-1">Banco</p>
                        <p className="font-black text-2xl text-white font-mono">${(p.bank || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-6 bg-slate-950/90 border-t border-slate-900 backdrop-blur-2xl z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="flex flex-col">
                <span className="text-[11px] font-mono font-bold text-white uppercase">{currentRoomId}</span>
            </div>
          </div>
          <button 
            onClick={() => updateMyData({ table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 } })}
            className="text-slate-700 hover:text-red-500 transition-all p-3.5 bg-slate-900 rounded-2xl border border-white/5 active:scale-90"
          >
            <Trash2 size={22} />
          </button>
        </div>
      </footer>
    </div>
  );
}
