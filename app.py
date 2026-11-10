"""Rallyo (Nexus) — interactive matching demo (Streamlit).

Run:
    pip install -r requirements.txt
    streamlit run app.py
"""

import streamlit as st

from rallyo.data import SAMPLE_FIELDS, SAMPLE_STUDENTS
from rallyo.matching import (
    apply_feedback,
    assign_fields,
    form_pods,
    instant_match,
    pod_score,
)
from rallyo.models import Student

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


@st.cache_data
def _weekly_pods():
    pods, waitlist = form_pods(list(SAMPLE_STUDENTS))
    assign_fields(pods, SAMPLE_FIELDS)
    return pods, waitlist


st.set_page_config(page_title="Rallyo — Find your pod", page_icon="🏟️")
st.title("🏟️ Rallyo (Nexus)")
st.write(
    "The AI social orchestrator for students. Tell us what you want to play — "
    "we form a pod of 4–6 compatible people and book the field. "
    "No swiping, no organising, no awkward silences."
)

st.header("Find your match in 3 clicks")
col1, col2, col3 = st.columns(3)
with col1:
    sport = st.selectbox("Sport", SPORTS)
with col2:
    level_label = st.selectbox("Level", list(LEVELS))
with col3:
    slot = st.selectbox("When", SLOTS)
neighbourhood = st.selectbox("Neighbourhood", NEIGHBOURHOODS)
extraversion = st.slider("Extraversion (1 = introverted, 10 = extraverted)", 1, 10, 6)
energy = st.slider("Energy (1 = low-key, 10 = high-energy)", 1, 10, 6)
interests = st.multiselect("Secondary interests (pick at least one)",
                           INTERESTS, default=["cinema"])

if st.button("⚡ Find my pod", type="primary"):
    you = Student("You", sport, LEVELS[level_label], (slot,), neighbourhood,
                  extraversion, energy, tuple(interests))
    pods, _ = _weekly_pods()
    pod = instant_match(you, pods, SAMPLE_STUDENTS)
    if pod is None:
        st.warning(
            "No pod fits you this week yet — you would start a new pod, "
            "and we would notify you as soon as 3 more players join."
        )
    else:
        field = pod.field.name if pod.field else "field to confirm"
        st.success(f"✅ Match found! **{pod.sport} · {pod.slot} · {field}**")
        st.write(f"Pod compatibility: **{pod_score(pod.members):.2f} / 1.00**")
        if pod.icebreaker_interest:
            st.write(f"💬 Icebreaker: at least two of you love "
                     f"'{pod.icebreaker_interest}' — conversation sorted.")
        st.write("**Your pod:**")
        for member in pod.members:
            level = {1: "beginner", 2: "intermediate", 3: "advanced"}[member.level]
            st.write(f"- {member.name} ({level}) — "
                     f"{', '.join(member.secondary_interests)}")
        rating = st.select_slider("How was it? (demo feedback)",
                                  options=[1, 2, 3, 4, 5], value=5)
        if st.button("Send feedback"):
            apply_feedback(you, pod, rating)
            st.write("Thanks — your next matches will take this into account.")

st.divider()
st.header("This week's pods (sample cohort)")
pods, waitlist = _weekly_pods()
for i, pod in enumerate(pods, 1):
    field = pod.field.name if pod.field else "field to confirm"
    with st.expander(f"Pod {i} — {pod.sport} · {pod.slot} · {field}"):
        st.write(f"Compatibility: **{pod_score(pod.members):.2f} / 1.00**")
        if pod.icebreaker_interest:
            st.write(f"💬 Icebreaker: '{pod.icebreaker_interest}'")
        for member in pod.members:
            level = {1: "beginner", 2: "intermediate", 3: "advanced"}[member.level]
            st.write(f"- {member.name} ({level}, {member.neighbourhood})")
if waitlist:
    st.write("⏳ Waitlist: " + ", ".join(s.name for s in waitlist))

st.caption(
    "Demo data: fictional students, real Montréal park names, illustrative "
    "availability. Not a live booking source — real availability would come "
    "from the City of Montréal's open data."
)
