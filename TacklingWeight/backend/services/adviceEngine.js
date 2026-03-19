/**
 * Rule-Based Advice Engine
 * Generates safe, general wellness guidance aligned with WHO, Public Health England,
 * and British Nutrition Foundation guidelines.
 *
 * ⚠️ NO medical advice, supplements, extreme diets, or disease-related guidance.
 */

const DISCLAIMER = 'This advice is for general health guidance only and is not medical advice. ' +
  'Always consult a qualified healthcare professional before making significant changes to your diet or exercise routine.';

const BLOCKED_TERMS = [
  'supplement', 'medication', 'drug', 'prescription', 'diagnosis', 'treatment',
  'cure', 'disease', 'disorder', 'syndrome', 'keto', 'detox', 'cleanse',
  'fasting', 'laxative', 'steroid', 'hormone', 'insulin',
];

function containsBlockedTerms(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_TERMS.some(term => lower.includes(term));
}

// ── Tips by goal + BMI ──

const tipsByGoal = {
  lose: [
    'Focus on whole foods: vegetables, fruits, lean proteins, and whole grains.',
    'Aim for a modest calorie reduction — around 500 kcal/day below maintenance for gradual loss.',
    'Drink water before meals to help manage portion sizes naturally.',
    'Include fibre-rich foods to help you feel fuller for longer.',
    'Use smaller plates to naturally reduce portion sizes.',
    'Practice mindful eating — chew slowly and avoid distractions while eating.',
    'Aim for at least 150 minutes of moderate activity per week (WHO guideline).',
  ],
  gain: [
    'Eat nutrient-dense foods regularly — include healthy fats like avocado, nuts, and olive oil.',
    'Add an extra snack between meals to increase daily calorie intake gradually.',
    'Include protein with every meal to support muscle building.',
    'Try smoothies with banana, oats, and nut butter for calorie-dense nutrition.',
    'Strength training 2–3 times per week can help build lean mass.',
    'Don\'t skip meals — set reminders if needed to eat consistently.',
    'Choose whole grains and starchy vegetables for sustained energy.',
  ],
  maintain: [
    'Continue a balanced diet with good variety across all food groups.',
    'Monitor portion sizes to keep energy intake consistent.',
    'Stay active with a mix of cardio and strength exercises.',
    'Weigh yourself weekly to catch any trends early.',
    'Focus on sleep quality — 7–9 hours per night supports weight maintenance.',
    'Limit ultra-processed foods and sugary drinks.',
    'Stay hydrated throughout the day — aim for 6–8 glasses of water.',
  ],
};

const tipsByBmi = {
  underweight: [
    'Gradually increase your calorie intake with nutrient-rich foods.',
    'If you\'re concerned about being underweight, speak to your GP for personalised guidance.',
  ],
  normal: [
    'You\'re in a healthy BMI range — focus on maintaining balanced nutrition and regular activity.',
  ],
  overweight: [
    'Small, sustainable changes are most effective — avoid crash diets.',
    'Even a 5% reduction in body weight can bring meaningful health benefits.',
  ],
  obese: [
    'Seek guidance from a healthcare professional for a safe, personalised plan.',
    'Focus on gradual changes — rapid weight loss can be harmful.',
  ],
};

// ── Meal ideas by goal & dietary flags ──

const baseMeals = {
  lose: [
    { meal: 'Grilled chicken salad with mixed leaves, cherry tomatoes, and a light vinaigrette', rationale: 'High protein, low calorie, and nutrient-dense' },
    { meal: 'Vegetable stir-fry with tofu and brown rice', rationale: 'Fibre-rich and balanced macros for satiety' },
    { meal: 'Overnight oats with berries and a drizzle of honey', rationale: 'Whole grains with natural sweetness for sustained energy' },
    { meal: 'Lentil soup with wholemeal bread', rationale: 'High fibre and plant protein for fullness' },
    { meal: 'Baked salmon with steamed broccoli and sweet potato', rationale: 'Omega-3 fatty acids and complex carbohydrates' },
  ],
  gain: [
    { meal: 'Porridge with banana, peanut butter, and whole milk', rationale: 'Calorie-dense with healthy fats and complex carbs' },
    { meal: 'Chicken wrap with avocado, cheese, and salad', rationale: 'Balanced macros with calorie density from healthy fats' },
    { meal: 'Pasta with lean mince, tomato sauce, and vegetables', rationale: 'Good source of protein and energy-dense carbohydrates' },
    { meal: 'Smoothie with Greek yoghurt, oats, mixed berries, and honey', rationale: 'Easy-to-consume calories with quality protein' },
    { meal: 'Rice bowl with beans, grilled chicken, and guacamole', rationale: 'Complete protein with complex carbs and healthy fats' },
  ],
  maintain: [
    { meal: 'Mediterranean salad with feta, olives, and grilled vegetables', rationale: 'Balanced nutrition aligned with Mediterranean diet principles' },
    { meal: 'Jacket potato with tuna and mixed salad', rationale: 'Sustained energy with lean protein' },
    { meal: 'Wholemeal toast with scrambled eggs and spinach', rationale: 'Balanced breakfast with protein and iron' },
    { meal: 'Grilled fish with roasted vegetables and quinoa', rationale: 'Lean protein with complete amino acids from quinoa' },
    { meal: 'Bean chilli with brown rice and natural yoghurt', rationale: 'Plant protein with probiotics and whole grains' },
  ],
};

