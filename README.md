# SinacMap PWA

Interactive map of Costa Rica's protected areas (SINAC — Sistema Nacional de Áreas de Conservación). Users can explore 150+ parks, reserves, and wildlife refuges, and track which ones they've visited.

## Stack

- **Angular 21** — standalone components, no NgModules
- **Angular Material** — UI components
- **Firebase** — Google Sign-In authentication
- **panzoom** — pan and zoom on the SVG map
- **Vitest** — unit tests

## Prerequisites

- [Node.js 20+](https://nodejs.org/) and npm 10+
- A running [SinacMap API](https://github.com/camilokorea/SinacMap.Api)
- Firebase project with Google Sign-In enabled

## Getting Started

1. **Install dependencies**:

```bash
npm install
```

2. **Configure** — edit `src/environments/environment.ts` with your Firebase config and API URL:

```typescript
export const environment = {
  apiUrl: 'http://localhost:5036/api/protected-areas',
  firebase: {
    apiKey: '...',
    authDomain: '...',
    projectId: '...',
    // ...
  }
};
```

3. **Start the dev server**:

```bash
npm start
```

App runs at `http://localhost:4200`.

## Commands

| Command | Description |
|---------|-------------|
| `npm start` | Dev server at `http://localhost:4200` |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run Vitest unit tests |

## Features

- **Interactive SVG map** — pan and zoom across Costa Rica's protected areas
- **Category filtering** — filter by park type (National Park, Wildlife Refuge, etc.)
- **Visit tracking** — mark areas as visited; visited areas are highlighted in gold
- **Google Sign-In** — authentication via Firebase; visit data is stored server-side
- **PWA** — installable, with service worker for offline support

## How the Map Works

The SVG map (`public/mapa.svg`) is loaded as raw HTML and injected into the DOM. Each area is a `<path>` element with a `data-sinac` attribute in the format `{codigo}-{suffix}` (e.g. `P01-1`). The app splits on `-` to get the area code, then matches it against API data for filtering and visit highlighting.

## Project Structure

```
SinacMap.Pwa/
├── public/
│   ├── mapa.svg              # SVG map of Costa Rica
│   ├── icons/                # PWA icons
│   └── manifest.webmanifest
├── src/
│   ├── app/
│   │   ├── map/              # Core map component
│   │   └── services/         # ApiService, AuthService, authInterceptor
│   └── environments/         # Environment config (API URL, Firebase)
└── angular.json
```
