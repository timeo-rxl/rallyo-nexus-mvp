"""Rallyo (Nexus) — interactive matching demo (Streamlit).

Run:
    pip install -r requirements.txt
    streamlit run app.py

Only this file is the interface: the matching engine, the demo data and
the tests live in rallyo/ and tests/ and are untouched by the redesign.
"""

import streamlit as st

from rallyo.data import SAMPLE_FIELDS, SAMPLE_STUDENTS
from rallyo.matching import (
    apply_feedback,
    assign_fields,
    form_pods,
    has_spark,
    instant_match,
    pod_score,
)
from rallyo.models import LEVELS as LEVEL_NAMES
from rallyo.models import MIN_POD_SIZE, Student

SPORTS = ["soccer", "basketball", "tennis"]
SLOTS = ["Thu 18:00", "Sat 10:00", "Tue 19:00"]
NEIGHBOURHOODS = [
    "Plateau-Mont-Royal",
    "Mile End",
    "Rosemont",
    "Verdun",
    "Côte-des-Neiges",
    "Villeray",
]
INTERESTS = [
    "cinema",
    "cooking",
    "music",
    "running",
    "photography",
    "board games",
    "reading",
]
LEVELS = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
SPORT_EMOJI = {"soccer": "⚽", "basketball": "🏀", "tennis": "🎾"}
AVATAR_COLORS = ["#FF5A1F", "#14315C", "#0E9F8A", "#7C3AED", "#E11D48", "#0284C7"]

st.set_page_config(
    page_title="Rallyo — Arrête de scroller. Va jouer.",
    page_icon="⚽",
    layout="wide",
)