const vegetarianSwaps = {
  'Grilled chicken salad with mixed leaves, cherry tomatoes, and a light vinaigrette': { meal: 'Halloumi salad with mixed leaves, cherry tomatoes, and a light vinaigrette', rationale: 'Vegetarian protein, low calorie, and nutrient-dense' },
  'Chicken wrap with avocado, cheese, and salad': { meal: 'Falafel wrap with hummus, avocado, and salad', rationale: 'Plant-based protein with healthy fats' },
  'Baked salmon with steamed broccoli and sweet potato': { meal: 'Baked aubergine with steamed broccoli and sweet potato', rationale: 'Fibre-rich plant-based alternative' },
  'Jacket potato with tuna and mixed salad': { meal: 'Jacket potato with beans and mixed salad', rationale: 'Plant protein with sustained energy' },
  'Grilled fish with roasted vegetables and quinoa': { meal: 'Grilled halloumi with roasted vegetables and quinoa', rationale: 'Vegetarian protein with complete amino acids from quinoa' },
  'Rice bowl with beans, grilled chicken, and guacamole': { meal: 'Rice bowl with beans, grilled peppers, and guacamole', rationale: 'Plant-based complete protein with healthy fats' },
  'Pasta with lean mince, tomato sauce, and vegetables': { meal: 'Pasta with lentil bolognese and vegetables', rationale: 'Plant protein with iron and fibre' },
};

function getMeals(goal, flags) {
  let meals = [...baseMeals[goal]];
  const isVegetarian = flags.includes('vegetarian') || flags.includes('vegan');

  if (isVegetarian) {
    meals = meals.map(m => vegetarianSwaps[m.meal] || m);
  }

  // Return 3–5 meal ideas
  return meals.slice(0, 5);
}

// ── Workout plans ──

const workoutPlans = {
  beginner: [
    { day: 'Day 1', activities: ['20-min brisk walk', '10-min gentle stretching'] },
    { day: 'Day 2', activities: ['15-min bodyweight exercises (squats, press-ups, lunges)', '10-min walk'] },
    { day: 'Day 3', activities: ['Rest day — gentle yoga or stretching for 15 minutes'] },
  ],
  intermediate: [
    { day: 'Day 1', activities: ['30-min jog or cycle', '15-min core workout (planks, crunches)'] },
    { day: 'Day 2', activities: ['30-min strength training (dumbbells or resistance bands)', '10-min cool-down stretching'] },
    { day: 'Day 3', activities: ['20-min HIIT session (bodyweight)', '10-min walk or light stretching'] },
  ],
};

function getWorkoutPlan(bmiCategory) {
  if (bmiCategory === 'obese' || bmiCategory === 'underweight') {
    return workoutPlans.beginner;
  }
  return workoutPlans.intermediate;
}

// ── Safer swaps ──

const saferSwaps = {
  'low sugar': [
    { instead: 'Fizzy drinks', try: 'Sparkling water with a slice of lemon' },
    { instead: 'Chocolate bars', try: 'A small handful of dark chocolate (70%+) or fresh fruit' },
  ],
  vegetarian: [
    { instead: 'Processed veggie burgers', try: 'Homemade bean burgers with herbs and spices' },
  ],
  vegan: [
    { instead: 'Processed vegan cheese', try: 'Nutritional yeast or cashew-based sauces' },
    { instead: 'White bread', try: 'Wholemeal or seeded bread for extra fibre' },
  ],
  general: [
    { instead: 'White bread/pasta', try: 'Wholemeal or wholegrain alternatives' },
    { instead: 'Crisps', try: 'Air-popped popcorn or vegetable sticks with hummus' },
    { instead: 'Sugary cereals', try: 'Porridge oats with fresh fruit' },
  ],
};

function getSaferSwaps(flags) {
  const swaps = [...saferSwaps.general];
  for (const flag of flags) {
    if (saferSwaps[flag]) {
      swaps.push(...saferSwaps[flag]);
    }
  }
  return swaps.slice(0, 5);
}

// ── Main engine ──

function generateAdvice({ goal, bmiCategory, flags = [], prompt }) {
  // Guard: reject blocked terms in prompt
  if (containsBlockedTerms(prompt)) {
    return {
      error: 'Your question contains terms related to medical advice, supplements, or extreme diets. ' +
        'We can only provide general wellness guidance.',
    };
  }

  // Build tips: start with goal-specific, add BMI-specific
  const tips = [...tipsByGoal[goal] || tipsByGoal.maintain];
  if (bmiCategory && tipsByBmi[bmiCategory]) {
    tips.push(...tipsByBmi[bmiCategory]);
  }

  // Select 5–7 tips
  const selectedTips = tips.slice(0, 7);

  const meals = getMeals(goal, flags);
  const workout = getWorkoutPlan(bmiCategory);
  const swaps = getSaferSwaps(flags);

  return {
    tips: selectedTips,
    mealIdeas: meals,
    workoutPlan: workout,
    saferSwaps: swaps,
    disclaimer: DISCLAIMER,
  };
}

module.exports = { generateAdvice, containsBlockedTerms };
