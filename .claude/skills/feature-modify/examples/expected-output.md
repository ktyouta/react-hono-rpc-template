# Expected Output — Feature Modify

---

## ケース1: バックエンド・フロントエンド両方を変更するケース

### 状況
- タスクのデフォルト優先度を「medium」から「low」に変更する

### Step 4 出力（差分設計・ユーザー確認）

```
## 差分設計

### 変更内容
- [変更前]: タスク作成時のデフォルト優先度 = "medium"
- [変更後]: タスク作成時のデフォルト優先度 = "low"

### バックエンド変更点
- エンドポイント: 変更なし
- Service メソッド: createTask() 内の定数 `DEFAULT_PRIORITY` を "medium" → "low" に変更
- Repository メソッド: 変更なし

### フロントエンド変更点
- コンポーネント: 変更なし（表示上の変化はない）
- hooks: 変更なし

### 変更・影響ファイル一覧

| ファイルパス | レイヤー | 操作 |
|---|---|---|
| backend/src/api/task/service/create-task.service.ts | Service | 変更 |

### フォルダ構成チェック（CLAUDE.md 準拠）
- エンドポイント単位のファイル分割になっているか ✓
- repository に .interface.ts がセットで存在するか ✓

問題がなければ実装に進みます。よろしいですか？
```

### Step 7 出力（バックエンド変更完了）

```
## バックエンド変更完了

### 変更ファイル
- backend/src/api/task/service/create-task.service.ts: `DEFAULT_PRIORITY` を "medium" → "low" に変更

### 実装内容サマリー
- デフォルト優先度定数の値を変更（振る舞いは仕様変更の範囲）

### backend-review 結果
- 問題なし

確認できたら実装を続けます。よろしいですか？
```

---

## ケース2: UI 変更を含む改修（ui-consistency-review が先行）

### 状況
- タスクカードのデザインを変更する

### Step 0 出力（ui-consistency-review 先行実行）

```
## UI Consistency Review

### 現状の評価

#### カラーパレット
- 使用色: `bg-gray-50`, `border-gray-200`, `text-stone-700`
- 気になる点: 問題なし

...（省略）

### 修正提案
- なし

→ 上記を踏まえた上で変更を進めます。
```

その後、Step 1 の「改修内容の把握」へ進む。
