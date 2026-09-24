-- ============================================================
-- Seed Verisi: TYT ve AYT Branşları / Dersleri
-- ============================================================

-- TYT Dersleri
INSERT INTO subjects (name, exam_type, category, question_count, sort_order) VALUES
  ('Türkçe',           'tyt', 'sozel',    40, 1),
  ('Matematik',        'tyt', 'sayisal',  40, 2),
  ('Fen Bilimleri',    'tyt', 'sayisal',  20, 3),
  ('Sosyal Bilimler',  'tyt', 'sozel',    20, 4);

-- AYT Dersleri (Sayısal)
INSERT INTO subjects (name, exam_type, category, question_count, sort_order) VALUES
  ('Matematik (AYT)',  'ayt', 'sayisal',  40, 5),
  ('Fizik',            'ayt', 'sayisal',  14, 6),
  ('Kimya',            'ayt', 'sayisal',  13, 7),
  ('Biyoloji',         'ayt', 'sayisal',  13, 8);

-- AYT Dersleri (Sözel / Eşit Ağırlık)
INSERT INTO subjects (name, exam_type, category, question_count, sort_order) VALUES
  ('Türk Dili ve Edebiyatı', 'ayt', 'sozel',       24, 9),
  ('Tarih-1',                'ayt', 'sozel',        10, 10),
  ('Coğrafya-1',             'ayt', 'esitagirlik',  6,  11);

-- AYT Dersleri (Sosyal Bilimler-2)
INSERT INTO subjects (name, exam_type, category, question_count, sort_order) VALUES
  ('Tarih-2',      'ayt', 'sozel', 11, 12),
  ('Coğrafya-2',   'ayt', 'sozel', 11, 13),
  ('Felsefe',      'ayt', 'sozel', 12, 14),
  ('Din Kültürü',  'ayt', 'sozel', 6,  15);

-- Yabancı Dil (YDT)
INSERT INTO subjects (name, exam_type, category, question_count, sort_order) VALUES
  ('İngilizce', 'ayt', 'dil', 80, 16);
