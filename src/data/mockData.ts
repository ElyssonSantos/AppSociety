import { LiveMatch, LiveMatchFull, Player, UpcomingMatch, QuickActionItem, Team } from '../types';

export const mockLiveMatch: LiveMatch = {
  id: 'match-derby-01',
  homeTeam: {
    name: 'Man. United',
    role: 'Mandante',
    score: 3,
    icon: 'shield',
  },
  awayTeam: {
    name: 'Man. City',
    role: 'Visitante',
    score: 1,
    icon: 'shield',
  },
  statusTag: 'Dérbi em Andamento',
  clock: "85' 2T",
  venue: 'Old Trafford',
  lastEvent: {
    minute: "79'",
    type: 'goal',
    player: 'Rashford',
    assist: 'B. Fernandes',
    description: "Gol! 79' Rashford (Assistência B. Fernandes)",
    xG: 2.45,
  },
};

// Dados completos para página de detalhes ao vivo
export const mockLiveMatchFull: LiveMatchFull = {
  id: 'match-derby-01',
  homeTeam: { name: 'Man. United', score: 3, icon: 'shield' },
  awayTeam: { name: 'Man. City', score: 1, icon: 'shield' },
  status: 'live',
  clock: "85'",
  venue: 'Old Trafford',
  competition: 'Premier League — Dérbi',
  events: [
    {
      id: 'ev1',
      minute: "12'",
      type: 'goal',
      player: 'B. Fernandes',
      team: 'home',
      assist: 'Rashford',
      description: 'Gol de fora da área, canto inferior esquerdo.',
    },
    {
      id: 'ev2',
      minute: "34'",
      type: 'yellow_card',
      player: 'Rodri',
      team: 'away',
      description: 'Falta dura no meio-campo.',
    },
    {
      id: 'ev3',
      minute: "51'",
      type: 'goal',
      player: 'Haaland',
      team: 'away',
      description: 'Cabeceio após escanteio. 1-1.',
    },
    {
      id: 'ev4',
      minute: "67'",
      type: 'goal',
      player: 'Højlund',
      team: 'home',
      assist: 'B. Fernandes',
      description: 'Contra-ataque fulminante. 2-1.',
    },
    {
      id: 'ev5',
      minute: "79'",
      type: 'goal',
      player: 'Rashford',
      team: 'home',
      assist: 'B. Fernandes',
      description: 'Chapéu no goleiro. Virada completa! 3-1.',
    },
  ],
};

export const mockQuickActions: QuickActionItem[] = [
  {
    id: 'live-score',
    title: 'Placar Ao Vivo',
    description: 'Controle minuto a minuto e gols em tempo real.',
    icon: 'flash_on',
    badge: '2 Ativas',
    badgeColorClass: 'bg-primary-container/20 text-primary',
    iconColorClass: 'text-primary',
    path: '/partidas',
  },
  {
    id: 'roster-add',
    title: 'Cadastrar Elenco',
    description: 'Novos jogadores, fotos corporais e biometria.',
    icon: 'group_add',
    badge: '28 Atletas',
    badgeColorClass: 'bg-secondary-container/20 text-secondary',
    iconColorClass: 'text-secondary',
    path: '/elencos',
  },
  {
    id: 'tactical-board',
    title: 'Quadro Tático',
    description: 'Prancheta digital, bolas paradas e marcação.',
    icon: 'tactic',
    badge: '4-3-3',
    badgeColorClass: 'bg-tertiary-container/20 text-tertiary',
    iconColorClass: 'text-tertiary',
    path: '/tatico',
  },
  {
    id: 'reports',
    title: 'Classificação',
    description: 'Tabela oficial do campeonato, pontos e aproveitamento.',
    icon: 'leaderboard',
    badge: 'Série A',
    badgeColorClass: 'bg-surface-container-highest text-on-surface',
    iconColorClass: 'text-surface-tint',
    path: '/estatisticas',
  },
];

