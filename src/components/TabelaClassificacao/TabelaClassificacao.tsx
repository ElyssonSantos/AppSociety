import React from 'react';
import { useApp } from '../../context/AppContext';

const formIcon = (result: 'W' | 'D' | 'L') => {
  if (result === 'W') {
    return (
      <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </svg>
      </span>
    );
  }
  if (result === 'D') {
    return (
      <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-500 shrink-0">
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path d="M5 12h14" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
        </svg>
      </span>
    );
  }
  return (
    <span className="w-4 h-4 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-600 shrink-0">
      <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
      </svg>
    </span>
  );
};

export const TabelaClassificacao: React.FC = () => {
  const { teams, getTeamShield } = useApp();

  // Critérios de desempate oficiais: 1º Pontos (Pts), 2º Vitórias (VIT), 3º Saldo de Gols (SG), 4º Gols Marcados (GM/GP)
  const sortedTeams = [...teams].sort((a, b) => {
    const ptsA = a.points ?? 0;
    const ptsB = b.points ?? 0;
    if (ptsB !== ptsA) return ptsB - ptsA;

    const vitA = a.wins ?? 0;
    const vitB = b.wins ?? 0;
    if (vitB !== vitA) return vitB - vitA;

    const diffA = a.goalDiff ?? 0;
    const diffB = b.goalDiff ?? 0;
    if (diffB !== diffA) return diffB - diffA;

    const gfA = a.goalsFor ?? 0;
    const gfB = b.goalsFor ?? 0;
    return gfB - gfA;
  });

  return (
    <div className="flex flex-col w-full rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <main className="flex-1 relative flex flex-col">
        <div className="w-full inline-block align-middle">
          <div className="relative">
            {/* Table Header */}
            <div className="flex text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-tight bg-slate-50 border-b border-slate-200 sticky top-0 z-30">
              <div className="flex-1 min-w-[90px] max-w-[130px] sm:max-w-[160px] pl-2 py-2 flex items-center border-r border-slate-200 shadow-sm truncate">
                <span>Equipe</span>
              </div>
              <div className="flex flex-1 items-center justify-around px-1 py-2">
                <span className="w-6 text-center font-extrabold text-[#e63946]">Pts</span>
                <span className="w-5 text-center">J</span>
                <span className="w-5 text-center">V</span>
                <span className="w-5 text-center">E</span>
                <span className="w-5 text-center">D</span>
                <span className="w-6 text-center">GP</span>
                <span className="w-6 text-center">GC</span>
                <span className="w-6 text-center">SG</span>
                <span className="w-12 text-center hidden sm:block">Forma</span>
              </div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-100 text-[10px]">
              {sortedTeams.length === 0 ? (
                <div className="p-4 text-center text-slate-500 font-medium text-xs">
                  Nenhuma equipe cadastrada.
                </div>
              ) : (
                sortedTeams.map((team, index) => {
                  const position = index + 1;
                  const isTop = position === 1;
                  const shieldUrl = team.shieldUrl || getTeamShield(team.name);

                  return (
                    <div
                      key={team.id}
                      className="flex items-center bg-white hover:bg-slate-50 transition-colors duration-150"
                    >
                      {/* Team Column */}
                      <div className="flex-1 min-w-[90px] max-w-[130px] sm:max-w-[160px] bg-white border-r border-slate-200 py-2 pl-2 pr-1 flex items-center shadow-sm truncate">
                        <span
                          className={`w-4 text-center font-extrabold text-[9px] mr-1 ${
                            isTop ? 'text-[#e63946]' : 'text-slate-500'
                          }`}
                        >
                          {position}
                        </span>

                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center mr-1.5 shrink-0 shadow-sm">
                          <img
                            src={shieldUrl}
                            alt={team.name}
                            className="w-full h-full object-cover rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=120&q=80';
                            }}
                          />
                        </div>

                        <span className="font-bold text-slate-900 truncate">{team.name}</span>
                      </div>

                      {/* Data Columns */}
                      <div className="flex flex-1 items-center justify-around px-1 py-2 font-mono text-[9px] sm:text-[10px]">
                        <span className="w-6 text-center font-extrabold text-[#e63946]">
                          {team.points ?? 0}
                        </span>
                        <span className="w-5 text-center text-slate-600 font-medium">{team.played ?? 0}</span>
                        <span className="w-5 text-center text-emerald-600 font-bold">{team.wins ?? 0}</span>
                        <span className="w-5 text-center text-slate-600 font-medium">{team.draws ?? 0}</span>
                        <span className="w-5 text-center text-rose-600 font-bold">{team.losses ?? 0}</span>
                        <span className="w-6 text-center text-slate-600 font-medium">{team.goalsFor ?? 0}</span>
                        <span className="w-6 text-center text-slate-600 font-medium">{team.goalsAgainst ?? 0}</span>
                        <span className="w-6 text-center text-slate-900 font-bold">
                          {(team.goalDiff ?? 0) > 0 ? `+${team.goalDiff}` : team.goalDiff ?? 0}
                        </span>
                        <div className="w-12 hidden sm:flex items-center justify-center space-x-0.5">
                          {(team.form || ['W', 'W', 'L']).map((r, i) => (
                            <React.Fragment key={i}>{formIcon(r)}</React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TabelaClassificacao;
