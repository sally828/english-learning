#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复断裂的 span 标签和 aud() 调用
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

    # 修复模式1: onclick="aud('word</span></span>
    # 这种情况是 aud() 的参数被截断了
    pattern1 = re.compile(
        r'onclick="aud\(\'([^\'<]+)</span></span>',
        re.IGNORECASE
    )

    def fix_pattern1(match):
        word = match.group(1)
        # 如果单词不完整（比如 'PE' 应该是 'per'），保持原样但修复语法
        return f'onclick="aud(\'{word}\',this)">🔊</button></span></span>'

    modified = pattern1.sub(fix_pattern1, modified)

    # 修复模式2: onclick="aud('word</span></span> 后面还有文本
    pattern2 = re.compile(
        r'<button class="spk" onclick="aud\(\'([^\'<]+)</span></span>([^<]+)</span>',
        re.IGNORECASE
    )

    def fix_pattern2(match):
        word = match.group(1)
        rest_text = match.group(2)
        return f'<button class="spk" onclick="aud(\'{word}\',this)">🔊</button></span></span>{rest_text}</span>'

    modified = pattern2.sub(fix_pattern2, modified)

    # 修复模式3: 查找所有不完整的 aud() 调用
    # onclick="aud('xxx 后面没有 ',this)
    pattern3 = re.compile(
        r'onclick="aud\(\'([^\']+)\'(?!,this\))',
        re.IGNORECASE
    )

    def fix_pattern3(match):
        word = match.group(1)
        return f'onclick="aud(\'{word}\',this)'

    modified = pattern3.sub(fix_pattern3, modified)

    # 写回文件
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(modified)

    if len(modified) != original_len:
        print(f"Successfully fixed! Changed from {original_len} to {len(modified)} chars")
        print("Now go to deploy_temp and git add/commit/push")
    else:
        print("No changes made - check pattern")

if __name__ == "__main__":
    main()
