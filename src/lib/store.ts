import { useSyncExternalStore, useMemo } from "react";
import { STUDENTS, type Interest, type Slot, type Sport, type Student } from "./data";
import { buildPod, formPods, MAX_POD, applyFeedback, type Affinity } from "./matching";

export interface Profile { name: string; sport: Sport; level: 1 | 2 | 3; slot: Slot; neighbourhood: string; extraversion: number; energy: number; interests: Interest[] }
export interface AppState { profile: Profile | null; joinedPodId: string | null; waitlisted: boolean; affinity: Affinity; ratings: Record<string, number> }

const KEY = "rallyo-state-v1";
const DEFAULT: AppState = { profile: null, joinedPodId: null, waitlisted: false, affinity: {}, ratings: {} };
let state: AppState = DEFAULT;
let loaded = false;
const subs = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = { ...DEFAULT, ...JSON.parse(raw) }; } catch { /* ignore */ }
}
export function setState(fn: (s: AppState) => AppState) {
  load();
  state = fn(state);
  localStorage.setItem(KEY, JSON.stringify(state));
  subs.forEach((f) => f());
}
export function useAppState() {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb); }, () => { load(); return state; }, () => DEFAULT);
}

export const profileToStudent = (p: Profile): Student => ({
  id: "me", name: p.name || "Toi", sport: p.sport, level: p.level, neighbourhood: p.neighbourhood,
  extraversion: p.extraversion, energy: p.energy, interests: p.interests, slots: [p.slot],
});

export function useEngine() {
  const s = useAppState();
  return useMemo(() => {
    const { pods, waitlist } = formPods(STUDENTS, s.affinity);
    const me = s.profile ? profileToStudent(s.profile) : null;
    const finalPods = pods.map((p) =>
      me && s.joinedPodId === p.id && p.members.length < MAX_POD ? buildPod(p.id, p.sport, p.slot, [...p.members, me], s.affinity) : p,
    );
    const finalWait = waitlist.map((w) => ({ ...w }));
    if (me && s.waitlisted && !s.joinedPodId) {
      const g = finalWait.find((w) => w.sport === me.sport && w.slot === me.slots[0]);
      if (g) { g.students = [...g.students, me]; g.needed = Math.max(0, g.needed - 1); }
      else finalWait.push({ sport: me.sport, slot: me.slots[0]!, students: [me], needed: 3 });
    }
    return { state: s, me, pods: finalPods, rawPods: pods, waitlist: finalWait };
  }, [s]);
}

export const joinPod = (id: string) => setState((s) => ({ ...s, joinedPodId: id, waitlisted: false }));
export const leavePod = () => setState((s) => ({ ...s, joinedPodId: null }));
export const joinWaitlist = () => setState((s) => ({ ...s, waitlisted: true, joinedPodId: null }));
export const saveProfile = (p: Profile) => setState((s) => ({ ...s, profile: p }));
export const rate = (podId: string, memberIds: string[], rating: number) =>
  setState((s) => {
    const prev = s.ratings[podId];
    // undo previous rating effect before applying new one
    let aff = s.affinity;
    if (prev) aff = applyFeedback(aff, "me", memberIds, 6 - prev);
    return { ...s, affinity: applyFeedback(aff, "me", memberIds, rating), ratings: { ...s.ratings, [podId]: rating } };
  });
