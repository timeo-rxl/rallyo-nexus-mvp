"""Demo data for Rallyo (Nexus).

Students are fictional — 18 HEC personas built from the project's three
personas (international newcomer, introvert / ambivert, sporty "Doer").

Fields use real Montréal park names. Sports and availability are
illustrative demo data, NOT a live source: real availability would come
from the City of Montréal's open data (the B2G dashboard in the roadmap).
"""

from .models import Field, Student

SAMPLE_STUDENTS: list[Student] = [
    # --- Soccer, Thursday 18:00 (pod of 6) ---
    Student("Sofia", "soccer", 2, ("Thu 18:00",), "Plateau-Mont-Royal", 8, 7, ("cinema", "cooking")),
    Student("Marc", "soccer", 2, ("Thu 18:00",), "Plateau-Mont-Royal", 5, 6, ("cinema", "music")),
    Student("Aïcha", "soccer", 3, ("Thu 18:00",), "Rosemont", 7, 8, ("running", "music")),
    Student("Léo", "soccer", 2, ("Thu 18:00", "Sat 10:00"), "Mile End", 4, 5, ("board games", "cinema")),
    Student("Emma", "soccer", 1, ("Thu 18:00",), "Plateau-Mont-Royal", 6, 6, ("cooking", "photography")),
    Student("Noah", "soccer", 2, ("Thu 18:00",), "Verdun", 3, 4, ("music", "board games")),
    # --- Basketball, Thursday 18:00 (pod of 5) ---
    Student("Yuki", "basketball", 2, ("Thu 18:00",), "Côte-des-Neiges", 7, 8, ("music", "photography")),
    Student("Chloé", "basketball", 2, ("Thu 18:00",), "Plateau-Mont-Royal", 8, 7, ("cinema", "music")),
    Student("Hugo", "basketball", 3, ("Thu 18:00",), "Rosemont", 5, 9, ("running", "cooking")),
    Student("Inès", "basketball", 1, ("Thu 18:00",), "Mile End", 4, 5, ("cinema", "reading")),
    Student("Sam", "basketball", 2, ("Thu 18:00", "Tue 19:00"), "Verdun", 6, 6, ("music", "cinema")),
    # --- Tennis, Saturday 10:00 (pod of 5) ---
    Student("Léa", "tennis", 2, ("Sat 10:00",), "Plateau-Mont-Royal", 6, 5, ("cooking", "cinema")),
    Student("Thomas", "tennis", 2, ("Sat 10:00",), "Villeray", 7, 6, ("music", "cooking")),
    Student("Mia", "tennis", 3, ("Sat 10:00",), "Rosemont", 5, 7, ("running", "music")),
    Student("Adam", "tennis", 1, ("Sat 10:00",), "Plateau-Mont-Royal", 4, 4, ("reading", "cinema")),
    Student("Zoé", "tennis", 2, ("Sat 10:00",), "Mile End", 8, 6, ("photography", "cooking")),
    # --- Soccer, Tuesday 19:00: only 2 players -> waitlist (by design) ---
    Student("Louis", "soccer", 2, ("Tue 19:00",), "Plateau-Mont-Royal", 6, 6, ("cinema", "music")),
    Student("Anna", "soccer", 2, ("Tue 19:00",), "Rosemont", 5, 5, ("cooking", "cinema")),
]

SAMPLE_FIELDS: list[Field] = [
    Field("Parc La Fontaine", "Plateau-Mont-Royal", ("tennis", "soccer")),
    Field("Parc Jeanne-Mance", "Plateau-Mont-Royal", ("tennis", "soccer", "basketball")),
    Field("Parc Jarry", "Villeray", ("tennis", "soccer")),
    Field("Parc Maisonneuve", "Rosemont", ("soccer", "tennis")),
    Field("Parc Angrignon", "Verdun", ("soccer", "basketball")),
    Field("Parc Ahuntsic", "Ahuntsic", ("soccer", "basketball")),
]
