// ==================== Storage Manager ====================
// 管理学习进度、生词本、复习记录

class StorageManager {
  constructor() {
    this.KEYS = {
      PROGRESS: 'company_progress',
      VOCAB: 'company_vocab',
      REVIEW: 'company_review',
      SETTINGS: 'company_settings'
    };
    this.init();
  }

  init() {
    // 初始化默认数据结构
    if (!this.getProgress()) {
      this.saveProgress({
        studiedProducts: [],
        studiedTerms: [],
        quizScores: [],
        totalStudyTime: 0,
        lastStudyDate: null
      });
    }

    if (!this.getVocab()) {
      this.saveVocab({
        words: [],
        addedDates: {}
      });
    }

    if (!this.getReview()) {
      this.saveReview({
        schedule: []
      });
    }

    if (!this.getSettings()) {
      this.saveSettings({
        autoPlay: false,
        playbackSpeed: 1.0,
        theme: 'dark'
      });
    }
  }

  // ==================== Progress ====================
  getProgress() {
    const data = localStorage.getItem(this.KEYS.PROGRESS);
    return data ? JSON.parse(data) : null;
  }

  saveProgress(data) {
    localStorage.setItem(this.KEYS.PROGRESS, JSON.stringify(data));
  }

  markProductStudied(productId) {
    const progress = this.getProgress();
    if (!progress.studiedProducts.includes(productId)) {
      progress.studiedProducts.push(productId);
      progress.lastStudyDate = new Date().toISOString();
      this.saveProgress(progress);
    }
  }

  markTermStudied(term) {
    const progress = this.getProgress();
    if (!progress.studiedTerms.includes(term)) {
      progress.studiedTerms.push(term);
      this.saveProgress(progress);
    }
  }

  addQuizScore(score) {
    const progress = this.getProgress();
    progress.quizScores.push({
      score: score,
      date: new Date().toISOString()
    });
    this.saveProgress(progress);
  }

  addStudyTime(minutes) {
    const progress = this.getProgress();
    progress.totalStudyTime += minutes;
    this.saveProgress(progress);
  }

  // ==================== Vocabulary ====================
  getVocab() {
    const data = localStorage.getItem(this.KEYS.VOCAB);
    return data ? JSON.parse(data) : null;
  }

  saveVocab(data) {
    localStorage.setItem(this.KEYS.VOCAB, JSON.stringify(data));
  }

  addToVocab(word) {
    const vocab = this.getVocab();
    if (!vocab.words.includes(word.en)) {
      vocab.words.push(word.en);
      vocab.addedDates[word.en] = new Date().toISOString();
      this.saveVocab(vocab);
      return true;
    }
    return false;
  }

  removeFromVocab(wordEn) {
    const vocab = this.getVocab();
    const index = vocab.words.indexOf(wordEn);
    if (index > -1) {
      vocab.words.splice(index, 1);
      delete vocab.addedDates[wordEn];
      this.saveVocab(vocab);
      return true;
    }
    return false;
  }

  isInVocab(wordEn) {
    const vocab = this.getVocab();
    return vocab.words.includes(wordEn);
  }

  // ==================== Review Schedule ====================
  getReview() {
    const data = localStorage.getItem(this.KEYS.REVIEW);
    return data ? JSON.parse(data) : null;
  }

  saveReview(data) {
    localStorage.setItem(this.KEYS.REVIEW, JSON.stringify(data));
  }

  addToReviewSchedule(word, nextReviewDate) {
    const review = this.getReview();
    const existing = review.schedule.find(item => item.word === word);

    if (existing) {
      existing.nextReview = nextReviewDate;
      existing.reviewCount++;
    } else {
      review.schedule.push({
        word: word,
        nextReview: nextReviewDate,
        reviewCount: 1,
        lastReview: new Date().toISOString()
      });
    }

    this.saveReview(review);
  }

  getDueReviews() {
    const review = this.getReview();
    const now = new Date();
    return review.schedule.filter(item => new Date(item.nextReview) <= now);
  }

  // ==================== Settings ====================
  getSettings() {
    const data = localStorage.getItem(this.KEYS.SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  saveSettings(data) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data));
  }

  updateSetting(key, value) {
    const settings = this.getSettings();
    settings[key] = value;
    this.saveSettings(settings);
  }

  // ==================== Export/Import ====================
  exportData() {
    return {
      progress: this.getProgress(),
      vocab: this.getVocab(),
      review: this.getReview(),
      settings: this.getSettings(),
      exportDate: new Date().toISOString()
    };
  }

  importData(data) {
    try {
      if (data.progress) this.saveProgress(data.progress);
      if (data.vocab) this.saveVocab(data.vocab);
      if (data.review) this.saveReview(data.review);
      if (data.settings) this.saveSettings(data.settings);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  // ==================== Clear Data ====================
  clearAll() {
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    this.init();
  }
}

// 导出单例
window.storage = new StorageManager();
