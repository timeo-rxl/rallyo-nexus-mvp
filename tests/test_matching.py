"""Unit tests for the Rallyo matching engine.

Run:  python -m unittest discover -s tests -v
"""

import unittest

from rallyo.data import SAMPLE_FIELDS, SAMPLE_STUDENTS
from rallyo.matching import (
    apply_feedback,
    assign_fields,
    find_icebreaker,
    form_pods,
    has_spark,
    instant_match,
    pair_score,
)
from rallyo.models import MAX_POD_SIZE, MIN_POD_SIZE, Student


def make_student(name, sport="soccer", level=2, slots=("Thu 18:00",),
                 neighbourhood="Plateau-Mont-Royal", extraversion=6,
                 energy=6, interests=("cinema",)):
    return Student(name, sport, level, slots, neighbourhood,
                   extraversion, energy, interests)


class TestPairScore(unittest.TestCase):
    def test_same_sport_and_slot_scores_above_zero(self):
        a = make_student("A")
        b = make_student("B", interests=("cinema", "music"))
        self.assertGreater(pair_score(a, b), 0.0)

    def test_different_sport_scores_zero(self):
        a = make_student("A", sport="soccer")
        b = make_student("B", sport="tennis")
        self.assertEqual(pair_score(a, b), 0.0)

    def test_no_shared_slot_scores_zero(self):
        a = make_student("A", slots=("Thu 18:00",))
        b = make_student("B", slots=("Sat 10:00",))
        self.assertEqual(pair_score(a, b), 0.0)

    def test_same_level_beats_distant_level(self):
        a = make_student("A", level=2)
        same = make_student("B", level=2)
        far = make_student("C", level=3)
        # keep interests/energy identical so only the level differs
        self.assertGreater(pair_score(a, same), pair_score(a, far))


class TestPodFormation(unittest.TestCase):
    def setUp(self):
        self.pods, self.waitlist = form_pods(SAMPLE_STUDENTS)

    def test_three_pods_are_formed(self):
        self.assertEqual(len(self.pods), 3)

    def test_pod_sizes_are_between_4_and_6(self):
        for pod in self.pods:
            self.assertGreaterEqual(pod.size, MIN_POD_SIZE)
            self.assertLessEqual(pod.size, MAX_POD_SIZE)

    def test_no_student_is_placed_twice(self):
        names = [m.name for pod in self.pods for m in pod.members]
        self.assertEqual(len(names), len(set(names)))

    def test_pod_members_share_sport_and_slot(self):
        for pod in self.pods:
            self.assertTrue(all(m.sport == pod.sport for m in pod.members))
            self.assertTrue(all(pod.slot in m.availability for m in pod.members))

    def test_every_pod_has_an_icebreaker_interest(self):
        for pod in self.pods:
            self.assertIsNotNone(pod.icebreaker_interest)

    def test_every_pod_has_a_spark(self):
        for pod in self.pods:
            self.assertTrue(has_spark(pod.members))

    def test_small_group_goes_to_waitlist(self):
        waitlisted = {s.name for s in self.waitlist}
        self.assertEqual(waitlisted, {"Louis", "Anna"})

    def test_every_student_is_placed_or_waitlisted(self):
        placed = {m.name for pod in self.pods for m in pod.members}
        waitlisted = {s.name for s in self.waitlist}
        self.assertEqual(placed | waitlisted,
                         {s.name for s in SAMPLE_STUDENTS})


class TestFieldAssignment(unittest.TestCase):
    def test_assigned_field_supports_the_sport(self):
        pods, _ = form_pods(SAMPLE_STUDENTS)
        assign_fields(pods, SAMPLE_FIELDS)
        for pod in pods:
            self.assertIsNotNone(pod.field)
            self.assertIn(pod.sport, pod.field.sports)


class TestInstantMatch(unittest.TestCase):
    def test_finds_a_pod_with_an_open_seat(self):
        pods, _ = form_pods(SAMPLE_STUDENTS)
        newcomer = make_student("Nina", sport="basketball", level=2,
                                slots=("Thu 18:00",),
                                neighbourhood="Rosemont",
                                interests=("music",))
        pod = instant_match(newcomer, pods, SAMPLE_STUDENTS)
        self.assertIsNotNone(pod)
        self.assertEqual(pod.sport, "basketball")

    def test_returns_none_when_no_pod_fits(self):
        pods, _ = form_pods(SAMPLE_STUDENTS)
        newcomer = make_student("Nina", sport="tennis", level=2,
                                slots=("Tue 19:00",))
        self.assertIsNone(instant_match(newcomer, pods, SAMPLE_STUDENTS))


class TestFeedback(unittest.TestCase):
    def setUp(self):
        # Fresh copies: affinity lives on the Student objects, so tests
        # must not share the module-level sample cohort.
        import copy

        students = copy.deepcopy(SAMPLE_STUDENTS)
        self.pods, _ = form_pods(students)

    def test_five_stars_builds_affinity(self):
        pod = self.pods[0]
        student = pod.members[0]
        apply_feedback(student, pod, 5)
        others = [m.name for m in pod.members if m is not student]
        self.assertTrue(all(student.affinity[name] > 0 for name in others))

    def test_one_star_reduces_affinity(self):
        pod = self.pods[0]
        student = pod.members[0]
        apply_feedback(student, pod, 1)
        others = [m.name for m in pod.members if m is not student]
        self.assertTrue(all(student.affinity[name] < 0 for name in others))

    def test_invalid_rating_raises(self):
        with self.assertRaises(ValueError):
            apply_feedback(self.pods[0].members[0], self.pods[0], 6)


class TestIcebreaker(unittest.TestCase):
    def test_returns_none_when_nothing_is_shared(self):
        members = [make_student("A", interests=("cinema",)),
                   make_student("B", interests=("cooking",))]
        self.assertIsNone(find_icebreaker(members))


if __name__ == "__main__":
    unittest.main()