export const mockRecentPlayers: Player[] = [
  {
    id: 'p1',
    name: 'M. Rashford',
    number: 10,
    position: 'Atacante Ponta',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCukewfSAiSf_7m6vAxHHuMLdhjlBYrjfvCmFUUJI1Q3CWNCMVnFylwHnDtpvmiqg_LH-a9Fo2mtZZas5R_YP2v_iDVaZFkzFyC63yKlkV7U_5-TPOugChWGP3uaYevpfILL6QEn6Lo0P8ScKjmySBoDO4fXGS2oLHTkt7AYCZNLu9efBeGjttzr1zYgSj8E2Ea_lwohktrIBlqMLViHE1Gzrhlj__ogMNBS4ZjlTcnWQYjm9uqhraQ',
    rating: 8.4,
    goals: 14,
    assists: 5,
    form: 8.4,
    matches: 32,
    minutesPlayed: 2780,
  },
  {
    id: 'p2',
    name: 'B. Fernandes',
    number: 8,
    position: 'Meia Central',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDU-YF1XRgxitgiE9WZcemuPHYd_4W4aGGM5cwDjLuMD4ugOldPinDxlw2qQPAOTI8FXMvJGe3tuZKD2YqlXEu7OYlJYDpNsDbTMg719KtRZCHf8pIgQplvpd1FIit1UpeOQXKzutk8uncvdC2Z4E6WFBd1CkuwmgnM4QCjH4EyW_WqrJsOIktVm1w8cSLo7K-YnDUhlFFKoN-ruKCwoO8ZmdxWjrpHYglicEzFseA6b3P98uHGs-4l',
    rating: 8.9,
    assists: 18,
    goals: 9,
    form: 8.9,
    matches: 34,
    minutesPlayed: 3042,
  },
  {
    id: 'p3',
    name: 'R. Højlund',
    number: 9,
    position: 'Centroavante',
    photoUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuARtAKGGPUJVEDuT-OIGD9kjaeNwJNS1DuRq2W5NPnHayZyxVtg2xKzd9xv9naohKQ-9aHUh9QYoUc9u435e20le3-CyqGBNV9btMYzGomH9lenCQ0cjrtaIWlWyeTfu8zZaalCgun8oFV2I3MQWTaGZFZtBiWU_4mce2jiu2_oab3R-Y6jNf_zItQufw7-Tc0HTG6UpOHBzySnIw9RJbP8puk_7Zkf2R6P7HXaz4q-BQy1yVWoIbSV',
    rating: 7.8,
    goals: 11,
    assists: 3,
    form: 7.8,
    matches: 28,
    minutesPlayed: 2310,
  },
];

// Alias exportado para compatibilidade com PlayerProfilePage
export const MOCK_PLAYERS = mockRecentPlayers;

export const mockUpcomingMatches: UpcomingMatch[] = [
  {
    id: 'up-1',
    homeTeam: 'Chelsea',
    awayTeam: 'Arsenal',
    dateLabel: 'Amanhã',
    time: '16:00',
    venue: 'Stamford Bridge',
    competition: 'Premier League',
  },
  {
    id: 'up-2',
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern',
    dateLabel: 'Ter • 20/05',
    time: '20:30',
    venue: 'Santiago Bernabéu',
    competition: 'Semifinal',
  },
];

export const mockTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Resenha FC',
    players: ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'],
  },
  {
    id: 'team-2',
    name: 'Amigos do Zico',
    players: ['p9', 'p10', 'p11', 'p12'],
  },
];

export interface StandingEntry {
  position: number;
  name: string;
  abbreviation: string;
  color: string;
  borderColor: string;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  form: ('W' | 'D' | 'L')[];
  zone?: 'libertadores' | 'sulamericana' | 'relegation' | 'neutral';
}

