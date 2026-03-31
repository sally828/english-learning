// ==================== Spaced Repetition ====================
// 间隔重复算法（SM-2 简化版），追踪词汇复习计划

class SpacedRepetition {
  constructor() {
    this.key = 'company_review';
  }

  getData() {
    try {
      const data = localStorage.getItem(this.key);
      return data ? JSON.parse(data) : { cards: [] };
    } catch {
      return { cards: [] };
    }
  }

  getStats() {
    const data = this.getData();
    const now = Date.now();
    const due = data.cards.filter(c => c.nextReview <= now).length;
    return { due, total: data.cards.length };
  }

  getSuggestion() {
    const stats = this.getStats();
    if (stats.due > 0) {
      return `📌 你有 <strong>${stats.due}</strong> 个词汇需要复习！`;
    }
    return '✅ 暂无待复习词汇，继续学习新词汇吧！';
  }
}

window.spacedRepetition = new SpacedRepetition();
