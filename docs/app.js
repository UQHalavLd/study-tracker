/**
 * StudyTracker — Akıllı Ders Çalışma ve İlerleme Takip Platformu
 * Geliştirici: 1has
 * GitHub Pages Ready • Multi-Agent Study Assistant Engine (A-R007)
 */

// ================= 1. POPÜLER YKS KİTAP KATALOĞU (KİTAPİŞLER ENTEGRELİ) =================
const POPULAR_YKS_BOOKS = [
  {
    title: "345 TYT Matematik Soru Bankası",
    author: "ÜçDörtBeş Yayınları",
    subject: "Matematik",
    totalPages: 440,
    cover: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80"
  },
  {
    title: "345 AYT Matematik Soru Bankası",
    author: "ÜçDörtBeş Yayınları",
    subject: "Matematik",
    totalPages: 416,
    cover: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&q=80"
  },
  {
    title: "345 TYT Türkçe Soru Bankası",
    author: "ÜçDörtBeş Yayınları",
    subject: "Türkçe",
    totalPages: 384,
    cover: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=300&q=80"
  },
  {
    title: "345 TYT Fen Bilimleri Soru Bankası",
    author: "ÜçDörtBeş Yayınları",
    subject: "Fizik",
    totalPages: 360,
    cover: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=300&q=80"
  },
  {
    title: "3D TYT Matematik Soru Bankası",
    author: "3D Yayınları",
    subject: "Matematik",
    totalPages: 400,
    cover: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&q=80"
  },
  {
    title: "3D AYT Matematik Soru Bankası",
    author: "3D Yayınları",
    subject: "Matematik",
    totalPages: 432,
    cover: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300&q=80"
  },
  {
    title: "3D TYT Fizik Soru Bankası",
    author: "3D Yayınları",
    subject: "Fizik",
    totalPages: 288,
    cover: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=300&q=80"
  },
  {
    title: "Bilgi Sarmal TYT Matematik Soru Bankası",
    author: "Bilgi Sarmal Yayınları",
    subject: "Matematik",
    totalPages: 384,
    cover: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&q=80"
  },
  {
    title: "Bilgi Sarmal TYT Paragraf Soru Bankası",
    author: "Bilgi Sarmal Yayınları",
    subject: "Paragraf",
    totalPages: 320,
    cover: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=300&q=80"
  },
  {
    title: "Bilgi Sarmal TYT Türkçe Soru Bankası",
    author: "Bilgi Sarmal Yayınları",
    subject: "Türkçe",
    totalPages: 368,
    cover: "https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=300&q=80"
  },
  {
    title: "Orijinal TYT Matematik Soru Bankası",
    author: "Orijinal Yayınları",
    subject: "Matematik",
    totalPages: 416,
    cover: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&q=80"
  },
  {
    title: "Orijinal Geometri TYT-AYT Soru Bankası",
    author: "Orijinal Yayınları",
    subject: "Geometri",
    totalPages: 384,
    cover: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=300&q=80"
  },
  {
    title: "Apotemi Türev Fasikülü",
    author: "Apotemi Yayınları",
    subject: "Matematik",
    totalPages: 208,
    cover: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&q=80"
  },
  {
    title: "Apotemi Trigonometri Fasikülü",
    author: "Apotemi Yayınları",
    subject: "Matematik",
    totalPages: 192,
    cover: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=300&q=80"
  },
  {
    title: "Limit Türk Dili ve Edebiyatı El Kitabı",
    author: "Limit Yayınları",
    subject: "Edebiyat",
    totalPages: 350,
    cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=300&q=80"
  },
  {
    title: "Hız ve Renk TYT Matematik Soru Bankası",
    author: "Hız ve Renk Yayınları",
    subject: "Matematik",
    totalPages: 320,
    cover: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=300&q=80"
  }
];

// ================= 2. STATE & LOCALSTORAGE DATABASE =================
let appState = {
  books: [],
  exams: [],
  activePlan: null,
  pomodoro: {
    timeLeft: 25 * 60,
    mode: 'pomodoro',
    isRunning: false,
    intervalId: null
  },
  settings: {
    supabaseUrl: '',
    supabaseKey: '',
    geminiKey: '',
    developer: '1has'
  }
};

// Initial Seed Data if empty
function initializeDefaultData() {
  const saved = localStorage.getItem('studytracker_data_1has');
  if (saved) {
    try {
      appState = JSON.parse(saved);
      if (!appState.pomodoro) {
        appState.pomodoro = { timeLeft: 25 * 60, mode: 'pomodoro', isRunning: false, intervalId: null };
      }
      return;
    } catch (e) {
      console.error('Yükleme hatası:', e);
    }
  }

  // Varsayılan zengin başlangıç verisi (İlk girişte dopdolu karşılama)
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(today.getDate() + 45);

  appState.books = [
    {
      id: 'book-1',
      title: '345 TYT Matematik Soru Bankası',
      author: 'ÜçDörtBeş Yayınları',
      subject: 'Matematik',
      totalPages: 440,
      currentPage: 210,
      targetDate: nextMonth.toISOString().split('T')[0],
      status: 'active',
      cover: POPULAR_YKS_BOOKS[0].cover,
      notes: 'Problemler ve Fonksiyonlar çözülüyor'
    },
    {
      id: 'book-2',
      title: 'Bilgi Sarmal TYT Paragraf Soru Bankası',
      author: 'Bilgi Sarmal Yayınları',
      subject: 'Paragraf',
      totalPages: 320,
      currentPage: 160,
      targetDate: nextMonth.toISOString().split('T')[0],
      status: 'active',
      cover: POPULAR_YKS_BOOKS[8].cover,
      notes: 'Günde 20 soru sabah çözülecek'
    },
    {
      id: 'book-3',
      title: '3D TYT Fizik Soru Bankası',
      author: '3D Yayınları',
      subject: 'Fizik',
      totalPages: 288,
      currentPage: 75,
      targetDate: nextMonth.toISOString().split('T')[0],
      status: 'active',
      cover: POPULAR_YKS_BOOKS[6].cover,
      notes: 'Optik ve Dalgalar konuları eksik'
    }
  ];

  const date1 = new Date();
  date1.setDate(today.getDate() - 14);
  const date2 = new Date();
  date2.setDate(today.getDate() - 7);
  const date3 = new Date();
  date3.setDate(today.getDate() - 1);

  appState.exams = [
    {
      id: 'exam-1',
      name: 'Özdebir TYT 1',
      type: 'tyt',
      date: date1.toISOString().split('T')[0],
      totalNet: 68.5,
      scores: {
        'Türkçe': { correct: 30, wrong: 6, empty: 4, net: 28.5 },
        'Matematik': { correct: 22, wrong: 4, empty: 14, net: 21.0 },
        'Fen Bilimleri': { correct: 10, wrong: 4, empty: 6, net: 9.0 },
        'Sosyal Bilimler': { correct: 11, wrong: 4, empty: 5, net: 10.0 }
      },
      notes: 'Türkçe paragrafta zaman yetmedi.'
    },
    {
      id: 'exam-2',
      name: '3D TYT Simülasyon 1',
      type: 'tyt',
      date: date2.toISOString().split('T')[0],
      totalNet: 74.0,
      scores: {
        'Türkçe': { correct: 32, wrong: 4, empty: 4, net: 31.0 },
        'Matematik': { correct: 25, wrong: 4, empty: 11, net: 24.0 },
        'Fen Bilimleri': { correct: 9, wrong: 6, empty: 5, net: 7.5 },
        'Sosyal Bilimler': { correct: 13, wrong: 6, empty: 1, net: 11.5 }
      },
      notes: 'Fen bilimlerinde fizik dalgalar yanlış çıktı.'
    },
    {
      id: 'exam-3',
      name: 'Türkiye Geneli TYT Deneme 3',
      type: 'tyt',
      date: date3.toISOString().split('T')[0],
      totalNet: 76.25,
      scores: {
        'Türkçe': { correct: 33, wrong: 4, empty: 3, net: 32.0 },
        'Matematik': { correct: 27, wrong: 3, empty: 10, net: 26.25 },
        'Fen Bilimleri': { correct: 8, wrong: 5, empty: 7, net: 6.75 },
        'Sosyal Bilimler': { correct: 12, wrong: 3, empty: 5, net: 11.25 }
      },
      notes: 'Fen netleri son 3 denemedir düşüşte, acil fizik tekrarı gerekli.'
    }
  ];

  saveState();
}