# ---------------------------------------------------------------------------
# Brand CSS — Rallyo: deep navy + vivid orange, rounded cards, airy layout.
# ---------------------------------------------------------------------------
st.markdown(
    """
<style>
  #MainMenu {visibility: hidden;}
  footer {visibility: hidden;}
  header[data-testid="stHeader"] {visibility: hidden;}
  .block-container {padding-top: 1.2rem; padding-bottom: 2.5rem; max-width: 1080px;}

  .hero {
    background: linear-gradient(120deg, #0B1B33 0%, #14315C 58%, #FF5A1F 165%);
    border-radius: 26px; padding: 2.4rem 2.6rem 2.2rem 2.6rem; color: #fff;
    box-shadow: 0 18px 40px rgba(11, 27, 51, .25); margin-bottom: 1.4rem;
  }
  .hero-eyebrow {letter-spacing: .22em; font-size: .78rem; font-weight: 800;
    color: #FFB59A; text-transform: uppercase; margin-bottom: .6rem;}
  .hero h1 {font-size: 3rem; line-height: 1.05; margin: 0 0 .7rem 0; font-weight: 900;}
  .hero h1 .accent {color: #FF8A3D;}
  .hero p {font-size: 1.12rem; line-height: 1.55; color: #DCE6F2; max-width: 640px;
    margin: 0 0 1.3rem 0;}
  .hero-stats {display: flex; gap: .6rem; flex-wrap: wrap;}
  .hero-stat {background: rgba(255,255,255,.13); border: 1px solid rgba(255,255,255,.22);
    border-radius: 999px; padding: .42rem .95rem; font-weight: 700; font-size: .92rem;}

  .step {text-align: center; padding: .4rem .6rem;}
  .step-num {width: 44px; height: 44px; border-radius: 50%; margin: 0 auto .5rem auto;
    background: #FF5A1F; color: #fff; font-weight: 900; font-size: 1.15rem;
    display: flex; align-items: center; justify-content: center;}
  .step b {display: block; font-size: 1rem; color: #0E1B2E; margin-bottom: .15rem;}
  .step span {font-size: .88rem; color: #5B6B80; line-height: 1.4;}

  .section-title {font-size: 1.55rem; font-weight: 900; color: #0E1B2E; margin: .4rem 0 .1rem 0;}
  .section-sub {color: #5B6B80; margin-bottom: 1rem;}

  .pod-card {background: #fff; border: 1px solid #ECE7DF; border-radius: 20px;
    padding: 1.15rem 1.25rem 1.25rem 1.25rem; box-shadow: 0 6px 22px rgba(14,27,46,.07);
    margin-bottom: 1rem;}
  .pod-head {display: flex; align-items: flex-start; gap: .7rem; margin-bottom: .8rem;}
  .pod-emoji {font-size: 1.9rem; line-height: 1; margin-top: .1rem;}
  .pod-title {font-size: 1.12rem; font-weight: 800; color: #0E1B2E;}
  .pod-sub {font-size: .88rem; color: #5B6B80;}
  .pod-size {margin-left: auto; background: #FFF1E8; color: #C2410C; font-weight: 800;
    font-size: .82rem; border-radius: 999px; padding: .28rem .7rem; white-space: nowrap;}
  .meter {height: 9px; background: #F0EDE7; border-radius: 999px; overflow: hidden; margin: .35rem 0 .3rem 0;}
  .meter-fill {height: 100%; border-radius: 999px;
    background: linear-gradient(90deg, #FFB03D, #FF5A1F);}
  .pod-meta {font-size: .88rem; color: #5B6B80; margin-bottom: .55rem;}
  .pod-meta b {color: #0E1B2E;}
  .spark {background: #FEF3C7; color: #92400E; font-weight: 800; border-radius: 999px;
    padding: .15rem .6rem; font-size: .8rem; margin-left: .35rem; white-space: nowrap;}
  .icebreaker {background: #EFF6F4; border-left: 4px solid #0E9F8A; border-radius: 8px;
    padding: .55rem .8rem; font-size: .92rem; color: #134E4A; margin-bottom: .7rem;}

  .member-row {display: flex; align-items: center; gap: .65rem; padding: .42rem 0;
    border-top: 1px solid #F3F0EB;}
  .avatar {width: 38px; height: 38px; min-width: 38px; border-radius: 50%; color: #fff;
    font-weight: 800; font-size: 1rem; display: flex; align-items: center;
    justify-content: center;}
  .member-info {line-height: 1.25;}
  .member-info b {color: #0E1B2E; font-size: .95rem;}
  .member-info span {display: block; font-size: .82rem; color: #5B6B80;}
  .member-tags {margin-left: auto; font-size: .8rem; color: #8A97A8; text-align: right;
    max-width: 42%;}

  .waitlist-card {background: #FFF8EC; border: 1px solid #F5D9A8; border-radius: 20px;
    padding: 1.15rem 1.3rem; box-shadow: 0 6px 22px rgba(14,27,46,.05);}
  .waitlist-card h3 {margin: 0 0 .35rem 0; color: #7C4A03; font-size: 1.15rem;}
  .waitlist-card p {margin: 0; color: #6B5A33; font-size: .95rem; line-height: 1.5;}
  .wait-chip {display: inline-block; background: #fff; border: 1px solid #EBD9AE;
    border-radius: 999px; padding: .3rem .85rem; font-weight: 700; color: #7C4A03;
    margin: .45rem .35rem 0 0; font-size: .9rem;}

  div[data-testid="stButton"] > button[kind="primary"] {
    background: linear-gradient(90deg, #FF5A1F, #FF7A3D); border: none;
    border-radius: 999px; padding: .75rem 2rem; font-weight: 800; font-size: 1.08rem;
    color: #fff; box-shadow: 0 10px 24px rgba(255, 90, 31, .35); width: 100%;}
  div[data-testid="stButton"] > button[kind="primary"]:hover {
    background: linear-gradient(90deg, #E84E12, #FF6A2B); color: #fff;}
  div[data-testid="stButton"] > button[kind="secondary"] {
    border-radius: 999px; font-weight: 700; border: 1.5px solid #FF5A1F; color: #E84E12;}
</style>
""",
    unsafe_allow_html=True,
)


@st.cache_data
def _weekly_pods():
    pods, waitlist = form_pods(list(SAMPLE_STUDENTS))
    assign_fields(pods, SAMPLE_FIELDS)
    return pods, waitlist


def _avatar_color(name: str) -> str:
    return AVATAR_COLORS[sum(name.encode()) % len(AVATAR_COLORS)]


