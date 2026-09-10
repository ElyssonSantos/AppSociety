import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  increment,
  Timestamp,
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
  serverClockOffset: number;
  calculateRemainingSeconds: (match: LiveMatchFull, customNowMs?: number) => number;
  formatMatchClock: (match: LiveMatchFull, customNowMs?: number) => string;
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
  updateMatchHistoryEntry: (id: string, updatedData: Partial<MatchHistoryEntry>) => Promise<void>;
  toggleLiveTimer: () => Promise<void>;
  addExtraTimeToLiveMatch: (minutes: number) => Promise<void>;
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

const LS_TEAMS = 'mopafut_teams_cache';
const LS_PLAYERS = 'mopafut_players_cache';
const LS_UPCOMING = 'mopafut_upcoming_cache';
const LS_HISTORY = 'mopafut_history_cache';
const LS_LIVE = 'mopafut_live_cache';

const DEFAULT_IDLE_MATCH: LiveMatchFull = {
  id: 'live-current',
  homeTeam: { name: 'Time Casa', score: 0, icon: 'shield' },
  awayTeam: { name: 'Time Visitante', score: 0, icon: 'shield' },
  competition: 'Jogo Casual',
  venue: 'Quadra Society 01',
  status: 'finished',
  clock: '0:00',
  durationMinutes: 15,
  elapsedSeconds: 0,
  isTimerRunning: false,
  events: [],
};

const loadFromLS = <T,>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
};

const saveToLS = <T,>(key: string, value: T) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* ignore */ }
};

