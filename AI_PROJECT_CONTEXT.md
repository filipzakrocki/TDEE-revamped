# TDEE Calculator - Project Context for AI Assistants

## Overview
A React + TypeScript web application for tracking Total Daily Energy Expenditure (TDEE). Users log daily calories and weight to calculate their actual TDEE over time, helping with weight loss or gain goals.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **UI Library**: Chakra UI v2
- **State Management**: Zustand
- **Routing**: React Router DOM v6
- **Backend**: Firebase (Auth + Realtime Database)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Dates**: date-fns
- **Styling**: SASS + Chakra's sx props

## Project Structure
```
src/
├── components/layout/     # Layout components (Sidenav, MainFrame, IconMenu, Logo)
├── firebase/              # Firebase configuration
├── hooks/                 # Custom hooks (useTDEECalculations)
├── stores/                # Zustand stores
│   ├── auth/              # Authentication state
│   ├── calc/              # Calculator data & logic
│   └── interface/         # UI state (loading, syncing)
├── utils/                 # Utility functions (calculations, toast)
├── views/                 # Page components
│   ├── analysis/          # Analytics page with charts
│   ├── auth/              # Login/Register page
│   ├── calculator/        # Main calculator view
│   ├── faq/               # Help & FAQ page
│   ├── logout/            # Logout handler
│   └── setup/             # Initial setup page
├── config.tsx             # App configuration (colors, menu items, spacing)
└── App.tsx                # Root component
```

## Key Files

### Configuration (`src/config.tsx`)
Contains all app-wide settings:
- Color scheme (teal/green theme: `test1-test5`, `backgroundNav`, etc.)
- Menu items with routes and labels
- Layout dimensions
- Font families (Raleway headings, Lato body)

### State Management

#### `src/stores/calc/calcStore.ts`
Main data store containing:
- `weekData`: Array of weeks, each with 7 days of {kg, kcal} data
- `startDate`, `startWeight`, `goalWeight`: User's diet setup
- `weeklyChange`, `dailyKcalChange`: Target rate of change
- `weeksForAvg`: How many weeks to average for TDEE (2-4)
- `isMetricSystem`: kg vs lbs toggle
- Actions: `fetchData`, `updateDay`, `addNewWeek`, `syncToFirebase`, etc.

#### `src/stores/auth/authStore.ts`
- Firebase authentication
- Guest mode (localStorage only, no account)
- `isGuest` flag for local-only usage

### Calculations (`src/hooks/useTDEECalculations.ts`)
Central hook that computes:
- `currentTdee`: Average TDEE based on last N weeks
- `recommendedDailyIntake`: TDEE ± deficit/surplus
- `weekCalculations`: Per-week stats (avgKcal, avgWeight, weeklyTdee, weeklyTarget, weightChange)
- `isWeightLoss`: Determines if deficit or surplus phase

**Key Logic:**
1. TDEE for a week = avgKcal - (weightChange × 7700 kcal/kg)
2. Average TDEE uses last N weeks (configurable), excludes current/latest week
3. Each week has its own `weeklyTarget` for historical accuracy in UI coloring
4. Daily target = TDEE ± dailyKcalChange

### Core Calculation Functions (`src/utils/calculations.ts`)
- `calculateWeeklyTDEE(avgKcal, currentWeight, previousWeight, isMetric)`
- `calculateAverageTDEE(tdeeOverTime, weeksForAvg)` - Uses only weekly TDEEs when enough data
- `estimateInitialTDEE(weight, isMetric)` - Starting estimate (~33 kcal/kg)
- `calculateWeeksToGoal(currentWeight, goalWeight, weeklyChange)`

## Views

### Calculator (`/calculator`)
Main tracking view:
- **Header Stats**: Daily Target, Your TDEE, Current Weight, Progress (with info tooltips)
- **Week Info Card**: Selected week's avg kcal/weight, delta, weekly TDEE
- **Day Cards Grid**: 7 day input cards with target coloring
- **Add New Week Button**
- **Monthly Calendar**: Navigate weeks, color-coded by target compliance

### Analytics (`/analysis`)
- Summary stat cards (days tracked, compliance %, total change)
- **Progress Over Time Chart**: Toggleable series (Target, Calories, TDEE, Weight)
- **Weekly Calorie Averages Bar Chart**: Shows date ranges
- **Goal Compliance Heatmap**: Monthly or Yearly (GitHub-style) view
- Best/Worst Week cards

### Setup (`/setup`)
Initial configuration:
- Measurement system toggle (metric/imperial)
- Start date, start weight, goal weight
- Weekly change rate, daily kcal adjustment
- Weeks for averaging
- "Your Plan Summary" card with live calculations
- Danger Zone: Delete all data

### FAQ (`/faq`)
- Quick Start Guide with step cards
- Accordion FAQ items

## Data Flow

1. **Guest Mode**: Data stored in localStorage only
2. **Authenticated**: Data synced to Firebase Realtime Database
3. **Sync Logic**: Debounced sync, always saves to localStorage first

## UI Patterns

### Color Coding
- **On target (green)**: `config.test5` (#4A7A57) / `config.green`
- **Off target (red)**: `#e57373` / `config.red`
- **Missing data (orange)**: `config.orange`
- **Background**: `config.backgroundNav` (#f3ebe4 - light beige)

### Components
- Cards use `bg="white"` with `shadow="sm"`
- Buttons: Primary uses `config.test5` background
- Page titles: `<Heading size="md">`
- Info icons with tooltips for explaining calculations

## Important Behaviors

### TDEE Calculation Timing
- Daily Target ONLY updates when a new week's data is complete
- Current/latest week is excluded from TDEE averaging
- Historical weeks show their original target (not current) for coloring

### Week Numbering
- Week 0 = setup week (internal, not displayed)
- Week 1+ = user's tracking weeks

### Weight Units
- Internal storage: kg
- Display: converted based on `isMetricSystem`
- Conversion: 1 kg = 2.20462 lbs

## Common Modifications

### Adding a new menu item
1. Add icon import to `config.tsx`
2. Add to `menuItems` array with `{ icon, route, label }`
3. Create view component in `src/views/`
4. Add route in `AppRoutes.tsx`

### Modifying calculations
- Edit `src/utils/calculations.ts` for formulas
- Edit `src/hooks/useTDEECalculations.ts` for derived values

### Styling changes
- Colors in `config.tsx`
- Component-level styles via Chakra props

## Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│ [Sidenav]  │     [MainFrame - view]    │ [Right Panel] │
│   icons    │                           │   (optional)  │
│            │                           │               │
└─────────────────────────────────────────────────────────┘
```

Right panel is used on `/calculator` and `/setup` routes (currently placeholder).

## Environment
- Node.js project with npm
- Firebase config in `src/firebase/firebase.ts`
- No environment variables exposed in code

## Notes for AI
- The old project reference is at `C:\Users\filip\Documents\GitHub\TDEE-reactivated\src`
- Check `useTDEECalculations` hook for understanding how data flows
- The `config.tsx` file is the source of truth for theming
- Guest mode allows full functionality without Firebase auth

