/**
 * Lo mínimo de una liga de futbol para pintar su escudo en una tarjeta.
 *
 * Lo mandan igual los listados de survivor, quinielas y ligas fantasy
 * (`FootballLeagueSummaryResource` en el API).
 */
export interface FootballLeagueSummary {
  uuid: string;
  name: string;
  image_path: string | null;
}
