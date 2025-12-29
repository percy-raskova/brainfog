# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Recovery Companion is a PWA designed to help people with ME/CFS manage brain fog and pacing. It provides a dark-themed, mobile-first interface with features like a crash mode blackout screen, rest timer, animal facts ("Fuzzy Logic"), pacing reminders, and a voice-enabled notes system.

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

**Single-file app structure**: The entire application lives in `src/App.tsx`. All views (Home, CrashMode, Rest, Fuel, Animals, Pacing, Notes) are implemented as components within this file. Navigation is managed via React state (`useState<ViewType>`).

**Key features by view**:

- **CrashModeView**: Full-screen blackout for sensory deprivation
- **RestView**: 15-minute timer with Web Audio API chime notification
- **NotesView**: localStorage-persisted notes with optional SpeechRecognition dictation
- **AnimalCheerView**: Randomized animal facts (Ken Allen, rabbits, gibbons, etc.)

**PWA configuration**: `vite-plugin-pwa` handles service worker generation and manifest. Icons in `public/pwa-*.png`.

**Testing**: Vitest with jsdom environment. Tests in `src/__tests__/`. Setup file at `src/test/setup.ts` mocks localStorage, AudioContext, and SpeechRecognition APIs.

## Code Standards

- ESLint enforces max cyclomatic complexity of 10
- Prettier + ESLint + Husky pre-commit hooks via lint-staged
- Tailwind CSS utility classes for all styling (no separate CSS modules)
- React 19 with TypeScript strict mode
