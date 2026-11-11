import { FIELDS, type Field, type Interest, type Slot, type Sport, type Student } from "./data";

export const MIN_POD = 4;
export const MAX_POD = 6;
export type Affinity = Record<string, number>;

export const affKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);
export const sharedSlot = (a: Student, b: Student) => a.slots.find((s) => b.slots.includes(s));

export function levelScore(a: number, b: number) {
  const d = Math.abs(a - b);
  return d === 0 ? 1 : d === 1 ? 0.6 : 0.25;
}
export function interestScore(a: Interest[], b: Interest[]) {
  const A = new Set(a), B = new Set(b);
  const union = new Set([...A, ...B]);
  if (union.size === 0) return 0;
  let inter = 0;
  A.forEach((x) => B.has(x) && inter++);
  return inter / union.size;
}
export const energyScore = (a: number, b: number) => Math.max(0, 1 - Math.abs(a - b) / 9);

export interface Breakdown { level: number; interest: number; energy: number }

export function pairBreakdown(a: Student, b: Student): Breakdown | null {
  if (a.sport !== b.sport || !sharedSlot(a, b)) return null;
  return { level: levelScore(a.level, b.level), interest: interestScore(a.interests, b.interests), energy: energyScore(a.energy, b.energy) };
}

export function pairScore(a: Student, b: Student, affinity: Affinity = {}) {
  const br = pairBreakdown(a, b);
  if (!br) return 0;
  const base = 0.45 * br.level + 0.3 * br.interest + 0.25 * br.energy;
  return Math.min(1, Math.max(0, base + (affinity[affKey(a.id, b.id)] ?? 0)));
}

export interface Pod {
  id: string; sport: Sport; slot: Slot; members: Student[]; field: Field;
  score: number; breakdown: Breakdown; spark: boolean; icebreaker: Interest | null;
}

export function meanScore(members: Student[], affinity: Affinity = {}) {
  let sum = 0, n = 0;
  const br = { level: 0, interest: 0, energy: 0 };
  for (let i = 0; i < members.length; i++)
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i]!, c2 = members[j]!;
      sum += pairScore(a, c2, affinity);
      const b = pairBreakdown(a, c2);
      if (b) { br.level += b.level; br.interest += b.interest; br.energy += b.energy; }
      n++;
    }
  if (!n) return { score: 0, breakdown: br };
  return { score: sum / n, breakdown: { level: br.level / n, interest: br.interest / n, energy: br.energy / n } };
}

export const hasSpark = (m: Student[]) => m.some((s) => s.extraversion >= 6);

export function icebreaker(m: Student[]): Interest | null {
  const c = new Map<Interest, number>();
  m.forEach((s) => s.interests.forEach((i) => c.set(i, (c.get(i) ?? 0) + 1)));
  const best = [...c.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return best[0]?.[0] ?? null;
}

export function assignField(sport: Sport, m: Student[]): Field {
  const options = FIELDS.filter((f) => f.sports.includes(sport));
  let best = options[0]!, bestN = -1;
  for (const f of options) {
    const n = m.filter((s) => s.neighbourhood === f.neighbourhood).length;
    if (n > bestN) { best = f; bestN = n; }
  }
  return best;
}

export function buildPod(id: string, sport: Sport, slot: Slot, members: Student[], affinity: Affinity = {}): Pod {
  const { score, breakdown } = meanScore(members, affinity);
  return { id, sport, slot, members, field: assignField(sport, members), score, breakdown, spark: hasSpark(members), icebreaker: icebreaker(members) };
}

export interface WaitGroup { sport: Sport; slot: Slot; students: Student[]; needed: number }

export function formPods(students: Student[], affinity: Affinity = {}) {
  const groups = new Map<string, { sport: Sport; slot: Slot; list: Student[] }>();
  for (const s of students) {
    const slot = s.slots[0]!;
    const k = `${s.sport}-${slot}`;
    if (!groups.has(k)) groups.set(k, { sport: s.sport, slot, list: [] });
    groups.get(k)!.list.push(s);
  }
  const pods: Pod[] = [];
  const waitlist: WaitGroup[] = [];
  for (const [k, g] of groups) {
    let remaining = [...g.list];
    let idx = 0;
    while (remaining.length >= MIN_POD) {
      remaining.sort((a, b) => b.extraversion - a.extraversion || a.id.localeCompare(b.id));
      const pod = [remaining.shift()!];
      while (pod.length < MAX_POD && remaining.length) {
        let bi = 0, bs = -1;
        remaining.forEach((c, i) => {
          const sc = pod.reduce((t, m) => t + pairScore(c, m, affinity), 0) / pod.length;
          if (sc > bs) { bs = sc; bi = i; }
        });
        pod.push(remaining.splice(bi, 1)[0]!);
      }
      pods.push(buildPod(`${k}-${idx++}`, g.sport, g.slot, pod, affinity));
    }
    if (remaining.length) waitlist.push({ sport: g.sport, slot: g.slot, students: remaining, needed: MIN_POD - remaining.length });
  }
  return { pods, waitlist };
}

export function instantMatch(user: Student, pods: Pod[], affinity: Affinity = {}): Pod | null {
  let best: Pod | null = null, bestS = -1;
  for (const p of pods) {
    if (p.members.length >= MAX_POD || p.sport !== user.sport || !user.slots.includes(p.slot)) continue;
    const sc = p.members.reduce((t, m) => t + pairScore(user, m, affinity), 0) / p.members.length;
    if (sc > bestS) { bestS = sc; best = p; }
  }
  return best;
}

export function applyFeedback(affinity: Affinity, userId: string, memberIds: string[], rating: number): Affinity {
  const delta = (rating - 3) * 0.05;
  const next = { ...affinity };
  for (const id of memberIds) {
    if (id === userId) continue;
    const k = affKey(userId, id);
    next[k] = Math.min(0.2, Math.max(-0.2, (next[k] ?? 0) + delta));
  }
  return next;
}
