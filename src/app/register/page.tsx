'use client';

import { useState } from 'react';
import { BookOpen, CheckCircle, Mail, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

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
        if (signUpError.message.includes('already registered')) {
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

      // Session yoksa bir de doğrudan giriş yapmayı dene
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData?.session) {
        router.push('/dashboard');
        router.refresh();
        return;
      }

      // Hala giriş yapılamadıysa Supabase'de e-posta onayı (Confirm Email) açıktır
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

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: registeredEmail,
      });

      if (resendError) {
        setError('Doğrulama e-postası gönderilemedi: ' + resendError.message);
      } else {
        setResendSuccess(true);
      }
    } catch {
      setError('Doğrulama e-postası tekrar gönderilirken bir hata oluştu.');
    } finally {
      setResending(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setGoogleLoading(false);
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

          {/* E-posta Doğrulama Bildirim Kartı */}
          {needsVerification ? (
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-5 rounded-2xl text-amber-900 dark:text-amber-200">
                <div className="flex items-center gap-2 font-bold text-base mb-1">
                  <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <span>E-posta Doğrulaması Gerekli</span>
                </div>
                <p className="text-xs leading-relaxed text-amber-800/90 dark:text-amber-300/90">
                  <strong className="font-semibold">{registeredEmail}</strong> adresine bir doğrulama bağlantısı gönderildi. Lütfen gelen kutunuzu (veya Spam klasörünüzü) kontrol edip onaylayın.
                </p>

                {resendSuccess && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-semibold bg-green-100/60 dark:bg-green-900/40 p-2 rounded-lg">
                    <CheckCircle className="w-4 h-4" />
                    <span>Doğrulama bağlantısı tekrar gönderildi!</span>
                  </div>
                )}

                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="w-full text-xs font-semibold py-2 px-3 bg-amber-200/80 hover:bg-amber-300 dark:bg-amber-800/80 dark:hover:bg-amber-700 text-amber-950 dark:text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {resending ? 'Gönderiliyor...' : 'Doğrulama E-postasını Tekrar Gönder'}
                  </button>

                  <Link
                    href="/login"
                    className="w-full text-center text-xs font-semibold py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Doğruladıktan Sonra Giriş Yap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Bilgilendirme Notu */}
              <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/40 p-3.5 rounded-xl border border-gray-200/60 dark:border-gray-700 leading-normal">
                💡 <strong>Doğrulamayı atlamak mı istiyorsunuz?</strong><br />
                Supabase Dashboard &gt; <em>Authentication</em> &gt; <em>Providers</em> &gt; <em>Email</em> sekmesinde <strong>&quot;Confirm email&quot;</strong> anahtarını kapatırsanız e-posta doğrulaması olmadan herkes anında kayıt olup girebilir.
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

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-gray-800 px-3 text-gray-500 dark:text-gray-400">
                      Veya Google ile devam et
                    </span>
                  </div>
                </div>

                <div className="mt-5">
                  <button
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className="w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    {googleLoading ? 'Bağlanıyor...' : 'Google ile Kayıt Ol'}
                  </button>
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Zaten hesabınız var mı?{' '}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
                >
                  Giriş yap
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
