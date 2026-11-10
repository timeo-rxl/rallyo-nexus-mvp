"""Core data models for Rallyo (Nexus).

The rules implemented here come from Timéo Rouxel's Rallyo strategy
documents ("Projet Rallyo (Nexus) : Infrastructure Sociale IA Étudiante"
and "Mémo Stratégique : Projet Rallyo"):

- A user states a desire (sport, level, availability). The app forms a
  micro-event: a pod of 4-6 compatible people, with a place and a time.
- Matching is multi-dimensional: sport, level (beginner / intermediate /
  advanced), availability, personality (introvert <-> extravert), energy
  level, and secondary interests.
- A good pod is *balanced*: it avoids awkward silences, so at least one
  member should be socially outgoing (the "spark") and at least two
  members should share a strong secondary interest (the "icebreaker").
- After each outing, quick feedback adjusts the profile for the next
  recommendations (continuous learning).
"""

from __future__ import annotations

from dataclasses import dataclass, field

MIN_POD_SIZE = 4
MAX_POD_SIZE = 6

LEVELS = {1: "beginner", 2: "intermediate", 3: "advanced"}


@dataclass
class Student:
    """One user of the platform.

    extraversion / energy are self-reported on a 1-10 scale.
    secondary_interests are free-form tags (cinema, cooking, running...).
    affinity maps another student's name to a learned bonus (from feedback).
    """

    name: str
    sport: str
    level: int  # 1 = beginner, 2 = intermediate, 3 = advanced
    availability: tuple[str, ...]  # e.g. ("Thu 18:00", "Sat 10:00")
    neighbourhood: str
    extraversion: int  # 1 (very introverted) .. 10 (very extraverted)
    energy: int  # 1 (low-key) .. 10 (high-energy)
    secondary_interests: tuple[str, ...] = ()
    affinity: dict[str, float] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if self.level not in LEVELS:
            raise ValueError(f"level must be 1, 2 or 3, got {self.level}")
        for attr in ("extraversion", "energy"):
            value = getattr(self, attr)
            if not 1 <= value <= 10:
                raise ValueError(f"{attr} must be 1-10, got {value}")


@dataclass
class Field:
    """A municipal sports field. Demo data: real park names in Montréal,
    illustrative sports / availability — not a live booking source."""

    name: str
    neighbourhood: str
    sports: tuple[str, ...]
    capacity: int = 12


@dataclass
class Pod:
    """A formed group: 4-6 students, one sport, one shared time slot,
    one assigned field."""

    sport: str
    slot: str
    members: list[Student]
    field: Field | None = None
    icebreaker_interest: str | None = None  # interest shared by >= 2 members

    @property
    def size(self) -> int:
        return len(self.members)
