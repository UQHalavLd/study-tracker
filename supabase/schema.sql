-- ============================================================
-- Akıllı Ders Çalışma ve İlerleme Takip Platformu
-- Supabase PostgreSQL Veritabanı Şeması
-- ============================================================

-- ============================================================
-- 1. ENUM TİPLERİ
-- ============================================================

CREATE TYPE exam_type AS ENUM ('tyt', 'ayt', 'custom');
CREATE TYPE book_status AS ENUM ('active', 'completed', 'paused');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE subject_category AS ENUM ('sozel', 'sayisal', 'esitagirlik', 'dil', 'genel');

-- ============================================================
-- 2. TABLOLAR
-- ============================================================

-- -------------------------------------------------------
-- 2.1 Profiller (auth.users ile 1:1)
-- -------------------------------------------------------
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  daily_study_hours NUMERIC(3,1) DEFAULT 4.0,  -- Günlük çalışma kapasitesi (saat)
  target_exam exam_type DEFAULT 'tyt',           -- Hedef sınav türü
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Yeni kullanıcı kaydolduğunda otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', NEW.raw_user_meta_data ->> 'picture', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------
-- 2.2 Dersler / Branşlar
-- -------------------------------------------------------
CREATE TABLE subjects (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  exam_type   exam_type NOT NULL DEFAULT 'tyt',
  category    subject_category NOT NULL DEFAULT 'genel',
  question_count INTEGER DEFAULT 40,  -- Sınavdaki soru sayısı
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- -------------------------------------------------------
-- 2.3 Kitaplar / Kaynaklar
-- -------------------------------------------------------
CREATE TABLE books (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  author        TEXT,
  isbn          TEXT,
  cover_url     TEXT,
  total_pages   INTEGER NOT NULL DEFAULT 0,
  current_page  INTEGER NOT NULL DEFAULT 0,
  subject_id    UUID REFERENCES subjects(id) ON DELETE SET NULL,
  target_date   DATE,
  status        book_status DEFAULT 'active' NOT NULL,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT current_page_check CHECK (current_page >= 0 AND current_page <= total_pages),
  CONSTRAINT total_pages_check CHECK (total_pages >= 0)
);

CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);

-- -------------------------------------------------------
-- 2.4 Deneme Sınavları (üst kayıt)
-- -------------------------------------------------------
CREATE TABLE mock_exams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  exam_type   exam_type NOT NULL DEFAULT 'tyt',
  exam_name   TEXT NOT NULL,          -- "3D TYT Deneme 5"
  exam_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  total_net   NUMERIC(6,2),           -- Toplam net
  total_score NUMERIC(6,2),           -- Toplam puan
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_mock_exams_user_id ON mock_exams(user_id);
CREATE INDEX idx_mock_exams_date ON mock_exams(exam_date);

-- -------------------------------------------------------
-- 2.5 Deneme Sınav Sonuçları (ders bazında)
-- -------------------------------------------------------
CREATE TABLE mock_exam_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mock_exam_id  UUID NOT NULL REFERENCES mock_exams(id) ON DELETE CASCADE,
  subject_id    UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  correct_count INTEGER NOT NULL DEFAULT 0,
  wrong_count   INTEGER NOT NULL DEFAULT 0,
  empty_count   INTEGER NOT NULL DEFAULT 0,
  net           NUMERIC(6,2) GENERATED ALWAYS AS (correct_count - (wrong_count::NUMERIC / 4.0)) STORED,
  score         NUMERIC(6,2),         -- Ders puanı (opsiyonel)
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT correct_count_check CHECK (correct_count >= 0),
  CONSTRAINT wrong_count_check CHECK (wrong_count >= 0),
  CONSTRAINT empty_count_check CHECK (empty_count >= 0)
);

CREATE INDEX idx_mock_exam_scores_exam_id ON mock_exam_scores(mock_exam_id);

-- -------------------------------------------------------
-- 2.6 Çalışma Planları (AI tarafından oluşturulan)
-- -------------------------------------------------------
CREATE TABLE study_plans (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      plan_status DEFAULT 'draft' NOT NULL,
  ai_prompt   TEXT,                   -- AI'a gönderilen prompt
  ai_response TEXT,                   -- AI'dan gelen ham yanıt
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now() NOT NULL,

  CONSTRAINT date_range_check CHECK (end_date >= start_date)
);

CREATE INDEX idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX idx_study_plans_status ON study_plans(status);

-- -------------------------------------------------------
-- 2.7 Çalışma Görevleri (plan altındaki günlük görevler)
-- -------------------------------------------------------
CREATE TABLE study_tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id          UUID NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id          UUID REFERENCES books(id) ON DELETE SET NULL,
  subject_id       UUID REFERENCES subjects(id) ON DELETE SET NULL,
  title            TEXT NOT NULL,
  description      TEXT,
  task_date        DATE NOT NULL,
  start_time       TIME,
  duration_minutes INTEGER DEFAULT 60,
  page_start       INTEGER,
  page_end         INTEGER,
  is_completed     BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at     TIMESTAMPTZ,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_study_tasks_plan_id ON study_tasks(plan_id);
CREATE INDEX idx_study_tasks_user_id ON study_tasks(user_id);
CREATE INDEX idx_study_tasks_date ON study_tasks(task_date);

