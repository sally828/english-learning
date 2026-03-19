// ==================== Spaced Repetition System ====================
// 基于SuperMemo SM-2算法的间隔重复系统

class SpacedRepetition {
  constructor() {
    this.intervals = [1, 3, 7, 14, 30, 60, 120]; // 天数
  }

  // ==================== 计算下次复习时间 ====================
  calculateNextReview(quality, currentInterval = 0, repetitions = 0) {
    /*
      quality: 0-5
      0: 完全不记得
      1: 记得一点
      2: 记得但费力
      3: 记得，有点犹豫
      4: 记得很清楚
      5: 完全记得
    */

    let newInterval;
    let newRepetitions = repetitions;

    if (quality < 3) {
      // 回答错误，重新开始
      newInterval = this.intervals[0];
      newRepetitions = 0;
    } else {
      // 回答正确，增加间隔
      if (repetitions === 0) {
        newInterval = this.intervals[0];
      } else if (repetitions === 1) {
        newInterval = this.intervals[1];
      } else {
        // 使用SM-2算法
        const easeFactor = 1.3 + (quality - 3) * 0.1;
        newInterval = Math.round(currentInterval * easeFactor);
      }

      newRepetitions++;
    }

    // 计算下次复习日期
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newInterval);

    return {
      nextReviewDate: nextDate.toISOString(),
      interval: newInterval,
      repetitions: newRepetitions
    };
  }

  // ==================== 获取今日应复习的词汇 ====================
  getTodayReviews() {
    const review = window.storage.getReview();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // 今天开始

    return review.schedule.filter(item => {
      const reviewDate = new Date(item.nextReview);
      reviewDate.setHours(0, 0, 0, 0);
      return reviewDate <= now;
    });
  }

  // ==================== 记录复习结果 ====================
  recordReview(word, quality) {
    const review = window.storage.getReview();
    const item = review.schedule.find(r => r.word === word);

    if (!item) {
      // 新词汇
      const result = this.calculateNextReview(quality, 0, 0);
      review.schedule.push({
        word: word,
        nextReview: result.nextReviewDate,
        interval: result.interval,
        repetitions: result.repetitions,
        lastReview: new Date().toISOString(),
        quality: quality
      });
    } else {
      // 已有词汇
      const result = this.calculateNextReview(quality, item.interval, item.repetitions);
      item.nextReview = result.nextReviewDate;
      item.interval = result.interval;
      item.repetitions = result.repetitions;
      item.lastReview = new Date().toISOString();
      item.quality = quality;
    }

    window.storage.saveReview(review);
  }

  // ==================== 获取复习统计 ====================
  getStats() {
    const review = window.storage.getReview();
    const now = new Date();

    const total = review.schedule.length;
    const due = this.getTodayReviews().length;

    // 按间隔分组
    const groups = {
      new: 0,      // 新词
      learning: 0, // 学习中 (< 7天)
      young: 0,    // 年轻卡片 (7-30天)
      mature: 0    // 成熟卡片 (> 30天)
    };

    review.schedule.forEach(item => {
      if (item.repetitions === 0) {
        groups.new++;
      } else if (item.interval < 7) {
        groups.learning++;
      } else if (item.interval < 30) {
        groups.young++;
      } else {
        groups.mature++;
      }
    });

    return {
      total,
      due,
      groups
    };
  }

  // ==================== 生成学习建议 ====================
  getSuggestion() {
    const stats = this.getStats();

    if (stats.due === 0) {
      return '今天没有需要复习的词汇，可以学习新内容！';
    } else if (stats.due < 10) {
      return `今天有 ${stats.due} 个词汇需要复习，建议先完成复习。`;
    } else if (stats.due < 30) {
      return `今天有 ${stats.due} 个词汇需要复习，可以分批完成。`;
    } else {
      return `今天有 ${stats.due} 个词汇需要复习，建议优先复习最紧急的。`;
    }
  }

  // ==================== 获取优先级排序的复习列表 ====================
  getPrioritizedReviews() {
    const reviews = this.getTodayReviews();

    // 按逾期天数排序（越逾期越优先）
    return reviews.sort((a, b) => {
      const dateA = new Date(a.nextReview);
      const dateB = new Date(b.nextReview);
      return dateA - dateB;
    });
  }
}

// 导出单例
window.spacedRepetition = new SpacedRepetition();
