// ==================== Main Application ====================

class App {
  constructor() {
    this.data = null;
    this.currentMode = 'study';
    this.currentCategory = null;
    this.init();
  }

  async init() {
    try {
      // 加载产品数据
      await this.loadData();

      // 加载外教课程数据（不阻塞主流程）
      this.loadTutorData();

      // 初始化UI
      this.initUI();

      // 绑定事件
      this.bindEvents();

      // 隐藏加载屏幕
      this.hideLoading();

      // 显示默认分类
      this.showCategory(this.data.categories[0].id);

    } catch (error) {
      console.error('初始化失败:', error);
      this.showToast('加载失败，请刷新页面重试');
      // 即使失败也隐藏加载屏幕
      this.hideLoading();
    }
  }

  async loadTutorData() {
    try {
      if (window.tutorModule) {
        await window.tutorModule.loadLessons();
      }
    } catch (error) {
      console.warn('外教课程数据加载失败:', error);
    }
  }

  async loadData() {
    try {
      const response = await fetch('data/products.json');
      if (!response.ok) {
        throw new Error('Failed to load products.json');
      }
      this.data = await response.json();
    } catch (error) {
      console.error('加载产品数据失败:', error);
      // 使用空数据结构避免崩溃
      this.data = {
        stats: { totalCategories: 0, totalProducts: 0, totalTerms: 0 },
        categories: []
      };
      throw error;
    }
  }

  initUI() {
    // 更新统计数据
    document.getElementById('stats-categories').textContent = this.data.stats.totalCategories;
    document.getElementById('stats-products').textContent = this.data.stats.totalProducts;
    document.getElementById('stats-terms').textContent = this.data.stats.totalTerms;

    // 生成导航标签
    this.renderNavTabs();

    // 显示学习模式
    this.renderStudyMode();
  }

  renderNavTabs() {
    const navTabs = document.getElementById('nav-tabs');
    navTabs.innerHTML = this.data.categories.map((cat, index) => `
      <button class="nav-tab ${index === 0 ? 'active' : ''}" data-category="${cat.id}">
        <span>${cat.emoji}</span>
        <span>${cat.nameCn}</span>
      </button>
    `).join('');
  }

  renderStudyMode() {
    const container = document.getElementById('main-content');

    if (!this.currentCategory) {
      this.currentCategory = this.data.categories[0].id;
    }

    const category = this.data.categories.find(c => c.id === this.currentCategory);

    container.innerHTML = `
      <div class="category-header">
        <h2 class="category-title">
          <span>${category.emoji}</span>
          ${category.nameCn}
        </h2>
        <p class="category-desc">${category.descEn}</p>
        ${category.badge ? `<div class="category-badge">${category.badge}</div>` : ''}
      </div>

      <div class="products-list">
        ${category.products.map(product => this.renderProductCard(product)).join('')}
      </div>
    `;
  }

  renderProductCard(product) {
    const isStudied = window.storage.getProgress().studiedProducts.includes(product.id);

    return `
      <div class="prod-card" id="${product.id}" data-studied="${isStudied}">
        <div class="card-top" onclick="app.toggleCard('${product.id}')">
          <div class="prod-icon">
            ${product.image
              ? `<img src="${product.image}" alt="${product.nameCn}" class="prod-img" onerror="this.outerHTML='${product.icon}'">`
              : product.icon}
          </div>
          <div class="card-info">
            <div class="prod-name">${product.nameEn}</div>
            <div class="prod-cn">${product.nameCn}</div>
            <div class="prod-tags">
              ${product.tags.map(tag => `<span class="prod-tag">${tag}</span>`).join('')}
            </div>
          </div>
          <span class="toggle-icon">+</span>
        </div>
        <div class="card-body" id="body-${product.id}">
          <div class="card-content">
            <div class="prod-desc">${product.description}</div>

            <table class="terms-table">
              <thead>
                <tr>
                  <th>中文</th>
                  <th>English / IPA</th>
                  <th>发音</th>
                </tr>
              </thead>
              <tbody>
                ${product.terms.map(term => `
                  <tr>
                    <td onclick="app.addToVocab('${term.en}', '${term.cn}', '${term.ipa}')" style="cursor:pointer" title="点击添加到生词本">${term.cn}</td>
                    <td onclick="app.addToVocab('${term.en}', '${term.cn}', '${term.ipa}')" style="cursor:pointer" title="点击添加到生词本">
                      <div>${term.en}</div>
                      <div style="font-size:11px;color:var(--muted)">${term.ipa}</div>
                    </td>
                    <td>
                      <button class="audio-btn" onclick="app.playAudio('${term.en}', this)">🔊</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  toggleCard(productId) {
    const card = document.getElementById(productId);
    const body = document.getElementById(`body-${productId}`);

    card.classList.toggle('open');
    body.classList.toggle('show');

    // 标记为已学习
    if (card.classList.contains('open')) {
      window.storage.markProductStudied(productId);
    }
  }

  async playAudio(text, button) {
    await window.audioManager.playWord(text, button);
  }

  addToVocab(en, cn, ipa) {
    window.storage.addWord({ en, cn, ipa });
    this.showToast(`已添加「${en}」到生词本`);
  }

  showCategory(categoryId) {
    this.currentCategory = categoryId;

    // 更新导航标签状态
    document.querySelectorAll('.nav-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.category === categoryId);
    });

    // 重新渲染内容
    this.renderStudyMode();
  }

