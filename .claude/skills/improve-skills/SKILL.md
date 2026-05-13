---
name: improve-skills
description: |
  既存の Claude Code Skill を分析し、
  構造・説明・examples・再利用性・Claude理解性を改善するための Skill。

  以下のような場合に使用する：
  - Skill の精度を上げたい
  - Claude が Skill をうまく使えていない
  - Skill の description が弱い
  - trigger word を増やしたい
  - examples を追加したい
  - Skill を保守しやすくしたい
  - Skill の責務が大きすぎる

  主なトリガーワード：
  - 「Skill を改善して」
  - 「improve skill」
  - 「Skill を最適化」
  - 「Skill の精度を上げたい」
  - 「Skill をレビューして」
  - 「Skill をリファクタリング」
  - 「Skill を強化したい」

  使用シーン：
  - Skill 運用改善
  - Claude の応答精度改善
  - Skill リファクタリング
  - Few-shot 強化
  - Skill の長期保守
version: 1.0.0
---

# Improve Skill

## Overview

既存の Claude Code Skill を分析し、
Claude がより理解・再利用・実行しやすい構造へ改善する。

改善対象：

- description
- trigger word
- examples
- Instructions
- ディレクトリ構成
- 責務分離
- 再利用性
- Claude の判断しやすさ

を最適化する。

---

## Instructions

### 1. Skill 全体を分析する

以下を確認する：

- Skill の責務
- Skill の目的
- Claude が迷いやすい箇所
- 再利用性
- 構造の複雑さ
- examples の有無
- trigger word の不足

---

### 2. frontmatter を改善する

description を強化する。

必ず以下を含める：

- Skill の目的
- 使用シーン
- trigger word
- 実行タイミング

Bad:

```yaml id="o8e8cv"
description: React review