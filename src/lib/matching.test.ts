import { describe, it, expect } from "vitest";
import { STUDENTS } from "./data";
import { formPods, pairScore, applyFeedback, levelScore } from "./matching";

describe("matching", () => {
  it("forms 3 pods (6,5,5) and 2-person waitlist", () => {
    const { pods, waitlist } = formPods(STUDENTS);
    expect(pods.map((p) => [p.sport, p.members.length])).toEqual([["soccer", 6], ["basketball", 5], ["tennis", 5]]);
    expect(waitlist.flatMap((w) => w.students.map((s) => s.id))).toEqual(["louis", "anna"]);
    expect(waitlist[0]!.needed).toBe(2);
  });
  it("level score", () => { expect([levelScore(2,2), levelScore(1,2), levelScore(1,3)]).toEqual([1, 0.6, 0.25]); });
  it("different sport scores 0", () => { expect(pairScore(STUDENTS[0]!, STUDENTS[6]!)).toBe(0); });
  it("pair score formula", () => {
    // Sofia & Marc: level 1, jaccard 1/3, energy 1-1/9
    expect(pairScore(STUDENTS[0]!, STUDENTS[1]!)).toBeCloseTo(0.45 + 0.1 + 0.25 * (8 / 9));
  });
  it("feedback clamps to 0.2", () => {
    let a = {};
    for (let i = 0; i < 5; i++) a = applyFeedback(a, "me", ["sofia"], 5);
    expect(Object.values(a)).toEqual([0.2]);
  });
});
