# rallyo-nexus-mvp

**Rallyo (Nexus)** — the AI-powered social orchestrator for students.
3rd place, 54H Start-Up (HEC Montréal).

The problem: students are hyper-connected and still isolated. Finding
someone to play sports with — at your level, at a time that works — takes
so much organising that most people just stay home. Meanwhile, Montréal's
municipal fields (soccer, basketball, tennis) sit empty.

The solution: you state a desire — *"play basketball Thursday at 6pm"* —
and Nexus forms a micro-event: a pod of 4–6 compatible people, a place,
and a time. No swiping, no organising, no awkward silences.

**Live demo:** https://rallyo-ucffapphfezeyntjoxtcqks.streamlit.app/

## What this MVP does

The core of the product is the **matching engine** (`rallyo/`), built from
the project's strategy documents:

| Rule | How it works |
| --- | --- |
| **Same sport + same slot** | Hard filter — a pod only forms around one sport and one shared time slot |
| **Level proximity** | Playing with someone far above / below your level is no fun (weight 0.45) |
| **Secondary interests** | Shared interests spark conversation (weight 0.30, Jaccard similarity) |
| **Energy match** | Low-key and high-energy players are scored apart (weight 0.25) |
| **Balanced pods** | Every pod needs a "spark" (≥ 1 member with extraversion ≥ 6/10) and an "icebreaker" (an interest shared by ≥ 2 members) |
| **Min. 4, max. 6 per pod** | Fewer than 4 goes to the waitlist — a pod of 2–3 is a date, not a Rallyo pod |
| **Field assignment** | The pod is sent to a municipal field that supports the sport, ideally in the members' neighbourhood |
| **Match immédiat** | One click finds you a pod with an open seat for your sport and slot |
| **Continuous learning** | Quick post-outing feedback (1–5 stars) builds affinity with the people you played with, shaping your next matches |

## Try it

```bash
pip install -r requirements.txt

# Command-line demo (sample cohort of 18 HEC students)
python demo.py

# Interactive demo
streamlit run app.py

# Tests (19 tests)
python -m unittest discover -s tests -v
```

Or deploy the demo free on [Streamlit Community Cloud](https://streamlit.io/cloud)
— point it at `app.py`.

## Project structure

```
rallyo-nexus-mvp/
├── rallyo/
│   ├── models.py      # Student, Field, Pod
│   ├── matching.py    # compatibility score, pod formation, fields,
│   │                  # instant match, feedback learning
│   └── data.py        # demo cohort + demo fields
├── app.py             # Streamlit demo — find your pod in 3 clicks
├── demo.py            # CLI demo
└── tests/
    └── test_matching.py
```

## Demo data — read this

Students are **fictional**. Fields use **real Montréal park names** with
**illustrative** sports and availability — this is not a live booking
source. Real availability would come from the City of Montréal's open
data (see roadmap).

## Product & design — the Lovable apps

The product already exists as UI in Lovable (workspace "Melanie's Lovable"):

- **Rallyo Connect** — the landing site: *"Arrête de scroller. Va jouer."*
  Hero, Problem, How it works, Vision, beta signup. The pitch, in one page.
- **Connect & Thrive** — the working web app: landing page + app
  (browse games, create a game, game detail, profile).
- **Rally Sports Hub** — the mobile-style app shell: game cards, filters,
  bottom navigation, create game, profile.

Those three are the **interface**. This repository is the **brain** they
were missing: none of them implements a real matching algorithm — the
pods, the compatibility score and the field assignment live here, tested,
and the Streamlit demo is the fastest way to try them.

## Roadmap

- Live field availability from the City of Montréal's open data
- Real user accounts + the 3-park hyper-local launch (HEC Montréal)
- Feedback-driven profile learning at scale
- B2B2C: licences for student associations and universities
- B2G: anonymised usage dashboard for the City

## Context

Built from the Rallyo strategy documents (*Infrastructure Sociale IA
Étudiante* and *Mémo Stratégique : Projet Rallyo*). The product is a
facilitator of real-life experiences, not a catalogue of profiles to swipe.
