import React from 'react';
import { useApp } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const RankingList: React.FC = () => {
  const { players, teams } = useApp();
  const navigate = useNavigate();

  // Get all players and sort them (e.g., by goals)
  const topPlayers = [...players]
    .filter(p => (p.goals || 0) > 0 || (p.assists || 0) > 0 || (p.matches || 0) > 0)
    .sort((a, b) => (b.goals || 0) - (a.goals || 0) || (b.assists || 0) - (a.assists || 0));

  return (
    <div className="flex flex-col space-y-4 animate-in fade-in duration-200">
      
      {/* Ranking List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-hidden pb-2">
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center text-[10px] sm:text-[11px] text-slate-500 font-bold mb-2 px-2 sm:px-4 py-3 border-b border-slate-100 uppercase tracking-wider">
              <div className="w-6 sm:w-10 shrink-0 mr-2 sm:mr-4"></div>
              <div className="flex-1 min-w-0 text-slate-900 text-xs sm:text-sm font-bold">Jogadores</div>
              <div className="w-10 sm:w-20 shrink-0 text-center" title="Gols">Gols</div>
              <div className="w-12 sm:w-20 shrink-0 text-center" title="Partidas">Part.</div>
              <div className="w-12 sm:w-20 shrink-0 text-center" title="Assistência">Ast.</div>
            </div>
            
            <div className="space-y-1 px-1 sm:px-2">
              {topPlayers.length === 0 ? (
                <div className="py-10 text-center text-slate-400 text-xs font-medium">Nenhum atleta no ranking.</div>
              ) : (
                topPlayers.map((player) => {
                  const team = teams.find(t => t.id === player.teamId);

                  return (
                    <div 
                      key={player.id} 
                      onClick={() => navigate(`/jogador/${player.id}`)} 
                      className="flex items-center p-1 sm:p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      {/* Número da Camisa */}
                      <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-700 text-[10px] sm:text-sm shrink-0 mr-2 sm:mr-4 border border-slate-200">
                        {player.number || '-'}
                      </div>
                      
                      {/* Foto e Nome */}
                      <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
                        <img 
                          src={player.photoUrl || 'https://i.imgur.com/vnYcevV.png'} 
                          alt="" 
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-slate-100 shadow-sm shrink-0" 
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-xs sm:text-[15px] whitespace-nowrap truncate leading-tight group-hover:text-emerald-600 transition-colors">
                            {player.name}
                          </span>
                          <span className="text-[9px] sm:text-[11px] text-slate-500 font-semibold mt-0.5 truncate flex items-center gap-1 sm:gap-1.5">
                            {player.position}
                            {team && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span className="truncate">{team.name}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      
                      {/* Estatísticas */}
                      <div className="w-10 sm:w-20 shrink-0 flex justify-center text-xs sm:text-[15px] font-black text-emerald-600">{player.goals || 0}</div>
                      <div className="w-12 sm:w-20 shrink-0 flex justify-center text-xs sm:text-[15px] font-bold text-slate-600">{player.matches || 0}</div>
                      <div className="w-12 sm:w-20 shrink-0 flex justify-center text-xs sm:text-[15px] font-bold text-blue-600">{player.assists || 0}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