export const MOCK_STANDINGS: StandingEntry[] = [
  { position: 1, name: 'Palmeiras', abbreviation: 'PAL', color: 'bg-emerald-950', borderColor: 'border-emerald-500/40', points: 52, played: 25, wins: 15, draws: 7, losses: 3, goalsFor: 45, goalsAgainst: 21, goalDiff: 24, form: ['W', 'W', 'D', 'L', 'W'], zone: 'libertadores' },
  { position: 2, name: 'Flamengo', abbreviation: 'FLA', color: 'bg-red-950', borderColor: 'border-red-500/40', points: 49, played: 25, wins: 14, draws: 7, losses: 4, goalsFor: 42, goalsAgainst: 22, goalDiff: 20, form: ['W', 'D', 'W', 'W', 'L'], zone: 'libertadores' },
  { position: 3, name: 'Internacional', abbreviation: 'INT', color: 'bg-red-900', borderColor: 'border-red-600/40', points: 46, played: 25, wins: 13, draws: 7, losses: 5, goalsFor: 38, goalsAgainst: 25, goalDiff: 13, form: ['D', 'W', 'L', 'W', 'W'], zone: 'libertadores' },
  { position: 4, name: 'São Paulo', abbreviation: 'SAO', color: 'bg-red-800', borderColor: 'border-red-700/40', points: 44, played: 25, wins: 12, draws: 8, losses: 5, goalsFor: 35, goalsAgainst: 26, goalDiff: 9, form: ['L', 'W', 'D', 'D', 'W'], zone: 'libertadores' },
  { position: 5, name: 'Grêmio', abbreviation: 'GRE', color: 'bg-blue-900', borderColor: 'border-blue-500/40', points: 41, played: 25, wins: 11, draws: 8, losses: 6, goalsFor: 33, goalsAgainst: 28, goalDiff: 5, form: ['W', 'L', 'D', 'W', 'D'], zone: 'sulamericana' },
  { position: 6, name: 'Corinthians', abbreviation: 'COR', color: 'bg-yellow-900', borderColor: 'border-yellow-500/40', points: 38, played: 25, wins: 10, draws: 8, losses: 7, goalsFor: 30, goalsAgainst: 28, goalDiff: 2, form: ['D', 'D', 'L', 'W', 'W'], zone: 'sulamericana' },
  { position: 7, name: 'Atlético-MG', abbreviation: 'CAM', color: 'bg-gray-800', borderColor: 'border-gray-500/40', points: 36, played: 25, wins: 10, draws: 6, losses: 9, goalsFor: 29, goalsAgainst: 30, goalDiff: -1, form: ['L', 'W', 'D', 'L', 'D'], zone: 'sulamericana' },
  { position: 8, name: 'Botafogo', abbreviation: 'BOT', color: 'bg-gray-700', borderColor: 'border-gray-400/40', points: 34, played: 25, wins: 9, draws: 7, losses: 9, goalsFor: 28, goalsAgainst: 32, goalDiff: -4, form: ['W', 'L', 'D', 'D', 'L'], zone: 'neutral' },
  { position: 9, name: 'Cruzeiro', abbreviation: 'CRU', color: 'bg-blue-800', borderColor: 'border-blue-600/40', points: 32, played: 25, wins: 8, draws: 8, losses: 9, goalsFor: 26, goalsAgainst: 30, goalDiff: -4, form: ['D', 'L', 'W', 'L', 'D'], zone: 'neutral' },
  { position: 10, name: 'Santos', abbreviation: 'SAN', color: 'bg-white-900', borderColor: 'border-white-400/40', points: 28, played: 25, wins: 7, draws: 7, losses: 11, goalsFor: 24, goalsAgainst: 35, goalDiff: -11, form: ['L', 'D', 'L', 'W', 'L'], zone: 'relegation' },
  { position: 11, name: 'Athletico-PR', abbreviation: 'CAP', color: 'bg-red-700', borderColor: 'border-red-500/40', points: 26, played: 25, wins: 6, draws: 8, losses: 11, goalsFor: 22, goalsAgainst: 34, goalDiff: -12, form: ['D', 'L', 'D', 'L', 'W'], zone: 'relegation' },
  { position: 12, name: 'Bahia', abbreviation: 'BAH', color: 'bg-blue-950', borderColor: 'border-blue-400/40', points: 24, played: 25, wins: 5, draws: 9, losses: 11, goalsFor: 20, goalsAgainst: 36, goalDiff: -16, form: ['L', 'D', 'L', 'D', 'L'], zone: 'relegation' },
];

