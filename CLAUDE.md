# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Brainfog is a PWA designed to help people with ME/CFS manage brain fog and pacing. It provides a dark-themed, mobile-first interface with features like a crash mode blackout screen, rest timer, animal facts ("Fuzzy Logic"), pacing reminders, and a voice-enabled notes system.

## Commands

```bash
npm run dev          # Start Vite dev server
npm run build        # TypeScript compile + Vite production build
npm run lint         # ESLint check
npm run format       # Prettier format all files
npm run typecheck    # TypeScript type checking only
npm run test         # Run Vitest in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage report
```

## Architecture

**Modular file structure**: The application is organized into focused modules:

```
src/
├── App.tsx                    # Pure routing (~70 lines)
├── types/index.ts             # TypeScript interfaces
├── constants/
│   ├── animalFacts.ts         # 73 animal/Claude facts
│   └── presetActivities.ts    # Spoon budget presets
├── styles/
│   └── buttonVariants.ts      # Button styling constants
├── utils/
│   ├── audio.ts               # Web Audio API chime
│   └── dateFormatters.ts      # Timer/timestamp formatting
├── hooks/
│   ├── useLocalStorage.ts     # Generic localStorage hook
│   └── useSpeechRecognition.ts # Voice input hook
└── components/
    ├── ui/
    │   ├── Button.tsx         # Variant-based button
    │   ├── Header.tsx         # Navigation header
    │   └── RatingScale.tsx    # 1-5 rating input
    └── views/
        ├── HomeView.tsx       # Main navigation
        ├── CrashModeView.tsx  # Blackout screen
        ├── RestView.tsx       # 15-min timer + breathing
        ├── BreathingExercise.tsx # 4-7-8 pattern
        ├── FuelView.tsx       # Hydration/protein tips
        ├── PacingView.tsx     # 50% rule reminder
        ├── NotesView.tsx      # Voice-enabled notes
        ├── AnimalCheerView.tsx # Random animal facts
        ├── SpoonBudgetView.tsx # Energy tracking
        └── SymptomCheckView.tsx # Fog/fatigue check-in
```

**Key features by view**:

- **CrashModeView**: Full-screen blackout for sensory deprivation
- **RestView**: 15-minute timer with Web Audio API chime + 4-7-8 breathing
- **NotesView**: localStorage-persisted notes with optional SpeechRecognition dictation
- **AnimalCheerView**: Randomized animal facts (Ken Allen, rabbits, gibbons, Claude, etc.)
- **SpoonBudgetView**: Spoon theory energy tracking with preset activities
- **SymptomCheckView**: Daily fog/fatigue 1-5 rating with yesterday comparison
- **HomeView**: Bad Day Mode toggle hides non-essential features

**PWA configuration**: `vite-plugin-pwa` handles service worker generation and manifest. Icons in `public/pwa-*.png`.

**Testing**: Vitest with jsdom environment. 113 tests in `src/__tests__/`. Setup file at `src/test/setup.ts` mocks localStorage, AudioContext, and SpeechRecognition APIs.

## Code Standards

- ESLint enforces max cyclomatic complexity of 10
- Prettier + ESLint + Husky pre-commit hooks via lint-staged
- Tailwind CSS utility classes for all styling (no separate CSS modules)
- React 19 with TypeScript strict mode
- 100% privacy: All data stored in localStorage, no network calls
