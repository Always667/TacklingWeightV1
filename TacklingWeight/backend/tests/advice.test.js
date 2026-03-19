const { generateAdvice, containsBlockedTerms } = require('../services/adviceEngine');

describe('Advice Engine', () => {
  describe('generateAdvice', () => {
    it('should return structured advice for weight loss goal', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'overweight',
        flags: [],
      });

      expect(result.tips).toBeDefined();
      expect(result.tips.length).toBeGreaterThanOrEqual(5);
      expect(result.tips.length).toBeLessThanOrEqual(7);
      expect(result.mealIdeas).toBeDefined();
      expect(result.mealIdeas.length).toBeGreaterThanOrEqual(3);
      expect(result.workoutPlan).toBeDefined();
      expect(result.workoutPlan.length).toBe(3);
      expect(result.saferSwaps).toBeDefined();
      expect(result.disclaimer).toBeDefined();
      expect(result.disclaimer).toContain('not medical advice');
    });

    it('should return vegetarian meal ideas when flagged', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'normal',
        flags: ['vegetarian'],
      });

      // Should not contain chicken or salmon in meal ideas
      const mealTexts = result.mealIdeas.map(m => m.meal.toLowerCase()).join(' ');
      expect(mealTexts).not.toContain('chicken');
      expect(mealTexts).not.toContain('salmon');
    });

    it('should return beginner workout for obese BMI', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'obese',
        flags: [],
      });

      const activities = result.workoutPlan.flatMap(d => d.activities).join(' ').toLowerCase();
      expect(activities).toContain('walk');
    });

    it('should always include mandatory disclaimer', () => {
      const goals = ['lose', 'gain', 'maintain'];
      for (const goal of goals) {
        const result = generateAdvice({ goal, bmiCategory: 'normal', flags: [] });
        expect(result.disclaimer).toBeDefined();
        expect(result.disclaimer.toLowerCase()).toContain('not medical advice');
      }
    });
  });

  describe('Guardrails', () => {
    it('should reject prompts with supplement terms', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'normal',
        flags: [],
        prompt: 'What supplement should I take?',
      });

      expect(result.error).toBeDefined();
      expect(result.error).toContain('medical advice');
    });

    it('should reject prompts with medication terms', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'normal',
        flags: [],
        prompt: 'Can you recommend a medication for weight loss?',
      });

      expect(result.error).toBeDefined();
    });

    it('should reject prompts about keto or extreme diets', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'normal',
        flags: [],
        prompt: 'Tell me about the keto diet',
      });

      expect(result.error).toBeDefined();
    });

    it('should reject prompts about fasting', () => {
      const result = generateAdvice({
        goal: 'lose',
        bmiCategory: 'normal',
        flags: [],
        prompt: 'Is intermittent fasting safe?',
      });

      expect(result.error).toBeDefined();
    });
  });

  describe('containsBlockedTerms', () => {
    it('should detect blocked terms', () => {
      expect(containsBlockedTerms('Take a supplement')).toBe(true);
      expect(containsBlockedTerms('keto diet')).toBe(true);
      expect(containsBlockedTerms('detox tea')).toBe(true);
    });

    it('should pass safe terms', () => {
      expect(containsBlockedTerms('How can I eat healthier?')).toBe(false);
      expect(containsBlockedTerms('Best vegetables for weight loss')).toBe(false);
      expect(containsBlockedTerms(null)).toBe(false);
    });
  });
});
