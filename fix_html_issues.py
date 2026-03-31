
#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
清理HTML中的重复按钮和语法错误
"""

import re
from pathlib import Path

BASE = Path(__file__).parent
DEPLOY_TEMP = BASE / "deploy_temp"
INDEX_HTML = DEPLOY_TEMP / "index.html"

def main():
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    original_len = len(html)
    modified = html

    # 1. 清理重复的按钮 - 删除 ',this)">🔊</button> 这样的残留
    # 使用字节匹配避免Unicode问题
    modified = modified.replace("',this)\">🔊</button>", "")
    modified = modified.replace('",this)">🔊</button>', "")
    modified = modified.replace("',this)\">", "")
    modified = modified.replace('",this)\">', "")

    # 4. 修复 aud() 调用中的引号问题
    # 确保所有 aud('word',this) 都是正确的单引号
    # 先替换所有 aud("word",this) 为 aud('word',this)
    pattern4 = re.compile(
        r'aud\("([^"]+)",this\)',
        re.IGNORECASE
    )
    modified = pattern4.sub(r"aud('\1',this)", modified)

    # 5. 修复 aud(''word'',this) 或 aud('word',this) 中的多余引号
    pattern5 = re.compile(
        r"aud\(''([^']+)'',this\)",
        re.IGNORECASE
    )
    modified = pattern5.sub(r"aud('\1',this)", modified)

    # 6. 修复 aud('word',this)',this) 这样的双重调用
    pattern6 = re.compile(
        r"aud\('([^']+)',this\)',this\)",
        re.IGNORECASE
    )
    modified = pattern6.sub(r"aud('\1',this)", modified)

    # 7. 清理空的 span 标签
    pattern7 = re.compile(
        r'<span class="w"></span>',
        re.IGNORECASE
    )
    modified = pattern7.sub("", modified)

    # 8. 清理重复的结束标签
    pattern8 = re.compile(
        r'</span></span></span>',
        re.IGNORECASE
    )
    modified = pattern8.sub("</span>", modified)

    # 9. 写回文件
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(modified)

    if len(modified) != original_len:
        print(f"Successfully cleaned! Changed from {original_len} to {len(modified)} chars")
        print("Now go to deploy_temp and git add/commit/push")
    else:
        print("No changes made - check pattern")

if __name__ == "__main__":
    main()
