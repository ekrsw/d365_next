-- ============================================================
-- シフト変更履歴トリガー (🔴 CRITICAL)
-- shifts テーブルへの UPDATE/DELETE 時に変更前の値を自動記録
-- ============================================================

CREATE OR REPLACE FUNCTION record_shift_change()
RETURNS TRIGGER AS $$
DECLARE
  next_version integer;
BEGIN
  SELECT COALESCE(MAX(version), 0) + 1 INTO next_version
  FROM shift_change_history WHERE shift_id = OLD.id;

  INSERT INTO shift_change_history (
    shift_id, employee_id, shift_date, shift_code,
    start_time, end_time, is_holiday, is_paid_leave, is_remote,
    change_type, version, changed_at
  ) VALUES (
    OLD.id, OLD.employee_id, OLD.shift_date, OLD.shift_code,
    OLD.start_time, OLD.end_time, OLD.is_holiday, OLD.is_paid_leave, OLD.is_remote,
    TG_OP, next_version, CURRENT_TIMESTAMP
  );

  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_shift_change_history
BEFORE UPDATE OR DELETE ON shifts
FOR EACH ROW EXECUTE FUNCTION record_shift_change();

-- ============================================================
-- 部分ユニークインデックス (🔴 CRITICAL)
-- ============================================================

-- employee_function_roles: 同一役割の現行レコード重複防止
CREATE UNIQUE INDEX idx_efr_active_role
  ON employee_function_roles (employee_id, function_role_id)
  WHERE end_date IS NULL;

-- employee_function_roles: 同一カテゴリの現行レコード重複防止
CREATE UNIQUE INDEX idx_efr_active_role_type
  ON employee_function_roles (employee_id, role_type)
  WHERE end_date IS NULL;

-- employee_name_history: 現行氏名は1件のみ
CREATE UNIQUE INDEX idx_enh_current
  ON employee_name_history (employee_id)
  WHERE is_current = true;

-- ============================================================
-- EXCLUDE 制約: 氏名履歴の有効期間重複防止 (🟡 IMPORTANT)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE employee_name_history
  ADD CONSTRAINT excl_enh_date_overlap
  EXCLUDE USING GiST (
    employee_id WITH =,
    daterange(valid_from, valid_to, '[]') WITH &&
  );
