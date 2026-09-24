'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const supabase = createClient();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    full_name: '',
    target_exam: 'YKS',
    daily_study_hours: 4
  });
  const [email, setEmail] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email || '');

      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (p) {
        setProfile({
          full_name: p.full_name || '',
          target_exam: p.target_exam || 'YKS',
          daily_study_hours: p.daily_study_hours || 4
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name,
        target_exam: profile.target_exam,
        daily_study_hours: profile.daily_study_hours
      }).eq('id', user.id);

      if (error) throw error;
      alert('Profil güncellendi!');
    } catch (error) {
      alert('Güncelleme başarısız.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      alert('Şifre sıfırlama e-postası gönderildi!');
    } catch (error) {
      alert('Hata oluştu.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (loading) return <div className="p-6">Yükleniyor...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-12">
      <h1 className="text-2xl font-bold dark:text-white">Ayarlar</h1>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Profil</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Kişisel bilgilerinizi ve çalışma hedeflerinizi güncelleyin.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-xl font-bold">
              {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">E-posta Adresi</label>
            <input type="email" value={email} readOnly className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 dark:text-gray-300">Ad Soyad</label>
            <input 
              type="text" 
              value={profile.full_name} 
              onChange={e => setProfile({...profile, full_name: e.target.value})} 
              className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Hedef Sınav</label>
              <select 
                value={profile.target_exam} 
                onChange={e => setProfile({...profile, target_exam: e.target.value})}
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="TYT">TYT</option>
                <option value="AYT">AYT</option>
                <option value="YKS">YKS (TYT+AYT)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Günlük Çalışma (Saat)</label>
              <input 
                type="number" 
                step="0.5" 
                min="0.5"
                max="24"
                value={profile.daily_study_hours} 
                onChange={e => setProfile({...profile, daily_study_hours: parseFloat(e.target.value)})} 
                className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" 
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              onClick={handleUpdateProfile}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {saving ? 'Güncelleniyor...' : 'Profili Güncelle'}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Görünüm</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Uygulama temasını özelleştirin.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700">
          <div className="flex gap-4">
            {['light', 'dark', 'system'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex-1 py-3 border rounded-lg font-medium transition-colors ${theme === t ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' : 'dark:border-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
              >
                {t === 'light' ? 'Açık' : t === 'dark' ? 'Koyu' : 'Sistem'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">Hesap</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Hesap güvenliği ve oturum yönetimi.</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border dark:border-gray-700 space-y-4">
          <button 
            onClick={handlePasswordReset}
            className="w-full text-left py-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Şifre Değiştir
          </button>
          <hr className="dark:border-gray-700" />
          <button 
            onClick={handleSignOut}
            className="w-full text-left py-2 text-red-600 dark:text-red-400 font-medium hover:underline"
          >
            Çıkış Yap
          </button>
        </div>
      </section>
    </div>
  );
}
