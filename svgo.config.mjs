/**
 * SVGO config for mapa.svg optimization.
 *
 * Constraints:
 * - Must preserve data-sinac attributes (used by Angular map component for area selection)
 * - Must preserve inline styles (path.style.fill/stroke are read at runtime)
 * - Must NOT merge paths (each path has its own data-sinac identity)
 * - Must NOT convert inline styles to presentation attributes (breaks JS style reads)
 */
export default {
  plugins: [
    'removeDoctype',
    'removeXMLProcInst',
    'removeComments',
    'removeMetadata',
    'removeEditorsNSData',
    'cleanupAttrs',
    'removeEmptyAttrs',
    'removeEmptyContainers',
    'removeUselessDefs',
    {
      name: 'cleanupNumericValues',
      params: { floatPrecision: 1 },
    },
    {
      name: 'convertPathData',
      params: { floatPrecision: 1 },
    },
    {
      name: 'convertTransform',
      params: { floatPrecision: 1 },
    },
    {
      name: 'minifyStyles',
      params: {
        // Remove CSS defaults that SVG renderers apply anyway
        removeComments: true,
      },
    },
    'removeUnknownsAndDefaults',
    'removeNonInheritableGroupAttrs',
    'collapseGroups',
    'cleanupIds',
  ],
};
