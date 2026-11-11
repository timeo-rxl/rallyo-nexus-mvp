export type Sport = "soccer" | "basketball" | "tennis";
export type Slot = "jeu-18" | "sam-10" | "mar-19";
export type Interest = "cinema" | "cuisine" | "musique" | "course" | "photo" | "jeux de société" | "lecture";

export interface Student {
  id: string; name: string; sport: Sport; level: 1 | 2 | 3; neighbourhood: string;
  extraversion: number; energy: number; interests: Interest[]; slots: Slot[];
}
export interface Field { id: string; name: string; neighbourhood: string; sports: Sport[] }

export const SPORT_LABEL: Record<Sport, string> = { soccer: "Soccer", basketball: "Basketball", tennis: "Tennis" };
export const SLOT_LABEL: Record<Slot, string> = { "jeu-18": "jeu. 18h00", "sam-10": "sam. 10h00", "mar-19": "mar. 19h00" };
export const LEVEL_LABEL: Record<1 | 2 | 3, string> = { 1: "Débutant", 2: "Intermédiaire", 3: "Avancé" };
export const INTEREST_LABEL: Record<Interest, string> = { cinema: "cinéma", cuisine: "cuisine", musique: "musique", course: "course", photo: "photo", "jeux de société": "jeux de société", lecture: "lecture" };
export const INTERESTS = Object.keys(INTEREST_LABEL) as Interest[];
export const NEIGHBOURHOODS = ["Plateau-Mont-Royal", "Mile End", "Rosemont", "Verdun", "Côte-des-Neiges", "Villeray"];

const P = "Plateau-Mont-Royal";
const s = (id: string, name: string, sport: Sport, slot: Slot, level: 1 | 2 | 3, neighbourhood: string, extraversion: number, energy: number, interests: Interest[]): Student =>
  ({ id, name, sport, level, neighbourhood, extraversion, energy, interests, slots: [slot] });

export const STUDENTS: Student[] = [
  s("sofia", "Sofia", "soccer", "jeu-18", 2, P, 8, 7, ["cinema", "cuisine"]),
  s("marc", "Marc", "soccer", "jeu-18", 2, P, 5, 6, ["cinema", "musique"]),
  s("aicha", "Aïcha", "soccer", "jeu-18", 3, "Rosemont", 7, 8, ["course", "musique"]),
  s("leo", "Léo", "soccer", "jeu-18", 2, "Mile End", 4, 5, ["jeux de société", "cinema"]),
  s("emma", "Emma", "soccer", "jeu-18", 1, P, 6, 6, ["cuisine", "photo"]),
  s("noah", "Noah", "soccer", "jeu-18", 2, "Verdun", 3, 4, ["musique", "jeux de société"]),
  s("yuki", "Yuki", "basketball", "jeu-18", 2, "Côte-des-Neiges", 7, 8, ["musique", "photo"]),
  s("chloe", "Chloé", "basketball", "jeu-18", 2, P, 8, 7, ["cinema", "musique"]),
  s("hugo", "Hugo", "basketball", "jeu-18", 3, "Rosemont", 5, 9, ["course", "cuisine"]),
  s("ines", "Inès", "basketball", "jeu-18", 1, "Mile End", 4, 5, ["cinema", "lecture"]),
  s("sam", "Sam", "basketball", "jeu-18", 2, "Verdun", 6, 6, ["musique", "cinema"]),
  s("lea", "Léa", "tennis", "sam-10", 2, P, 6, 5, ["cuisine", "cinema"]),
  s("thomas", "Thomas", "tennis", "sam-10", 2, "Villeray", 7, 6, ["musique", "cuisine"]),
  s("mia", "Mia", "tennis", "sam-10", 3, "Rosemont", 5, 7, ["course", "musique"]),
  s("adam", "Adam", "tennis", "sam-10", 1, P, 4, 4, ["lecture", "cinema"]),
  s("zoe", "Zoé", "tennis", "sam-10", 2, "Mile End", 8, 6, ["photo", "cuisine"]),
  s("louis", "Louis", "soccer", "mar-19", 2, P, 6, 6, ["cinema", "musique"]),
  s("anna", "Anna", "soccer", "mar-19", 2, "Rosemont", 5, 5, ["cuisine", "cinema"]),
];

export const FIELDS: Field[] = [
  { id: "lafontaine", name: "Parc La Fontaine", neighbourhood: P, sports: ["tennis", "soccer"] },
  { id: "jeannemance", name: "Parc Jeanne-Mance", neighbourhood: P, sports: ["tennis", "soccer", "basketball"] },
  { id: "jarry", name: "Parc Jarry", neighbourhood: "Villeray", sports: ["tennis", "soccer"] },
  { id: "maisonneuve", name: "Parc Maisonneuve", neighbourhood: "Rosemont", sports: ["soccer", "tennis"] },
  { id: "angrignon", name: "Parc Angrignon", neighbourhood: "Verdun", sports: ["soccer", "basketball"] },
  { id: "ahuntsic", name: "Parc Ahuntsic", neighbourhood: "Ahuntsic", sports: ["soccer", "basketball"] },
];
