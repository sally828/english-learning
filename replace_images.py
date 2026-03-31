#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 index.html 里的 img1~img30 全部替换成威高官网对应产品图
"""
import os, json, time, urllib.request, urllib.parse, sys
sys.stdout.reconfigure(encoding='utf-8')

BASE = "https://www.weigaoholding.com"
IMG_DIR = "C:/Users/Sally/Desktop/company-learning-system/images"

def post_json(path, data):
    url = BASE + path
    enc = urllib.parse.urlencode(data).encode('utf-8')
    req = urllib.request.Request(url, data=enc, method='POST')
    req.add_header('User-Agent', 'Mozilla/5.0')
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read().decode('utf-8'))

def download(img_path, save_as):
    """下载图片，保存为指定文件名（含扩展名）"""
    url = BASE + img_path if img_path.startswith('/') else img_path
    out = os.path.join(IMG_DIR, save_as)
    req = urllib.request.Request(url)
    req.add_header('User-Agent', 'Mozilla/5.0')
    req.add_header('Referer', BASE)
    with urllib.request.urlopen(req, timeout=15) as r:
        with open(out, 'wb') as f:
            f.write(r.read())
    return True

def get_products(cate3_id):
    data = post_json('/index/getpro.html', {'pid': str(cate3_id)})
    return data.get('allpro', [])

# 映射表：imgN -> (cate3_id, product_index, 说明)
# product_index = 0 表示取第一个有图的产品
MAPPING = [
    # img1: 脊柱内固定系统 → 骨科/脊柱
    (1,  43, 0,  '脊柱内固定系统'),
    # img2: 人工关节（膝/髋）→ 骨科/关节 第1个（全膝关节系统）
    (2,  44, 0,  '人工关节-全膝关节系统'),
    # img3: 单髁膝关节系统 → 骨科/关节 第2个
    (3,  44, 1,  '单髁膝关节系统'),
    # img4: 股骨柄家族（髋关节）→ 骨科/关节 第3个
    (4,  44, 2,  '股骨柄家族'),
    # img5: 创伤内固定产品系列 → 骨科/创伤
    (5,  45, 0,  '创伤内固定'),
    # img6: 骨修复材料（磷酸钙人工骨）→ 骨科/骨修复材料
    (6,  48, 0,  '骨修复材料'),
    # img7: 骨科器械（脊柱微创管道）→ 骨科/骨科器械
    (7,  47, 0,  '骨科器械'),
    # img8: 自固化磷酸人工骨 → 骨科/骨修复材料 第2个
    (8,  48, 1,  '自固化磷酸人工骨'),
    # img9: 骨科器械（手术工具）→ 骨科/骨科器械 第2个
    (9,  47, 1,  '骨科器械手术工具'),
    # img10: 血液透析器（人工肾）→ 血液净化/血液透析耗材
    (10, 63, 0,  '血液透析器'),
    # img11: 血液透析浓缩液 → 血液净化/血液透析制剂耗材
    (11, 126, 0, '血液透析浓缩液'),
    # img12: 血液透析粉 → 血液净化/血液透析制剂耗材 第2个
    (12, 126, 1, '血液透析粉'),
    # img13: 腹膜透析用外接软管 → 血液净化/腹膜透析其他耗材
    (13, 67, 0,  '腹膜透析其他耗材'),
    # img14: 血液透析设备管路洗消 → 血液净化/设备管路洗消
    (14, 125, 0, '血液透析洗消'),
    # img15: 中心静脉导管辅助套件 → 通用耗材/临床护理耗材
    (15, 23, 0,  '中心静脉导管辅助套件'),
    # img16: 一次性心电电极 → 通用耗材/临床护理耗材
    (16, 23, 1,  '心电电极'),
    # img17: 一次性笔式注射针 → 通用耗材/输注耗材
    (17, 28, 1,  '笔式注射针'),
    # img18: 有创血压传感器 → 通用耗材/重症耗材
    (18, 41, 0,  '有创血压传感器'),
    # img19: 中心静脉导管包 → 通用耗材/临床护理耗材
    (19, 23, 2,  '中心静脉导管包'),
    # img20: 医用防护服/口罩 → 通用耗材/感染防护耗材
    (20, 21, 0,  '感染防护耗材'),
    # img21: 输注耗材全产品线 → 通用耗材/输注耗材 第5个（精密过滤输液器）
    (21, 28, 4,  '精密过滤输液器'),
    # img22: 静脉留置针 → 通用耗材/留置针
    (22, 24, 0,  '静脉留置针'),
    # img23: 麻醉呼吸耗材 → 通用耗材/麻醉呼吸耗材
    (23, 22, 0,  '麻醉呼吸耗材'),
    # img24: 手术室耗材包 → 通用耗材/手术室耗材（包）
    (24, 40, 0,  '手术室耗材包'),
    # img25: 预灌封给药系统 → 药包材/预灌封给药系统
    (25, 70, 0,  '预灌封给药系统'),
    # img26: 预灌封给药系统全产品线 → 药包材/预灌封给药系统 第2个
    (26, 70, 1,  '预灌封给药系统全系列'),
    # img27: 自动给药系统 → 药包材/自动给药系统
    (27, 72, 0,  '自动给药系统'),
    # img28: 三层共挤输液膜 → 药包材/医药包装耗材
    (28, 71, 0,  '医药包装耗材'),
    # img29: 医疗信息化解决方案 → 医疗信息化/智慧就医解决方案
    (29, 136, 0, '医疗信息化'),
    # img30: 血糖仪及血糖试纸 → 内分泌/内分泌耗材
    (30, 52, 0,  '血糖仪'),
]

ok_count, fail_count = 0, 0
cache = {}  # cate3_id -> products list

for img_n, cate3_id, prod_idx, label in MAPPING:
    save_as = f'img{img_n}.png'
    print(f'[img{img_n:02d}] {label}', end=' ... ')

    try:
        if cate3_id not in cache:
            cache[cate3_id] = get_products(cate3_id)
            time.sleep(0.3)

        products = cache[cate3_id]

        # 找第 prod_idx 个有图片的产品
        with_img = [p for p in products if p.get('image')]
        if prod_idx >= len(with_img):
            prod_idx = len(with_img) - 1  # 取最后一个

        if not with_img:
            print('(无图片，跳过)')
            fail_count += 1
            continue

        prod = with_img[prod_idx]
        img_path = prod['image']
        download(img_path, save_as)
        print(f'OK ({prod["title"][:25]})')
        ok_count += 1
        time.sleep(0.15)

    except Exception as e:
        print(f'ERROR: {e}')
        fail_count += 1

print(f'\n完成: {ok_count}/{ok_count+fail_count}')
