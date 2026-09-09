import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const PlayerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { players } = useApp();
  
  // Encontrar o jogador pelo ID
  const player = players.find((p) => p.id === id);

  if (!player) {
    return (
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-slate-50 min-h-screen px-4 justify-center items-center">
        <span className="text-slate-600 font-medium">Jogador não encontrado</span>
        <button onClick={() => navigate(-1)} className="mt-4 text-[#e63946] font-bold">Voltar</button>
      </main>
    );
  }

  return (
    <main className="flex flex-col relative w-full pt-4 pb-24 bg-slate-50 min-h-screen px-4">
      <div className="flex flex-col w-full space-y-4 max-w-lg mx-auto">
        {/* Sub-Header contextual de navegação rápida */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            aria-label="Voltar" 
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm"
            type="button"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Em Forma
            </span>
            <button aria-label="Compartilhar Perfil" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-transform active:scale-90 shadow-sm" type="button">
              <span className="material-symbols-outlined text-[20px]">share</span>
            </button>
          </div>
        </div>

        {/* Hero Card: Perfil do Atleta */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 shadow-lg flex flex-col justify-end min-h-[175px] text-white">
          <div className="relative z-10 flex items-center gap-4">
            {/* Imagem do Jogador */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-800 flex items-center justify-center shadow-lg border-2 border-slate-700">
                <img 
                  className="w-full h-full object-cover object-top" 
                  src={player.photoUrl || "https://i.imgur.com/2dRX6Mh.png"} 
                  alt={player.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://i.imgur.com/2dRX6Mh.png';
                  }}
                />
              </div>
              <span className="absolute bottom-0 right-0 bg-[#e63946] text-white text-xs font-extrabold px-1.5 py-0.5 rounded-full shadow">
                #{player.number}
              </span>
            </div>
            
            {/* Dados Nominais e Posição */}
            <div className="flex flex-col min-w-0 flex-1">
              <h2 className="text-[20px] font-extrabold text-white tracking-tight uppercase truncate">{player.name}</h2>
              <div className="flex items-center gap-1.5 text-rose-400 font-bold text-xs mt-0.5">
                <span className="material-symbols-outlined text-[16px]">military_tech</span>
                <span>Futebol Society 7v7</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-white/10 text-white/90 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[13px]">sports</span> {player.position}
                </span>
                <span className="inline-flex items-center gap-1 bg-white/10 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-lg backdrop-blur-sm">
                  <span className="material-symbols-outlined text-[13px]">footprint</span> Destro
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo dos Jogos */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e63946] text-[20px]">query_stats</span>
              <h3 className="text-sm font-bold text-slate-900">Resumo dos Jogos</h3>
            </div>
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1 rounded-full text-slate-700 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#e63946]"></span>
              <span>GERAL</span>
            </div>
          </div>
          
          {/* Grid 2x2 de Métricas Principais */}
          <div className="grid grid-cols-2 gap-3">
            {/* Card: Gols */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Gols Marcados</span>
                <span className="material-symbols-outlined text-[18px] text-emerald-500">sports_soccer</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{player.goals ?? 0}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            
            {/* Card: Assistências */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Assistências</span>
                <span className="material-symbols-outlined text-[18px] text-amber-500">handshake</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{player.assists ?? 0}</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            
            {/* Card: Partidas */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Partidas</span>
                <span className="material-symbols-outlined text-[18px] text-slate-400">stadium</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-slate-900 leading-none">{player.matches ?? 34}</span>
                <span className="text-xs text-slate-500 font-semibold">{player.minutesPlayed ?? 2780}'</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
                <span>Titular: {player.matches ?? 34}</span>
                <span className="text-emerald-600 font-bold">100%</span>
              </div>
            </div>
            
            {/* Card: Nota Média (Rating) */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col justify-between relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-[11px] uppercase font-bold tracking-wider">Nota Média</span>
                <span className="material-symbols-outlined text-[18px] text-amber-400">star</span>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-[#e63946] leading-none">{player.rating || player.form || 8.4}</span>
                <span className="text-[10px] font-bold bg-rose-50 text-[#e63946] border border-rose-100 px-1.5 py-0.5 rounded">Top 1%</span>
              </div>
              <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#e63946] h-full rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PlayerProfilePage;
