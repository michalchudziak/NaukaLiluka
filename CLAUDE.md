# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Expo React Native application created with `create-expo-app`. The project uses TypeScript, file-based routing with expo-router, and is configured for iOS, Android, and web platforms.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm start
# or platform-specific:
npm run ios      # Start with iOS simulator
npm run android  # Start with Android emulator
npm run web      # Start for web

# Linting
npm run lint

# Reset project to blank state
npm run reset-project
```

## Architecture & Structure

### Routing System
- Uses **expo-router** with file-based routing
- Main app entry: `app/_layout.tsx` (root layout with theme provider)
- Tab navigation: `app/(tabs)/_layout.tsx` (bottom tab navigator)
- Screens: `app/(tabs)/index.tsx` (Home), `app/(tabs)/explore.tsx` (Explore)

### Key Technical Details
- **TypeScript**: Strict mode enabled
- **Path alias**: `@/` maps to root directory
- **Styling**: Uses theme-aware components with light/dark mode support via `useColorScheme` hook
- **Platform-specific code**: Components have `.ios.tsx` variants for iOS-specific implementations
- **React Native New Architecture**: Enabled (`newArchEnabled: true`)

### Component Organization
- `components/`: Reusable UI components
  - `ui/`: Platform-specific UI components (IconSymbol, TabBarBackground)
  - Themed components: `ThemedText.tsx`, `ThemedView.tsx` for automatic theme support
- `hooks/`: Custom React hooks including theme and color scheme utilities
- `constants/Colors.ts`: Centralized color definitions for light/dark themes

### Testing & Code Quality
- ESLint configured with `eslint-config-expo`
- No test runner currently configured - testing approach should be determined based on project needs