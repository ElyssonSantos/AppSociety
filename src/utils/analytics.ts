export const GA_MEASUREMENT_ID = 'G-6F1MW504TD';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Safely invokes Google Analytics gtag function or pushes to window.dataLayer
 */
export const sendGtag = (...args: any[]): void => {
  if (typeof window === 'undefined') return;

  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  } else {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(args);
  }
};

/**
 * Tracks route / page view changes in the Single Page Application
 */
export const trackPageView = (path: string, title?: string): void => {
  const pageTitle = title || document.title || 'MopaFut';
  const pageLocation = typeof window !== 'undefined' ? window.location.href : '';

  sendGtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
    page_title: pageTitle,
    page_location: pageLocation,
  });

  sendGtag('event', 'page_view', {
    page_path: path,
    page_title: pageTitle,
    page_location: pageLocation,
  });
};

/**
 * Tracks visibility of specific sections within pages
 */
export const trackSectionView = (sectionName: string, path?: string): void => {
  const currentPath = path || (typeof window !== 'undefined' ? window.location.pathname : '');

  sendGtag('event', 'section_view', {
    event_category: 'Section',
    section_name: sectionName,
    page_path: currentPath,
  });
};

/**
 * Tracks clicks on buttons, navigation items and interactive controls
 */
export const trackButtonClick = (buttonName: string, details: Record<string, any> = {}): void => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  sendGtag('event', 'button_click', {
    event_category: 'Button',
    button_name: buttonName,
    page_path: currentPath,
    ...details,
  });
};

/**
 * Custom event helper
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}): void => {
  sendGtag('event', eventName, params);
};

/**
 * Extracts a readable label for any interactive element
 */
function getElementLabel(el: HTMLElement): string {
  const aria = el.getAttribute('aria-label');
  if (aria && aria.trim()) return aria.trim();

  const title = el.getAttribute('title');
  if (title && title.trim()) return title.trim();

  const dataName = el.getAttribute('data-button-name') || el.getAttribute('data-action');
  if (dataName && dataName.trim()) return dataName.trim();

  const text = el.innerText || el.textContent;
  if (text && text.trim()) {
    return text.trim().replace(/\s+/g, ' ').slice(0, 60);
  }

  const id = el.getAttribute('id');
  if (id) return id;

  const name = el.getAttribute('name');
  if (name) return name;

  if (el instanceof HTMLInputElement && el.value) {
    return el.value;
  }

  return 'Botão sem texto';
}

/**
 * Resolves the parent section name of an element
 */
function getSectionName(el: HTMLElement): string {
  const sectionEl = el.closest('[data-section]');
  if (sectionEl) {
    const sName = sectionEl.getAttribute('data-section');
    if (sName) return sName;
  }

  if (el.closest('header')) return 'Cabeçalho';
  if (el.closest('nav')) return 'Navegação / Menu';
  if (el.closest('footer')) return 'Rodapé';
  if (el.closest('dialog, [role="dialog"], [class*="modal"]')) return 'Modal / Diálogo';

  const container = el.closest('section, article, div[class*="rounded"]');
  if (container) {
    const heading = container.querySelector('h1, h2, h3, h4');
    if (heading && heading.textContent && heading.textContent.trim()) {
      return heading.textContent.trim().slice(0, 50);
    }
  }

  return 'Conteúdo Principal';
}

let isClickTrackingInitialized = false;

/**
 * Automatically captures button, link, and interactive control clicks across all pages and sections
 */
export const initGlobalClickTracking = (): void => {
  if (typeof window === 'undefined' || isClickTrackingInitialized) return;
  isClickTrackingInitialized = true;

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const clickable = target.closest<HTMLElement>(
        'button, a, [role="button"], input[type="button"], input[type="submit"], [data-action]'
      );

      if (clickable) {
        const buttonLabel = getElementLabel(clickable);
        const sectionName = getSectionName(clickable);
        const tagName = clickable.tagName.toLowerCase();
        const href = clickable.getAttribute('href') || undefined;

        trackButtonClick(buttonLabel, {
          button_tag: tagName,
          button_id: clickable.id || undefined,
          section: sectionName,
          destination_url: href,
        });
      }
    },
    { capture: true, passive: true }
  );
};

let sectionObserver: IntersectionObserver | null = null;
const observedSectionsThisPage = new Set<string>();

/**
 * Observes sections on the current page and sends section_view metrics when visible
 */
export const observeSections = (): void => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

  if (sectionObserver) {
    sectionObserver.disconnect();
  }
  observedSectionsThisPage.clear();

  sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
          const el = entry.target as HTMLElement;
          const sectionName =
            el.getAttribute('data-section') ||
            el.querySelector('h1, h2, h3, h4')?.textContent?.trim() ||
            el.getAttribute('aria-label') ||
            el.tagName.toLowerCase();

          if (sectionName && !observedSectionsThisPage.has(sectionName)) {
            observedSectionsThisPage.add(sectionName);
            trackSectionView(sectionName);
          }
        }
      });
    },
    { threshold: [0.2] }
  );

  const elements = document.querySelectorAll(
    'section, header, nav, [data-section], div[class*="rounded-2xl"], div[class*="rounded-xl"]'
  );

  elements.forEach((el) => {
    const hasIdentifier =
      el.hasAttribute('data-section') ||
      el.tagName === 'HEADER' ||
      el.tagName === 'NAV' ||
      el.tagName === 'SECTION' ||
      el.querySelector('h1, h2, h3');

    if (hasIdentifier) {
      sectionObserver?.observe(el);
    }
  });
};
