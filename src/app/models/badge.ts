import { ProtectedArea } from '../services/api';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  svgPath: string;
  check(areas: ProtectedArea[]): { earned: boolean; progress: number; total: number };
}

export interface BadgeResult {
  id: string;
  name: string;
  description: string;
  svgPath: string;
  earned: boolean;
  progress: number;
  total: number;
}

// Material Design icon path data (viewBox 0 0 24 24)
const PATHS = {
  eco:          'M6.05 8.5c.44-4.36 3.78-7.45 6.95-7.5 0 5.3-3.5 7.9-6.95 7.5zm2.97 10.5C9 17.5 9 15 9 15c3.07 0 5.24-1.87 5.24-5H18c0 5.5-4.6 9-9 9v-1h-.02zM3 15c1.26 0 2.37-.19 3.35-.5C4.65 9.82 5 4.45 5 4.45 2.17 5.39 0 8.4 0 12c0 1.1.23 2.14.63 3.09C1.33 15.04 2.12 15 3 15z',
  explore:      'M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z',
  backpack:     'M20 8h-3V6c0-1.1-.9-2-2-2H9C7.9 4 7 4.9 7 6v2H4c-1.1 0-2 .9-2 2v11c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V10c0-1.1-.9-2-2-2zm-8 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-11H9V6h6v2z',
  shield:       'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
  star:         'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z',
  trophy:       'M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z',
  landscape:    'M14 6l-1-2H5v17h2v-7h5l1 2h7V6h-6zm4 8h-4l-1-2H7V6h5l1 2h5v6z',
  butterfly:    'M2 6c0 3.87 2.62 7.13 6.18 8.49L5 22h2.5l2-5h5l2 5H19l-3.18-7.51C19.38 13.13 22 9.87 22 6H2z',
  park:         'M17 12h2L12 2 5 12h2l-3 8h6v-4c0-.55.45-1 1-1s1 .45 1 1v4h6l-3-8z',
  biotech:      'M7 19c-1.1 0-2 .9-2 2h14c0-1.1-.9-2-2-2h-4v-2h3c1.1 0 2-.9 2-2h-8c-1.66 0-3-1.34-3-3 0-1.09.59-2.04 1.46-2.56L8.5 7.5C6.41 8.23 5 10.24 5 12c0 2.76 2.24 5 5 5v2H7zm5.5-8.5 1.5 1.5-4.5 4.5-1.5-1.5 4.5-4.5zm4-4.5 1.5 1.5-8 8-1.5-1.5 8-8z',
  water_drop:   'M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2C20 10.48 17.33 6.55 12 2z',
  volcano:      'M13.17 4 11 7.83 8.83 4H4.5L8 9.72 6.17 13H5V11L2 14v4h4v-2h12v2h4v-4l-3-3v2h-1.17L16 9.72 19.5 4z',
  waves:        'M17 16.99c-1.35 0-2.2.42-2.95.8-.65.33-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.33-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.25-2.05-.6-.75-.38-1.58-.8-2.95-.8zm0-4.5c-1.35 0-2.2.43-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.43-2.95.8c-.65.32-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8v-1.95c-.9 0-1.4-.27-2.05-.6-.75-.37-1.58-.8-2.95-.8zm2.95-8.49c-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.32-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8V5.1c-.9 0-1.4-.27-2.05-.6zm0 2.25c-1.35 0-2.2.42-2.95.8-.65.32-1.18.6-2.05.6-.9 0-1.4-.25-2.05-.6-.75-.38-1.57-.8-2.95-.8s-2.2.42-2.95.8c-.65.32-1.17.6-2.05.6v1.95c1.35 0 2.2-.42 2.95-.8.65-.33 1.17-.6 2.05-.6s1.4.25 2.05.6c.75.38 1.57.8 2.95.8s2.2-.42 2.95-.8c.65-.33 1.18-.6 2.05-.6.9 0 1.4.25 2.05.6.75.38 1.57.8 2.95.8V7.2c-.9 0-1.4-.25-2.05-.6z',
  forest:       'M12 3L6 11h3l-3.5 6H11v4h2v-4h5.5L15 11h3z',
};

function byCount(areas: ProtectedArea[], visited: number): { earned: boolean; progress: number; total: number } {
  const progress = areas.filter(a => a.visitado).length;
  return { earned: progress >= visited, progress, total: visited };
}

