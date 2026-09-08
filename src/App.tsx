import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/Home/HomePage';
import { MatchesPage } from './pages/Matches/MatchesPage';
import { LiveMatchDetailsPage } from './pages/Matches/LiveMatchDetailsPage';
import { LiveEventRegistrationPage } from './pages/Matches/LiveEventRegistrationPage';
import MatchHistoryPage from './pages/Matches/MatchHistoryPage';
import { TacticsPage } from './pages/Tactics/TacticsPage';
import { RosterPage } from './pages/Roster/RosterPage';
import PlayerProfilePage from './pages/Roster/PlayerProfilePage';
import PlayerRegistrationPage from './pages/Roster/PlayerRegistrationPage';
import { ClubsPage } from './pages/Clubs/ClubsPage';
import { ClubRegistrationPage } from './pages/Clubs/ClubRegistrationPage';
import { StatsPage } from './pages/Stats/StatsPage';
import { AppProvider } from './context/AppContext';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/inicio" replace />} />
            <Route path="inicio" element={<HomePage />} />
            <Route path="partidas" element={<MatchesPage />} />
            <Route path="ao-vivo/:id" element={<LiveMatchDetailsPage />} />
            <Route path="ao-vivo/:id/lances" element={<LiveEventRegistrationPage />} />
            <Route path="historico" element={<MatchHistoryPage />} />
            <Route path="tatico" element={<TacticsPage />} />
            <Route path="elencos" element={<RosterPage />} />
            <Route path="jogador/novo" element={<PlayerRegistrationPage />} />
            <Route path="jogador/:id" element={<PlayerProfilePage />} />
            <Route path="clubes" element={<ClubsPage />} />
            <Route path="clubes/novo" element={<ClubRegistrationPage />} />
            <Route path="estatisticas" element={<StatsPage />} />
            <Route path="*" element={<Navigate to="/inicio" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
