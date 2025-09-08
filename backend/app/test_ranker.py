import unittest
from app.ranker import ResumeRanker

class TestResumeRanker(unittest.TestCase):
    def setUp(self):
        self.ranker = ResumeRanker()

    def test_identical_texts(self):
        resume = "Python developer with 5 years experience"
        job = "Python developer with 5 years experience"
        score = self.ranker.score(resume, job)
        self.assertAlmostEqual(score, 100, delta=1)

    def test_no_overlap(self):
        resume = "Chef with culinary skills"
        job = "Software engineer with Python experience"
        score = self.ranker.score(resume, job)
        self.assertLess(score, 15)  # Accept very low score for no overlap

    def test_partial_overlap(self):
        resume = "Python developer"
        job = "Python developer with Java experience"
        score = self.ranker.score(resume, job)
        self.assertTrue(0 < score < 100)

    def test_empty_input(self):
        score = self.ranker.score("", "")
        self.assertEqual(score, 0)

    def test_matched_keywords(self):
        resume = "Python developer with Java experience"
        job = "Python developer with Java experience"
        matched = self.ranker.get_matched_keywords(resume, job)
        self.assertIn("python", matched)
        self.assertIn("developer", matched)
        self.assertIn("java", matched)

    def test_missing_keywords(self):
        resume = "Python developer"
        job = "Python developer with Java experience"
        missing = self.ranker.get_missing_keywords(resume, job)
        self.assertIn("java", missing)
        self.assertIn("experience", missing)

if __name__ == "__main__":
    unittest.main()