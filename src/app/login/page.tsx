'use client';

import { useState } from 'react';
import { BookOpen, AlertTriangle, CheckCircle, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendSuccess(false);
    setUnconfirmedEmail(null);
    setRateLimitExceeded(false);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const errorLower = signInError.message.toLowerCase();
        if (errorLower.includes('email not confirmed')) {
          setUnconfirmedEmail(email);
          setError('E-posta adresiniz henüz onaylanmamış.');
        } else if (errorLower.includes('rate limit') || errorLower.includes('rate_limit')) {
          setRateLimitExceeded(true);
          setError('E-posta gönderim limiti aşıldı (Supabase Rate Limit).');
        } else if (errorLower.includes('invalid login credentials')) {
          setError('E-posta adresi veya şifre hatalı.');
        } else {
          setError(signInError.message);
        }
        setLoading(false);
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu.';
      setError(msg);
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unconfirmedEmail) return;
    setResending(true);
    setResendSuccess(false);
    setRateLimitExceeded(false);

    try {
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });

      if (resendError) {
        if (resendError.message.toLowerCase().includes('rate limit')) {
          setRateLimitExceeded(true);
          setError('E-posta gönderim limiti aşıldı.');
        } else {
          setError('Doğrulama e-postası gönderilemedi: ' + resendError.message);
        }
      } else {
        setResendSuccess(true);
      }
    } catch {
      setError('E-posta gönderilirken bir hata oluştu.');
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
          Hesabınıza Giriş Yapın
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Çalışma programınıza ve hedeflerinize erişin
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <p>{error}</p>
                {unconfirmedEmail && !rateLimitExceeded && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resending}
                      className="inline-flex items-center gap-1.5 font-bold underline hover:no-underline text-xs disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{resending ? 'Gönderiliyor...' : 'Doğrulama Bağlantısını Yeniden Gönder'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rate Limit Aşıldığında Rehber Kutusu */}
          {rateLimitExceeded && (
            <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 rounded-xl text-xs leading-relaxed">
              <strong className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300 mb-1">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>E-posta Limiti Uyarısı ve Hızlı Çözüm</span>
              </strong>
              <p>
                Supabase varsayılan posta sunucusunun saatlik gönderim limiti doldu. Doğrulama maili beklemeden doğrudan girmek için:
              </p>
              <p className="mt-1 font-mono text-[11px] bg-amber-100/70 dark:bg-amber-900/50 p-2 rounded">
                Supabase Dashboard &gt; Authentication &gt; Providers &gt; Email &gt; &quot;Confirm email&quot; ayarını KAPATIN.
              </p>
            </div>
          )}

          {resendSuccess && (
            <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Doğrulama e-postası gelen kutunuza yeniden gönderildi.</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Şifre
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Şifremi Unuttum
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01]"
            >
              {loading ? 'Giriş Yapılıyor...' : 'Güvenli Giriş Yap'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Henüz hesabınız yok mu?{' '}
            <Link
              href="/register"
              className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors"
            >
              Kayıt ol
            </Link>
          </p>

          {/* 1has İmzası */}
          <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-center">
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Bu sistem <strong className="text-blue-600 dark:text-blue-400 font-bold">1has</strong> tarafından geliştirilmiştir.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
