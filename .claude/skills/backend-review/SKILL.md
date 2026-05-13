---
name: backend-review
description: |
  バックエンドのコード変更が完了した直後に、レイヤー設計・単一責務の観点でチェックを行う。

  以下のような場合に使用する：
  - バックエンドの Controller / Service / Repository を新規作成・修正したとき

  以下の場合は使用しない：
  - フロントエンドのみの変更
  - 調査・説明・設計相談のみの場合
version: 1.0.0
---

# Backend Review Skill

## Overview

バックエンド実装後に、レイヤー設計・単一責務の違反パターンをチェックする。

---

## Check Instructions

### Controller 単一責務
- Controller 内にビジネスロジック・データ変換処理が直書きされていないか
- Controller は Service を呼ぶだけになっているか

### Repository 単一操作
- Repository の1メソッドが複数のDB操作を行っていないか（1メソッド1操作）

---

## Procedure

1. 変更されたバックエンドファイルを確認する
2. Controller / Service / Repository のレイヤーを特定する
3. 各チェック項目を照合する
4. 以下の形式で報告する

---

## Output Format

違反がある場合：

```
## Backend Review 結果

### 違反あり
- **ファイル**: [ファイルパス:行番号]
- **違反内容**: 具体的な問題
- **修正方針**: 修正の方向性
```

違反がない場合：

```
## Backend Review 結果

チェック完了。問題なし。
```
