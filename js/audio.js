// ==================== Audio Manager ====================
// 使用浏览器原生TTS，优化音质

class AudioManager {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.loadVoices();
  }

  loadVoices() {
    if (!this.synth) return;

    const setVoices = () => {
      this.voices = this.synth.getVoices();
    };

    setVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoices;
    }
  }

  getBestVoice() {
    // 优先选择美式英语真人音
    const preferred = [
      'Microsoft Aria Online (Natural) - English (United States)',
      'Microsoft David - English (United States)',
      'Google US English',
      'en-US'
    ];

    for (const name of preferred) {
      const voice = this.voices.find(v => v.name.includes(name) || v.lang.includes('en-US'));
      if (voice) return voice;
    }

    return this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
  }

  async playWord(text, button) {
    if (!this.synth) {
      if (button) button.classList.remove('playing');
      return;
    }

    if (button) button.classList.add('playing');

    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = this.getBestVoice();

    if (voice) utterance.voice = voice;
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      if (button) button.classList.remove('playing');
    };

    utterance.onerror = () => {
      if (button) button.classList.remove('playing');
    };

    this.synth.speak(utterance);
  }
}

window.audioManager = new AudioManager();
