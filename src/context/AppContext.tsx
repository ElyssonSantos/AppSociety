import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
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
  addTeam: (name: string, shieldUrl?: string) => Promise<Team>;
  updateTeam: (id: string, updatedData: Partial<Team>) => Promise<void>;
  deleteTeam: (id: string) => Promise<void>;
  addPlayer: (newPlayer: Partial<Player>) => Promise<Player>;
  updatePlayer: (id: string, updatedData: Partial<Player>) => Promise<void>;
  deletePlayer: (id: string) => Promise<void>;
  createNewMatch: (homeTeam: string, awayTeam: string, durationMinutes: number) => Promise<string>;
  addUpcomingMatch: (homeTeam: string, awayTeam: string, durationMinutes: number) => Promise<void>;
  startUpcomingMatch: (matchId: string) => Promise<string>;
  finishLiveMatch: () => Promise<void>;
  deleteMatchHistoryEntry: (id: string) => Promise<void>;
  addMatchEvent: (event: {
    type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'shot' | 'foul';
    team: 'home' | 'away';
    playerId: string;
    assistPlayerId?: string;
    minute: string;
    description?: string;
  }) => Promise<void>;
  setMatchClockMinutes: (minutes: number) => Promise<void>;
  setUpcomingMatchesList: (matches: UpcomingMatch[]) => Promise<void>;
  getTeamShield: (teamNameOrId: string) => string;
}

const DEFAULT_FALLBACK_IMAGE = 'https://i.imgur.com/2dRX6Mh.png';

const INITIAL_TEAMS: Team[] = [];

const INITIAL_PLAYERS: Player[] = [];

