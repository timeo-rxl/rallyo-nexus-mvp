"""Rallyo (Nexus) — AI orchestration engine."""

from .models import MAX_POD_SIZE, MIN_POD_SIZE, Field, Pod, Student

# Pair-compatibility weights. Level matters most (playing with someone far
# above / below your level is no fun), then shared interests, then energy.
LEVEL_WEIGHT = 0.45
INTEREST_WEIGHT = 0.30
ENERGY_WEIGHT = 0.25

# A pod needs a "spark": at least one member this extraverted, so the
# conversation starts by itself instead of stalling in silence.
SPARK_EXTRAVERSION = 6


def level_score(a: Student, b: Student) -> float:
    """How close the two levels are: 1.0 (same) / 0.6 (one apart) / 0.25."""
    gap = abs(a.level - b.level)
    return {0: 1.0, 1: 0.6, 2: 0.25}[gap]


def interest_score(a: Student, b: Student) -> float:
    """Jaccard similarity of secondary interests (0 if none in common)."""
    set_a, set_b = set(a.secondary_interests), set(b.secondary_interests)
    if not set_a or not set_b:
        return 0.0
    return len(set_a & set_b) / len(set_a | set_b)


def energy_score(a: Student, b: Student) -> float:
    """1.0 when energy levels match, fading to 0.0 when far apart."""
    return max(0.0, 1.0 - abs(a.energy - b.energy) / 9.0)


def pair_score(a: Student, b: Student) -> float:
    """Compatibility of two students (0-1), plus learned affinity."""
    if a.sport != b.sport:
        return 0.0
    if not set(a.availability) & set(b.availability):
        return 0.0
    score = (
        LEVEL_WEIGHT * level_score(a, b)
        + INTEREST_WEIGHT * interest_score(a, b)
        + ENERGY_WEIGHT * energy_score(a, b)
    )
    score += a.affinity.get(b.name, 0.0) + b.affinity.get(a.name, 0.0)
    return max(0.0, min(1.0, score))


def pod_score(pod_members: list[Student]) -> float:
    """Mean pair score inside a pod (0 if fewer than 2 members)."""
    if len(pod_members) < 2:
        return 0.0
    scores = [
        pair_score(a, b)
        for i, a in enumerate(pod_members)
        for b in pod_members[i + 1:]
    ]
    return sum(scores) / len(scores)


def find_icebreaker(members: list[Student]) -> str | None:
    """The secondary interest shared by the most members (>= 2), if any.
    Ties are broken alphabetically so the result is deterministic."""
    counts: dict[str, int] = {}
    for member in members:
        for interest in set(member.secondary_interests):
            counts[interest] = counts.get(interest, 0) + 1
    shared = [(n, interest) for interest, n in counts.items() if n >= 2]
    if not shared:
        return None
    return sorted(shared, key=lambda item: (-item[0], item[1]))[0][1]


def has_spark(members: list[Student]) -> bool:
    """True if at least one member is outgoing enough to start conversation."""
    return any(m.extraversion >= SPARK_EXTRAVERSION for m in members)


def form_pods(students: list[Student]) -> tuple[list[Pod], list[Student]]:
    """Group students into pods of 4-6 by (sport, time slot).

    Greedy algorithm: within each (sport, slot) group, seed a pod with the
    most outgoing student, then keep adding the most compatible remaining
    student until the pod is full. A group with fewer than 4 students
    becomes a waitlist (nobody is placed in a pod of 2-3: that is a date,
    not a Rallyo pod).
    """
    pods: list[Pod] = []
    waitlist: list[Student] = []

    groups: dict[tuple[str, str], list[Student]] = {}
    for student in students:
        for slot in student.availability:
            groups.setdefault((student.sport, slot), []).append(student)

    # A student with several slots is considered for each, but placed once.
    placed: set[str] = set()

    for (sport, slot), group in sorted(groups.items()):
        remaining = [s for s in group if s.name not in placed]
        while len(remaining) >= MIN_POD_SIZE:
            seed = max(remaining, key=lambda s: (s.extraversion, len(s.affinity)))
            pod_members = [seed]
            remaining.remove(seed)
            while remaining and len(pod_members) < MAX_POD_SIZE:
                best = max(
                    remaining,
                    key=lambda c: sum(pair_score(c, m) for m in pod_members),
                )
                pod_members.append(best)
                remaining.remove(best)
            for member in pod_members:
                placed.add(member.name)
            pods.append(Pod(sport=sport, slot=slot, members=pod_members,
                            icebreaker_interest=find_icebreaker(pod_members)))
        waitlist.extend(s for s in remaining if s.name not in placed)

    # De-duplicate the waitlist (a student appears in one group per slot).
    seen: set[str] = set()
    unique_waitlist = []
    for student in waitlist:
        if student.name not in seen and student.name not in placed:
            seen.add(student.name)
            unique_waitlist.append(student)
    return pods, unique_waitlist


def assign_fields(pods: list[Pod], fields: list[Field]) -> None:
    """Assign each pod the best field: it must support the sport, ideally
    in the neighbourhood where most members live."""
    for pod in pods:
        candidates = [f for f in fields if pod.sport in f.sports]
        if not candidates:
            pod.field = None
            continue
        home = max(
            {m.neighbourhood for m in pod.members},
            key=lambda n: sum(1 for m in pod.members if m.neighbourhood == n),
        )
        same_area = [f for f in candidates if f.neighbourhood == home]
        pod.field = (same_area or candidates)[0]


def instant_match(student: Student, pods: list[Pod], pool: list[Student]) -> Pod | None:
    """"Match immédiat": find the student a pod with an open seat for their
    sport and a shared time slot, preferring the most compatible pod.
    Returns None if no pod fits (caller should form a new pod instead)."""
    best: Pod | None = None
    best_score = 0.0
    for pod in pods:
        if pod.sport != student.sport or pod.size >= MAX_POD_SIZE:
            continue
        if pod.slot not in student.availability:
            continue
        score = sum(pair_score(student, m) for m in pod.members) / pod.size
        if score > best_score:
            best, best_score = pod, score
    return best


def apply_feedback(student: Student, pod: Pod, rating: int) -> None:
    """Quick post-outing feedback (1-5 stars): a good outing builds
    affinity with the people you played with, so the next match
    prefers them. A bad one does the opposite."""
    if not 1 <= rating <= 5:
        raise ValueError("rating must be 1-5")
    delta = (rating - 3) * 0.05  # +0.10 at 5 stars, -0.10 at 1 star
    for member in pod.members:
        if member is student:
            continue
        student.affinity[member.name] = round(
            max(-0.2, min(0.2, student.affinity.get(member.name, 0.0) + delta)), 3
        )
