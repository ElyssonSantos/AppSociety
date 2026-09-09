import React, { createContext, useContext, useState } from 'react';
import { LiveMatchFull, MatchEvent, MatchHistoryEntry, Player, Team, UpcomingMatch } from '../types';

interface AppContextType {
  liveMatch: LiveMatchFull;
  upcomingMatches: UpcomingMatch[];
  players: Player[];
  teams: Team[];
  matchHistory: MatchHistoryEntry[];
  availableClubNames: string[];
  isCreationModalOpen: boolean;
  openCreationModal: () => void;
  closeCreationModal: () => void;
  addTeam: (name: string, shieldUrl?: string) => Team;
  updateTeam: (id: string, updatedData: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  addPlayer: (newPlayer: Partial<Player>) => Player;
  updatePlayer: (id: string, updatedData: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  createNewMatch: (homeTeam: string, awayTeam: string, durationMinutes: number) => string;
  addUpcomingMatch: (homeTeam: string, awayTeam: string, durationMinutes: number) => void;
  startUpcomingMatch: (matchId: string) => string;
  finishLiveMatch: () => void;
  deleteMatchHistoryEntry: (id: string) => void;
  addMatchEvent: (event: {
    type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'shot' | 'foul';
    team: 'home' | 'away';
    playerId: string;
    assistPlayerId?: string;
    minute: string;
    description?: string;
  }) => void;
  setMatchClockMinutes: (minutes: number) => void;
  setUpcomingMatchesList: (matches: UpcomingMatch[]) => void;
  getTeamShield: (teamNameOrId: string) => string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://i.imgur.com/2dRX6Mh.png';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveMatch, setLiveMatch] = useState<LiveMatchFull>({
    id: '',
    homeTeam: { name: '', score: 0, icon: 'shield' },
    awayTeam: { name: '', score: 0, icon: 'shield' },
    competition: '',
    venue: '',
    status: 'finished',
    clock: '0:00',
    events: [],
  });

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);

  const availableClubNames = teams.map((t) => t.name);

  const openCreationModal = () => setIsCreationModalOpen(true);
  const closeCreationModal = () => setIsCreationModalOpen(false);

  const getTeamShield = (teamNameOrId: string): string => {
    const t = teams.find(
      (team) =>
        team.name.toLowerCase() === (teamNameOrId || '').toLowerCase() ||
        team.id === teamNameOrId
    );
    if (t?.shieldUrl) return t.shieldUrl;

    return DEFAULT_FALLBACK_IMAGE;
  };

  const addTeam = (name: string, shieldUrl?: string): Team => {
    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name,
      shieldUrl: shieldUrl || DEFAULT_FALLBACK_IMAGE,
      players: [],
      points: 0,
      played: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      form: [],
    };

    setTeams((prev) => [...prev, newTeam]);
    return newTeam;
  };

  const updateTeam = (id: string, updatedData: Partial<Team>) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );
  };

  const deleteTeam = (id: string) => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setPlayers((prev) =>
      prev.map((p) => (p.teamId === id ? { ...p, teamId: undefined } : p))
    );
  };

  const addPlayer = (newPlayerData: Partial<Player>): Player => {
    const created: Player = {
      id: `p-${Date.now()}`,
      name: newPlayerData.name || 'Novo Atleta',
      number: newPlayerData.number || 10,
      position: newPlayerData.position || 'Pivô',
      photoUrl:
        newPlayerData.photoUrl ||
        DEFAULT_FALLBACK_IMAGE,
      rating: newPlayerData.rating || 8.0,
      goals: 0,
      assists: 0,
      form: 8.0,
      matches: 0,
      minutesPlayed: 0,
      teamId: newPlayerData.teamId,
    };

    setPlayers((prev) => [created, ...prev]);

    if (newPlayerData.teamId) {
      setTeams((prevTeams) =>
        prevTeams.map((t) =>
          t.id === newPlayerData.teamId
            ? { ...t, players: [...t.players, created.id] }
            : t
        )
      );
    }

    return created;
  };

  const updatePlayer = (id: string, updatedData: Partial<Player>) => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );

    if (updatedData.teamId !== undefined) {
      setTeams((prevTeams) =>
        prevTeams.map((t) => {
          const hasPlayer = t.players.includes(id);
          const shouldHavePlayer = t.id === updatedData.teamId;

          if (hasPlayer && !shouldHavePlayer) {
            return { ...t, players: t.players.filter((pid) => pid !== id) };
          }
          if (!hasPlayer && shouldHavePlayer) {
            return { ...t, players: [...t.players, id] };
          }
          return t;
        })
      );
    }
  };

  const deletePlayer = (id: string) => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    setTeams((prevTeams) =>
      prevTeams.map((t) => ({
        ...t,
        players: t.players.filter((pid) => pid !== id),
      }))
    );
  };

  const createNewMatch = (homeTeam: string, awayTeam: string, durationMinutes: number): string => {
    const newMatchId = `match-${Date.now()}`;
    const newMatch: LiveMatchFull = {
      id: newMatchId,
      homeTeam: { name: homeTeam, score: 0, icon: 'shield' },
      awayTeam: { name: awayTeam, score: 0, icon: 'shield' },
      status: 'live',
      clock: `${durationMinutes}:00`,
      venue: 'Quadra Society 01',
      competition: 'Jogo Casual',
      events: [],
    };

    setLiveMatch(newMatch);
    closeCreationModal();
    return newMatchId;
  };

  const addUpcomingMatch = (homeTeam: string, awayTeam: string, durationMinutes: number) => {
    const newMatch: UpcomingMatch = {
      id: `upcoming-${Date.now()}`,
      homeTeam,
      awayTeam,
      dateLabel: 'HOJE',
      time: `${durationMinutes} MIN`,
      venue: 'Quadra Society 01',
      competition: 'Jogo Casual',
    };
    setUpcomingMatches((prev) => [...prev, newMatch]);
    closeCreationModal();
  };

  const startUpcomingMatch = (matchId: string): string => {
    const matchToStart = upcomingMatches.find((m) => m.id === matchId);
    if (!matchToStart) return '';

    const newMatchId = `match-${Date.now()}`;
    const durationMins = parseInt(matchToStart.time) || 15;

    const newMatch: LiveMatchFull = {
      id: newMatchId,
      homeTeam: { name: matchToStart.homeTeam, score: 0, icon: 'shield' },
      awayTeam: { name: matchToStart.awayTeam, score: 0, icon: 'shield' },
      status: 'live',
      clock: `${durationMins}:00`,
      venue: matchToStart.venue,
      competition: matchToStart.competition,
      events: [],
    };

    setLiveMatch(newMatch);
    setUpcomingMatches((prev) => prev.filter((m) => m.id !== matchId));
    return newMatchId;
  };


  const finishLiveMatch = () => {
    if (liveMatch.status === 'finished') return;

    const homeName = liveMatch.homeTeam.name;
    const awayName = liveMatch.awayTeam.name;
    const homeScore = liveMatch.homeTeam.score;
    const awayScore = liveMatch.awayTeam.score;

    setLiveMatch((prev) => ({
      ...prev,
      status: 'finished',
      clock: 'FIM DE JOGO',
    }));

    // Persist to match history
    const historyEntry: MatchHistoryEntry = {
      id: `hist-${Date.now()}`,
      date: new Date().toISOString(),
      homeTeam: homeName,
      awayTeam: awayName,
      homeScore,
      awayScore,
      competition: liveMatch.competition,
      venue: liveMatch.venue,
      events: liveMatch.events,
    };
    setMatchHistory((prev) => [historyEntry, ...prev]);

    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        const isHome = team.name.toLowerCase() === homeName.toLowerCase();
        const isAway = team.name.toLowerCase() === awayName.toLowerCase();

        if (!isHome && !isAway) return team;

        const gf = isHome ? homeScore : awayScore;
        const gc = isHome ? awayScore : homeScore;
        const diff = gf - gc;

        let ptsAdd = 0;
        let winAdd = 0;
        let drawAdd = 0;
        let lossAdd = 0;
        let formResult: 'W' | 'D' | 'L' = 'D';

        if (gf > gc) {
          ptsAdd = 3;
          winAdd = 1;
          formResult = 'W';
        } else if (gf < gc) {
          ptsAdd = 0;
          lossAdd = 1;
          formResult = 'L';
        } else {
          ptsAdd = 1;
          drawAdd = 1;
          formResult = 'D';
        }

        const currentForm = team.form || [];
        const updatedForm = [formResult, ...currentForm.slice(0, 4)];

        return {
          ...team,
          played: (team.played || 0) + 1,
          points: (team.points || 0) + ptsAdd,
          wins: (team.wins || 0) + winAdd,
          draws: (team.draws || 0) + drawAdd,
          losses: (team.losses || 0) + lossAdd,
          goalsFor: (team.goalsFor || 0) + gf,
          goalsAgainst: (team.goalsAgainst || 0) + gc,
          goalDiff: (team.goalDiff || 0) + diff,
          form: updatedForm,
        };
      })
    );
  };

  const deleteMatchHistoryEntry = (id: string) => {
    setMatchHistory((prev) => prev.filter((m) => m.id !== id));
  };

  const addMatchEvent = ({
    type,
    team,
    playerId,
    assistPlayerId,
    minute,
    description,
  }: {
    type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'shot' | 'foul';
    team: 'home' | 'away';
    playerId: string;
    assistPlayerId?: string;
    minute: string;
    description?: string;
  }) => {
    const scorer = players.find((p) => p.id === playerId || p.name === playerId);
    const assistPlayer = assistPlayerId ? players.find((p) => p.id === assistPlayerId || p.name === assistPlayerId) : undefined;

    const playerLabel = scorer ? scorer.name : playerId;
    const assistLabel = assistPlayer ? assistPlayer.name : assistPlayerId;

    let eventDesc = description;
    if (!eventDesc) {
      if (type === 'goal') {
        eventDesc = `Gol de ${playerLabel}${assistLabel ? ` (Assistência: ${assistLabel})` : ''}`;
      } else if (type === 'yellow_card') {
        eventDesc = `Cartão amarelo para ${playerLabel}`;
      } else if (type === 'red_card') {
        eventDesc = `Cartão vermelho para ${playerLabel}`;
      } else if (type === 'foul') {
        eventDesc = `Falta cometida por ${playerLabel}`;
      } else if (type === 'sub') {
        eventDesc = `Substituição — entra ${playerLabel}`;
      } else {
        eventDesc = `Chute a gol de ${playerLabel}`;
      }
    }

    const newEvent: MatchEvent = {
      id: `ev-${Date.now()}`,
      minute,
      type: type === 'foul' ? 'yellow_card' : type,
      player: playerLabel,
      team,
      assist: assistLabel,
      description: eventDesc,
    };

    setLiveMatch((prev) => {
      const updatedHomeScore = team === 'home' && type === 'goal' ? prev.homeTeam.score + 1 : prev.homeTeam.score;
      const updatedAwayScore = team === 'away' && type === 'goal' ? prev.awayTeam.score + 1 : prev.awayTeam.score;

      return {
        ...prev,
        homeTeam: { ...prev.homeTeam, score: updatedHomeScore },
        awayTeam: { ...prev.awayTeam, score: updatedAwayScore },
        events: [newEvent, ...prev.events],
      };
    });

    setPlayers((prevPlayers) =>
      prevPlayers.map((p) => {
        let updatedGoals = p.goals || 0;
        let updatedAssists = p.assists || 0;

        if (type === 'goal') {
          if (p.id === playerId || p.name === playerLabel) {
            updatedGoals += 1;
          }
          if (assistPlayerId && (p.id === assistPlayerId || p.name === assistLabel)) {
            updatedAssists += 1;
          }
        }

        return {
          ...p,
          goals: updatedGoals,
          assists: updatedAssists,
        };
      })
    );
  };

  const setMatchClockMinutes = (minutes: number) => {
    setLiveMatch((prev) => ({
      ...prev,
      clock: `${minutes}'`,
    }));
  };

  const setUpcomingMatchesList = (matches: UpcomingMatch[]) => {
    setUpcomingMatches(matches);
  };

  return (
    <AppContext.Provider
      value={{
        liveMatch,
        upcomingMatches,
        players,
        teams,
        matchHistory,
        availableClubNames,
        isCreationModalOpen,
        openCreationModal,
        closeCreationModal,
        addTeam,
        updateTeam,
        deleteTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        createNewMatch,
        addUpcomingMatch,
        startUpcomingMatch,
        finishLiveMatch,
        deleteMatchHistoryEntry,
        addMatchEvent,
        setMatchClockMinutes,
        setUpcomingMatchesList,
        getTeamShield,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