const normalizeTimerStartedAt = (raw: unknown): number | undefined => {
  if (raw === null || raw === undefined) return undefined;
  if (raw instanceof Timestamp) return raw.toMillis();
  if (typeof raw === 'object' && raw !== null && 'seconds' in raw) {
    const ts = raw as { seconds: number; nanoseconds: number };
    return ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1_000_000);
  }
  if (typeof raw === 'number') return raw;
  return undefined;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [liveMatch, setLiveMatch] = useState<LiveMatchFull>(() =>
    loadFromLS<LiveMatchFull>(LS_LIVE, DEFAULT_IDLE_MATCH)
  );

  const [upcomingMatches, setUpcomingMatches] = useState<UpcomingMatch[]>(() =>
    loadFromLS<UpcomingMatch[]>(LS_UPCOMING, [])
  );
  const [players, setPlayers] = useState<Player[]>(() =>
    loadFromLS<Player[]>(LS_PLAYERS, [])
  );
  const [teams, setTeams] = useState<Team[]>(() =>
    loadFromLS<Team[]>(LS_TEAMS, [])
  );
  const [matchHistory, setMatchHistory] = useState<MatchHistoryEntry[]>(() =>
    loadFromLS<MatchHistoryEntry[]>(LS_HISTORY, [])
  );
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [serverClockOffset, setServerClockOffset] = useState<number>(0);

  // Sync local state to localStorage as secondary fallback
  useEffect(() => { saveToLS(LS_TEAMS, teams); }, [teams]);
  useEffect(() => { saveToLS(LS_PLAYERS, players); }, [players]);
  useEffect(() => { saveToLS(LS_UPCOMING, upcomingMatches); }, [upcomingMatches]);
  useEffect(() => { saveToLS(LS_HISTORY, matchHistory); }, [matchHistory]);
  useEffect(() => { saveToLS(LS_LIVE, liveMatch); }, [liveMatch]);

  // ──────────────────────────────────────────────────────────
  // Firestore Real-Time Global Listeners (Single Source of Truth)
  // ──────────────────────────────────────────────────────────
  useEffect(() => {
    // 1. Teams listener
    const unsubscribeTeams = onSnapshot(
      collection(db, 'teams'),
      (snapshot) => {
        const loadedTeams: Team[] = snapshot.docs.map((d) => d.data() as Team);
        setTeams(loadedTeams);
      },
      (error) => {
        console.warn('Firestore teams listener warning:', error?.message);
      }
    );

    // 2. Players listener
    const unsubscribePlayers = onSnapshot(
      collection(db, 'players'),
      (snapshot) => {
        const loadedPlayers: Player[] = snapshot.docs.map((d) => d.data() as Player);
        setPlayers(loadedPlayers);
      },
      (error) => {
        console.warn('Firestore players listener warning:', error?.message);
      }
    );

    // 3. Upcoming matches listener
    const unsubscribeUpcoming = onSnapshot(
      collection(db, 'upcomingMatches'),
      (snapshot) => {
        const loadedUpcoming: UpcomingMatch[] = snapshot.docs.map(
          (d) => d.data() as UpcomingMatch
        );
        setUpcomingMatches(loadedUpcoming);
      },
      (error) => {
        console.warn('Firestore upcomingMatches listener warning:', error?.message);
      }
    );

    // 4. Match history listener
    const unsubscribeHistory = onSnapshot(
      collection(db, 'matchHistory'),
      (snapshot) => {
        const loadedHistory: MatchHistoryEntry[] = snapshot.docs.map(
          (d) => d.data() as MatchHistoryEntry
        );
        loadedHistory.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setMatchHistory(loadedHistory);
      },
      (error) => {
        console.warn('Firestore matchHistory listener warning:', error?.message);
      }
    );

    // 5. Live Match listener — Sincronização Global de Gols, Eventos e Cronômetro
    const unsubscribeLiveMatch = onSnapshot(
      doc(db, 'liveMatch', 'current'),
      (snapshotDoc) => {
        if (snapshotDoc.exists()) {
          const data = snapshotDoc.data();

          // Calcula o offset entre o relógio do servidor e o dispositivo local para eliminar delay de 30s
          const rawUpdatedAt = data.updatedAt;
          let offset = 0;
          if (rawUpdatedAt instanceof Timestamp) {
            offset = rawUpdatedAt.toMillis() - Date.now();
          } else if (typeof rawUpdatedAt === 'object' && rawUpdatedAt !== null && 'seconds' in rawUpdatedAt) {
            const ts = rawUpdatedAt as { seconds: number; nanoseconds: number };
            offset = (ts.seconds * 1000 + Math.floor(ts.nanoseconds / 1_000_000)) - Date.now();
          }
          setServerClockOffset(offset);

          const normalized: LiveMatchFull = {
            ...(data as LiveMatchFull),
            timerStartedAt: normalizeTimerStartedAt(data.timerStartedAt),
          };
          setLiveMatch(normalized);
        }
      },
      (error) => {
        console.warn('Firestore liveMatch listener warning:', error?.message);
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

  // Helper: Cálculo de segundos restantes compensado por offset de relógio do servidor
  const calculateRemainingSeconds = (match: LiveMatchFull, customNowMs?: number): number => {
    const totalSecs = (match.durationMinutes || 15) * 60;
    let elapsed = match.elapsedSeconds || 0;
    if (match.isTimerRunning && match.timerStartedAt) {
      const now = (customNowMs ?? Date.now()) + serverClockOffset;
      const currentStintSecs = Math.floor((now - match.timerStartedAt) / 1000);
      elapsed += currentStintSecs;
    }
    return Math.max(0, totalSecs - elapsed);
  };

  const formatMatchClock = (match: LiveMatchFull, customNowMs?: number): string => {
    if (match.status === 'finished') return '00:00';
    const secs = calculateRemainingSeconds(match, customNowMs);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ──────────────────────────────────────────────────────────
  // Firestore Persistence CRUD Actions
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

    try {
      await setDoc(doc(db, 'teams', newTeam.id), newTeam);
    } catch (err: any) {
      console.warn('Firestore write notice:', err?.message);
    }
    return newTeam;
  };

  const updateTeam = async (id: string, updatedData: Partial<Team>): Promise<void> => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedData } : t))
    );
    try {
      await updateDoc(doc(db, 'teams', id), updatedData);
    } catch (err: any) {
      console.warn('Firestore update notice:', err?.message);
    }
  };

  const deleteTeam = async (id: string): Promise<void> => {
    const teamToDelete = teams.find((t) => t.id === id);
    const teamNameLower = teamToDelete ? teamToDelete.name.toLowerCase().trim() : '';

    // 1. Exclui a equipe localmente e no Firestore
    setTeams((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (err: any) {
      console.warn('Firestore delete team notice:', err?.message);
    }

    // 2. Limpa teamId dos atletas que pertenciam a este time
    setPlayers((prev) =>
      prev.map((p) => (p.teamId === id ? { ...p, teamId: undefined } : p))
    );
    const affectedPlayers = players.filter((p) => p.teamId === id);
    for (const p of affectedPlayers) {
      try {
        await updateDoc(doc(db, 'players', p.id), { teamId: null });
      } catch {}
    }

    if (teamNameLower) {
      // 3. Remove partidas agendadas (próximas) envolvendo esta equipe
      const remainingUpcoming = upcomingMatches.filter((m) => {
        const h = m.homeTeam.toLowerCase().trim();
        const a = m.awayTeam.toLowerCase().trim();
        return h !== teamNameLower && a !== teamNameLower;
      });

      const removedUpcoming = upcomingMatches.filter((m) => {
        const h = m.homeTeam.toLowerCase().trim();
        const a = m.awayTeam.toLowerCase().trim();
        return h === teamNameLower || a === teamNameLower;
      });

      setUpcomingMatches(remainingUpcoming);
      for (const m of removedUpcoming) {
        try {
          await deleteDoc(doc(db, 'upcomingMatches', m.id));
        } catch {}
      }

      // 4. Se a partida ao vivo envolver esta equipe, reinicia para estado inativo
      const liveHomeLower = liveMatch.homeTeam.name.toLowerCase().trim();
      const liveAwayLower = liveMatch.awayTeam.name.toLowerCase().trim();
      if (liveHomeLower === teamNameLower || liveAwayLower === teamNameLower) {
        setLiveMatch(DEFAULT_IDLE_MATCH);
        try {
          await setDoc(doc(db, 'liveMatch', 'current'), {
            ...DEFAULT_IDLE_MATCH,
            updatedAt: serverTimestamp(),
          });
        } catch {}
      }

      // 5. Remove do histórico de partidas e dos logs todas as partidas desta equipe
      const remainingHistory = matchHistory.filter((h) => {
        const home = h.homeTeam.toLowerCase().trim();
        const away = h.awayTeam.toLowerCase().trim();
        return home !== teamNameLower && away !== teamNameLower;
      });

      const removedHistory = matchHistory.filter((h) => {
        const home = h.homeTeam.toLowerCase().trim();
        const away = h.awayTeam.toLowerCase().trim();
        return home === teamNameLower || away === teamNameLower;
      });

      setMatchHistory(remainingHistory);
      for (const h of removedHistory) {
        try {
          await deleteDoc(doc(db, 'matchHistory', h.id));
        } catch {}
      }
    }
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
        try {
          await updateDoc(doc(db, 'teams', targetTeam.id), { players: updatedPlayers });
        } catch { /* ignore */ }
      }
    }

    try {
      await setDoc(doc(db, 'players', created.id), created);
    } catch (err: any) {
      console.warn('Firestore write notice:', err?.message);
    }
    return created;
  };

  const updatePlayer = async (id: string, updatedData: Partial<Player>): Promise<void> => {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p))
    );
    try {
      await updateDoc(doc(db, 'players', id), updatedData);
    } catch (err: any) {
      console.warn('Firestore update notice:', err?.message);
    }

    if (updatedData.teamId !== undefined) {
      const newTeamId = updatedData.teamId;
      for (const t of teams) {
        const hasPlayer = t.players.includes(id);
        const shouldHavePlayer = t.id === newTeamId;

        if (hasPlayer && !shouldHavePlayer) {
          const filtered = t.players.filter((pid) => pid !== id);
          try { await updateDoc(doc(db, 'teams', t.id), { players: filtered }); } catch {}
        } else if (!hasPlayer && shouldHavePlayer) {
          const added = [...t.players, id];
          try { await updateDoc(doc(db, 'teams', t.id), { players: added }); } catch {}
        }
      }
    }
  };

  const deletePlayer = async (id: string): Promise<void> => {
    const playerToDelete = players.find((p) => p.id === id);
    const playerNameLower = playerToDelete ? playerToDelete.name.toLowerCase().trim() : '';

    // 1. Exclui o atleta localmente e no Firestore
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    try {
      await deleteDoc(doc(db, 'players', id));
    } catch (err: any) {
      console.warn('Firestore delete player notice:', err?.message);
    }

    // 2. Remove o atleta da lista de elenco em todos os clubes
    for (const t of teams) {
      if (t.players.includes(id)) {
        const updatedPlayersList = t.players.filter((pid) => pid !== id);
        setTeams((prevTeams) =>
          prevTeams.map((teamItem) =>
            teamItem.id === t.id ? { ...teamItem, players: updatedPlayersList } : teamItem
          )
        );
        try {
          await updateDoc(doc(db, 'teams', t.id), { players: updatedPlayersList });
        } catch {}
      }
    }

    if (playerNameLower) {
      const isPlayerInEvent = (ev: MatchEvent) => {
        const pName = (ev.player || '').toLowerCase().trim();
        const aName = (ev.assist || '').toLowerCase().trim();
        return pName === playerNameLower || aName === playerNameLower || ev.player === id;
      };

      // 3. Remove eventos deste atleta da partida ao vivo em andamento
      const hasLiveMatchPlayerEvent = liveMatch.events.some(isPlayerInEvent);
      if (hasLiveMatchPlayerEvent) {
        const filteredEvents = liveMatch.events.filter((ev) => !isPlayerInEvent(ev));
        const updatedLive = { ...liveMatch, events: filteredEvents };
        setLiveMatch(updatedLive);
        try {
          await setDoc(doc(db, 'liveMatch', 'current'), {
            ...updatedLive,
            updatedAt: serverTimestamp(),
          });
        } catch {}
      }

      // 4. Limpa eventos deste atleta no histórico de partidas e logs
      const updatedHistory = matchHistory.map((entry) => {
        const hasPlayerEvents = entry.events.some(isPlayerInEvent);
        if (!hasPlayerEvents) return entry;
        const cleanEvents = entry.events.filter((ev) => !isPlayerInEvent(ev));
        return { ...entry, events: cleanEvents };
      });

      setMatchHistory(updatedHistory);
      for (const entry of updatedHistory) {
        const original = matchHistory.find((h) => h.id === entry.id);
        if (original && original.events.length !== entry.events.length) {
          try {
            await setDoc(doc(db, 'matchHistory', entry.id), entry);
          } catch {}
        }
      }
    }
  };

  const createNewMatch = async (
    homeTeam: string,
    awayTeam: string,
    durationMinutes: number
  ): Promise<string> => {
    const newMatchId = `match-${Date.now()}`;
    const nowMs = Date.now();
    const newMatchLocal: LiveMatchFull = {
      id: newMatchId,
      homeTeam: { name: homeTeam, score: 0, icon: 'shield' },
      awayTeam: { name: awayTeam, score: 0, icon: 'shield' },
      status: 'live',
      clock: `${durationMinutes}:00`,
      durationMinutes,
      elapsedSeconds: 0,
      isTimerRunning: true,
      timerStartedAt: nowMs,
      venue: 'Quadra Society 01',
      competition: 'Jogo Casual',
      events: [],
    };

    setLiveMatch(newMatchLocal);
    closeCreationModal();

    try {
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...newMatchLocal,
        timerStartedAt: nowMs,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore write notice:', err?.message);
    }
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

    try {
      await setDoc(doc(db, 'upcomingMatches', newMatch.id), newMatch);
    } catch (err: any) {
      console.warn('Firestore write notice:', err?.message);
    }
  };

  const startUpcomingMatch = async (matchId: string): Promise<string> => {
    const matchToStart = upcomingMatches.find((m) => m.id === matchId);
    if (!matchToStart) return '';

    const newMatchId = `match-${Date.now()}`;
    const durationMins = parseInt(matchToStart.time) || 15;
    const nowMs = Date.now();

    const newMatchLocal: LiveMatchFull = {
      id: newMatchId,
      homeTeam: { name: matchToStart.homeTeam, score: 0, icon: 'shield' },
      awayTeam: { name: matchToStart.awayTeam, score: 0, icon: 'shield' },
      status: 'live',
      clock: `${durationMins}:00`,
      durationMinutes: durationMins,
      elapsedSeconds: 0,
      isTimerRunning: true,
      timerStartedAt: nowMs,
      venue: matchToStart.venue,
      competition: matchToStart.competition,
      events: [],
    };

    setLiveMatch(newMatchLocal);
    setUpcomingMatches((prev) => prev.filter((m) => m.id !== matchId));

    try {
      await deleteDoc(doc(db, 'upcomingMatches', matchId));
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...newMatchLocal,
        timerStartedAt: nowMs,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore notice:', err?.message);
    }

    return newMatchId;
  };

  const toggleLiveTimer = async (): Promise<void> => {
    if (liveMatch.status !== 'live') return;

    const now = Date.now();
    const newIsRunning = !liveMatch.isTimerRunning;
    let newElapsed = liveMatch.elapsedSeconds || 0;

    if (liveMatch.isTimerRunning && liveMatch.timerStartedAt) {
      const stint = Math.floor((now - liveMatch.timerStartedAt) / 1000);
      newElapsed += Math.max(0, stint);
    }

    const updatedLocal: LiveMatchFull = {
      ...liveMatch,
      isTimerRunning: newIsRunning,
      elapsedSeconds: newElapsed,
      timerStartedAt: newIsRunning ? now : undefined,
    };

    setLiveMatch(updatedLocal);

    try {
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...updatedLocal,
        timerStartedAt: newIsRunning ? now : null,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore toggleTimer notice:', err?.message);
    }
  };

  const addExtraTimeToLiveMatch = async (minutes: number): Promise<void> => {
    const newDuration = (liveMatch.durationMinutes || 15) + minutes;
    const updated = { ...liveMatch, durationMinutes: newDuration };
    setLiveMatch(updated);
    try {
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...updated,
        updatedAt: serverTimestamp(),
      });
    } catch {}
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
      isTimerRunning: false,
      timerStartedAt: undefined,
    };

    setLiveMatch(updatedLiveMatch);
    try {
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...updatedLiveMatch,
        timerStartedAt: null,
        updatedAt: serverTimestamp(),
      });
    } catch {}

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
    try {
      await setDoc(doc(db, 'matchHistory', historyEntry.id), historyEntry);
    } catch {}

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

      try {
        await updateDoc(doc(db, 'teams', team.id), updatedTeamData);
      } catch {}
    }
  };

  const deleteMatchHistoryEntry = async (id: string): Promise<void> => {
    setMatchHistory((prev) => prev.filter((m) => m.id !== id));
    try {
      await deleteDoc(doc(db, 'matchHistory', id));
    } catch (err: any) {
      console.warn('Firestore delete notice:', err?.message);
    }
  };

  const updateMatchHistoryEntry = async (
    id: string,
    updatedData: Partial<MatchHistoryEntry>
  ): Promise<void> => {
    setMatchHistory((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedData } : m))
    );
    try {
      await updateDoc(doc(db, 'matchHistory', id), updatedData);
    } catch (err: any) {
      console.warn('Firestore updateMatchHistoryEntry notice:', err?.message);
    }
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

    try {
      // Salva estado completo no Firestore notificando instantaneamente todos os dispositivos escutando
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...updatedMatch,
        updatedAt: serverTimestamp(),
      });
    } catch (err: any) {
      console.warn('Firestore addMatchEvent notice:', err?.message);
    }

    if (type === 'goal' && scorer) {
      try {
        await updateDoc(doc(db, 'players', scorer.id), {
          goals: increment(1),
        });
      } catch {}
    }
    if (type === 'goal' && assistPlayer) {
      try {
        await updateDoc(doc(db, 'players', assistPlayer.id), {
          assists: increment(1),
        });
      } catch {}
    }
  };

  const setMatchClockMinutes = async (minutes: number): Promise<void> => {
    const totalSecs = minutes * 60;
    const matchDurationSecs = (liveMatch.durationMinutes || 15) * 60;
    const newElapsed = Math.max(0, matchDurationSecs - totalSecs);
    const now = Date.now();

    const updatedMatch: LiveMatchFull = {
      ...liveMatch,
      elapsedSeconds: newElapsed,
      timerStartedAt: liveMatch.isTimerRunning ? now : undefined,
      clock: `${minutes}:00`,
    };

    setLiveMatch(updatedMatch);

    try {
      await setDoc(doc(db, 'liveMatch', 'current'), {
        ...updatedMatch,
        timerStartedAt: liveMatch.isTimerRunning ? now : null,
        updatedAt: serverTimestamp(),
      });
    } catch {}
  };

  const setUpcomingMatchesList = async (matches: UpcomingMatch[]): Promise<void> => {
    setUpcomingMatches(matches);
    try {
      const snapshot = await getDocs(collection(db, 'upcomingMatches'));
      for (const d of snapshot.docs) {
        await deleteDoc(d.ref);
      }
      for (const m of matches) {
        await setDoc(doc(db, 'upcomingMatches', m.id), m);
      }
    } catch {}
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
        serverClockOffset,
        calculateRemainingSeconds,
        formatMatchClock,
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
        updateMatchHistoryEntry,
        toggleLiveTimer,
        addExtraTimeToLiveMatch,
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
