# GitHub Pages v5.0 问题修复方案

---

## 问题 1：点击喇叭没有声音

### 修复代码（直接在浏览器控制台运行）：

```javascript
// 1. 重新定义 speak() 函数：优先使用浏览器原生 speechSynthesis
window.speak = async function(text) {
  let ok = await window.synthSpeak(text);  // 浏览器优先
  if (!ok) ok = await window.googleSpeak(text);
  if (!ok) ok = await window.ydSpeak(text);
  return ok;
};

// 2. 确保 audioUnlocked 已解锁
const unlockNow = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf; src.connect(ctx.destination); src.start(0);
};
unlockNow();

console.log('✅ 音频修复完成：浏览器原生语音优先');
```

### 永久修复：修改源代码

找到页面中 `speak()` 函数的定义，修改为：

```javascript
// 修改前（原顺序）：Google → 有道 → 浏览器
async function speak(text) {
  let ok = await googleSpeak(text);
  if (!ok) ok = await ydSpeak(text);
  if (!ok) ok = await synthSpeak(text);
  return ok;
}

// 修改后（新顺序）：浏览器 → Google → 有道
async function speak(text) {
  let ok = await synthSpeak(text);  // 优先用浏览器，秒播，不依赖网络
  if (!ok) ok = await googleSpeak(text);
  if (!ok) ok = await ydSpeak(text);
  return ok;
}
```

---

## 问题 2：图片无法加载

### 修复代码（控制台运行）：

```javascript
// 给所有图片添加 onerror 回退
document.querySelectorAll('img').forEach(img => {
  if (!img.dataset.fixed) {
    img.dataset.fixed = 'true';
    img.onerror = function() {
      this.style.display = 'none';
      // 找到并显示备用 emoji
      const parent = this.closest('.prod-icon') || this.parentElement;
      if (parent) {
        const backupIcon = parent.querySelector('.backup-emoji');
        if (backupIcon) backupIcon.style.display = 'inline';
      }
    };
    // 如果已经加载失败，立即触发回退
    if (img.naturalWidth === 0 && img.complete) {
      img.onerror();
    }
  }
});

console.log('✅ 图片 onerror 回退已添加');
```

---

## 问题 3：启动无法打开

GitHub Pages 是在线网站，**不是本地服务器**：
- 直接访问：https://sally828.github.io/english-learning/
- 不需要 `启动.bat`（那是给本地文件夹用的）
- 如果打不开，请检查网络

---

## 一键修复（控制台全选复制运行）：

```javascript
(() => {
  console.log('🚀 开始修复...');

  // 1. 音频修复
  if (window.synthSpeak) {
    window.speak = async function(text) {
      let ok = await window.synthSpeak(text);
      if (!ok) ok = await window.googleSpeak(text);
      if (!ok) ok = await window.ydSpeak(text);
      return ok;
    };
    console.log('✅ 音频已修复（浏览器优先）');
  }

  // 2. 音频解锁
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf; src.connect(ctx.destination); src.start(0);
    console.log('✅ 音频已解锁');
  } catch(e) {}

  // 3. 图片回退
  document.querySelectorAll('img').forEach(img => {
    if (!img.dataset.fixed) {
      img.dataset.fixed = 'true';
      img.onerror = function() {
        this.style.display = 'none';
        const parent = this.closest('.prod-icon') || this.parentElement;
        if (parent) {
          const backup = parent.querySelector('.backup-emoji');
          if (backup) backup.style.display = 'inline';
        }
      };
      if (img.naturalWidth === 0 && img.complete) img.onerror();
    }
  });
  console.log('✅ 图片回退已添加');

  console.log('🎉 修复全部完成！');
})();
```
