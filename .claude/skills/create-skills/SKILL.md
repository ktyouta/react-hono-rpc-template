---
name: create-skills
description: |
  Claude Code Skills を正しい形式・構成で生成するためのスキル。

  以下のような場合に使用する：
  - 新しい Claude Code Skill を作成したい
  - Skill のフォーマットを統一したい
  - Skill 構成をベストプラクティスに沿わせたい
  - examples / templates / docs を含む再利用可能な Skill を作りたい

  主なトリガーワード：
  - 「Skill を作って」
  - 「create skill」
  - 「Claude Code Skill 作成」
  - 「レビュー用 Skill を作りたい」
  - 「コミットメッセージ生成 Skill を作りたい」
  - 「Skill の雛形を作成」
  - 「新しい Skill を追加」

  使用シーン：
  - Claude Code 開発環境の整備
  - チーム用 Skill 作成
  - 個人開発用 Skill 作成
  - Skill テンプレート生成
version: 1.0.0
---

# Create Skill

## Overview

Claude Code 用の Skill を、
最新の推奨構成・統一フォーマットで生成する。

このスキルは：

- Skill フォーマット統一
- 不正構成防止
- Claude が理解しやすい構造化
- 再利用可能な Skill 設計
- examples を活用した Few-shot 最適化

を目的とする。

---

## Required Directory Structure

必ず以下の構成を基本とする。

```txt
.claude/
└── skills/
    └── <skill-name>/                   # Skillごとの専用ディレクトリ
        │                               # 1 Skill = 1 フォルダで管理する
        │
        ├── SKILL.md                    # Skill本体（必須）
        │                               # Claudeへの指示書
        │                               # Purpose / Instructions / Examples を定義
        │
        ├── templates/                  # テンプレート置き場（任意）
        │                               # README・Issue・PRテンプレなど
        │
        ├── examples/                   # Few-shot用の出力例（重要）
        │                               # 良い例・悪い例・期待出力を置く
        │
        └── scripts/                    # 補助スクリプト置き場（任意）
                                        # shell/python/node等の自動処理