  switchMode(mode) {
    this.currentMode = mode;

    // 更新按钮状态
    document.querySelectorAll('.mode-btn, .bottom-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // 显示/隐藏导航标签
    const navTabs = document.getElementById('nav-tabs');
    if (mode === 'study') {
      navTabs.style.display = 'flex';
    } else {
      navTabs.style.display = 'none';
    }

    // 渲染对应模式
    switch (mode) {
      case 'study':
        this.renderStudyMode();
        break;
      case 'tutor':
        window.tutorModule.render();
        break;
      case 'quiz':
        this.renderQuizMode();
        break;
      case 'vocab':
        this.renderVocabMode();
        break;
      case 'progress':
        this.renderProgressMode();
        break;
    }
  }

  renderQuizMode() {
    const container = document.getElementById('main-content');
    container.innerHTML = `
      <div class="quiz-container">
        <h2>测验模式</h2>
        <p>功能开发中...</p>
      </div>
    `;
  }

  renderVocabMode() {
    const vocab = window.storage.getVocab();
    const container = document.getElementById('main-content');

    container.innerHTML = `
      <div class="vocab-header">
        <h2>📚 生词本</h2>
        <button class="import-btn" onclick="app.showImportDialog()">📥 导入生词</button>
      </div>

      ${vocab.words.length === 0 ? `
        <div class="empty-state">
          <p style="font-size:48px;margin-bottom:16px">📚</p>
          <p>生词本是空的</p>
          <p style="font-size:13px;color:var(--muted);margin-top:8px">在学习模式中点击词汇可以添加到生词本</p>
        </div>
      ` : `
        <table class="terms-table">
          <thead>
            <tr>
              <th>中文</th>
              <th>English / IPA</th>
              <th>发音</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            ${vocab.words.map((word, idx) => `
              <tr>
                <td>${word.cn || '-'}</td>
                <td>
                  <div>${word.en}</div>
                  <div style="font-size:11px;color:var(--muted)">${word.ipa || ''}</div>
                </td>
                <td>
                  <button class="audio-btn" onclick="app.playAudio('${word.en}', this)">🔊</button>
                </td>
                <td>
                  <button class="delete-btn" onclick="app.removeFromVocab(${idx})">删除</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `}
    `;
  }

  showImportDialog() {
    const text = prompt('请输入要导入的生词（每行一个，格式：英文,中文,音标 或 英文）：\n\n例如：\nfracture,骨折,ˈfræktʃər\ncartilage,软骨');
    if (!text) return;

    const lines = text.trim().split('\n');
    let count = 0;

    lines.forEach(line => {
      const parts = line.split(',').map(s => s.trim());
      if (parts[0]) {
        window.storage.addWord({
          en: parts[0],
          cn: parts[1] || '',
          ipa: parts[2] || ''
        });
        count++;
      }
    });

    this.showToast(`成功导入 ${count} 个生词`);
    this.renderVocabMode();
  }

  removeFromVocab(index) {
    window.storage.removeWord(index);
    this.showToast('已删除');
    this.renderVocabMode();
  }

  renderProgressMode() {
    const progress = window.storage.getProgress();
    const stats = window.spacedRepetition.getStats();
    const container = document.getElementById('main-content');

    container.innerHTML = `
      <div class="progress-container">
        <h2>学习进度</h2>

        <div class="stat-card">
          <div class="stat-label">已学习产品</div>
          <div class="stat-value">${progress.studiedProducts.length}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">已学习词汇</div>
          <div class="stat-value">${progress.studiedTerms.length}</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">累计学习时间</div>
          <div class="stat-value">${Math.round(progress.totalStudyTime)} 分钟</div>
        </div>

        <div class="stat-card">
          <div class="stat-label">今日待复习</div>
          <div class="stat-value">${stats.due}</div>
        </div>

        <div class="suggestion">
          ${window.spacedRepetition.getSuggestion()}
        </div>
      </div>
    `;
  }

  bindEvents() {
    // 导航标签点击
    document.getElementById('nav-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.nav-tab');
      if (tab) {
        this.showCategory(tab.dataset.category);
      }
    });

    // 模式切换
    document.querySelectorAll('.mode-btn, .bottom-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchMode(btn.dataset.mode);
      });
    });
  }

  hideLoading() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }

  showToast(message, duration = 2000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new App();
});
