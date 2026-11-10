"""CLI demo: run the Rallyo matching engine on the sample cohort.

Usage:
    python demo.py
"""

from rallyo.data import SAMPLE_FIELDS, SAMPLE_STUDENTS
from rallyo.matching import assign_fields, form_pods, pod_score


def main() -> None:
    print("=" * 68)
    print("  RALLYO (Nexus) — AI social orchestrator, matching demo")
    print("  18 sample students from HEC Montréal")
    print("=" * 68)

    pods, waitlist = form_pods(SAMPLE_STUDENTS)
    assign_fields(pods, SAMPLE_FIELDS)

    for i, pod in enumerate(pods, 1):
        field = pod.field.name if pod.field else "no field available"
        print(f"\n🏟️  Pod {i} — {pod.sport} · {pod.slot} · {field}")
        print(f"   Pod compatibility: {pod_score(pod.members):.2f} / 1.00")
        if pod.icebreaker_interest:
            print(f"   💬 Icebreaker: at least two members love "
                  f"'{pod.icebreaker_interest}'")
        for member in pod.members:
            level = {1: "beginner", 2: "intermediate", 3: "advanced"}[member.level]
            print(f"   - {member.name:<8} {level:<12} "
                  f"extraversion {member.extraversion}/10 · "
                  f"{', '.join(member.secondary_interests)}")

    if waitlist:
        print(f"\n⏳ Waitlist ({len(waitlist)}): "
              + ", ".join(s.name for s in waitlist)
              + " — not enough players in their slot yet (min. 4 per pod).")


if __name__ == "__main__":
    main()
