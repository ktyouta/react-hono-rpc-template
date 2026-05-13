---
name: frontend-review
description: |
  フロントエンドのコード変更が完了した直後に、コンポーネント設計の観点でチェックを行う。

  以下のような場合に使用する：
  - フロントエンドのコンポーネント・ページ・hooks を新規作成・修正したとき

  以下の場合は使用しない：
  - バックエンドのみの変更
  - 調査・説明・設計相談のみの場合
version: 1.0.0
---

# Frontend Review Skill

## Overview

フロントエンド実装後に、コンポーネント設計の違反パターンをチェックする。

---

## Check Instructions

### Presentational コンポーネントの純粋性
- `useState` / `useReducer` などの state 管理が含まれていないか
- `onClick` などのイベントハンドラが直接定義されていないか（props 経由の受け取りは可）
- データフェッチ・副作用（`useEffect`）が含まれていないか

---

## Procedure

1. 変更されたフロントエンドファイルを確認する
2. Presentational / Container の分類を判断する
3. Presentational として実装されたコンポーネントに違反がないか照合する
4. 以下の形式で報告する

---

## Output Format

違反がある場合：

```
## Frontend Review 結果

### 違反あり
- **ファイル**: [ファイルパス:行番号]
- **違反内容**: 具体的な問題
- **修正方針**: 修正の方向性
```

違反がない場合：

```
## Frontend Review 結果

チェック完了。問題なし。
```
