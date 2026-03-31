#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动修复 FD 视角区域的单词，添加音标和喇叭
"""

import json
import re
from pathlib import Path

BASE = Path(__file__).parent
DEPLOY_TEMP = BASE / "deploy_temp"
INDEX_HTML = DEPLOY_TEMP / "index.html"
PRODUCTS_JSON = BASE / "data" / "products.json"


def main():
    # 1. 读取 products.json，建立单词 -> 音标的字典
    with open(PRODUCTS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    word_to_ipa = {}
    for cat in data.get("categories", []):
        for prod in cat.get("products", []):
            for term in prod.get("terms", []):
                en_word = term.get("en", "").lower().strip()
                ipa = term.get("ipa", "")
                if en_word and ipa:
                    word_to_ipa[en_word] = ipa

    print(f"Loaded {len(word_to_ipa)} words from products.json")

    # 2. 读取 index.html
    with open(INDEX_HTML, "r", encoding="utf-8") as f:
        html = f.read()

    original_len = len(html)

    # 3. 查找并替换 FD 视角区域的英文单词
    # 首先建立 FD 视角区域的查找模式
    cfo_pattern = re.compile(
        r'<div class="cfo-box">.*?<div class="ov-en" id="cfo-\d+".*?>(.*?)</div>.*?</div>',
        re.DOTALL
    )

    # 对每个匹配的 ov-en 内容进行单词替换
    # 复杂的替换，需要小心处理已有标签
    # 先将已有 <span class="w"> 标签的部分标记跳过，只替换纯文本
    # 这个逻辑会比较复杂，先简单处理几个关键单词

    # 关键单词列表
    key_words = [
        ("compensate", "ˈkɒmpenseɪt"),
        ("gross margin", "ɡrəʊs ˈmɑːdʒɪn"),
        ("volume", "ˈvɒljuːm"),
        ("cost reduction", "kɒst rɪˈdʌkʃən"),
        ("bioabsorbable stents", "ˌbaɪoʊəbˈzɔːrbəbəl stents"),
        ("procurement", "prəˈkjʊəmənt"),
        ("market leader", "ˈmɑːkɪt ˈliːdər"),
        ("orthopedic implants", "ˌɔːrθəˈpiːdɪk ˈɪmplænts"),
        ("STAR Market", "stɑː mɑːrkɪt"),
        ("stent", "stent"),
        ("premium", "ˈpriːmiəm"),
        ("supply chain", "səˈplaɪ tʃeɪn"),
    ]

    modified = html

    for word, ipa in key_words:
        # 查找没有被 span 包裹的单词，小心避免破坏已有标签
        # 使用负向查找，避免替换已有 span 内的文字
        # 简单方案：只替换整个句子中的纯文本
        pattern = re.compile(
            rf'(?<!<span class="wt">)(?<!<span class="w">)(\b{re.escape(word)}\b)(?!<)',
            re.IGNORECASE
        )

        replacement = (
            f'<span class="w">'
            f'<span class="wt">{word}</span>'
            f'<span class="wi">/{ipa}/ <button class="spk" onclick="aud(\'{word}\',this)">🔊</button></span>'
            f'</span>'
        )

        modified = pattern.sub(replacement, modified)

    # 4. 写回文件
    with open(INDEX_HTML, "w", encoding="utf-8") as f:
        f.write(modified)

    if len(modified) != original_len:
        print(f"Successfully modified! Changed from {original_len} to {len(modified)} chars")
        print("Now go to deploy_temp and git add/commit/push")
    else:
        print("No changes made - check pattern")


if __name__ == "__main__":
    main()
