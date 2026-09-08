---
name: Pro Pitch Dark
colors:
  surface: '#121316'
  surface-dim: '#121316'
  surface-bright: '#38393c'
  surface-container-lowest: '#0d0e11'
  surface-container-low: '#1b1b1f'
  surface-container: '#1f1f23'
  surface-container-high: '#292a2d'
  surface-container-highest: '#343538'
  on-surface: '#e3e2e6'
  on-surface-variant: '#e6bdb9'
  inverse-surface: '#e3e2e6'
  inverse-on-surface: '#2f3034'
  outline: '#ad8885'
  outline-variant: '#5d3f3d'
  surface-tint: '#ffb3ad'
  primary: '#ffb3ad'
  on-primary: '#68000a'
  primary-container: '#e0202c'
  on-primary-container: '#fff8f7'
  inverse-primary: '#c0001c'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#a16600'
  on-tertiary-container: '#fff9f5'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad7'
  primary-fixed-dim: '#ffb3ad'
  on-primary-fixed: '#410004'
  on-primary-fixed-variant: '#930013'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#121316'
  on-background: '#e3e2e6'
  surface-variant: '#343538'
typography:
  display-score:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 52px
    letterSpacing: -0.04em
  headline-xl:
    fontFamily: Outfit
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Outfit
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-tactical:
    fontFamily: Space Grotesk
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-badge:
    fontFamily: Space Grotesk
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.06em
  stat-metric:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.25rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 2.5rem
  gutter-mobile: 1rem
  gutter-desktop: 1.5rem
  card-pad-sm: 0.875rem
  card-pad-md: 1.25rem
---

## Brand & Style

This design system is engineered for elite football analysis, live match monitoring, tactical management, and player performance scouting. The tone balances matchday adrenaline with the precision of high-performance analytics. The aesthetic merges tactical sophistication with an ultra-clean, modern dark mode. 

Visual characteristics draw from low-reflection sports arena displays, broadcast graphics, and telemetry dashboards:
- Deep obsidian matte backdrops reduce eye strain during night matches and high-frequency live tracking.
- Dynamic athletic accents—a high-energy championship crimson and an authentic stadium pitch emerald—anchor data visualizations, live status markers, and interactive tactical nodes.
- Surfaces adopt a refined matte layered finish, eschewing glossy reflections in favor of subtle border luminescence and subdued graphite tonal layering.

## Colors

The palette is tuned specifically for deep dark mode ergonomics, contrast compliance, and live match data legibility.

### Primary (`#E0202C`)
The primary crimson drives high-impact urgency: live match status indicators, key primary CTAs, critical foul alerts, and match highlights. On dark surfaces, it yields a fierce, energetic silhouette without bleeding.

### Secondary (`#10B981`)
The pitch-green accent symbolizes on-field positive metrics: completed passes, high match ratings (>7.5), win streaks, tactical possession dominance, and player fitness validation.

### Tertiary (`#F59E0B`)
An amber caution tone reserved for live match clock elapsed time badges, yellow cards, pending substitutions, and neutral draw results.

### Neutral & Surfaces (`#121316`)
The foundation uses tiered, deep obsidian neutrals:
- **Canvas Base (`#0B0C0E`)**: Primary background for main screens.
- **Surface Level 1 (`#16171B`)**: Default card backdrop and tactical container fill.
- **Surface Level 2 (`#202227`)**: Elevated popovers, segmented controls, and nested list tiles.
- **Border Subtle (`#2E3138`)**: Low-contrast boundary lines providing clean geometry without distraction.
- **Text High-Emphasis (`#F9FAFB`)**: Crisp off-white for scores, player names, and vital stats.
- **Text Muted (`#9CA3AF`)**: Balanced gray for sublabels, team nationalities, and secondary metrics.

## Typography

Typography balances display power with condensed data legibility:

- **Outfit** carries headlines, match scores, and large player profile headers. Its geometric cut provides athletic momentum and high clarity at scale.
- **Plus Jakarta Sans** manages dense information sets: game summaries, commentary feeds, line-up status notes, and tactical player profiles. It remains exceptionally legible across dark backgrounds.
- **Space Grotesk** serves specialized sports telemetry: tactical pitch numbers, match clock counters, live status tags, formation selectors (e.g., `4-2-3-1`), and player positional badges (e.g., `CAM`, `CB`, `ST`).

## Layout & Spacing

The spatial model prioritizes high data density without feeling cluttered.

### Mobile Standard (375px - 430px)
- **Margins**: Consistent 16px (`1rem`) screen gutters.
- **Card Padding**: 14px to 20px internal padding. Dense match statistic rows use an 8px vertical grid.
- **Tactical Pitch Scaling**: Formations adopt a fixed 4:5 aspect ratio on mobile, preserving touch target zones for on-pitch player nodes (minimum 44x44px hit areas).

