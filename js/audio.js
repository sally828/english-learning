// ==================== Audio Manager ====================
// 多方案音频播放：Web Speech API + 有道API + 备用方案

class AudioManager {
  constructor() {
    this.currentAudio = null;
    this.currentButton = null;
    this.isPlaying = false;
    this.bestVoice = null;
    this.voicesLoaded = false;
    this.init();
  }

  init() {
    // 解锁音频上下文（移动端需要）
    this.unlockAudio();

    // 加载语音列表
    if (window.speechSynthesis) {
      this.loadVoices();
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }
  }

  unlockAudio() {
    const unlock = () => {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      } catch (e) {
        console.log('Audio unlock failed:', e);
      }
    };

    document.addEventListener('click', unlock, { once: true });
    document.addEventListener('touchstart', unlock, { once: true });
  }

  loadVoices() {
    if (!window.speechSynthesis) return;

    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;

    this.voicesLoaded = true;

    // 优先选择高质量英语语音
    const preferredVoices = [
      'Microsoft Ava Online',
      'Microsoft Jenny Online',
      'Microsoft Aria Online',
      'Google US English',
      'Samantha',
      'Alex'
    ];

    for (const name of preferredVoices) {
      const voice = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
      if (voice) {
        this.bestVoice = voice;
        return;
      }
    }

    // 备选：任何英语语音
    this.bestVoice = voices.find(v => v.lang === 'en-US') ||
                     voices.find(v => v.lang.startsWith('en'));
  }

  // ==================== 停止所有播放 ====================
  stopAll() {
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.currentTime = 0;
      } catch (e) {}
      this.currentAudio = null;
    }

    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    this.isPlaying = false;

    if (this.currentButton) {
      this.currentButton.classList.remove('playing');
      this.currentButton = null;
    }
  }

  // ==================== 方案1: 有道API ====================
  async playYoudao(text) {
    return new Promise((resolve) => {
      try {
        const audio = new Audio(
          `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(text)}&type=1`
        );
        audio.playbackRate = 0.95;
        this.currentAudio = audio;

        audio.onended = () => {
          this.currentAudio = null;
          resolve(true);
        };

        audio.onerror = () => {
          this.currentAudio = null;
          resolve(false);
        };

        audio.play().catch(() => {
          this.currentAudio = null;
          resolve(false);
        });
      } catch (e) {
        resolve(false);
      }
    });
  }

  // ==================== 方案2: Web Speech API ====================
  async playSpeechSynthesis(text) {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve(false);
        return;
      }

      if (!this.voicesLoaded) {
        this.loadVoices();
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      utterance.pitch = 1.02;

      if (this.bestVoice) {
        utterance.voice = this.bestVoice;
      }

      utterance.onend = () => resolve(true);
      utterance.onerror = () => resolve(false);

      window.speechSynthesis.speak(utterance);
    });
  }

  // ==================== 统一播放接口 ====================
  async speak(text) {
    // 优先使用有道API（音质更好）
    let success = await this.playYoudao(text);

    // 失败则使用浏览器TTS
    if (!success) {
      success = await this.playSpeechSynthesis(text);
    }

    return success;
  }

  // ==================== 播放单词（带按钮状态） ====================
  async playWord(text, button) {
    this.stopAll();

    if (button) {
      button.classList.add('playing');
      this.currentButton = button;
    }

    await this.speak(text.trim());

    if (this.currentButton) {
      this.currentButton.classList.remove('playing');
      this.currentButton = null;
    }
  }

  // ==================== 播放长文本（分段） ====================
  splitToChunks(text) {
    // 按句子分割
    let sentences = text.split(/(?<=[.!?])\s+/);
    let result = [];

    for (let s of sentences) {
      s = s.trim();
      if (!s) continue;

      // 如果句子太长，进一步分割
      if (s.length > 150) {
        result.push(...s.split(/\s+—\s+/).filter(p => p.trim()));
      } else {
        result.push(s);
      }
    }

    return result;
  }

  async playLongText(text, button) {
    this.stopAll();

    const chunks = this.splitToChunks(text);
    if (!chunks.length) return;

    this.isPlaying = true;

    if (button) {
      button.classList.add('playing');
      button.textContent = '⏹ 停止';
      this.currentButton = button;
    }

    for (let i = 0; i < chunks.length; i++) {
      if (!this.isPlaying) break;
      await this.speak(chunks[i]);
      await this.delay(300); // 句子间停顿
    }

    this.isPlaying = false;

    if (this.currentButton) {
      this.currentButton.classList.remove('playing');
      this.currentButton.textContent = '🔊 朗读';
      this.currentButton = null;
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// 导出单例
window.audioManager = new AudioManager();