function byCategory(areas: ProtectedArea[], categoria: string, needed: number) {
  const total = areas.filter(a => a.categoria === categoria).length;
  const progress = areas.filter(a => a.categoria === categoria && a.visitado).length;
  return { earned: progress >= needed, progress, total: needed };
}

function byCodigos(areas: ProtectedArea[], codigos: string[], needed: number) {
  const relevant = areas.filter(a => codigos.includes(a.codigo));
  const progress = relevant.filter(a => a.visitado).length;
  return { earned: progress >= needed, progress, total: needed };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Milestones
  {
    id: 'primer-paso',
    name: 'Primer Paso',
    description: 'Visita tu primera área protegida.',
    svgPath: PATHS.eco,
    check: (areas) => byCount(areas, 1),
  },
  {
    id: 'explorador',
    name: 'Explorador',
    description: 'Visita 10 áreas protegidas.',
    svgPath: PATHS.explore,
    check: (areas) => byCount(areas, 10),
  },
  {
    id: 'aventurero',
    name: 'Aventurero',
    description: 'Visita 25 áreas protegidas.',
    svgPath: PATHS.backpack,
    check: (areas) => byCount(areas, 25),
  },
  {
    id: 'guardian',
    name: 'Guardián',
    description: 'Visita 50 áreas protegidas.',
    svgPath: PATHS.shield,
    check: (areas) => byCount(areas, 50),
  },
  {
    id: 'heroe-sinac',
    name: 'Héroe SINAC',
    description: 'Visita 100 áreas protegidas.',
    svgPath: PATHS.star,
    check: (areas) => byCount(areas, 100),
  },
  {
    id: 'leyenda-sinac',
    name: 'Leyenda SINAC',
    description: 'Visita las 150 áreas protegidas de Costa Rica.',
    svgPath: PATHS.trophy,
    check: (areas) => byCount(areas, 150),
  },
  // Category
  {
    id: 'parquero-nacional',
    name: 'Parquero Nacional',
    description: 'Visita 10 Parques Nacionales.',
    svgPath: PATHS.landscape,
    check: (areas) => byCategory(areas, 'Parque Nacional', 10),
  },
  {
    id: 'amigo-refugio',
    name: 'Amigo del Refugio',
    description: 'Visita 10 Refugios Nacionales de Vida Silvestre.',
    svgPath: PATHS.butterfly,
    check: (areas) => byCategory(areas, 'Refugio Nacional de Vida Silvestre', 10),
  },
  {
    id: 'guardabosques',
    name: 'Guardabosques',
    description: 'Visita 5 Reservas Forestales.',
    svgPath: PATHS.park,
    check: (areas) => byCategory(areas, 'Reserva Forestal', 5),
  },
  {
    id: 'naturalista',
    name: 'Naturalista',
    description: 'Visita 5 Reservas Biológicas.',
    svgPath: PATHS.biotech,
    check: (areas) => byCategory(areas, 'Reserva Biológica', 5),
  },
  {
    id: 'guardian-humedales',
    name: 'Guardián de Humedales',
    description: 'Visita 5 Humedales.',
    svgPath: PATHS.water_drop,
    check: (areas) => byCategory(areas, 'Humedal', 5),
  },
  // Thematic
  {
    id: 'cazador-volcanes',
    name: 'Cazador de Volcanes',
    description: 'Visita 5 parques volcánicos: Arenal, Turrialba, Poás, Rincón de la Vieja, Tenorio, Irazú o Miravalles.',
    svgPath: PATHS.volcano,
    check: (areas) => byCodigos(areas, ['P01', 'P04', 'P05', 'P09', 'P22', 'P23', 'P29'], 5),
  },
  {
    id: 'explorador-marino',
    name: 'Explorador Marino',
    description: 'Visita 5 áreas costeras o marinas.',
    svgPath: PATHS.waves,
    check: (areas) => byCodigos(areas, ['A01', 'A02', 'A03', 'A04', 'P07', 'P14', 'P16', 'P20', 'V03', 'V06'], 5),
  },
  {
    id: 'pulmon-verde',
    name: 'Pulmón Verde',
    description: 'Visita 3 de los 4 grandes pulmones verdes: Braulio Carrillo, Tortuguero, Corcovado o La Amistad.',
    svgPath: PATHS.forest,
    check: (areas) => byCodigos(areas, ['P02', 'P11', 'P12', 'P18'], 3),
  },
];
