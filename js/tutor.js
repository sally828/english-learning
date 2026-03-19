// ==================== Tutor Lesson Module ====================

class TutorModule {
  constructor() {
    this.lessons = null;
    this.currentLesson = null;
  }

  async loadLessons() {
    const response = await fetch('data/tutor-lessons.json');
    this.lessons = await response.json();
    return this.lessons;
  }

  render() {
    const container = document.getElementById('main-content');

    if (!this.lessons || this.lessons.lessons.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <p style="font-size:48px;margin-bottom:16px">👨‍🏫</p>
          <p>暂无外教课程记录</p>
          <p style="font-size:13px;color:var(--muted);margin-top:8px">上传课程文字稿后会自动生成分析报告</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="tutor-container">
        <h2 class="section-title">外教课程分析</h2>

        <div class="lessons-list">
          ${this.lessons.lessons.map(lesson => this.renderLessonCard(lesson)).join('')}
        </div>
      </div>
    `;
  }

  renderLessonCard(lesson) {
    return `
      <div class="lesson-card" onclick="tutorModule.showLessonDetail('${lesson.id}')">
        <div class="lesson-header">
          <div class="lesson-date">📅 ${lesson.date}</div>
          <div class="lesson-tutor">👨‍🏫 ${lesson.tutor}</div>
          <div class="lesson-duration">⏱️ ${lesson.duration}</div>
        </div>
        <div class="lesson-topics">
          ${lesson.topics.slice(0, 3).map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
          ${lesson.topics.length > 3 ? `<span class="topic-more">+${lesson.topics.length - 3}</span>` : ''}
        </div>
        <div class="lesson-stats">
          <span>❌ ${lesson.grammarErrors.length} 个语法错误</span>
          <span>🔊 ${lesson.pronunciation.length} 个发音问题</span>
          <span>📚 ${lesson.vocabulary.business.length + lesson.vocabulary.medical.length} 个新词汇</span>
        </div>
      </div>
    `;
  }

  showLessonDetail(lessonId) {
    const lesson = this.lessons.lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    this.currentLesson = lesson;
    const container = document.getElementById('main-content');

    container.innerHTML = `
      <div class="lesson-detail">
        <button class="back-btn" onclick="tutorModule.render()">← 返回课程列表</button>

        <div class="lesson-detail-header">
          <h2>外教课程分析报告</h2>
          <div class="lesson-meta">
            <span><strong>学生：</strong> Sally</span>
            <span><strong>外教：</strong> ${lesson.tutor}</span>
            <span><strong>日期：</strong> ${lesson.date}</span>
            <span><strong>时长：</strong> ${lesson.duration}</span>
          </div>
        </div>

        <!-- Grammar Errors Section -->
        <div class="analysis-section">
          <h3>❌ 语法错误分析与纠正</h3>
          <table class="error-table">
            <thead>
              <tr>
                <th>你说的</th>
                <th>应该说</th>
                <th>错误类型</th>
                <th>例句</th>
              </tr>
            </thead>
            <tbody>
              ${lesson.grammarErrors.map(error => `
                <tr>
                  <td><span class="incorrect">${error.incorrect}</span></td>
                  <td><span class="correct">${error.correct}</span></td>
                  <td><span class="error-type">${error.errorType}</span></td>
                  <td class="example-cell">${error.example}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Pronunciation Section -->
        <div class="analysis-section">
          <h3>🔊 发音问题</h3>
          <table class="pronunciation-table">
            <thead>
              <tr>
                <th>单词</th>
                <th>你的发音</th>
                <th>正确发音</th>
                <th>音标</th>
                <th>播放</th>
              </tr>
            </thead>
            <tbody>
              ${lesson.pronunciation.map(item => `
                <tr>
                  <td><strong>${item.word}</strong></td>
                  <td><span class="incorrect">${item.incorrect}</span></td>
                  <td><span class="correct">${item.correct}</span></td>
                  <td>${item.ipa}</td>
                  <td>
                    <button class="audio-btn" onclick="tutorModule.playAudio('${item.word}', this)">🔊</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Vocabulary Section -->
        <div class="analysis-section">
          <h3>📚 关键词汇表</h3>

          <h4 class="vocab-category">商务/财务类</h4>
          <div class="vocab-grid">
            ${lesson.vocabulary.business.map(word => this.renderVocabCard(word)).join('')}
          </div>

          <h4 class="vocab-category">医疗器械类</h4>
          <div class="vocab-grid">
            ${lesson.vocabulary.medical.map(word => this.renderVocabCard(word)).join('')}
          </div>
        </div>

        <!-- Notes Section -->
        <div class="analysis-section">
          <h3>📝 课堂笔记整理</h3>
          ${lesson.notes.map(note => `
            <div class="note-card">
              <h4>${note.title}</h4>
              <p>${note.content}</p>
              <ul class="note-examples">
                ${note.examples.map(ex => `<li>${ex}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <!-- Improvements Section -->
        <div class="analysis-section">
          <h3>💡 做得好的地方</h3>
          <ul class="improvement-list">
            ${lesson.improvements.map(item => `<li>✓ ${item}</li>`).join('')}
          </ul>
        </div>

        <!-- Next Focus Section -->
        <div class="analysis-section">
          <h3>🎯 下次课重点</h3>
          <ul class="focus-list">
            ${lesson.nextFocus.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  renderVocabCard(word) {
    return `
      <div class="vocab-card">
        <div class="vocab-header">
          <span class="vocab-chinese">${word.chinese}</span>
          <button class="audio-btn-small" onclick="tutorModule.playAudio('${word.english}', this)">🔊</button>
        </div>
        <div class="vocab-english">${word.english}</div>
        <div class="vocab-ipa">${word.ipa}</div>
        <div class="vocab-example">${word.example}</div>
      </div>
    `;
  }

  async playAudio(text, button) {
    await window.audioManager.playWord(text, button);
  }
}

// 全局实例
window.tutorModule = new TutorModule();
