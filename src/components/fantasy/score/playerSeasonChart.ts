import type {
    PlayerSeasonRound,
    PlayerSeasonRoundStatus,
} from "@/interfaces/fantasy/score/PlayerSeasonScoreResponse";

/**
 * La aritmética de la gráfica "Puntos por jornada" del cajón de temporada.
 *
 * Espejo de `PlayerSeasonChart` en el `sharedLogic` del móvil: las dos
 * pantallas tienen que estar de acuerdo en qué barras salen, cuál se resalta y
 * dónde cae el promedio. Aquí solo hay números de 0 a 1; el componente pinta.
 */

/** Escalones "redondos" del tope del eje: 47 → 50, 112 → 120, 8 → 8. */
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/** Tope por defecto cuando no hay un solo punto: una gráfica plana, no un 0/0. */
const EMPTY_TOP = 10;

export function niceCeil(value: number): number {
    if (!(value > 0)) return 0;
    const magnitude = 10 ** Math.floor(Math.log10(value));
    const fraction = value / magnitude;
    const step = NICE_STEPS.find((candidate) => fraction <= candidate + 1e-9) ?? 10;
    // El redondeo quita la cola de coma flotante (1.2 × 100 = 120.00000000000001).
    return Math.round(step * magnitude * 1000) / 1000;
}

export interface SeasonChartBar {
    /** Posición en `rounds` (orden de calendario). */
    index: number;
    status: PlayerSeasonRoundStatus;
    /** Null si no jugó o la jornada sigue abierta: no hay barra, hay hueco. */
    points: number | null;
    /** Borde superior de la barra, en fracción del alto medida desde arriba. */
    top: number;
    /** Borde inferior de la barra, en la misma medida. */
    bottom: number;
    isBest: boolean;
}

export interface SeasonChart {
    bars: SeasonChartBar[];
    /** Valor del tope del eje (siempre > 0). */
    maxValue: number;
    /** Valor del suelo del eje: 0, o negativo si alguna jornada restó. */
    minValue: number;
    /** Dónde cae el cero, en fracción desde arriba. */
    baseline: number;
    /** Dónde cae el promedio, en fracción desde arriba. Null si no jugó nunca. */
    average: number | null;
    bestIndex: number | null;
}

/**
 * Cuatro reglas que no son obvias:
 *
 * - **El eje incluye el promedio**, no solo las barras: la línea del promedio
 *   no puede quedar fuera del lienzo.
 * - **Solo se resalta una mejor jornada que sumó.** Si la mejor es 0 o
 *   negativa, resaltarla diría "aquí destacó" de una jornada que no lo hizo.
 * - **Un empate a la mejor se queda con la primera**, igual que el API.
 * - **Las jornadas sin jugar no son ceros**: van con `points: null`.
 */
export function buildSeasonChart(rounds: PlayerSeasonRound[], averagePoints: number): SeasonChart {
    const played = rounds
        .map((round, index) => ({ round, index }))
        .filter(({ round }) => round.status === "played");

    const values = played.map(({ round }) => round.total_points);
    const hasPlayed = values.length > 0;
    const average = hasPlayed ? averagePoints : 0;

    const highest = Math.max(0, average, ...values);
    const lowest = Math.min(0, ...values);

    const maxValue = niceCeil(highest) || EMPTY_TOP;
    const minValue = lowest < 0 ? -niceCeil(-lowest) : 0;
    const range = maxValue - minValue;
    const toFraction = (value: number) => (maxValue - value) / range;

    let bestIndex: number | null = null;
    let bestPoints = 0;
    for (const { round, index } of played) {
        if (round.total_points > bestPoints) {
            bestPoints = round.total_points;
            bestIndex = index;
        }
    }

    const baseline = toFraction(0);

    return {
        bars: rounds.map((round, index) => {
            const points = round.status === "played" ? round.total_points : null;
            const value = points ?? 0;
            return {
                index,
                status: round.status,
                points,
                top: value >= 0 ? toFraction(value) : baseline,
                bottom: value >= 0 ? baseline : toFraction(value),
                isBest: index === bestIndex,
            };
        }),
        maxValue,
        minValue,
        baseline,
        average: hasPlayed ? toFraction(average) : null,
        bestIndex,
    };
}
