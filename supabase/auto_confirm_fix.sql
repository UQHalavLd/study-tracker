-- ============================================================
-- E-POSTA DOĞRULAMA ENGELİNİ VE RATE LIMIT'I KALDIRMA KODU
-- Bu kodu Supabase SQL Editor'e yapıştırıp "Run" butonuna basın.
-- ============================================================

-- 1. Halihazırda kayıt olmuş ve onay bekleyen tüm kullanıcıları hemen onayla:
UPDATE auth.users 
SET email_confirmed_at = now(),
    confirmed_at = now()
WHERE email_confirmed_at IS NULL;

-- 2. Yeni kaydolacak tüm kullanıcıları otomatik olarak anında onayla (e-posta bekleme kalkar):
CREATE OR REPLACE FUNCTION public.auto_confirm_user_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.email_confirmed_at = COALESCE(NEW.email_confirmed_at, now());
  NEW.confirmed_at = COALESCE(NEW.confirmed_at, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_before_insert_confirm ON auth.users;
CREATE TRIGGER on_auth_user_before_insert_confirm
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user_email();
