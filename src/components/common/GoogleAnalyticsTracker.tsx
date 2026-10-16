import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  initGlobalClickTracking,
  observeSections,
  trackPageView,
} from '../../utils/analytics';

const getPageTitleFromPath = (pathname: string): string => {
  if (pathname === '/' || pathname === '/inicio') return 'Início | MopaFut';
  if (pathname === '/partidas') return 'Partidas | MopaFut';
  if (pathname.startsWith('/ao-vivo/') && pathname.endsWith('/lances'))
    return 'Registro de Lances | MopaFut';
  if (pathname.startsWith('/ao-vivo/')) return 'Placar Ao Vivo | MopaFut';
  if (pathname === '/historico') return 'Histórico de Confrontos | MopaFut';
  if (pathname === '/tatico') return 'Quadro Tático | MopaFut';
  if (pathname === '/elencos') return 'Elenco de Atletas | MopaFut';
  if (pathname === '/jogador/novo') return 'Cadastrar Atleta | MopaFut';
  if (pathname.startsWith('/jogador/')) return 'Perfil do Atleta | MopaFut';
  if (pathname === '/clubes') return 'Clubes Participantes | MopaFut';
  if (pathname === '/clubes/novo') return 'Cadastrar Clube | MopaFut';
  if (pathname.startsWith('/clube/')) return 'Perfil do Clube | MopaFut';
  if (pathname === '/estatisticas') return 'Classificação e Estatísticas | MopaFut';
  return 'MopaFut | Society dos quebrados';
};

export const GoogleAnalyticsTracker: React.FC = () => {
  const location = useLocation();

  // Initialize global click tracking once
  useEffect(() => {
    initGlobalClickTracking();
  }, []);

  // Track page view and section visibility on route change
  useEffect(() => {
    const fullPath = location.pathname + location.search;
    const pageTitle = getPageTitleFromPath(location.pathname);

    // Update document title dynamically
    document.title = pageTitle;

    // Send page_view to Google Analytics
    trackPageView(fullPath, pageTitle);

    // Give the DOM a moment to mount the new page components, then observe sections
    const timer = setTimeout(() => {
      observeSections();
    }, 350);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);

  return null;
};

export default GoogleAnalyticsTracker;
