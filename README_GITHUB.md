# 医疗英语学习系统

> 医疗器械行业专业英语学习工具 + 外教课程分析

[![GitHub Pages](https://img.shields.io/badge/demo-live-brightgreen)](https://你的用户名.github.io/english-learning/)

## ✨ 功能特点

- 📖 **产品学习** - 医疗器械产品专业词汇
- 👨‍🏫 **外教课程** - 自动分析课程，生成学习报告
- 🔊 **点击发音** - 所有词汇支持在线发音
- 📱 **响应式设计** - 完美适配手机和电脑
- 📴 **离线支持** - PWA技术，可离线使用
- 🎨 **深色主题** - 护眼设计

## 🚀 快速开始

### 在线使用
访问：https://你的用户名.github.io/english-learning/

### 本地使用
```bash
# 克隆仓库
git clone https://github.com/你的用户名/english-learning.git

# 启动本地服务器
cd english-learning
python -m http.server 8000

# 访问 http://localhost:8000
```

## 📱 安装为APP

### iPhone
1. Safari 打开网站
2. 点击"分享" → "添加到主屏幕"
3. 像APP一样使用

### Android
1. Chrome 打开网站
2. 菜单 → "添加到主屏幕"
3. 像APP一样使用

## 📂 项目结构

```
english-learning/
├── index.html              # 主页面
├── manifest.json           # PWA配置
├── sw.js                   # Service Worker
├── css/
│   └── main.css           # 样式文件
├── js/
│   ├── app.js             # 主应用逻辑
│   ├── tutor.js           # 外教课程模块
│   ├── storage.js         # 存储管理
│   ├── audio.js           # 音频管理
│   └── spaced-repetition.js  # 间隔重复算法
└── data/
    ├── products.json      # 产品数据
    └── tutor-lessons.json # 外教课程数据
```

## 🔄 更新内容

修改 `data/tutor-lessons.json` 添加新课程，提交后自动部署。

## 📄 许可

仅供个人学习使用

---

**创建日期：** 2026-03-18
**版本：** v3.0