### Breakpoints & Reflow
- **Compact (`< 600px`)**: Single-column vertical scroll. Live match tracker sits pinned or sticky at the top, followed by segmented analytics and line-up trays.
- **Medium (`600px - 1024px`)**: Dual-pane layout. The tactical pitch canvas locks to a sticky left quadrant while comparative squad stats and match incident feeds stream on the right.
- **Expanded (`> 1024px`)**: Multi-column command view. Left column houses league tables and quick match pickers, center column displays tactical formations with heatmaps, and right column streams live telemetry and player comparisons.

## Elevation & Depth

This design system uses a matte tactical layering structure rather than heavy drop shadows, mimicking military avionics and modern digital stadium suites.

- **Base Layer (`#0B0C0E`)**: Deep matte canvas that recedes into the hardware bezel.
- **Level 1 Containers (`#16171B`)**: Match cards, team roster modules, and tactical boards. Defined by a 1px solid perimeter stroke in `#2E3138` with no direct shadow.
- **Level 2 Interactive & Floating Surfaces (`#202227`)**: Bottom navigation bar, floating action buttons, and dropdown filter pickers. Enhanced with an ambient, diffused shadow: `0 8px 24px -4px rgba(0, 0, 0, 0.65)` and a subtle top edge highlight in `rgba(255, 255, 255, 0.08)`.
- **Pitch Depth**: The virtual field surface uses a subtle radial glow anchored at the center circle, moving from dark tactical grass green (`#12281E`) toward the edges (`#0E1A15`), overlayed with semi-transparent white field boundaries (`rgba(255, 255, 255, 0.35)`).
- **Match Focus Flare**: When a team scores or a match is active ("Live"), cards may receive a 1px accent border glow in `#E0202C` with a soft diffused outer ambient aura (`box-shadow: 0 0 16px -2px rgba(224, 32, 44, 0.25)`).

## Shapes

The geometric architecture pairs structural athletic discipline with comfortable hand-held ergonomics:

- **Cards and Pitch Containers**: Default to `16px` (`rounded-lg` / `1rem`), providing a contained frame for player headshots, scoreboards, and tactical boards.
- **Pills & Status Tags**: Fully rounded (`9999px`) for match clocks (e.g., `'85`), live badges, and league category filters.
- **Tactical Player Nodes**: Circular tokens (`40px` to `48px` diameter) equipped with squad numbers, position indicators, and sub-status pips.
- **Metric Micro-Bars**: `4px` corner radii on horizontal comparative possession and shot graphs, ensuring data reads crisply at small sizes.

## Components

### Live Score & Match Header Card
- **Structure**: Surface Level 1 with 16px corner radius and 1px `#2E3138` border.
- **Content Layout**: Club crests (36px–44px) flanking the central score box. Large scores rendered in `display-score` font.
- **Live Badge**: Positioned at the top right of the card. A pill badge in dark translucent crimson (`rgba(224, 32, 44, 0.15)`) with `#E0202C` text and a pulsing live dot indicator.
- **Time Indicator**: Tertiary amber or secondary pitch emerald text set in `label-badge` typography, with a vertical divider separating the current half.

### Tactical Pitch Board
- **Pitch Container**: High-durability tactical green canvas with clipped white boundary lines, center circle, and penalty boxes.
- **Player Nodes**: Circular avatar or jersey number badge (diameter: 40px) surrounded by an active status ring:
  - Red ring (`#E0202C`): Active team possession / attacking focus.
  - Emerald green tag (`#10B981`): High match rating badge (>7.5).
  - Subtitle: Surname in `body-sm` bold, with tactical number in `label-tactical`.
- **Bench & Formations Bar**: Segmented pill switch at the pitch base allowing rapid toggle between "Lineup" and "Bench".

### Buttons & Interactive CTAs
- **Primary Athletic Button**: Solid crimson background (`#E0202C`), white bold typography (`body-md`), 12px border radius, 48px height. On press: scales down slightly (`0.98`) with darkened fill (`#B91C1C`).
- **Secondary / Ghost Button**: Translucent dark surface (`#202227`), subtle border (`#2E3138`), white text.
- **Pill Segmented Controls**: Capsule track in `#16171B`, containing sliding selection tabs that glow in `#2E3138` with active text in `#F9FAFB`.

### Stat Comparison Bars
- **Layout**: Centered metric title (e.g., "Possession", "Shots on Target", "Passes") flanked by left and right team numeric metrics.
- **Comparison Visualizer**: Dual-sided horizontal bar with rounded tips (`4px`), filling proportionally toward each team's respective side. Unfilled track uses `#202227`.

### Filter Chips
- **Resting**: Semi-transparent dark slate surface, 1px `#2E3138` stroke, `label-badge` font, 8px vertical and 14px horizontal padding.
- **Selected**: Solid `#E0202C` or clean bright white background with inverted dark typography for immediate visual confirmation.

### Player Profile Hero Card
- **Layout**: Dynamic horizontal or stacked card featuring cutout player imagery overlapping a dark matte background.
- **Information Grid**: 2x2 or 4x1 stat blocks highlighting Goals, Assists, Rating, and Minutes Played using `stat-metric` figures accompanied by uppercase muted labels.