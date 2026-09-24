/**
 * La silueta que queda detrás del difuminado cuando la temporada es de Premium.
 *
 * Son formas, no datos: sin suscripción el API no manda las jornadas, así que
 * aquí no hay nada real que esconder y quitar el blur desde las herramientas
 * del navegador no enseña nada. Lo único real es cuántas jornadas van —ya está
 * en la cabecera—, para que la silueta tenga el largo de la temporada que se
 * ofrece.
 *
 * Espejo de `PlayerSeasonTeaser` en el `sharedLogic` del móvil: las tres
 * pantallas enseñan la misma silueta.
 */

/** Alturas de relleno, en fracción del lienzo: suben y bajan como una temporada cualquiera. */
const PATTERN = [0.52, 0.78, 0.4, 0.66, 0.3, 0.84, 0.58, 0.46, 0.72, 0.36, 0.62, 0.9, 0.44, 0.7, 0.28, 0.56, 0.64];

/** Con menos barras ya no se lee como una gráfica. */
export const TEASER_MIN_BARS = 8;

/** Una temporada europea (38 jornadas) cabe entera. */
export const TEASER_MAX_BARS = 38;

/** Una barra por jornada del torneo, de 0 a 1 medido desde el suelo. */
export function teaserBars(roundsCount: number): number[] {
    const rounds = Number.isFinite(roundsCount) ? Math.floor(roundsCount) : 0;
    const count = Math.min(TEASER_MAX_BARS, Math.max(TEASER_MIN_BARS, rounds));
    return Array.from({ length: count }, (_, index) => PATTERN[index % PATTERN.length]);
}

/** La altura de la raya del promedio, en la misma medida que `teaserBars`. */
export function teaserAverage(bars: number[]): number {
    if (!bars.length) return 0;
    return bars.reduce((sum, height) => sum + height, 0) / bars.length;
}