def _member_row(member) -> str:
    level = LEVEL_NAMES[member.level].capitalize()
    interests = " · ".join(member.secondary_interests)
    return (
        f'<div class="member-row">'
        f'<div class="avatar" style="background:{_avatar_color(member.name)}">'
        f"{member.name[0]}</div>"
        f'<div class="member-info"><b>{member.name}</b>'
        f"<span>{level} · {member.neighbourhood}</span></div>"
        f'<div class="member-tags">{interests}</div></div>'
    )


def _pod_card_html(pod, index: int) -> str:
    score = pod_score(pod.members)
    field = pod.field
    field_line = (
        f"📍 {field.name} · {field.neighbourhood}" if field else "📍 Terrain à confirmer"
    )
    spark = '<span class="spark">⚡ Spark dans le pod</span>' if has_spark(pod.members) else ""
    icebreaker = (
        f'<div class="icebreaker">💬 <b>Icebreaker :</b> au moins deux d’entre vous '
        f"adorent « {pod.icebreaker_interest} » — la conversation est déjà lancée.</div>"
        if pod.icebreaker_interest
        else ""
    )
    members = "".join(_member_row(m) for m in pod.members)
    return (
        f'<div class="pod-card">'
        f'<div class="pod-head"><span class="pod-emoji">{SPORT_EMOJI[pod.sport]}</span>'
        f'<div><div class="pod-title">Pod {index} — {pod.sport.capitalize()} · {pod.slot}</div>'
        f'<div class="pod-sub">{field_line}</div></div>'
        f'<span class="pod-size">{pod.size} joueurs</span></div>'
        f'<div class="meter"><div class="meter-fill" style="width:{score * 100:.0f}%"></div></div>'
        f'<div class="pod-meta">Compatibilité <b>{score:.2f} / 1.00</b>{spark}</div>'
        f"{icebreaker}{members}</div>"
    )


# ---------------------------------------------------------------------------
# Hero — the Lovable landing slogan, as a banner.
# ---------------------------------------------------------------------------
st.markdown(
    """
<div class="hero">
  <div class="hero-eyebrow">Rallyo · Nexus — Montréal</div>
  <h1>Arrête de scroller.<br><span class="accent">Va jouer.</span></h1>
  <p>L'orchestrateur social IA des étudiants. Dis-nous ce que tu veux jouer :
  on forme un pod de 4 à 6 personnes compatibles et on vous réserve le terrain.
  Pas de swipe, pas d'organisation, pas de blancs gênants.</p>
  <div class="hero-stats">
    <span class="hero-stat">🏟️ 3 pods cette semaine</span>
    <span class="hero-stat">👥 18 étudiants dans la démo</span>
    <span class="hero-stat">📍 6 terrains municipaux</span>
  </div>
</div>
""",
    unsafe_allow_html=True,
)

steps = st.columns(3)
with steps[0]:
    st.markdown(
        '<div class="step"><div class="step-num">1</div><b>Dis ton sport</b>'
        "<span>Sport, niveau, créneau : 3 clics et c'est parti.</span></div>",
        unsafe_allow_html=True,
    )
with steps[1]:
    st.markdown(
        '<div class="step"><div class="step-num">2</div><b>On forme ton pod</b>'
        "<span>4 à 6 joueurs compatibles, avec un spark pour lancer la discussion.</span></div>",
        unsafe_allow_html=True,
    )
with steps[2]:
    st.markdown(
        '<div class="step"><div class="step-num">3</div><b>Rendez-vous au terrain</b>'
        "<span>Un parc municipal de Montréal, un horaire, et on joue.</span></div>",
        unsafe_allow_html=True,
    )

st.markdown("---")

# ---------------------------------------------------------------------------
# Find your pod — the interactive form (unchanged logic, new layout).
# ---------------------------------------------------------------------------
st.markdown('<div class="section-title">⚡ Trouve ton pod en 3 clics</div>',
            unsafe_allow_html=True)
st.markdown('<div class="section-sub">On te place dans un pod existant, '
            'ou on en démarre un nouveau pour toi.</div>', unsafe_allow_html=True)

