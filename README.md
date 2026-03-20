# 某公司英语学习系统 v3.0

医疗器械行业专业英语学习工具 + 外教课程分析 - 支持电脑和手机

## 功能特点

### 核心功能
- ✅ **产品学习** - 浏览产品和专业词汇
- ✅ **外教课程** - 自动分析课程文字稿，生成学习报告
- ✅ **测验模式** - 自我测试（开发中）
- ✅ **生词本** - 收藏重点词汇
- ✅ **学习进度** - 追踪学习情况

### 外教课程分析功能
- 📝 **语法错误检测** - 自动识别并纠正语法错误，附带例句
- 🔊 **发音问题分析** - 标注发音错误，提供正确音标
- 📚 **关键词汇提取** - 自动整理商务和医疗词汇，配音标和例句
- 📖 **课堂笔记整理** - 总结语法要点和学习建议
- 🎯 **学习建议** - 指出优点和下次课重点

### 技术特性
- 📱 **响应式设计** - 完美适配手机和电脑
- 🔊 **多方案发音** - 有道API + 浏览器TTS
- 💾 **本地存储** - 学习进度自动保存
- 🔄 **间隔重复** - 智能复习提醒（SM-2算法）
- 📴 **离线支持** - PWA技术，可离线使用
- 🎨 **深色主题** - 护眼设计

## 使用方法

### 方法1：直接打开（推荐）
1. 双击 `index.html` 文件
2. 在浏览器中打开即可使用

### 方法2：本地服务器
```bash
# 使用Python
python -m http.server 8000

# 使用Node.js
npx http-server

# 然后访问 http://localhost:8000
```

### 手机使用
1. 将整个文件夹上传到服务器，或使用局域网共享
2. 手机浏览器访问对应地址
3. 点击"添加到主屏幕"即可像APP一样使用

## 外教课程分析使用指南

### 添加新课程
1. 将腾讯会议的文字稿复制下来
2. 发送给Claude Code，让它分析并生成JSON数据
3. 生成的数据会自动添加到 `data/tutor-lessons.json`
4. 刷新页面，点击"外教课程"标签即可查看

### 课程分析包含
- 语法错误表格（错误用法 → 正确用法 → 错误类型 → 例句）
- 发音问题列表（你的发音 → 正确发音 → 音标 → 播放按钮）
- 关键词汇卡片（中英文 → 音标 → 例句 → 播放按钮）
- 课堂笔记（语法要点 → 示例）
- 学习建议（优点 + 下次重点）

## 项目结构

```
company-learning-system/
├── index.html              # 主页面
├── upload.html             # 课程上传页面（辅助）
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
├── data/
│   ├── products.json      # 产品数据
│   └── tutor-lessons.json # 外教课程数据
└── assets/
    ├── audio/             # 音频文件（预留）
    └── images/            # 图片文件（预留）
```

## 数据说明

### products.json 结构
```json
{
  "company": "某公司",
  "stats": {
    "totalCategories": 10,
    "totalProducts": 44,
    "totalTerms": 259
  },
  "categories": [
    {
      "id": "ortho",
      "nameCn": "骨科",
      "nameEn": "Orthopedics",
      "products": [...]
    }
  ]
}
```

### tutor-lessons.json 结构
```json
{
  "lessons": [
    {
      "id": "lesson_2026_03_18",
      "date": "2026-03-18",
      "tutor": "Maxim",
      "duration": "49分钟",
      "topics": ["工作状态更新", "财政部培训课程", ...],
      "grammarErrors": [...],
      "pronunciation": [...],
      "vocabulary": {
        "business": [...],
        "medical": [...]
      },
      "notes": [...],
      "improvements": [...],
      "nextFocus": [...]
    }
  ]
}
```

### 本地存储数据
- `company_progress` - 学习进度
- `company_vocab` - 生词本
- `company_review` - 复习计划
- `company_settings` - 用户设置

## 浏览器兼容性

- ✅ Chrome/Edge 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ 移动端浏览器

## 后续优化建议

1. **完善测验模式**
   - 选择题
   - 填空题
   - 听力测试

2. **增强音频功能**
   - 预录高质量音频
   - 调节播放速度
   - 循环播放

3. **数据同步**
   - 云端备份
   - 多设备同步

4. **外教课程增强**
   - 支持直接上传Word文档
   - 支持视频文件分析
   - 自动生成复习卡片

5. **内容扩展**
   - 添加更多产品
   - 例句和用法
   - 视频讲解

## 开发者

创建日期：2026-03-18
版本：v3.0

## 许可

仅供个人学习使用
