'use client';

import { useState } from 'react';
import { BookOpen, AlertTriangle, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    setError(null);
    setNeedsVerification(false);
    setResendSuccess(false);
    setRateLimitExceeded(false);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signUpError) {
        const errLower = signUpError.message.toLowerCase();
        if (errLower.includes('rate limit') || errLower.includes('rate_limit') || errLower.includes('over_email_send_rate_limit')) {
          setRateLimitExceeded(true);
          setError('Supabase e-posta gönderim limiti aşıldı (Email Rate Limit Exceeded).');
        } else if (errLower.includes('already registered')) {
          setError('Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.');
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      // Eğer session geldiyse (e-posta doğrulaması kapalıysa) doğrudan panele gir
      if (data?.session) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      // Session yoksa hemen şifreyle giriş yapmayı dene
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.session) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      // Hala oturum yoksa e-posta onayı açıktır
      setRegisteredEmail(email);
      setNeedsVerification(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Kayıt sırasında bir hata oluştu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    setResending(true);
    setResendSuccess(false);
    setError(null);
    setRateLimitExceeded(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });

      if (resendError) {
        if (resendError.message.toLowerCase().includes('rate limit')) {
          setRateLimitExceeded(true);
          setError('E-posta gönderim sıklık limiti aşıldı.');
        } else {
          setError('Doğrulama e-postası gönderilemedi: ' + resendError.message);
        }
      } else {
        setResendSuccess(true);
      }
    } catch {
      setError('Doğrulama e-postası tekrar gönderilirken bir hata oluştu.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-2 mb-4 group">
          <div className="flex items-center justify-center bg-blue-600 w-12 h-12 rounded-xl text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <BookOpen size={28} />
          </div>
          <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            StudyTracker
          </span>
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Yeni Hesap Oluşturun
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Ders takip platformuna katılarak hemen çalışmaya başlayın
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Rate Limit Aşıldığında Rehber Kutusu */}
          {rateLimitExceeded && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs leading-relaxed">
              <strong className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Supabase E-Posta Limiti Uyarısı ve Hızlı Çözüm:</span>
              </strong>
              <p>
                Supabase ücretsiz planında saatlik sınırlı sayıda e-posta gönderimine izin verilir. Doğrulama e-postası beklemeden anında hesap açabilmek için:
              </p>
              <div className="mt-2 p-2.5 bg-amber-100/70 dark:bg-amber-900/50 rounded font-mono text-[11px]">
                1. Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email sekmesine gidin.<br />
                2. <strong>&quot;Confirm email&quot;</strong> ayarını <strong>KAPATIN (Save)</strong>.
              </div>
              <p className="mt-2 font-medium">
                Bu ayarı kapattıktan sonra herhangi bir e-posta doğrulaması olmadan herkes anında kayıt olup doğrudan panele girebilir.
              </p>
            </div>
          )}

          {/* E-posta Doğrulama Bildirim Kartı */}
          {needsVerification ? (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>E-posta Doğrulaması Gerekli</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  <strong className="font-semibold">{registeredEmail}</strong> adresine doğrulama bağlantısı gönderildi. Lütfen gelen kutunuzu (veya Spam klasörünüzü) kontrol edip onaylayın.
                </p>

                {resendSuccess && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-semibold bg-green-100/60 dark:bg-green-900/40 p-2 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Doğrulama bağlantısı tekrar gönderildi!</span>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resending || rateLimitExceeded}
                    className="w-full text-xs font-semibold py-2 px-3 bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-800/80 dark:hover:bg-amber-700 text-amber-950 dark:text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {resending ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
                  </button>

                  <Link
                    href="/login"
                    className="w-full text-center text-xs font-semibold py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Giriş Sayfasına Git</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>
              <form className="space-y-4" onSubmit={handleRegister}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Örn: Ahmet Yılmaz"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    E-posta Adresi
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Şifre (En az 6 karakter)
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
                >
                  {loading ? 'Hesap Oluşturuluyor...' : 'Hemen Kayıt Ol'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Zaten hesabınız var mı?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                >
                  Giriş yap
                </Link>
              </p>

              {/* 1has İmzası */}
              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Bu sistem <strong className="text-blue-600 dark:text-blue-400 font-bold">1has</strong> tarafından geliştirilmiştir.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