with st.container(border=True):
    col1, col2, col3 = st.columns(3)
    with col1:
        sport = st.selectbox("Sport", SPORTS)
    with col2:
        level_label = st.selectbox("Level", list(LEVELS))
    with col3:
        slot = st.selectbox("When", SLOTS)
    neighbourhood = st.selectbox("Neighbourhood", NEIGHBOURHOODS)
    vibe1, vibe2 = st.columns(2)
    with vibe1:
        extraversion = st.slider("Extraversion (1 = introverted, 10 = extraverted)", 1, 10, 6)
    with vibe2:
        energy = st.slider("Energy (1 = low-key, 10 = high-energy)", 1, 10, 6)
    interests = st.multiselect("Secondary interests (pick at least one)",
                               INTERESTS, default=["cinema"])
    st.write("")
    find_clicked = st.button("⚡ Find my pod", type="primary", use_container_width=True)

if "match_result" not in st.session_state:
    st.session_state.match_result = None  # ("found", pod, you) | ("none", None, None)
if "feedback_sent" not in st.session_state:
    st.session_state.feedback_sent = False

if find_clicked:
    you = Student("You", sport, LEVELS[level_label], (slot,), neighbourhood,
                  extraversion, energy, tuple(interests))
    pods, _ = _weekly_pods()
    pod = instant_match(you, pods, SAMPLE_STUDENTS)
    st.session_state.match_result = (
        ("found", pod, you) if pod is not None else ("none", None, None)
    )
    st.session_state.feedback_sent = False

result = st.session_state.match_result
if result is not None:
    status, pod, you = result
    if status == "none":
        st.warning(
            "No pod fits you this week yet — you would start a new pod, "
            "and we would notify you as soon as 3 more players join."
        )
    else:
        field = pod.field.name if pod.field else "field to confirm"
        st.success(f"✅ Match found! **{pod.sport} · {pod.slot} · {field}**")
        st.markdown(_pod_card_html(pod, 0).replace("Pod 0 — ", "Ton pod — "),
                    unsafe_allow_html=True)
        st.write("**How was it? (demo feedback)**")
        rating = st.select_slider("Rate your outing (demo feedback)",
                                  options=[1, 2, 3, 4, 5], value=5,
                                  label_visibility="collapsed")
        if st.button("Send feedback"):
            apply_feedback(you, pod, rating)
            st.session_state.feedback_sent = True
        if st.session_state.feedback_sent:
            st.write("Thanks — your next matches will take this into account.")

st.markdown("---")

# ---------------------------------------------------------------------------
# This week's pods — visual cards instead of expanders.
# ---------------------------------------------------------------------------
st.markdown('<div class="section-title">📅 Les pods de la semaine</div>',
            unsafe_allow_html=True)
st.markdown('<div class="section-sub">Formés par le moteur de matching sur '
            "la cohorte d'exemple — même sport, même créneau, niveaux "
            "compatibles.</div>", unsafe_allow_html=True)

pods, waitlist = _weekly_pods()
pod_cols = st.columns(len(pods))
for col, (i, pod) in zip(pod_cols, enumerate(pods, 1)):
    with col:
        st.markdown(_pod_card_html(pod, i), unsafe_allow_html=True)

# ---------------------------------------------------------------------------
# Waitlist — clean callout card, with the missing-player count.
# ---------------------------------------------------------------------------
if waitlist:
    groups: dict[tuple[str, str], list] = {}
    for student in waitlist:
        for slot in student.availability:
            groups.setdefault((student.sport, slot), []).append(student)
    notes = []
    for (wsport, wslot), members in sorted(groups.items()):
        missing = MIN_POD_SIZE - len(members)
        notes.append(
            f"Plus que {missing} joueur{'s' if missing > 1 else ''} pour former "
            f"un pod {wsport} · {wslot}."
        )
    chips = "".join(f'<span class="wait-chip">⏳ {s.name}</span>' for s in waitlist)
    st.markdown(
        '<div class="waitlist-card"><h3>⏳ Liste d’attente — '
        f"{len(waitlist)} joueur{'s' if len(waitlist) > 1 else ''} en attente</h3>"
        f"<p>{' '.join(notes)}</p>{chips}</div>",
        unsafe_allow_html=True,
    )

st.markdown("---")
st.caption(
    "Demo data: fictional students, real Montréal park names, illustrative "
    "availability. Not a live booking source — real availability would come "
    "from the City of Montréal's open data."
)
