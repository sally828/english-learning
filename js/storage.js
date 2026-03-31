// ==================== Storage Manager ====================
// 使用 localStorage 保存学习进度、生词本等数据

class Storage {
  getProgress() {
    try {
      const data = localStorage.getItem('company_progress');
      return data ? JSON.parse(data) : { studiedProducts: [], studiedTerms: [], totalStudyTime: 0 };
    } catch {
      return { studiedProducts: [], studiedTerms: [], totalStudyTime: 0 };
    }
  }

  saveProgress(progress) {
    localStorage.setItem('company_progress', JSON.stringify(progress));
  }

  markProductStudied(productId) {
    const progress = this.getProgress();
    if (!progress.studiedProducts.includes(productId)) {
      progress.studiedProducts.push(productId);
      this.saveProgress(progress);
    }
  }

  getVocab() {
    try {
      const data = localStorage.getItem('company_vocab');
      return data ? JSON.parse(data) : { words: [] };
    } catch {
      return { words: [] };
    }
  }

  saveVocab(vocab) {
    localStorage.setItem('company_vocab', JSON.stringify(vocab));
  }

  addWord(word) {
    const vocab = this.getVocab();
    const exists = vocab.words.some(w => w.en === word.en);
    if (!exists) {
      vocab.words.push(word);
      this.saveVocab(vocab);
    }
  }

  removeWord(index) {
    const vocab = this.getVocab();
    vocab.words.splice(index, 1);
    this.saveVocab(vocab);
  }

  addVocabWord(word) {
    this.addWord({ en: word, cn: '', ipa: '' });
  }

  removeVocabWord(word) {
    const vocab = this.getVocab();
    vocab.words = vocab.words.filter(w => w.en !== word);
    this.saveVocab(vocab);
  }

  importVocabBatch(csvText) {
    const lines = csvText.trim().split('\n');
    const vocab = this.getVocab();
    let count = 0;

    lines.forEach(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts[0] && !vocab.words.some(w => w.en === parts[0])) {
        vocab.words.push({
          en: parts[0],
          cn: parts[1] || '',
          ipa: parts[2] || ''
        });
        count++;
      }
    });

    this.saveVocab(vocab);
    return count;
  }
}

window.storage = new Storage();
