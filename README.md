# Rallyo — Arrête de scroller. Va jouer.

**Live demo:** https://rallyo-montreal.lovable.app

Rallyo (Nexus) — the social sports orchestrator for students.
3rd place, 54H Start-Up (HEC Montréal).

The problem: students are hyper-connected and still isolated. Finding
someone to play sports with — at your level, at a time that works — takes
so much organising that most people just stay home. Meanwhile, Montréal's
municipal fields (soccer, basketball, tennis) sit empty.

The solution: you state a desire — *"play basketball Thursday at 6pm"* —
and Rallyo forms a micro-event: a pod of 4–6 compatible people, a place,
and a time. No swiping, no organising, no awkward silences.

## What this app does

The core of the product is the **matching engine** (`src/lib/matching.ts`):

| Rule | How it works |
| --- | --- |
| **Same sport + same slot** | Hard filter — a pod only forms around one sport and one shared time slot |
| **Level proximity** | Playing with someone far above / below your level is no fun (weight 0.45) |
| **Secondary interests** | Shared interests spark conversation (weight 0.30, Jaccard similarity) |
| **Energy match** | Low-key and high-energy players are scored apart (weight 0.25) |
| **Balanced pods** | Every pod needs a "spark" (≥ 1 member with extraversion ≥ 6/10) and an "icebreaker" (an interest shared by ≥ 2 members) |
| **Min. 4, max. 6 per pod** | Fewer than 4 goes to the waitlist — a pod of 2–3 is a date, not a Rallyo pod |
| **Field assignment** | The pod is sent to a municipal field that supports the sport, ideally in the members' neighbourhood |
| **Instant match** | One click finds you a pod with an open seat for your sport and slot |
| **Continuous learning** | Quick post-outing feedback (1–5 stars) builds affinity with the people you played with, shaping your next matches |

Pages: **Accueil** (hero, problem, how it works, this week's pods),
**Trouve ton pod** (onboarding + instant match with a full score
breakdown), **Pods de la semaine**, **Liste d'attente**, **Profil**
(saved in localStorage).

## Try it

```bash
npm install
npm run dev     # local dev server
npm test        # vitest — matching engine + routing
npm run build   # production build
```

## Demo data — read this

Students are **fictional**. Fields use **real Montréal park names** with
**illustrative** sports and availability — this is not a live booking
source. Real availability would come from the City of Montréal's open
data (see roadmap).

## Tech

React + Vite + Tailwind CSS + shadcn/ui + TanStack Router. No backend,
no auth in this version: state lives in localStorage.

## History

The matching engine was first built and tested in Python (19 tests) with
a Streamlit demo; the full history is in the git log. The current app is
a complete rebuild (Lovable, November 2026) that ports the engine to
TypeScript and ships it as a real product interface.

## Roadmap

- Live field availability from the City of Montréal's open data
- Real user accounts + the hyper-local launch (HEC Montréal), starting with 3 parks (demo data covers 6 municipal fields)
- Feedback-driven profile learning at scale
- B2B2C: licences for student associations and universities
- B2G: anonymised usage dashboard for the City

## Context

Built from the Rallyo strategy documents (*Infrastructure Sociale IA
Étudiante* and *Mémo Stratégique : Projet Rallyo*). The product is a
facilitator of real-life experiences, not a catalogue of profiles to swipe.