function saveState() {
  localStorage.setItem('studytracker_data_1has', JSON.stringify(appState));
}

// ================= 3. NAVIGATION & ROUTING =================
let currentView = 'dashboard';

function navigateTo(viewId) {
  currentView = viewId;

  // View sections toggle
  const views = ['dashboard', 'books', 'exams', 'study-plan', 'tutor', 'pomodoro', 'admin'];
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === viewId) {
        el.classList.remove('hidden');
      } else {
        el.classList.add('hidden');
      }
    }
  });

  // Sidebar buttons active state
  document.querySelectorAll('.nav-btn').forEach(btn => {
    const navTarget = btn.getAttribute('data-nav');
    if (navTarget === viewId) {
      btn.className = 'nav-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-600 text-white shadow-md shadow-blue-500/20';
    } else {
      btn.className = 'nav-btn w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
    }
  });

  // Mobile sidebar close
  closeMobileSidebar();

  // Trigger view renderers
  if (viewId === 'dashboard') {
    renderDashboard();
  } else if (viewId === 'books') {
    renderBooksGrid();
  } else if (viewId === 'exams') {
    renderExamsView();
  } else if (viewId === 'study-plan') {
    renderStudyPlanView();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
  lucide.createIcons();
}

function toggleMobileSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('mobile-backdrop');
  if (sb.classList.contains('-translate-x-full')) {
    sb.classList.remove('-translate-x-full');
    bd.classList.remove('hidden');
  } else {
    sb.classList.add('-translate-x-full');
    bd.classList.add('hidden');
  }
}

function closeMobileSidebar() {
  const sb = document.getElementById('sidebar');
  const bd = document.getElementById('mobile-backdrop');
  if (sb && bd) {
    sb.classList.add('-translate-x-full');
    bd.classList.add('hidden');
  }
}

function toggleDarkMode() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  localStorage.setItem('studytracker_theme_1has', html.classList.contains('dark') ? 'dark' : 'light');
  lucide.createIcons();
  if (currentView === 'dashboard') renderDashboardChart();
  if (currentView === 'exams') renderExamsMainChart();
}

// ================= 4. DASHBOARD RENDERER =================
let dashboardChartInstance = null;

function renderDashboard() {
  const totalBooks = appState.books.length;
  let totalPages = 0;
  let totalCurrentPages = 0;

  appState.books.forEach(b => {
    totalPages += parseInt(b.totalPages || 0);
    totalCurrentPages += parseInt(b.currentPage || 0);
  });

  const progressPercent = totalPages > 0 ? Math.round((totalCurrentPages / totalPages) * 100) : 0;

  // Last exam
  let lastExamNet = '—';
  let lastExamName = 'Henüz deneme girilmedi';
  if (appState.exams.length > 0) {
    const sortedExams = [...appState.exams].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latest = sortedExams[0];
    lastExamNet = typeof latest.totalNet === 'number' ? latest.totalNet.toFixed(2) : latest.totalNet;
    lastExamName = `${latest.name} (${new Date(latest.date).toLocaleDateString('tr-TR')})`;
  }

  // Today's tasks count
  let todayTasksCount = 0;
  let completedTodayTasks = 0;
  if (appState.activePlan && appState.activePlan.tasks) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTasks = appState.activePlan.tasks.filter(t => t.date === todayStr);
    todayTasksCount = todayTasks.length;
    completedTodayTasks = todayTasks.filter(t => t.completed).length;
  }

  // Update UI Elements
  document.getElementById('stat-total-books').innerText = totalBooks;
  document.getElementById('stat-pages-info').innerText = `${totalCurrentPages} / ${totalPages} sayfa çözüldü`;
  document.getElementById('stat-progress-percent').innerText = `%${progressPercent}`;
  document.getElementById('stat-last-net').innerText = lastExamNet;
  document.getElementById('stat-last-exam-name').innerText = lastExamName;
  document.getElementById('stat-today-tasks').innerText = `${completedTodayTasks} / ${todayTasksCount}`;
  document.getElementById('badge-books-count').innerText = totalBooks;
  document.getElementById('badge-exams-count').innerText = appState.exams.length;

  renderDashboardTodayTasks();
  renderDashboardChart();
}

