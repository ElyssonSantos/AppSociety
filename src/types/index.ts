export type SocietyPosition =
  | 'Goleiro'
  | 'Fixo'
  | 'Ala Direita'
  | 'Ala Esquerda'
  | 'Meio-Campo'
  | 'Pivô';

export const SOCIETY_POSITIONS: SocietyPosition[] = [
  'Goleiro',
  'Fixo',
  'Ala Direita',
  'Ala Esquerda',
  'Meio-Campo',
  'Pivô',
];

export interface Player {
  id: string;
  name: string;
  number: number;
  position: SocietyPosition | string;
  photoUrl: string;
  rating: number;
  goals?: number;
  assists?: number;
  form?: number;
  matches?: number;
  minutesPlayed?: number;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  shieldUrl?: string;
  players: string[];
  points?: number;
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDiff?: number;
  form?: ('W' | 'D' | 'L')[];
}

export interface MatchEvent {
  id: string;
  minute: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'sub' | 'shot' | 'foul';
  player: string;
  team: 'home' | 'away';
  assist?: string;
  description: string;
}

export interface LiveMatchFull {
  id: string;
  homeTeam: {
    name: string;
    score: number;
    icon: string;
  };
  awayTeam: {
    name: string;
    score: number;
    icon: string;
  };
  status: 'live' | 'upcoming' | 'finished';
  clock: string;
  venue: string;
  competition: string;
  events: MatchEvent[];
}

export interface LiveMatchEvent {
  minute: string;
  type: 'goal' | 'card' | 'sub';
  description: string;
  player: string;
  assist?: string;
  xG?: number;
}

export interface LiveMatch {
  id: string;
  homeTeam: {
    name: string;
    role: string;
    score: number;
    icon: string;
  };
  awayTeam: {
    name: string;
    role: string;
    score: number;
    icon: string;
  };
  statusTag: string;
  clock: string;
  venue: string;
  lastEvent: LiveMatchEvent;
}

export interface UpcomingMatch {
  id: string;
  homeTeam: string;
  awayTeam: string;
  dateLabel: string;
  time: string;
  venue: string;
  competition: string;
}

export interface MatchHistoryEntry {
  id: string;
  date: string; // ISO string
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  competition: string;
  venue: string;
  events: MatchEvent[];
}
