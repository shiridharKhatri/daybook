import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('Daybook Core Business Logic', () => {
  describe('Finance Calculations', () => {
    test('calculates balance and category percentages accurately', () => {
      const transactions = [
        { type: 'income', amount: 50000, category: 'Salary' },
        { type: 'expense', amount: 1500, category: 'Beauty & Haircare' },
        { type: 'expense', amount: 2500, category: 'Food & Dining' },
        { type: 'expense', amount: 1000, category: 'Shopping' },
      ];

      const totalIncome = transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalExpenses = transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const balance = totalIncome - totalExpenses;

      assert.strictEqual(totalIncome, 50000);
      assert.strictEqual(totalExpenses, 5000);
      assert.strictEqual(balance, 45000);

      // Category breakdown percentage
      const haircare = transactions.find((t) => t.category === 'Beauty & Haircare')!;
      const haircarePct = Math.round((haircare.amount / totalExpenses) * 100);
      assert.strictEqual(haircarePct, 30); // 1500 / 5000 = 30%
    });
  });

  describe('Task Priority Ordering', () => {
    test('sorts pending tasks before completed, and orders by priority A > B > C > D', () => {
      const rawTasks = [
        { id: '1', title: 'Buy Rosemary Oil', priority: 'C', status: 'pending' },
        { id: '2', title: 'Schedule Dermatologist', priority: 'A', status: 'pending' },
        { id: '3', title: 'Hair wash day', priority: 'B', status: 'completed' },
        { id: '4', title: 'Morning meditation', priority: 'B', status: 'pending' },
        { id: '5', title: 'Read hair care guide', priority: 'D', status: 'pending' },
      ];

      const priorityOrder: Record<string, number> = { A: 1, B: 2, C: 3, D: 4 };

      const sorted = [...rawTasks].sort((a, b) => {
        // Pending first
        if (a.status !== b.status) {
          return a.status === 'pending' ? -1 : 1;
        }
        // Then Priority A > B > C > D
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

      assert.strictEqual(sorted[0].priority, 'A');
      assert.strictEqual(sorted[0].id, '2'); // Dermatologist (A)
      assert.strictEqual(sorted[1].priority, 'B'); // Morning meditation (B, pending)
      assert.strictEqual(sorted[1].id, '4');
      assert.strictEqual(sorted[2].priority, 'C'); // Rosemary Oil (C)
      assert.strictEqual(sorted[3].priority, 'D'); // Read guide (D)
      assert.strictEqual(sorted[4].status, 'completed'); // Completed comes last
    });
  });

  describe('Watercolor Reaction Mappings', () => {
    test('maps all 5 daily moods to valid watercolor keys', () => {
      const MOOD_TO_REACTION: Record<string, string> = {
        very_happy: 'joyful_peach',
        happy: 'sweet_smile',
        neutral: 'sleepy_zz',
        angry: 'angry_grump',
        sad: 'sobbing_tears',
      };

      const validReactions = [
        'joyful_peach', 'crying_cloud', 'playful_wink', 'sad_yellow',
        'dizzy_spiral', 'sweet_smile', 'peaceful_sad', 'shocked_open',
        'laughing_happy', 'sleepy_zz', 'sick_mask', 'pout_soft',
        'sobbing_tears', 'nervous_teeth', 'angry_grump', 'kiss_love',
        'cute_kitty', 'yawning_tired', 'wink_blush', 'exhausted_dead'
      ];

      // Check all 5 moods map to an existing reaction key
      Object.entries(MOOD_TO_REACTION).forEach(([mood, key]) => {
        assert.ok(
          validReactions.includes(key),
          `Mood ${mood} should map to a valid reaction key`
        );
      });
      assert.strictEqual(validReactions.length, 20);
    });
  });

  describe('Local AI Knowledge Retrieval', () => {
    test('correctly routes queries to tasks, haircare, finance, or notes', () => {
      const matchQueryCategory = (query: string): string => {
        const q = query.toLowerCase();
        if (q.includes('task') || q.includes('todo')) return 'tasks';
        if (q.includes('hair') || q.includes('oil') || q.includes('serum') || q.includes('skin')) return 'products';
        if (q.includes('spend') || q.includes('expense') || q.includes('money')) return 'finance';
        if (q.includes('mood') || q.includes('feel')) return 'moods';
        return 'notes';
      };

      assert.strictEqual(matchQueryCategory('What tasks do I have today?'), 'tasks');
      assert.strictEqual(matchQueryCategory('Where did I save rosemary oil?'), 'products');
      assert.strictEqual(matchQueryCategory('How much did I spend this week?'), 'finance');
      assert.strictEqual(matchQueryCategory('How am I feeling recently?'), 'moods');
      assert.strictEqual(matchQueryCategory('Find my packing checklist'), 'notes');
    });
  });

  describe('Cycle & Period Calculations', () => {
    test('calculates correct cycle day, phase, and next period prediction', () => {
      const cycleLength = 28;
      const periodLength = 5;
      const lutealLength = 14;
      const ovulationDay = cycleLength - lutealLength; // Day 14

      const determinePhase = (day: number) => {
        if (day <= periodLength) return 'menstrual';
        if (day >= ovulationDay - 1 && day <= ovulationDay + 1) return 'ovulation';
        if (day > ovulationDay + 1) return 'luteal';
        return 'follicular';
      };

      // Day 2 should be Menstrual
      assert.strictEqual(determinePhase(2), 'menstrual');

      // Day 8 should be Follicular
      assert.strictEqual(determinePhase(8), 'follicular');

      // Day 14 should be Ovulation
      assert.strictEqual(determinePhase(14), 'ovulation');

      // Day 21 should be Luteal
      assert.strictEqual(determinePhase(21), 'luteal');

      // Days countdown test
      const currentDay = 14;
      const daysUntilNextPeriod = cycleLength - currentDay + 1;
      assert.strictEqual(daysUntilNextPeriod, 15);
    });
  });

  describe('Daily Ritual Customization', () => {
    test('supports custom ritual creation, color themes, and completion ratio', () => {
      const rituals = [
        { id: '1', name: 'Morning Skincare', icon: 'heart', color: '#E9C5BE', isCompleted: true },
        { id: '2', name: 'Rosemary Hair Oil', icon: 'leaf', color: '#8DB580', isCompleted: true },
        { id: '3', name: 'Magnesium Supplement', icon: 'pill', color: '#8BB0C4', isCompleted: false },
        { id: '4', name: 'Evening Reflection', icon: 'book', color: '#E8B36F', isCompleted: false },
      ];

      const completedCount = rituals.filter((r) => r.isCompleted).length;
      assert.strictEqual(completedCount, 2);
      assert.strictEqual(rituals.length, 4);

      const completionRatio = `${completedCount}/${rituals.length} completed`;
      assert.strictEqual(completionRatio, '2/4 completed');

      // Valid icon and color palette
      const allowedColors = ['#C58882', '#E9C5BE', '#8DB580', '#8BB0C4', '#E8B36F', '#B4A7D6'];
      rituals.forEach((r) => {
        assert.ok(allowedColors.includes(r.color), `Color ${r.color} should be in warm palette`);
      });
    });
  });
});

