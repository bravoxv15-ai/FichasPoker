
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
  LogIn, 
  ArrowLeft, 
  Copy, 
  Check, 
  Trophy,
  Settings,
  ShieldAlert,
  Edit3,
  CreditCard,
  UserCircle
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
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRoomId) return;

    const syncData = () => {
      const savedPlayers = localStorage.getItem(`room_${currentRoomId}`);
      const currentPlayers = savedPlayers ? JSON.parse(savedPlayers) : {};
      
      if (!currentPlayers[LOCAL_USER_ID]) {
        currentPlayers[LOCAL_USER_ID] = {
          uid: LOCAL_USER_ID,
          name: `Pro_${LOCAL_USER_ID.slice(-3)}`,
          bank: INITIAL_BANK,
          table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 },
          lastUpdate: Date.now()
        };
        localStorage.setItem(`room_${currentRoomId}`, JSON.stringify(currentPlayers));
      }
      setPlayers(currentPlayers);
    };

    syncData();
    const interval = setInterval(syncData, 1500);
    return () => clearInterval(interval);
  }, [currentRoomId]);

  const me = useMemo(() => players[LOCAL_USER_ID] || {
    uid: LOCAL_USER_ID,
    name: 'Conectando...',
    bank: 0,
    table: {}
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
      // Sumamos lo que hay en la mesa al banco total y reseteamos la mesa
      updateMyData({ 
        bank: (me.bank || 0) + mesaTotal,
        table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 } 
      });
    } else {
      const newBank = (me.bank || 0) - mesaTotal;
      updateMyData({
        bank: newBank,
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
      <div className="flex flex-col h-screen bg-[#020617] text-slate-100 max-w-md mx-auto border-x border-slate-900 font-sans p-8 justify-center items-center relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-80 h-80 bg-sky-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-80 h-80 bg-emerald-600/10 rounded-full blur-[120px] animate-pulse"></div>
        
        <div className="z-10 w-full space-y-12">
          <div className="text-center relative">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-20">
              <ShieldAlert size={64} className="text-sky-500" />
            </div>
            <h1 className="text-7xl font-black tracking-tighter italic text-white mb-2 leading-none">
              APEX <span className="text-sky-500 drop-shadow-[0_0_20px_rgba(14,165,233,0.6)]">PRO</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 tracking-[0.6em] uppercase">Gestión Elite de Fichas</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => { setCurrentRoomId('SOLO-' + Math.random().toString(36).substring(2, 6).toUpperCase()); setView(View.GAME); }}
              className="group w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 hover:border-sky-500/50 p-6 rounded-3xl flex items-center gap-4 transition-all active:scale-95"
            >
              <div className="bg-sky-500/10 p-4 rounded-2xl text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                <Play size={28} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase italic">Mesa Local</p>
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Sesión individual privada</p>
              </div>
            </button>

            <button 
              onClick={() => { const id = Math.random().toString(36).substring(2, 8).toUpperCase(); setCurrentRoomId(id); setView(View.GAME); }}
              className="group w-full bg-sky-600 hover:bg-sky-500 p-6 rounded-3xl flex items-center gap-4 transition-all shadow-xl shadow-sky-600/20 active:translate-y-1"
            >
              <div className="bg-white/10 p-4 rounded-2xl text-white">
                <PlusCircle size={28} />
              </div>
              <div className="text-left">
                <p className="font-black text-sm uppercase italic text-white">Crear Sala</p>
                <p className="text-[10px] font-bold text-sky-100/60 uppercase tracking-widest">Juega con amigos en línea</p>
              </div>
            </button>

            <div className="relative py-6 flex items-center justify-center">
              <div className="w-full border-t border-slate-900 absolute"></div>
              <span className="bg-[#020617] px-4 text-[10px] font-black text-slate-700 uppercase relative tracking-[0.4em]">O Únete</span>
            </div>

            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="ID SALA"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 font-mono text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/50 uppercase placeholder:text-slate-700 text-sky-400"
              />
              <button 
                onClick={() => { setCurrentRoomId(roomCode); setView(View.GAME); }}
                disabled={roomCode.length < 3}
                className="bg-slate-100 disabled:opacity-20 text-slate-950 px-8 rounded-2xl font-black text-xs hover:bg-white transition-all active:scale-95"
              >
                ENTRAR
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-100 max-w-md mx-auto border-x border-slate-900 font-sans overflow-hidden">
      
      <header className="p-6 pb-2 bg-slate-950/90 backdrop-blur-2xl z-40 border-b border-white/5">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => setView(View.MENU)} className="bg-slate-900 p-2.5 rounded-xl text-slate-400 hover:text-white transition-all active:scale-90">
            <ArrowLeft size={20} />
          </button>
          
          <div onClick={copyCode} className="flex items-center gap-3 bg-slate-900 border border-white/5 py-2 px-5 rounded-full cursor-pointer hover:bg-slate-800 transition-all active:scale-95 shadow-lg group">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-sky-400 transition-colors">
              SALA: <span className="text-white font-mono ml-1">{currentRoomId}</span>
            </p>
            {copyFeedback ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-500" />}
          </div>

          <div className="bg-slate-900 p-2.5 rounded-xl text-slate-400">
            <Settings size={20} />
          </div>
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

      <main className="flex-1 overflow-y-auto p-5 space-y-6" ref={scrollRef}>
        
        {activeTab === Tab.TABLE && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Table Surface */}
            <div className="bg-gradient-to-b from-[#064e3b] to-[#022c22] rounded-[3.5rem] p-10 min-h-[280px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)] relative border-[8px] border-slate-900 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
              <div className="absolute inset-0 border-[3px] border-white/5 m-4 rounded-[3rem]"></div>
              
              <div className="relative grid grid-cols-3 gap-y-12 gap-x-6 justify-items-center z-10">
                {DENOMS.map(d => (
                  <div key={d.val} className="relative h-20 w-20 flex items-center justify-center">
                    {me.table && (me.table as TableState)[d.val] > 0 ? (
                      <div className="relative group/chip cursor-default">
                        {[...Array(Math.min((me.table as TableState)[d.val], 10))].map((_, i) => (
                          <div 
                            key={i} 
                            style={{ 
                                bottom: i * 4 + 'px', 
                                transform: `rotate(${i * 8}deg)`,
                                zIndex: i
                            }}
                            className={`absolute inset-0 w-20 h-20 rounded-full border-[5px] border-dashed border-white/10 shadow-[0_6px_10px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.3)] ${d.color} flex items-center justify-center font-black text-sm overflow-hidden transition-all duration-300 group-hover/chip:translate-y-[-5px]`}
                          >
                            {i === Math.min((me.table as TableState)[d.val], 10) - 1 && (
                                <div className={`${d.text} drop-shadow-lg flex flex-col items-center leading-none`}>
                                    <span>{d.val >= 1000 ? '1K' : d.val}</span>
                                </div>
                            )}
                          </div>
                        ))}
                        <div className="absolute -top-5 -right-5 bg-white text-slate-950 text-[10px] w-7 h-7 flex items-center justify-center rounded-full font-black border-2 border-slate-950 z-[100] shadow-2xl scale-110">
                          {(me.table as TableState)[d.val]}
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center text-[8px] text-white/5 font-black uppercase tracking-tighter">
                        Libre
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pot Display */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-950/80 backdrop-blur-md px-6 py-2 rounded-2xl border border-white/10 shadow-2xl z-20">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] text-center mb-0.5">Pozo de la Mesa</p>
                <p className="text-xl font-black text-emerald-400 font-mono tracking-tighter">${tablePot.toLocaleString()}</p>
              </div>
            </div>

            {/* Dashboard */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/20"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-sky-400 transition-colors">Disponible</p>
                <p className="text-4xl font-black text-white font-mono tracking-tighter">${availableBank.toLocaleString()}</p>
              </div>
              <div className="bg-slate-900 border border-white/5 p-5 rounded-[2.5rem] shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20"></div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 group-hover:text-emerald-400 transition-colors">En Juego</p>
                <p className="text-4xl font-black text-emerald-400 font-mono tracking-tighter">${mesaTotal.toLocaleString()}</p>
              </div>
            </div>

            {/* Betting Matrix */}
            <div className="grid grid-cols-3 gap-4">
              {DENOMS.map(d => (
                <button 
                  key={d.val}
                  onClick={() => addChip(d.val)}
                  disabled={availableBank < d.val}
                  className={`relative p-4 rounded-[2.2rem] border transition-all active:scale-90 flex flex-col items-center gap-4 overflow-hidden group shadow-lg ${availableBank < d.val ? 'opacity-20 grayscale' : 'bg-slate-900 border-white/5 hover:border-sky-500/30'}`}
                >
                  <div className={`h-16 w-16 rounded-full ${d.color} shadow-xl border-[4px] ${d.border} flex items-center justify-center font-black text-sm ${d.text}`}>
                    {d.val >= 1000 ? '1K' : d.val}
                  </div>
                  <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase italic group-hover:text-sky-400 transition-colors">Apostar</span>
                </button>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={allIn}
                disabled={availableBank <= 0}
                className="w-full py-5 bg-gradient-to-r from-amber-600 to-amber-500 rounded-3xl font-black text-[11px] uppercase tracking-[0.5em] text-amber-950 flex items-center justify-center gap-4 shadow-2xl shadow-amber-600/30 active:scale-[0.98] transition-all disabled:opacity-20"
              >
                <Zap size={20} fill="currentColor" /> ¡ALL-IN!
              </button>
              
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleAction('win')}
                  disabled={mesaTotal <= 0}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all disabled:opacity-20"
                >
                  <Trophy size={18} /> ¡GANÉ!
                </button>
                <button 
                  onClick={() => handleAction('lose')}
                  disabled={mesaTotal <= 0}
                  className="bg-red-600 hover:bg-red-500 text-white py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all disabled:opacity-20"
                >
                  <TrendingDown size={18} /> PERDÍ
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === Tab.BANK && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-500">
            {/* Total Treasury */}
            <div className="bg-slate-900 border border-white/5 rounded-[4rem] p-12 text-center shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-full h-2 bg-sky-500/40"></div>
               <div className="absolute -right-20 -top-20 w-64 h-64 bg-sky-500/5 rounded-full blur-[100px]"></div>
               
              <h2 className="text-[12px] font-black text-sky-400 uppercase tracking-[0.5em] mb-12">Banco Total</h2>
              
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
                  className="bg-transparent text-8xl font-black text-white w-full text-center outline-none focus:text-sky-400 transition-colors font-mono tracking-tighter"
                />
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-950 rounded-full border border-white/10 text-[10px] font-black text-slate-500 uppercase italic">
                <CreditCard size={14} className="text-sky-500" /> Toca los números para ajustar saldo manual
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[100, 500, 1000].map(amt => (
                <button 
                  key={amt} 
                  onClick={() => updateMyData({ bank: (me.bank || 0) + amt })}
                  className="bg-slate-900 hover:bg-slate-800 py-8 rounded-[2.5rem] font-black text-sm border border-white/5 active:bg-sky-600 active:text-white transition-all shadow-xl text-sky-500 flex flex-col items-center gap-2"
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
            {/* Mi Perfil / Personalización de Nombre */}
            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
                    <UserCircle size={20} />
                 </div>
                 <h2 className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Mi Identidad</h2>
               </div>
               
               <div className="relative group">
                  <input 
                    type="text" 
                    value={me.name}
                    onChange={(e) => updateMyData({ name: e.target.value })}
                    placeholder="Tu nombre en la mesa"
                    className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 font-bold text-white outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30 transition-all placeholder:text-slate-800 uppercase text-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-700">
                    <Edit3 size={18} />
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-4">
                  <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Censo de la Mesa</h3>
                  <div className="bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                      {Object.keys(players).length} Activos
                  </div>
              </div>
              <div className="space-y-4">
                {(Object.values(players) as Player[]).sort((a, b) => (b.lastUpdate || 0) - (a.lastUpdate || 0)).map((p: Player) => {
                  const pMesa = Object.entries(p.table || {}).reduce((acc, [v, c]) => acc + (Number(v) * (c as number)), 0);
                  const isMe = p.uid === LOCAL_USER_ID;
                  return (
                    <div key={p.uid} className={`group p-6 rounded-[2.5rem] flex justify-between items-center transition-all ${isMe ? 'bg-sky-600/10 border border-sky-500/40 ring-2 ring-sky-500/10' : 'bg-slate-900 border border-white/5 shadow-2xl hover:border-slate-700'}`}>
                      <div className="flex items-center gap-5">
                        <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-inner relative overflow-hidden transition-transform group-hover:scale-105 ${isMe ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-600'}`}>
                          {isMe ? <Crown size={28} /> : <User size={28} />}
                          {!isMe && Date.now() - (p.lastUpdate || 0) < 5000 && (
                              <div className="absolute inset-0 bg-emerald-500/10 animate-pulse"></div>
                          )}
                        </div>
                        <div>
                          <p className="font-black text-base tracking-tight uppercase italic flex items-center gap-3">
                              {p.name} {isMe && <span className="text-[9px] bg-sky-500 text-white px-3 py-1 rounded-full not-italic tracking-widest font-black uppercase">Tú</span>}
                          </p>
                          <p className="text-[11px] font-bold text-emerald-500 flex items-center gap-1.5 uppercase tracking-widest mt-1.5 opacity-80">
                             <Coins size={14} /> Apostando: ${pMesa.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">Banco</p>
                        <p className="font-black text-2xl text-white font-mono tracking-tighter">${(p.bank || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="p-5 bg-slate-950/90 border-t border-slate-900 backdrop-blur-2xl z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"></div>
                <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
            </div>
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Conexión: {currentRoomId}</span>
          </div>
          <button 
            onClick={() => updateMyData({ table: { 1: 0, 5: 0, 25: 0, 100: 0, 500: 0, 1000: 0 } })}
            className="text-slate-700 hover:text-red-500 transition-all p-3 bg-slate-900 rounded-2xl border border-white/5 active:scale-90"
            title="Limpiar Mesa"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </footer>
    </div>
  );
}