export const mockAllPlayers: Player[] = [
  {
    id: 'p1',
    name: 'M. Rashford',
    number: 10,
    position: 'Atacante Ponta',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCukewfSAiSf_7m6vAxHHuMLdhjlBYrjfvCmFUUJI1Q3CWNCMVnFylwHnDtpvmiqg_LH-a9Fo2mtZZas5R_YP2v_iDVaZFkzFyC63yKlkV7U_5-TPOugChWGP3uaYevpfILL6QEn6Lo0P8ScKjmySBoDO4fXGS2oLHTkt7AYCZNLu9efBeGjttzr1zYgSj8E2Ea_lwohktrIBlqMLViHE1Gzrhlj__ogMNBS4ZjlTcnWQYjm9uqhraQ',
    rating: 8.4,
    goals: 14,
    assists: 5,
    form: 8.4,
    matches: 32,
    minutesPlayed: 2780,
  },
  {
    id: 'p2',
    name: 'B. Fernandes',
    number: 8,
    position: 'Meia Central',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDU-YF1XRgxitgiE9WZcemuPHYd_4W4aGGM5cwDjLuMD4ugOldPinDxlw2qQPAOTI8FXMvJGe3tuZKD2YqlXEu7OYlJYDpNsDbTMg719KtRZCHf8pIgQplvpd1FIit1UpeOQXKzutk8uncvdC2Z4E6WFBd1CkuwmgnM4QCjH4EyW_WqrJsOIktVm1w8cSLo7K-YnDUhlFFKoN-ruKCwoO8ZmdxWjrpHYglicEzFseA6b3P98uHGs-4l',
    rating: 8.9,
    assists: 18,
    goals: 9,
    form: 8.9,
    matches: 34,
    minutesPlayed: 3042,
  },
  {
    id: 'p3',
    name: 'R. Højlund',
    number: 9,
    position: 'Centroavante',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARtAKGGPUJVEDuT-OIGD9kjaeNwJNS1DuRq2W5NPnHayZyxVtg2xKzd9xv9naohKQ-9aHUh9QYoUc9u435e20le3-CyqGBNV9btMYzGomH9lenCQ0cjrtaIWlWyeTfu8zZaalCgun8oFV2I3MQWTaGZFZtBiWU_4mce2jiu2_oab3R-Y6jNf_zItQufw7-Tc0HTG6UpOHBzySnIw9RJbP8puk_7Zkf2R6P7HXaz4q-BQy1yVWoIbSV',
    rating: 7.8,
    goals: 11,
    assists: 3,
    form: 7.8,
    matches: 28,
    minutesPlayed: 2310,
  },
  {
    id: 'p4',
    name: 'L. Martínez',
    number: 6,
    position: 'Zagueiro Central',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBqKzXWBb6TVJxK7xB4gY6j1mNOPqrSTUVw8xCDE2FGHIJKMNoZqR4_s5gK7l2hJK8vw_Fz9xT3QRSTUVw8xCDE2FGHIJKMNoZqR4_s5gK7l2hJK8vw_Fz9xT',
    rating: 8.1,
    goals: 2,
    assists: 1,
    form: 8.1,
    matches: 30,
    minutesPlayed: 2700,
  },
  {
    id: 'p5',
    name: 'K. Mainoo',
    number: 37,
    position: 'Volante',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQ',
    rating: 7.6,
    goals: 1,
    assists: 4,
    form: 7.6,
    matches: 25,
    minutesPlayed: 1890,
  },
  {
    id: 'p6',
    name: 'A. Onana',
    number: 24,
    position: 'Goleiro',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQR',
    rating: 7.2,
    goals: 0,
    assists: 0,
    form: 7.2,
    matches: 34,
    minutesPlayed: 3060,
  },
  {
    id: 'p7',
    name: 'D. Dalot',
    number: 20,
    position: 'Lateral Direito',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRS',
    rating: 7.5,
    goals: 1,
    assists: 3,
    form: 7.5,
    matches: 29,
    minutesPlayed: 2340,
  },
  {
    id: 'p8',
    name: 'M. Diallo',
    number: 16,
    position: 'Extremo Direito',
    teamId: 'team-pro',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRST',
    rating: 7.3,
    goals: 4,
    assists: 6,
    form: 7.3,
    matches: 22,
    minutesPlayed: 1456,
  },
  {
    id: 'p9',
    name: 'S. Eriksen',
    number: 14,
    position: 'Meia Ofensivo',
    teamId: 'team-base',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTU',
    rating: 7.4,
    goals: 2,
    assists: 5,
    form: 7.4,
    matches: 18,
    minutesPlayed: 980,
  },
  {
    id: 'p10',
    name: 'J. Mount',
    number: 7,
    position: 'Meia Central',
    teamId: 'team-base',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUV',
    rating: 7.1,
    goals: 1,
    assists: 2,
    form: 7.1,
    matches: 12,
    minutesPlayed: 650,
  },
  {
    id: 'p11',
    name: 'T. Collymore',
    number: 45,
    position: 'Atacante',
    teamId: 'team-base',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVW',
    rating: 7.0,
    goals: 3,
    assists: 1,
    form: 7.0,
    matches: 15,
    minutesPlayed: 890,
  },
  {
    id: 'p12',
    name: 'W. Faremi',
    number: 42,
    position: 'Meia',
    teamId: 'team-base',
    photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVw8xCDEFGHIJKLMNOPQRSTUVWX',
    rating: 6.9,
    goals: 0,
    assists: 1,
    form: 6.9,
    matches: 8,
    minutesPlayed: 340,
  },
];