const INITIAL_UPCOMING: UpcomingMatch[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveMatch, setLiveMatch] = useState<LiveMatchFull>({
    id: 'live-current',
    homeTeam: { name: 'Time Casa', score: 0, icon: 'shield' },
    awayTeam: { name: 'Time Visitante', score: 0, icon: 'shield' },
    competition: 'Jogo Casual',
    venue: 'Quadra Society 01',
    status: 'finished',
    clock: '0:00',
    events: [],
  });

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>([]);

  // ──────────────────────────────────────────────────────────
  // Real-time Firestore Listeners (onSnapshot) & Seed Logic
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Teams listener
    const unsubscribeTeams = onSnapshot(
      collection(db, 'teams'),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial teams if Firestore collection is empty
          for (const team of INITIAL_TEAMS) {
            await setDoc(doc(db, 'teams', team.id), team);
          }
        } else {
          const loadedTeams: Team[] = snapshot.docs.map((d) => d.data() as Team);
          setTeams(loadedTeams);
        }
      },
      (error) => {
        console.warn('Firestore teams snapshot error:', error);
      }
    );

    // 2. Players listener
    const unsubscribePlayers = onSnapshot(
      collection(db, 'players'),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed initial players if empty
          for (const player of INITIAL_PLAYERS) {
            await setDoc(doc(db, 'players', player.id), player);
          }
        } else {
          const loadedPlayers: Player[] = snapshot.docs.map((d) => d.data() as Player);
          setPlayers(loadedPlayers);
        }
      },
      (error) => {
        console.warn('Firestore players snapshot error:', error);
      }
    );

    // 3. Upcoming matches listener
    const unsubscribeUpcoming = onSnapshot(
      collection(db, 'upcomingMatches'),
      async (snapshot) => {
        if (snapshot.empty) {
          for (const match of INITIAL_UPCOMING) {
            await setDoc(doc(db, 'upcomingMatches', match.id), match);
          }
        } else {
          const loadedUpcoming: UpcomingMatch[] = snapshot.docs.map(
            (d) => d.data() as UpcomingMatch
          );
          setUpcomingMatches(loadedUpcoming);
        }
      },
      (error) => {
        console.warn('Firestore upcomingMatches snapshot error:', error);
      }
    );

    // 4. Match history listener
    const unsubscribeHistory = onSnapshot(
      collection(db, 'matchHistory'),
      (snapshot) => {
        const loadedHistory: MatchHistoryEntry[] = snapshot.docs.map(
          (d) => d.data() as MatchHistoryEntry
        );
        // Sort newest first
        loadedHistory.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMatchHistory(loadedHistory);
      },
      (error) => {
        console.warn('Firestore matchHistory snapshot error:', error);
      }
    );

    // 5. Live Match listener
    const unsubscribeLiveMatch = onSnapshot(
      doc(db, 'liveMatch', 'current'),
      (snapshotDoc) => {
        if (snapshotDoc.exists()) {
          setLiveMatch(snapshotDoc.data() as LiveMatchFull);
        } else {
          // Create initial live match doc
          const defaultLive: LiveMatchFull = {
            id: 'live-current',
            homeTeam: { name: 'Time Casa', score: 0, icon: 'shield' },
            awayTeam: { name: 'Time Visitante', score: 0, icon: 'shield' },
            competition: 'Jogo Casual',
            venue: 'Quadra Society 01',
            status: 'finished',
            clock: '0:00',
            events: [],
          };
          setDoc(doc(db, 'liveMatch', 'current'), defaultLive);
        }
      },
      (error) => {
        console.warn('Firestore liveMatch snapshot error:', error);
      }
    );

    return () => {
      unsubscribeTeams();
      unsubscribePlayers();
      unsubscribeUpcoming();
      unsubscribeHistory();
      unsubscribeLiveMatch();
    };
  }, []);

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

  // ──────────────────────────────────────────────────────────
  // Firestore Persistence CRUD Actions (Async / Await Guaranteed)
  // ──────────────────────────────────────────────────────────

  const addTeam = async (name: string, shieldUrl?: string): Promise<Team> => {
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
    await setDoc(doc(db, 'teams', newTeam.id), newTeam);
    return newTeam;
  };

  const updateTeam = async (id: string, updatedData: Partial<Team>): Promise<void> => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );
    await updateDoc(doc(db, 'teams', id), updatedData);
  };

  const deleteTeam = async (id: string): Promise<void> => {
    setTeams((prev) => prev.filter((t) => t.id !== id));
    setPlayers((prev) =>
      prev.map((p) => (p.teamId === id ? { ...p, teamId: undefined } : p))
    );
    await deleteDoc(doc(db, 'teams', id));
  };

  const addPlayer = async (newPlayerData: Partial<Player>): Promise<Player> => {
    const created: Player = {
      id: `p-${Date.now()}`,
      name: newPlayerData.name || 'Novo Atleta',
      number: newPlayerData.number || 10,
      position: newPlayerData.position || 'Pivô',
      photoUrl: newPlayerData.photoUrl || DEFAULT_FALLBACK_IMAGE,
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

      const targetTeam = teams.find((t) => t.id === newPlayerData.teamId);
      if (targetTeam) {
        const updatedPlayers = Array.from(new Set([...targetTeam.players, created.id]));
        await updateDoc(doc(db, 'teams', targetTeam.id), { players: updatedPlayers });
      }
    }

    await setDoc(doc(db, 'players', created.id), created);
    return created;
  };

  const updatePlayer = async (id: string, updatedData: Partial<Player>): Promise<void> => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    await updateDoc(doc(db, 'players', id), updatedData);

    if (updatedData.teamId !== undefined) {
      const newTeamId = updatedData.teamId;
      for (const t of teams) {
        const hasPlayer = t.players.includes(id);
        const shouldHavePlayer = t.id === newTeamId;

        if (hasPlayer && !shouldHavePlayer) {
          const filtered = t.players.filter((pid) => pid !== id);
          await updateDoc(doc(db, 'teams', t.id), { players: filtered });
        } else if (!hasPlayer && shouldHavePlayer) {
          const added = [...t.players, id];
          await updateDoc(doc(db, 'teams', t.id), { players: added });
        }
      }
    }
  };

  const deletePlayer = async (id: string): Promise<void> => {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    await deleteDoc(doc(db, 'players', id));
  };

  const createNewMatch = async (
    homeTeam: string,
    awayTeam: string,
    durationMinutes: number
  ): Promise<string> => {
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

    await setDoc(doc(db, 'liveMatch', 'current'), newMatch);
    return newMatchId;
  };

  const addUpcomingMatch = async (
    homeTeam: string,
    awayTeam: string,
    durationMinutes: number
  ): Promise<void> => {
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

    await setDoc(doc(db, 'upcomingMatches', newMatch.id), newMatch);
  };

  const startUpcomingMatch = async (matchId: string): Promise<string> => {
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

    await deleteDoc(doc(db, 'upcomingMatches', matchId));
    await setDoc(doc(db, 'liveMatch', 'current'), newMatch);

    return newMatchId;
  };

  const finishLiveMatch = async (): Promise<void> => {
    if (liveMatch.status === 'finished') return;

    const homeName = liveMatch.homeTeam.name;
    const awayName = liveMatch.awayTeam.name;
    const homeScore = liveMatch.homeTeam.score;
    const awayScore = liveMatch.awayTeam.score;

    const updatedLiveMatch: LiveMatchFull = {
      ...liveMatch,
      status: 'finished',
      clock: 'FIM DE JOGO',
    };

    setLiveMatch(updatedLiveMatch);
    await setDoc(doc(db, 'liveMatch', 'current'), updatedLiveMatch);

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
    await setDoc(doc(db, 'matchHistory', historyEntry.id), historyEntry);

    // Update Team Stats
    for (const team of teams) {
      const isHome = team.name.toLowerCase() === homeName.toLowerCase();
      const isAway = team.name.toLowerCase() === awayName.toLowerCase();

      if (!isHome && !isAway) continue;

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

      const updatedTeamData: Partial<Team> = {
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

      await updateDoc(doc(db, 'teams', team.id), updatedTeamData);
    }
  };

  const deleteMatchHistoryEntry = async (id: string): Promise<void> => {
    setMatchHistory((prev) => prev.filter((m) => m.id !== id));
    await deleteDoc(doc(db, 'matchHistory', id));
  };

  const addMatchEvent = async ({
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
  }): Promise<void> => {
    const scorer = players.find((p) => p.id === playerId || p.name === playerId);
    const assistPlayer = assistPlayerId
      ? players.find((p) => p.id === assistPlayerId || p.name === assistPlayerId)
      : undefined;

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

    const updatedHomeScore =
      team === 'home' && type === 'goal' ? liveMatch.homeTeam.score + 1 : liveMatch.homeTeam.score;
    const updatedAwayScore =
      team === 'away' && type === 'goal' ? liveMatch.awayTeam.score + 1 : liveMatch.awayTeam.score;

    const updatedMatch: LiveMatchFull = {
      ...liveMatch,
      homeTeam: { ...liveMatch.homeTeam, score: updatedHomeScore },
      awayTeam: { ...liveMatch.awayTeam, score: updatedAwayScore },
      events: [newEvent, ...liveMatch.events],
    };

    setLiveMatch(updatedMatch);
    await setDoc(doc(db, 'liveMatch', 'current'), updatedMatch);

    // Update goal/assist counts for player in Firestore
    if (type === 'goal' && scorer) {
      await updateDoc(doc(db, 'players', scorer.id), {
        goals: (scorer.goals || 0) + 1,
      });
    }
    if (type === 'goal' && assistPlayer) {
      await updateDoc(doc(db, 'players', assistPlayer.id), {
        assists: (assistPlayer.assists || 0) + 1,
      });
    }
  };

  const setMatchClockMinutes = async (minutes: number): Promise<void> => {
    const updatedMatch = {
      ...liveMatch,
      clock: `${minutes}'`,
    };
    setLiveMatch(updatedMatch);
    await setDoc(doc(db, 'liveMatch', 'current'), updatedMatch);
  };

  const setUpcomingMatchesList = async (matches: UpcomingMatch[]): Promise<void> => {
    setUpcomingMatches(matches);
    // Persist list reorder to Firestore
    const snapshot = await getDocs(collection(db, 'upcomingMatches'));
    for (const d of snapshot.docs) {
      await deleteDoc(d.ref);
    }
    for (const m of matches) {
      await setDoc(doc(db, 'upcomingMatches', m.id), m);
    }
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
