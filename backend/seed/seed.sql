-- =============================================
-- Seed Data
-- テーブルはマイグレーション済みであることが前提
-- 実行: npm run db:seed:local
-- =============================================

-- シーケンスマスタ（ID採番用）
INSERT OR IGNORE INTO seq_master (key, next_id, created_at, updated_at) VALUES
  ('front_user_id', 1, datetime('now'), datetime('now'));

-- サンプルデータ
INSERT INTO sample (name, description, delete_flg, created_at, updated_at) VALUES
  ('サンプル1', 'これはサンプルデータ1です。', '0', datetime('now'), datetime('now')),
  ('サンプル2', 'これはサンプルデータ2です。', '0', datetime('now'), datetime('now')),
  ('サンプル3', 'これはサンプルデータ3です。', '0', datetime('now'), datetime('now'));