-- -------------------------------------------------------
-- 2.8 Zayıf Konular (AI analizi sonucu)
-- -------------------------------------------------------
CREATE TABLE weak_topics (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject_id  UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  topic_name  TEXT NOT NULL,
  severity    severity_level DEFAULT 'medium' NOT NULL,
  detected_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  resolved    BOOLEAN DEFAULT FALSE NOT NULL,
  notes       TEXT,

  CONSTRAINT unique_user_topic UNIQUE (user_id, subject_id, topic_name)
);

CREATE INDEX idx_weak_topics_user_id ON weak_topics(user_id);

-- ============================================================
-- 3. updated_at OTOMATİK GÜNCELLEME TRİGGER'I
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Her tabloya updated_at trigger'ı ekle
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mock_exams_updated_at
  BEFORE UPDATE ON mock_exams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_plans_updated_at
  BEFORE UPDATE ON study_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_study_tasks_updated_at
  BEFORE UPDATE ON study_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================

-- Tüm tablolarda RLS'yi aktifleştir
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weak_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- 4.1 Profiles RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi profilini görebilir"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- -------------------------------------------------------
-- 4.2 Subjects RLS (herkes okuyabilir, kimse değiştiremez)
-- -------------------------------------------------------
CREATE POLICY "Herkes dersleri görebilir"
  ON subjects FOR SELECT
  USING (true);

-- -------------------------------------------------------
-- 4.3 Books RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi kitaplarını görebilir"
  ON books FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kitap ekleyebilir"
  ON books FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi kitaplarını güncelleyebilir"
  ON books FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi kitaplarını silebilir"
  ON books FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4.4 Mock Exams RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi denemelerini görebilir"
  ON mock_exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı deneme ekleyebilir"
  ON mock_exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi denemelerini güncelleyebilir"
  ON mock_exams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi denemelerini silebilir"
  ON mock_exams FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4.5 Mock Exam Scores RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi deneme sonuçlarını görebilir"
  ON mock_exam_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM mock_exams
      WHERE mock_exams.id = mock_exam_scores.mock_exam_id
        AND mock_exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Kullanıcı deneme sonucu ekleyebilir"
  ON mock_exam_scores FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM mock_exams
      WHERE mock_exams.id = mock_exam_scores.mock_exam_id
        AND mock_exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Kullanıcı kendi deneme sonuçlarını güncelleyebilir"
  ON mock_exam_scores FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM mock_exams
      WHERE mock_exams.id = mock_exam_scores.mock_exam_id
        AND mock_exams.user_id = auth.uid()
    )
  );

CREATE POLICY "Kullanıcı kendi deneme sonuçlarını silebilir"
  ON mock_exam_scores FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM mock_exams
      WHERE mock_exams.id = mock_exam_scores.mock_exam_id
        AND mock_exams.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- 4.6 Study Plans RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi planlarını görebilir"
  ON study_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı plan oluşturabilir"
  ON study_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi planlarını güncelleyebilir"
  ON study_plans FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi planlarını silebilir"
  ON study_plans FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4.7 Study Tasks RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi görevlerini görebilir"
  ON study_tasks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı görev ekleyebilir"
  ON study_tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi görevlerini güncelleyebilir"
  ON study_tasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi görevlerini silebilir"
  ON study_tasks FOR DELETE
  USING (auth.uid() = user_id);

-- -------------------------------------------------------
-- 4.8 Weak Topics RLS
-- -------------------------------------------------------
CREATE POLICY "Kullanıcı kendi zayıf konularını görebilir"
  ON weak_topics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcı zayıf konu ekleyebilir"
  ON weak_topics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi zayıf konularını güncelleyebilir"
  ON weak_topics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcı kendi zayıf konularını silebilir"
  ON weak_topics FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 5. YARDIMCI VİEW'LAR
-- ============================================================

-- Kitap ilerleme özeti
CREATE OR REPLACE VIEW book_progress_summary AS
SELECT
  b.id,
  b.user_id,
  b.title,
  b.total_pages,
  b.current_page,
  CASE
    WHEN b.total_pages > 0
    THEN ROUND((b.current_page::NUMERIC / b.total_pages) * 100, 1)
    ELSE 0
  END AS progress_percent,
  b.target_date,
  CASE
    WHEN b.target_date IS NOT NULL
    THEN (b.target_date - CURRENT_DATE)
    ELSE NULL
  END AS remaining_days,
  CASE
    WHEN b.target_date IS NOT NULL AND (b.target_date - CURRENT_DATE) > 0 AND b.total_pages > b.current_page
    THEN CEIL((b.total_pages - b.current_page)::NUMERIC / (b.target_date - CURRENT_DATE))
    ELSE NULL
  END AS daily_page_target,
  b.status
FROM books b;

-- Son deneme netleri özeti
CREATE OR REPLACE VIEW latest_exam_nets AS
SELECT
  me.user_id,
  me.id AS exam_id,
  me.exam_name,
  me.exam_date,
  me.exam_type,
  s.name AS subject_name,
  mes.correct_count,
  mes.wrong_count,
  mes.empty_count,
  mes.net,
  mes.score
FROM mock_exams me
JOIN mock_exam_scores mes ON mes.mock_exam_id = me.id
JOIN subjects s ON s.id = mes.subject_id
ORDER BY me.exam_date DESC, s.sort_order ASC;