function renderDashboardTodayTasks() {
  const container = document.getElementById('dashboard-today-task-list');
  if (!appState.activePlan || !appState.activePlan.tasks || appState.activePlan.tasks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i data-lucide="calendar-plus" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
        <p class="text-xs font-semibold">Henüz aktif bir çalışma planın yok.</p>
        <button onclick="navigateTo('study-plan')" class="mt-3 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
          Hemen AI Planı Oluştur
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTasks = appState.activePlan.tasks.filter(t => t.date === todayStr);

  if (todayTasks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8 text-gray-400">
        <i data-lucide="smile" class="w-10 h-10 mx-auto mb-2 opacity-50 text-emerald-500"></i>
        <p class="text-xs font-semibold">Bugün için planlanmış görev yok veya serbest çalışma günü!</p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = todayTasks.map(task => `
    <div class="p-3.5 rounded-2xl border ${task.completed ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700'} flex items-center justify-between gap-3 transition-all">
      <div class="flex items-center gap-3 min-w-0">
        <button onclick="toggleTaskCompletion('${task.id}')" class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'}">
          ${task.completed ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
        </button>
        <div class="min-w-0">
          <p class="text-xs font-bold text-gray-900 dark:text-white truncate ${task.completed ? 'line-through text-gray-400' : ''}">
            ${task.title}
          </p>
          <div class="flex items-center gap-2 text-[10px] text-gray-500">
            <span>⏱️ ${task.duration} dk</span>
            ${task.pages ? `<span>• Sayfa: ${task.pages}</span>` : ''}
          </div>
        </div>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${task.completed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}">
        ${task.subject}
      </span>
    </div>
  `).join('');

  lucide.createIcons();
}

function renderDashboardChart() {
  const ctx = document.getElementById('dashboardNetChart');
  if (!ctx) return;

  if (dashboardChartInstance) {
    dashboardChartInstance.destroy();
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const gridColor = isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)';

  if (appState.exams.length === 0) {
    dashboardChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Deneme 1', 'Deneme 2', 'Deneme 3'],
        datasets: [{
          label: 'Örnek Net',
          data: [65, 72, 78],
          borderColor: '#818cf8',
          borderDash: [5, 5],
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: textColor }, grid: { color: gridColor } },
          y: { ticks: { color: textColor }, grid: { color: gridColor } }
        }
      }
    });
    return;
  }

  const sortedExams = [...appState.exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sortedExams.map(e => e.name);
  const dataNets = sortedExams.map(e => parseFloat(e.totalNet || 0));

  dashboardChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Toplam Net',
        data: dataNets,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#6366f1',
        pointRadius: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor }, beginAtZero: false }
      }
    }
  });
}

// ================= 5. BOOKS & KİTAPİŞLER ENGINE =================
let bookFilterMode = 'all';

function filterBooks(mode) {
  bookFilterMode = mode;
  document.querySelectorAll('#book-filters .filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === mode) {
      btn.className = 'filter-btn px-4 py-1.5 rounded-xl text-xs font-bold bg-blue-600 text-white';
    } else {
      btn.className = 'filter-btn px-4 py-1.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800';
    }
  });
  renderBooksGrid();
}

