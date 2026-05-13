---
name: detect-recurring-feedback
description: |
  ユーザーから繰り返し指摘されるレビュー内容・修正内容・設計ルールを検出し、
  Claude Code Skill 化または既存 Skill 強化を提案するための Skill。

  以下のような場合に使用する：
  - 同じレビュー指摘が何度も発生している
  - 毎回同じ修正をしている
  - チーム独自ルールが定着してきた
  - Claude が毎回同じミスをする
  - recurring pattern を Skill に昇格したい
  - Claude のレビュー精度を継続改善したい

  主なトリガーワード：
  - 「毎回同じ指摘してる」
  - 「 recurring feedback を検出して」
  - 「よくある指摘を分析」
  - 「Skill 化した方がいいルールある？」
  - 「繰り返しミスを抽出」
  - 「レビュー傾向を分析」
  - 「Claude が何度も同じミスをする」

  使用シーン：
  - レビュー品質改善
  - Skill 自動進化
  - チームルール抽出
  - Claude Code 運用改善
  - recurring pattern 分析
version: 1.0.0
---

# Detect Recurring Feedback

## Overview

ユーザーから繰り返し発生している：

- レビュー指摘
- 修正依頼
- コーディングルール
- 設計ルール
- 命名規則
- アンチパターン

を分析し、

- 新規 Skill 作成
- 既存 Skill 強化
- examples 追加
- rules 分離

を提案する。

この Skill は、
Claude Code 環境を継続的に改善することを目的とする。

---

## Detection Targets

以下を recurring pattern として検出対象にする。

- 同じレビュー指摘
- 同じ修正依頼
- 同じ設計方針
- 同じ命名指摘
- 同じ lint 修正
- 同じ architecture 指摘
- 同じ anti-pattern

---

## Instructions

### 1. フィードバック履歴を分析する

以下を確認する：

- 同一指摘の頻度
- 類似指摘の頻度
- 修正パターン
- recurring anti-pattern
- recurring design rule

頻度が高いものを抽出する。

---

### 2. recurring pattern を分類する

検出した内容を分類する。

例：

| 分類 | 例 |
|---|---|
| React Hooks | useEffect dependency |
| Architecture | 責務分離 |
| Naming | boolean命名 |
| Testing | テスト不足 |
| Performance | 不要render |
| Security | null check不足 |

---

### 3. Skill の存在を確認する

対象ルールに対応する Skill が：

- 存在しない
- 既に存在する

を確認する。

---

### 4. Skill が存在しない場合

新規 Skill 作成を提案する。

例：

```txt id="shk8d2"
react-hooks-review
naming-review
null-safety-review