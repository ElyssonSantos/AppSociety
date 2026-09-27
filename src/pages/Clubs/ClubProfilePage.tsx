import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const ClubProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { teams, players } = useApp();

  const team = teams.find((t) => t.id === id);
  const teamPlayers = players.filter((p) => p.teamId === id);

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Equipe não encontrada</h2>
        <button
          onClick={() => navigate('/clubes')}
          className="px-4 py-2 bg-[#e63946] text-white font-bold rounded-xl"
        >
          Voltar para Clubes
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 p-4 pb-20 space-y-4 animate-in fade-in duration-200">
      
      {/* Header com Navegação */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/clubes')}
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm hover:bg-slate-50"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        </button>
        <div>
          <span className="text-[11px] text-[#e63946] uppercase font-bold tracking-wider block">Perfil do Clube</span>
          <h1 className="text-[20px] font-extrabold text-slate-900 tracking-tight">Detalhes e Gestão</h1>
        </div>
      </div>

      {/* Cartão Principal do Clube */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-5">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
          {team.shieldUrl ? (
            <img src={team.shieldUrl} alt={team.name} className="w-full h-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-[#e63946] text-[40px]">shield</span>
          )}
        </div>
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl font-black text-slate-900">{team.name}</h2>
          <span className="inline-block mt-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-bold">
            Equipe Ativa (Society 7v7)
          </span>
          <div className="grid grid-cols-4 gap-2 mt-4">
             <div className="flex flex-col p-2 bg-slate-50 rounded-xl border border-slate-100">
               <span className="text-lg font-black text-slate-900 leading-none">{teamPlayers.length}</span>
               <span className="text-[9px] uppercase font-bold text-slate-500 mt-1">Atletas</span>
             </div>
             <div className="flex flex-col p-2 bg-emerald-50 rounded-xl border border-emerald-100">
               <span className="text-lg font-black text-emerald-700 leading-none">{team.wins ?? 0}</span>
               <span className="text-[9px] uppercase font-bold text-emerald-700 mt-1">Vitórias</span>
             </div>
             <div className="flex flex-col p-2 bg-amber-50 rounded-xl border border-amber-100">
               <span className="text-lg font-black text-amber-600 leading-none">{team.draws ?? 0}</span>
               <span className="text-[9px] uppercase font-bold text-amber-600 mt-1">Empates</span>
             </div>
             <div className="flex flex-col p-2 bg-rose-50 rounded-xl border border-rose-100">
               <span className="text-lg font-black text-rose-600 leading-none">{team.losses ?? 0}</span>
               <span className="text-[9px] uppercase font-bold text-rose-600 mt-1">Derrotas</span>
             </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Aba - Elenco Atual */}
      <div className="space-y-3 mt-4">
        <h3 className="font-bold text-slate-900 px-1 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[#e63946] text-[18px]">group</span>
          Elenco Atual ({teamPlayers.length})
        </h3>
        {teamPlayers.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-300 rounded-2xl bg-white">
             <span className="material-symbols-outlined text-slate-300 text-3xl">sentiment_dissatisfied</span>
             <p className="text-sm font-medium text-slate-500 mt-2">Nenhum jogador no elenco.</p>
          </div>
        ) : (
          <div className="overflow-x-auto hide-scrollbar pb-2">
            <div className="min-w-[420px]">
              {/* Cabeçalho da Lista */}
              <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase mb-2 px-2">
                <div className="w-6 shrink-0"></div> {/* Status */}
                <div className="w-8 shrink-0 mr-3 text-center">Nº</div>
                <div className="flex-1 min-w-[150px]">Jogadores</div>
                <div className="w-14 shrink-0 text-center">Jogos</div>
                <div className="w-14 shrink-0 text-center">Gols</div>
                <div className="w-14 shrink-0 text-center">Asts</div>
              </div>
              
              <div className="space-y-1.5">
                {teamPlayers.map((p) => (
                  <div key={p.id} onClick={() => navigate(`/jogador/${p.id}`)} className="flex items-center p-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-[#e63946] hover:shadow-md transition-all cursor-pointer group">
                    <div className="w-6 flex justify-center shrink-0">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-xs shrink-0 mr-3 border border-slate-200 shadow-sm">
                      {p.number || '-'}
                    </div>
                    <div className="flex-1 flex items-center gap-3 min-w-[150px]">
                      <img src={p.photoUrl || 'https://i.imgur.com/vnYcevV.png'} alt={p.name} className="w-10 h-10 rounded-full border border-slate-200 object-cover shadow-sm" />
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-slate-900 block leading-tight group-hover:text-[#e63946] transition-colors">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-semibold">{p.position}</span>
                      </div>
                    </div>
                    <div className="w-14 shrink-0 flex justify-center text-sm font-black text-slate-700">{p.matches || 0}</div>
                    <div className="w-14 shrink-0 flex justify-center text-sm font-black text-emerald-600">{p.goals || 0}</div>
                    <div className="w-14 shrink-0 flex justify-center text-sm font-black text-blue-600">{p.assists || 0}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Jogadores que Saíram */}
      <div className="space-y-3 mt-6">
        <h3 className="font-bold text-slate-900 px-1 text-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-[18px]">history</span>
          Jogadores que saíram
        </h3>
        
        <div className="overflow-x-auto hide-scrollbar pb-2 opacity-80">
          <div className="min-w-[420px]">
            {/* Cabeçalho da Lista */}
            <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase mb-2 px-2">
              <div className="w-6 shrink-0"></div>
              <div className="w-8 shrink-0 mr-3 text-center">Nº</div>
              <div className="flex-1 min-w-[150px]">Jogadores</div>
              <div className="w-14 shrink-0 text-center">Jogos</div>
              <div className="w-14 shrink-0 text-center">Gols</div>
              <div className="w-14 shrink-0 text-center">Asts</div>
            </div>
            
            <div className="space-y-1.5">
              {/* Mock Player 1 */}
              <div className="flex items-center p-2 bg-slate-100 rounded-xl border border-slate-200">
                <div className="w-6 flex justify-center shrink-0">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs shrink-0 mr-3 border border-slate-300">
                  8
                </div>
                <div className="flex-1 flex items-center gap-3 min-w-[150px]">
                  <img src="https://i.imgur.com/vnYcevV.png" alt="Ex-Jogador 1" className="w-10 h-10 rounded-full border border-slate-300 object-cover grayscale opacity-75" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-600 block leading-tight line-through">Lucas M.</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Saiu do time</span>
                  </div>
                </div>
                <div className="w-14 shrink-0 flex justify-center text-sm font-bold text-slate-500">12</div>
                <div className="w-14 shrink-0 flex justify-center text-sm font-bold text-slate-500">4</div>
                <div className="w-14 shrink-0 flex justify-center text-sm font-bold text-slate-500">2</div>
              </div>
              
              {/* Mock Player 2 */}
              <div className="flex items-center p-2 bg-slate-100 rounded-xl border border-slate-200">
                <div className="w-6 flex justify-center shrink-0">
                  <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs shrink-0 mr-3 border border-slate-300">
                  11
                </div>
                <div className="flex-1 flex items-center gap-3 min-w-[150px]">
                  <img src="https://i.imgur.com/vnYcevV.png" alt="Ex-Jogador 2" className="w-10 h-10 rounded-full border border-slate-300 object-cover grayscale opacity-75" />
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-slate-600 block leading-tight line-through">Gabriel P.</span>
                    <span className="text-[10px] text-slate-500 font-semibold">Saiu do time</span>
                  </div>
                </div>
                <div className="w-14 shrink-0 flex justify-center text-sm font-bold text-slate-500">5</div>
                <div className="w-14 shrink-0 flex justify-center text-sm font-bold text-slate-500">1</div>
                <div className="w-14 shrink-0 flex justify-center text-sm font-bold text-slate-500">0</div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