function renderBooksGrid() {
  const container = document.getElementById('books-grid');
  if (!container) return;

  const searchQuery = (document.getElementById('books-local-search')?.value || '').toLowerCase();

  let filtered = appState.books.filter(b => {
    if (bookFilterMode !== 'all' && b.status !== bookFilterMode) return false;
    if (searchQuery && !b.title.toLowerCase().includes(searchQuery) && !b.author.toLowerCase().includes(searchQuery) && !b.subject.toLowerCase().includes(searchQuery)) {
      return false;
    }
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
        <i data-lucide="book-open" class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-700"></i>
        <h3 class="font-bold text-base text-gray-700 dark:text-gray-300">Kitap Bulunamadı</h3>
        <p class="text-xs text-gray-400 mt-1">Kitapişler arama motorundan yeni bir kaynak kitap ekleyebilirsin.</p>
        <button onclick="openBookModal()" class="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">
          Yeni Kitap Ekle
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(b => {
    const total = parseInt(b.totalPages || 1);
    const curr = parseInt(b.currentPage || 0);
    const pct = Math.min(100, Math.round((curr / total) * 100));

    // Daily target calculation
    let dailyTargetText = '';
    if (b.targetDate) {
      const diffTime = new Date(b.targetDate) - new Date();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const remainingPages = Math.max(0, total - curr);
      if (diffDays > 0 && remainingPages > 0) {
        const pagesPerDay = Math.ceil(remainingPages / diffDays);
        dailyTargetText = `${diffDays} gün kaldı (Hedef: ${pagesPerDay} sayfa/gün)`;
      } else if (remainingPages === 0) {
        dailyTargetText = '🎉 Kitap bitti!';
      } else {
        dailyTargetText = 'Hedef tarih geçti';
      }
    }

    return `
      <div class="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <!-- Header with cover thumbnail and tags -->
          <div class="flex items-start gap-4 mb-4">
            <img src="${b.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=150&q=80'}" alt="${b.title}" class="w-16 h-22 object-cover rounded-xl shadow-xs shrink-0 border border-gray-200 dark:border-gray-700">
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  ${b.subject || 'Ders'}
                </span>
                <span class="text-[10px] font-bold ${b.status === 'completed' ? 'text-emerald-500' : 'text-gray-400'}">
                  ${b.status === 'completed' ? 'Tamamlandı' : b.status === 'paused' ? 'Duraklatıldı' : 'Aktif'}
                </span>
              </div>
              <h4 class="font-extrabold text-sm text-gray-900 dark:text-white line-clamp-2 leading-snug">
                ${b.title}
              </h4>
              <p class="text-xs text-gray-400 mt-0.5 truncate">${b.author || 'Yayınevi Belirtilmedi'}</p>
            </div>
          </div>

          <!-- Progress Bar & Page Stats -->
          <div class="space-y-1.5 mb-4">
            <div class="flex items-center justify-between text-xs font-bold">
              <span>İlerleme: %${pct}</span>
              <span class="text-gray-500">${curr} / ${total} sayfa</span>
            </div>
            <div class="w-full h-2.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div class="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
            </div>
            ${dailyTargetText ? `<p class="text-[11px] font-medium text-indigo-600 dark:text-indigo-400">${dailyTargetText}</p>` : ''}
          </div>
        </div>

        <!-- Quick Page Update and Action Buttons -->
        <div class="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-1.5">
            <button onclick="quickUpdatePage('${b.id}', 10)" class="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors" title="+10 sayfa ekle">+10s</button>
            <button onclick="quickUpdatePage('${b.id}', 20)" class="px-2 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg transition-colors" title="+20 sayfa ekle">+20s</button>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="editBook('${b.id}')" class="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg" title="Düzenle">
              <i data-lucide="edit-3" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteBook('${b.id}')" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg" title="Sil">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function openBookModal(bookData = null) {
  const modal = document.getElementById('modal-book');
  const form = document.getElementById('form-add-book');
  form.reset();

  document.getElementById('kitapisler-results').classList.add('hidden');
  document.getElementById('kitapisler-search-input').value = '';

  if (bookData) {
    document.getElementById('book-form-id').value = bookData.id || '';
    document.getElementById('book-form-title').value = bookData.title || '';
    document.getElementById('book-form-author').value = bookData.author || '';
    document.getElementById('book-form-subject').value = bookData.subject || 'Matematik';
    document.getElementById('book-form-total-pages').value = bookData.totalPages || 400;
    document.getElementById('book-form-current-page').value = bookData.currentPage || 0;
    document.getElementById('book-form-target-date').value = bookData.targetDate || '';
    document.getElementById('book-form-status').value = bookData.status || 'active';
    document.getElementById('book-form-notes').value = bookData.notes || '';
    document.getElementById('book-form-cover').value = bookData.cover || '';
  } else {
    document.getElementById('book-form-id').value = '';
    document.getElementById('book-form-cover').value = '';
  }

  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeBookModal() {
  document.getElementById('modal-book').classList.add('hidden');
}

// Live Kitapişler Search (Dahili Katalog + Proxy)
let kitapislerSearchTimeout = null;
function debounceKitapislerSearch() {
  clearTimeout(kitapislerSearchTimeout);
  kitapislerSearchTimeout = setTimeout(() => {
    searchKitapisler();
  }, 300);
}

async function searchKitapisler() {
  const query = (document.getElementById('kitapisler-search-input').value || '').trim().toLowerCase();
  const resultsContainer = document.getElementById('kitapisler-results');

  if (!query) {
    resultsContainer.classList.add('hidden');
    return;
  }

  // 1. Önce popüler YKS kataloğunda hızlı eşleşme ara
  const matchedLocal = POPULAR_YKS_BOOKS.filter(b =>
    b.title.toLowerCase().includes(query) ||
    b.author.toLowerCase().includes(query) ||
    b.subject.toLowerCase().includes(query)
  );

  resultsContainer.classList.remove('hidden');

  let resultsHTML = matchedLocal.map(b => `
    <div onclick="selectKitapislerBook('${b.title.replace(/'/g, "\\'")}', '${b.author}', '${b.subject}', ${b.totalPages}, '${b.cover}')" class="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-500 cursor-pointer flex items-center gap-3 transition-all">
      <img src="${b.cover}" class="w-10 h-14 object-cover rounded shadow-xs shrink-0">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${b.title}</p>
        <p class="text-[10px] text-gray-400">${b.author} • ${b.totalPages} Sayfa</p>
        <span class="text-[9px] font-bold text-blue-600">Tek tıkla formu doldur</span>
      </div>
    </div>
  `).join('');

  if (matchedLocal.length === 0) {
    resultsHTML = `
      <div class="col-span-full p-3 text-center text-xs text-gray-400">
        Özel kitap adı girdiniz. Aşağıdaki formdan doğrudan bilgileri kaydedebilirsiniz.
      </div>
    `;
  }

  resultsContainer.innerHTML = resultsHTML;
}

function selectKitapislerBook(title, author, subject, totalPages, cover) {
  document.getElementById('book-form-title').value = title;
  document.getElementById('book-form-author').value = author;
  document.getElementById('book-form-subject').value = subject;
  document.getElementById('book-form-total-pages').value = totalPages;
  document.getElementById('book-form-cover').value = cover;
  document.getElementById('kitapisler-results').classList.add('hidden');
}

function handleSaveBook(e) {
  e.preventDefault();

  const id = document.getElementById('book-form-id').value;
  const title = document.getElementById('book-form-title').value.trim();
  const author = document.getElementById('book-form-author').value.trim();
  const subject = document.getElementById('book-form-subject').value;
  const totalPages = parseInt(document.getElementById('book-form-total-pages').value) || 0;
  const currentPage = parseInt(document.getElementById('book-form-current-page').value) || 0;
  const targetDate = document.getElementById('book-form-target-date').value;
  const status = document.getElementById('book-form-status').value;
  const notes = document.getElementById('book-form-notes').value.trim();
  let cover = document.getElementById('book-form-cover').value;

  if (!cover) {
    cover = POPULAR_YKS_BOOKS[Math.floor(Math.random() * POPULAR_YKS_BOOKS.length)].cover;
  }

  if (id) {
    const idx = appState.books.findIndex(b => b.id === id);
    if (idx !== -1) {
      appState.books[idx] = {
        ...appState.books[idx],
        title, author, subject, totalPages, currentPage, targetDate, status, notes, cover
      };
    }
  } else {
    appState.books.push({
      id: 'book-' + Date.now(),
      title, author, subject, totalPages, currentPage, targetDate, status, notes, cover
    });
  }

  saveState();
  closeBookModal();
  renderBooksGrid();
  renderDashboard();

  confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
}

function quickUpdatePage(bookId, increment) {
  const book = appState.books.find(b => b.id === bookId);
  if (!book) return;

  const current = parseInt(book.currentPage || 0);
  const total = parseInt(book.totalPages || 0);
  book.currentPage = Math.min(total, current + increment);

  if (book.currentPage >= total) {
    book.status = 'completed';
    confetti({ particleCount: 70, spread: 80 });
  }

  saveState();
  renderBooksGrid();
  renderDashboard();
}

function editBook(bookId) {
  const book = appState.books.find(b => b.id === bookId);
  if (book) openBookModal(book);
}

function deleteBook(bookId) {
  if (!confirm('Bu kitabı kütüphanenizden silmek istediğinize emin misiniz?')) return;
  appState.books = appState.books.filter(b => b.id !== bookId);
  saveState();
  renderBooksGrid();
  renderDashboard();
}

// ================= 6. EXAMS & NETS ENGINE =================
let currentExamModalType = 'tyt';
let examsMainChartInstance = null;

const TYT_SUBJECTS = [
  { name: 'Türkçe', questions: 40 },
  { name: 'Matematik', questions: 40 },
  { name: 'Fen Bilimleri', questions: 20 },
  { name: 'Sosyal Bilimler', questions: 20 }
];

const AYT_SUBJECTS = [
  { name: 'Matematik', questions: 40 },
  { name: 'Fizik', questions: 14 },
  { name: 'Kimya', questions: 13 },
  { name: 'Biyoloji', questions: 13 },
  { name: 'Edebiyat', questions: 24 },
  { name: 'Tarih-1', questions: 10 },
  { name: 'Coğrafya-1', questions: 6 }
];

function setExamModalType(type) {
  currentExamModalType = type;
  const btnTyt = document.getElementById('exam-type-tyt');
  const btnAyt = document.getElementById('exam-type-ayt');

  if (type === 'tyt') {
    btnTyt.className = 'flex-1 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow';
    btnAyt.className = 'flex-1 py-1.5 rounded-lg text-gray-500 hover:text-gray-900';
  } else {
    btnAyt.className = 'flex-1 py-1.5 rounded-lg bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow';
    btnTyt.className = 'flex-1 py-1.5 rounded-lg text-gray-500 hover:text-gray-900';
  }

  renderExamModalRows();
}

function openExamModal() {
  const modal = document.getElementById('modal-exam');
  document.getElementById('form-add-exam').reset();
  document.getElementById('exam-form-date').value = new Date().toISOString().split('T')[0];
  setExamModalType('tyt');
  modal.classList.remove('hidden');
  lucide.createIcons();
}

function closeExamModal() {
  document.getElementById('modal-exam').classList.add('hidden');
}

function renderExamModalRows() {
  const container = document.getElementById('exam-scores-rows');
  const subjects = currentExamModalType === 'tyt' ? TYT_SUBJECTS : AYT_SUBJECTS;

  container.innerHTML = subjects.map((sub, idx) => `
    <div class="p-3 grid grid-cols-5 items-center text-center gap-2 text-sm ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/40'}">
      <div class="text-left font-bold text-gray-900 dark:text-white text-xs">
        ${sub.name} <span class="text-[10px] text-gray-400 block">${sub.questions} Soru</span>
      </div>
      <div>
        <input type="number" min="0" max="${sub.questions}" value="0" oninput="calculateModalNets()" data-subj="${sub.name}" data-q="${sub.questions}" class="inp-correct w-16 text-center py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold">
      </div>
      <div>
        <input type="number" min="0" max="${sub.questions}" value="0" oninput="calculateModalNets()" data-subj="${sub.name}" class="inp-wrong w-16 text-center py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-xs font-bold">
      </div>
      <div class="text-xs font-medium text-gray-400 cell-empty" data-subj="${sub.name}">
        ${sub.questions}
      </div>
      <div class="text-xs font-black text-purple-600 dark:text-purple-400 cell-net" data-subj="${sub.name}">
        0.00
      </div>
    </div>
  `).join('');

  calculateModalNets();
}

function calculateModalNets() {
  const rows = document.querySelectorAll('#exam-scores-rows > div');
  let grandTotalNet = 0;

  rows.forEach(row => {
    const inpC = row.querySelector('.inp-correct');
    const inpW = row.querySelector('.inp-wrong');
    const cellE = row.querySelector('.cell-empty');
    const cellN = row.querySelector('.cell-net');

    const totalQ = parseInt(inpC.getAttribute('data-q') || 40);
    const correct = Math.max(0, parseInt(inpC.value) || 0);
    const wrong = Math.max(0, parseInt(inpW.value) || 0);

    const empty = Math.max(0, totalQ - correct - wrong);
    const net = Math.max(0, correct - (wrong / 4));

    cellE.innerText = empty;
    cellN.innerText = net.toFixed(2);
    grandTotalNet += net;
  });

  document.getElementById('exam-total-net-display').innerText = grandTotalNet.toFixed(2);
}

function handleSaveExam(e) {
  e.preventDefault();

  const name = document.getElementById('exam-form-name').value.trim();
  const date = document.getElementById('exam-form-date').value;
  const notes = document.getElementById('exam-form-notes').value.trim();

  const scores = {};
  let totalNet = 0;

  const rows = document.querySelectorAll('#exam-scores-rows > div');
  rows.forEach(row => {
    const inpC = row.querySelector('.inp-correct');
    const inpW = row.querySelector('.inp-wrong');
    const subj = inpC.getAttribute('data-subj');
    const totalQ = parseInt(inpC.getAttribute('data-q') || 40);

    const correct = Math.max(0, parseInt(inpC.value) || 0);
    const wrong = Math.max(0, parseInt(inpW.value) || 0);
    const empty = Math.max(0, totalQ - correct - wrong);
    const net = Math.max(0, correct - (wrong / 4));

    scores[subj] = { correct, wrong, empty, net };
    totalNet += net;
  });

  appState.exams.push({
    id: 'exam-' + Date.now(),
    name,
    type: currentExamModalType,
    date,
    totalNet: Math.round(totalNet * 100) / 100,
    scores,
    notes
  });

  saveState();
  closeExamModal();
  renderExamsView();
  renderDashboard();

  confetti({ particleCount: 50, spread: 70 });
}

function renderExamsView() {
  renderWeakSubjects();
  renderExamsMainChart();
  renderExamsHistoryList();
}

// Multi-Agent Weakness Evaluator (Son 3 deneme analizi)
function renderWeakSubjects() {
  const container = document.getElementById('weak-subjects-container');
  if (!container) return;

  if (appState.exams.length < 2) {
    container.innerHTML = '';
    return;
  }

  const sorted = [...appState.exams].sort((a, b) => new Date(b.date) - new Date(a.date));
  const latest3 = sorted.slice(0, 3);

  // Group scores by subject
  const subjectNets = {};
  latest3.forEach(exam => {
    if (exam.scores) {
      Object.keys(exam.scores).forEach(s => {
        if (!subjectNets[s]) subjectNets[s] = [];
        subjectNets[s].unshift(exam.scores[s].net);
      });
    }
  });

  const declining = [];
  Object.keys(subjectNets).forEach(subj => {
    const nets = subjectNets[subj];
    if (nets.length >= 2) {
      const latest = nets[nets.length - 1];
      const prevAvg = nets.slice(0, -1).reduce((a, b) => a + b, 0) / (nets.length - 1);
      if (latest < prevAvg && (prevAvg - latest) >= 1) {
        declining.push({
          subject: subj,
          latest,
          prevAvg,
          drop: (prevAvg - latest).toFixed(1)
        });
      }
    }
  });

  if (declining.length === 0) {
    container.innerHTML = `
      <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
        <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0"></i>
        <p class="text-xs text-emerald-800 dark:text-emerald-300 font-bold">
          Harika! Son denemelerinde belirgin bir net düşüşü tespit edilmedi. Gelişimin istikrarlı devam ediyor.
        </p>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
      <div class="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-extrabold text-sm">
        <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-600"></i>
        <span>Multi-Agent Analizi: Dikkat Edilmesi Gereken Zayıf Branşlar!</span>
      </div>
      <p class="text-xs text-amber-700 dark:text-amber-400">
        Son 3 deneme sınavındaki sonuçlarına göre aşağıdaki branşlarda net kaybı tespit edildi. Yeni çalışma programında bu derslere öncelik verilecek:
      </p>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        ${declining.map(d => `
          <div class="p-3 rounded-xl bg-white dark:bg-gray-900 border border-amber-200 dark:border-amber-800/60 shadow-xs">
            <span class="font-bold text-xs text-gray-900 dark:text-white">${d.subject}</span>
            <div class="mt-1 flex items-baseline justify-between">
              <span class="text-xs text-red-500 font-bold">-${d.drop} Net Düşüş</span>
              <span class="text-[10px] text-gray-400">Son: ${d.latest} Net</span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  lucide.createIcons();
}

function renderExamsMainChart() {
  const ctx = document.getElementById('examsMainChart');
  if (!ctx) return;

  if (examsMainChartInstance) {
    examsMainChartInstance.destroy();
  }

  const isDark = document.documentElement.classList.contains('dark');
  const textColor = isDark ? '#9ca3af' : '#4b5563';
  const gridColor = isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(209, 213, 219, 0.5)';

  const sorted = [...appState.exams].sort((a, b) => new Date(a.date) - new Date(b.date));
  const labels = sorted.map(e => `${e.name} (${new Date(e.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' })})`);

  const datasets = [
    {
      label: 'Toplam Net',
      data: sorted.map(e => e.totalNet),
      borderColor: '#9333ea',
      backgroundColor: 'rgba(147, 51, 234, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.3
    }
  ];

  // Specific subjects if available
  const subjColors = {
    'Türkçe': '#3b82f6',
    'Matematik': '#ef4444',
    'Fen Bilimleri': '#10b981',
    'Sosyal Bilimler': '#f59e0b'
  };

  Object.keys(subjColors).forEach(subj => {
    datasets.push({
      label: subj,
      data: sorted.map(e => e.scores && e.scores[subj] ? e.scores[subj].net : null),
      borderColor: subjColors[subj],
      borderWidth: 1.5,
      tension: 0.3
    });
  });

  examsMainChartInstance = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: textColor }, grid: { color: gridColor } },
        y: { ticks: { color: textColor }, grid: { color: gridColor } }
      }
    }
  });
}

function renderExamsHistoryList() {
  const container = document.getElementById('exams-history-list');
  if (!container) return;

  if (appState.exams.length === 0) {
    container.innerHTML = '<p class="text-xs text-gray-400 py-6 text-center">Henüz kaydedilmiş deneme sınavı yok.</p>';
    return;
  }

  const sorted = [...appState.exams].sort((a, b) => new Date(b.date) - new Date(a.date));

  container.innerHTML = sorted.map(exam => `
    <div class="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            ${exam.type.toUpperCase()}
          </span>
          <h4 class="font-bold text-sm text-gray-900 dark:text-white">${exam.name}</h4>
        </div>
        <p class="text-xs text-gray-400">
          📅 ${new Date(exam.date).toLocaleDateString('tr-TR')} ${exam.notes ? `• <em>${exam.notes}</em>` : ''}
        </p>
      </div>

      <div class="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
        <div class="text-right">
          <span class="text-[10px] font-semibold text-gray-400 block uppercase">Toplam Net</span>
          <span class="text-lg font-black text-purple-600 dark:text-purple-400">${exam.totalNet}</span>
        </div>
        <button onclick="deleteExam('${exam.id}')" class="p-2 text-gray-400 hover:text-red-500 rounded-lg" title="Sil">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
  `).join('');

  lucide.createIcons();
}

function deleteExam(examId) {
  if (!confirm('Bu denemeyi silmek istediğinize emin misiniz?')) return;
  appState.exams = appState.exams.filter(e => e.id !== examId);
  saveState();
  renderExamsView();
  renderDashboard();
}

// ================= 7. MULTI-AGENT STUDY PLANNER (A-R007 ENGINE) =================
function openPlanGeneratorModal() {
  document.getElementById('modal-plan-generator').classList.remove('hidden');
  lucide.createIcons();
}

function closePlanGeneratorModal() {
  document.getElementById('modal-plan-generator').classList.add('hidden');
}

function generateMultiAgentPlan() {
  const dailyHours = parseInt(document.getElementById('plan-daily-hours').value) || 4;
  const strategy = document.getElementById('plan-strategy').value;

  // Multi-Agent Algoritması (Kusursuz, deterministik + yapay zeka hibrit)
  const daysOfWeek = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  const generatedTasks = [];

  const availableBooks = appState.books.filter(b => b.status === 'active');
  const bookCount = availableBooks.length;

  const today = new Date();

  // Find declining weak subjects
  const decliningSubjects = [];
  if (appState.exams.length >= 2) {
    const latestExam = appState.exams[appState.exams.length - 1];
    if (latestExam.scores) {
      Object.keys(latestExam.scores).forEach(s => {
        if (latestExam.scores[s].net < 15) decliningSubjects.push(s);
      });
    }
  }

  daysOfWeek.forEach((dayName, dayIndex) => {
    const dayDate = new Date();
    dayDate.setDate(today.getDate() + dayIndex);
    const dateStr = dayDate.toISOString().split('T')[0];

    // Günlük 3-4 pomodoro bloğu
    const sessionsCount = Math.max(2, Math.min(5, dailyHours));

    for (let s = 1; s <= sessionsCount; s++) {
      let assignedBook = null;
      let subject = 'Matematik';
      let title = '';
      let pages = '';

      if (bookCount > 0) {
        assignedBook = availableBooks[(dayIndex * sessionsCount + s) % bookCount];
        subject = assignedBook.subject;
        const curP = parseInt(assignedBook.currentPage || 0);
        const startP = curP + (s * 8);
        const endP = startP + 12;
        pages = `${startP}-${endP}`;
        title = `${assignedBook.title}: Test ${s} Çözümü (Sayfa ${pages})`;
      } else {
        const defaultSubjects = ['TYT Matematik', 'TYT Paragraf', 'TYT Fen Bilimleri', 'AYT Matematik'];
        subject = defaultSubjects[(dayIndex + s) % defaultSubjects.length];
        title = `${subject} Konu Tekrarı ve 30 Soru Çözümü`;
        pages = 'Konu Özeti';
      }

      // If weak subject strategy
      if (strategy === 'weakness' && decliningSubjects.length > 0 && s === 1) {
        subject = decliningSubjects[dayIndex % decliningSubjects.length];
        title = `⚡ Zayıf Konu Güçlendirme: ${subject} Özel Soru Kampı`;
      }

      generatedTasks.push({
        id: `task-${Date.now()}-${dayIndex}-${s}`,
        day: dayName,
        date: dateStr,
        title,
        subject,
        duration: 45,
        pages,
        bookId: assignedBook ? assignedBook.id : null,
        completed: false
      });
    }
  });

  appState.activePlan = {
    id: 'plan-' + Date.now(),
    title: `Haftalık Çalışma Programı (${dailyHours} Saat / Gün)`,
    createdAt: new Date().toISOString(),
    tasks: generatedTasks
  };

  saveState();
  closePlanGeneratorModal();
  renderStudyPlanView();
  renderDashboard();

  confetti({ particleCount: 70, spread: 80 });
}

function renderStudyPlanView() {
  const container = document.getElementById('active-plan-container');
  if (!container) return;

  if (!appState.activePlan || !appState.activePlan.tasks || appState.activePlan.tasks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-16 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800">
        <i data-lucide="brain-circuit" class="w-16 h-16 mx-auto mb-3 text-emerald-500 opacity-60"></i>
        <h3 class="font-extrabold text-lg text-gray-900 dark:text-white">Henüz Bir Çalışma Programı Oluşturmadın</h3>
        <p class="text-xs text-gray-400 mt-1 max-w-md mx-auto">
          A-R007 Multi-Agent motoru; kitaplarının kalan sayfalarını ve deneme netlerini analiz ederek sana özel haftalık ders takvimi üretir.
        </p>
        <button onclick="openPlanGeneratorModal()" class="mt-5 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
          Hemen AI Programı Oluştur
        </button>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // Group tasks by day
  const daysMap = {};
  appState.activePlan.tasks.forEach(t => {
    if (!daysMap[t.day]) daysMap[t.day] = [];
    daysMap[t.day].push(t);
  });

  const totalTasks = appState.activePlan.tasks.length;
  const completedTasks = appState.activePlan.tasks.filter(t => t.completed).length;
  const progressPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  let html = `
    <!-- Plan Progress Overview Banner -->
    <div class="p-6 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Aktif Program</span>
        <h3 class="text-xl font-black text-gray-900 dark:text-white">${appState.activePlan.title}</h3>
        <p class="text-xs text-gray-400 mt-0.5">Tamamlanan: ${completedTasks} / ${totalTasks} Görev (%${progressPct})</p>
      </div>
      <div class="w-full sm:w-48">
        <div class="w-full h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" style="width: ${progressPct}%"></div>
        </div>
      </div>
    </div>

    <!-- Days Grid -->
    <div class="space-y-4">
  `;

  Object.keys(daysMap).forEach(dayName => {
    const tasks = daysMap[dayName];
    html += `
      <div class="p-5 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xs space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
            <i data-lucide="calendar" class="w-4 h-4 text-emerald-500"></i>
            <span>${dayName}</span>
          </h4>
          <span class="text-xs text-gray-400">${tasks.filter(t => t.completed).length} / ${tasks.length} Tamam</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          ${tasks.map(t => `
            <div class="p-3.5 rounded-2xl border ${t.completed ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50' : 'bg-gray-50/70 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700/80'} flex items-center justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0">
                <button onclick="toggleTaskCompletion('${t.id}')" class="w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${t.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-gray-300 dark:border-gray-600 hover:border-emerald-500'}">
                  ${t.completed ? '<i data-lucide="check" class="w-4 h-4"></i>' : ''}
                </button>
                <div class="min-w-0">
                  <p class="text-xs font-bold text-gray-900 dark:text-white truncate ${t.completed ? 'line-through text-gray-400' : ''}">
                    ${t.title}
                  </p>
                  <p class="text-[10px] text-gray-400">⏱️ ${t.duration} dk ${t.pages ? `• ${t.pages}` : ''}</p>
                </div>
              </div>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shrink-0">
                ${t.subject}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  html += '</div>';
  container.innerHTML = html;
  lucide.createIcons();
}

function toggleTaskCompletion(taskId) {
  if (!appState.activePlan || !appState.activePlan.tasks) return;
  const task = appState.activePlan.tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;

  // Auto increment book current page if linked to a book
  if (task.completed && task.bookId) {
    const book = appState.books.find(b => b.id === task.bookId);
    if (book) {
      book.currentPage = Math.min(parseInt(book.totalPages || 0), parseInt(book.currentPage || 0) + 10);
    }
  }

  saveState();
  if (task.completed) {
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
  }

  renderStudyPlanView();
  renderDashboard();
}

// ================= 8. MULTI-AGENT AI TUTOR & MENTOR (A-R007 CHAT) =================
const YKS_KNOWLEDGE_BASE = {
  matematik: `TYT Matematik'te net artışı için temel 3 kural:
1. **İlk 12 Konuyu Kusursuz Hale Getir**: Temel kavramlar, rasyonel sayılar, üslü-köklü, çarpanlara ayırma ve denklem çözme.
2. **Problemleri Günlük Rutin Yap**: Her gün aksatmadan 15-20 problem sorusu çöz (Hız ve Renk veya 345).
3. **Geometriyi Asla Bırakma**: Günde en az 5 geometri sorusu çöz. Doğruda açı ve üçgende alan bilmeden TYT 20+ nete çıkamazsın.`,

  paragraf: `Paragrafta hızlanmak ve 30+ nete ulaşmak için taktikler:
1. **Soru Kökünü Önce Oku**: Paragraftan önce soruyu ve olumsuz kökleri (değinilmemiştir, ulaşılamaz) çiz.
2. **Kendi Fikrini Katma**: Yalnızca metinde yazan neyse doğru odur.
3. **Sabahları İlk İş Olarak Çöz**: Beynin en berrak olduğu saatlerde 20 paragraf sorusu çözerek güne başla.`,

  fizik: `Fizik formüllerini ezberlemeden öğrenmenin yolu:
1. **Birim Analizi Yap**: Formülü unutsan bile SI birimlerini çarparak formülü kendin türetebilirsin.
2. **Şekil Çiz**: Hangi soru olursa olsun (Kuvvet, Optik, Elektrik) kafanda canlandırmak yerine kağıda şekil çiz.
3. **Kavram Yanılgılarını Temizle**: Fizikte soruların %60'ı salt işlem değil, kavram ve yorum sorusudur.`,

  pomodoro: `Verimli Pomodoro Tekniği:
- 50 dakika kesintisiz çalışma + 10 dakika mola (Masa başından tamamen kalk, telefona bakma).
- 3 blok sonra 30 dakika uzun mola ver.
- Her blokta tek bir hedefe odaklan (örn: 'Sadece 345 TYT Mat Sayfa 80-92').`
};

function sendQuickPrompt(promptText) {
  document.getElementById('chat-input').value = promptText;
  handleChatSubmit(new Event('submit'));
}

function handleChatSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = (input.value || '').trim();
  if (!text) return;

  const chatContainer = document.getElementById('chat-messages');

  // Append user message
  chatContainer.innerHTML += `
    <div class="flex items-start justify-end gap-3">
      <div class="p-4 rounded-2xl rounded-tr-none bg-blue-600 text-white text-sm max-w-xl leading-relaxed">
        ${escapeHtml(text)}
      </div>
      <div class="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 font-bold text-xs">
        SEN
      </div>
    </div>
  `;

  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // AI Response processing
  setTimeout(() => {
    let reply = '';
    const lower = text.toLowerCase();

    if (lower.includes('matematik') || lower.includes('geometri')) {
      reply = YKS_KNOWLEDGE_BASE.matematik;
    } else if (lower.includes('paragraf') || lower.includes('türkçe')) {
      reply = YKS_KNOWLEDGE_BASE.paragraf;
    } else if (lower.includes('fizik') || lower.includes('formül')) {
      reply = YKS_KNOWLEDGE_BASE.fizik;
    } else if (lower.includes('pomodoro') || lower.includes('rutin') || lower.includes('zaman')) {
      reply = YKS_KNOWLEDGE_BASE.pomodoro;
    } else {
      reply = `Sorunu dikkatle inceledim! 
YKS hazırlığında en önemli kural **tutarlılık ve hedefli soru çözümüdür**.
- Elindeki kitapların ilerlemesini StudyTracker'da her gün güncelle.
- Zayıf olduğun branşları denemeler sekmesinden takip et ve Multi-Agent haftalık planlayıcının önerdiği görev bloklarına sadık kal.
Başka bir konuda sorun varsa hemen sorabilirsin!`;
    }

    chatContainer.innerHTML += `
      <div class="flex items-start gap-3">
        <div class="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
          <i data-lucide="bot" class="w-5 h-5"></i>
        </div>
        <div class="p-4 rounded-2xl rounded-tl-none bg-gray-100 dark:bg-gray-800 text-sm max-w-xl leading-relaxed whitespace-pre-line text-gray-900 dark:text-gray-100">
          ${reply}
        </div>
      </div>
    `;

    chatContainer.scrollTop = chatContainer.scrollHeight;
    lucide.createIcons();
  }, 400);
}

// ================= 9. CANLI POMODORO SAYACI =================
const POMODORO_DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60
};

function setPomodoroMode(mode) {
  clearInterval(appState.pomodoro.intervalId);
  appState.pomodoro.isRunning = false;
  appState.pomodoro.mode = mode;
  appState.pomodoro.timeLeft = POMODORO_DURATIONS[mode];

  const btnP = document.getElementById('btn-mode-pomodoro');
  const btnS = document.getElementById('btn-mode-short');
  const btnL = document.getElementById('btn-mode-long');

  [btnP, btnS, btnL].forEach(b => {
    b.className = 'flex-1 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:text-gray-900';
  });

  if (mode === 'pomodoro') btnP.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400';
  if (mode === 'shortBreak') btnS.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400';
  if (mode === 'longBreak') btnL.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400';

  updatePomodoroDisplay();
  updatePomodoroButtonState();
}

function togglePomodoroTimer() {
  if (appState.pomodoro.isRunning) {
    clearInterval(appState.pomodoro.intervalId);
    appState.pomodoro.isRunning = false;
  } else {
    appState.pomodoro.isRunning = true;
    appState.pomodoro.intervalId = setInterval(() => {
      if (appState.pomodoro.timeLeft > 0) {
        appState.pomodoro.timeLeft--;
        updatePomodoroDisplay();
      } else {
        clearInterval(appState.pomodoro.intervalId);
        appState.pomodoro.isRunning = false;
        playPomodoroBell();
        confetti({ particleCount: 50, spread: 60 });
        alert('🎉 Pomodoro seansı tamamlandı! Harika odaklandın.');
        updatePomodoroButtonState();
      }
    }, 1000);
  }
  updatePomodoroButtonState();
}

function resetPomodoroTimer() {
  clearInterval(appState.pomodoro.intervalId);
  appState.pomodoro.isRunning = false;
  appState.pomodoro.timeLeft = POMODORO_DURATIONS[appState.pomodoro.mode];
  updatePomodoroDisplay();
  updatePomodoroButtonState();
}

function updatePomodoroDisplay() {
  const mins = Math.floor(appState.pomodoro.timeLeft / 60);
  const secs = appState.pomodoro.timeLeft % 60;
  const str = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  document.getElementById('big-timer-display').innerText = str;
  document.getElementById('nav-pomodoro-timer').innerText = str;
  document.title = `(${str}) StudyTracker • 1has`;
}

function updatePomodoroButtonState() {
  const lbl = document.getElementById('label-timer-toggle');
  const icn = document.getElementById('icon-timer-play');
  if (appState.pomodoro.isRunning) {
    lbl.innerText = 'Durdur';
    icn.setAttribute('data-lucide', 'pause');
  } else {
    lbl.innerText = 'Başlat';
    icn.setAttribute('data-lucide', 'play');
  }
  lucide.createIcons();
}

function playPomodoroBell() {
  const audio = document.getElementById('audio-bell');
  if (audio) {
    audio.play().catch(() => {});
  }
}

// ================= 10. ADMIN & SETTINGS / DATA BACKUP =================
function saveSupabaseSettings() {
  const url = document.getElementById('setting-supabase-url').value.trim();
  const key = document.getElementById('setting-supabase-key').value.trim();
  appState.settings.supabaseUrl = url;
  appState.settings.supabaseKey = key;
  saveState();
  alert('✅ Supabase bağlantı bilgileri kaydedildi!');
}

function exportDataJSON() {
  const jsonStr = JSON.stringify(appState, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `StudyTracker_Yedek_1has_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importDataJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (imported.books && imported.exams) {
        appState = imported;
        saveState();
        alert('✅ Verileriniz başarıyla geri yüklendi!');
        renderDashboard();
        renderBooksGrid();
        renderExamsView();
        renderStudyPlanView();
      } else {
        alert('Geçersiz yedek dosyası biçimi.');
      }
    } catch {
      alert('Yedek dosyası okunurken hata oluştu.');
    }
  };
  reader.readAsText(file);
}

function clearAllData() {
  if (!confirm('TÜM KİTAPLARINIZ, DENEMELERİNİZ VE ÇALIŞMA PLANLARINIZ SİLİNECEK! Emin misiniz?')) return;
  localStorage.removeItem('studytracker_data_1has');
  location.reload();
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ================= 11. INIT ON PAGE LOAD =================
window.addEventListener('DOMContentLoaded', () => {
  // Theme initialization
  const savedTheme = localStorage.getItem('studytracker_theme_1has');
  if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }

  initializeDefaultData();
  renderDashboard();
  lucide.createIcons();
});
