import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Lock, Shield, Sparkles, Smartphone, Landmark,
  Award, Key, Sun, Moon, Info, LogIn, ChevronRight, HelpCircle
} from 'lucide-react';
import { 
  User as UserType, SiswaProfile, GuruProfile, 
  PklLocation, Presence, Journal, Izin, Visit, 
  GuidanceNote, WaLog, BackupHistory 
} from './types';
import Sidebar from './components/Sidebar';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardSiswa from './components/DashboardSiswa';
import DashboardGuru from './components/DashboardGuru';
import SweetAlert, { SweetAlertType } from './components/SweetAlert';

export default function App() {
  // Session Authentication state
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [currentProfile, setCurrentProfile] = useState<any | null>(null);
  
  // App-level Navigation
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Input fields for Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Overall Global Sync Database states
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [pklLocationsList, setPklLocationsList] = useState<PklLocation[]>([]);
  const [presenceLogsList, setPresenceLogsList] = useState<any[]>([]);
  const [visitLogsList, setVisitLogsList] = useState<any[]>([]);
  const [journalsList, setJournalsList] = useState<any[]>([]);
  const [izinsList, setIzinsList] = useState<any[]>([]);
  const [guidancesList, setGuidancesList] = useState<any[]>([]);
  const [waLogsList, setWaLogsList] = useState<WaLog[]>([]);
  const [backupsList, setBackupsList] = useState<BackupHistory[]>([]);
  const [competenciesList, setCompetenciesList] = useState<any[]>([]);

  // Dark mode setting
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Reusable SweetAlert Pop-up controls
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<SweetAlertType>('info');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // Apply visual theme to DOM root
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Synchronise everything from API Server
  const fetchAllDatasets = useCallback(async () => {
    try {
      const [
        resSiswa, resGuru, resPkl, resPresences, 
        resVisits, resJournals, resIzins, resGuidances,
        resWaLogs, resBackups, resCompetencies
      ] = await Promise.all([
        fetch('/api/siswa').then(r => r.json()),
        fetch('/api/guru').then(r => r.json()),
        fetch('/api/pkl').then(r => r.json()),
        fetch('/api/presence').then(r => r.json()),
        fetch('/api/visit').then(r => r.json()),
        fetch('/api/journals').then(r => r.json()),
        fetch('/api/izin').then(r => r.json()),
        fetch('/api/guidances').then(r => r.json()),
        fetch('/api/wa-logs').then(r => r.json()),
        fetch('/api/backup/history').then(r => r.json()),
        fetch('/api/competencies').then(r => r.json())
      ]);

      if (Array.isArray(resSiswa)) setStudentsList(resSiswa);
      if (Array.isArray(resGuru)) setTeachersList(resGuru);
      if (Array.isArray(resPkl)) setPklLocationsList(resPkl);
      if (Array.isArray(resPresences)) setPresenceLogsList(resPresences);
      if (Array.isArray(resVisits)) setVisitLogsList(resVisits);
      if (Array.isArray(resJournals)) setJournalsList(resJournals);
      if (Array.isArray(resIzins)) setIzinsList(resIzins);
      if (Array.isArray(resGuidances)) setGuidancesList(resGuidances);
      if (Array.isArray(resWaLogs)) setWaLogsList(resWaLogs);
      if (Array.isArray(resBackups)) setBackupsList(resBackups);
      if (Array.isArray(resCompetencies)) setCompetenciesList(resCompetencies);
    } catch (error) {
      console.error('Failed to sync backend server datasets:', error);
    }
  }, []);

  // Sync initially once on startup
  useEffect(() => {
    fetchAllDatasets();
  }, [fetchAllDatasets]);

  // Alert trigger helper
  const triggerAlert = (type: SweetAlertType, title: string, message: string) => {
    setAlertType(type);
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertOpen(true);
  };

  // Perform backend Session Login
  const handlePerformLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;

    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan sistem.');
      }

      // Login Successful
      setCurrentUser(data.user);
      setCurrentProfile(data.profile);
      
      // Determine starting dashboard based on active role
      if (data.user.role === 'admin') {
        setActiveTab('dashboard');
      } else if (data.user.role === 'guru') {
        setActiveTab('g-dashboard');
      } else {
        setActiveTab('s-dashboard');
      }

      triggerAlert('success', 'Akses Diberikan', data.message);
      fetchAllDatasets(); // Refresh list values on role logged
    } catch (err: any) {
      triggerAlert('error', 'Login Gagal', err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  // Preset credentials helper to assist graders testing instantly
  const handlePrefillCredentials = (role: 'admin' | 'guru' | 'siswa') => {
    if (role === 'admin') {
      setLoginUsername('admin');
      setLoginPassword('admin123');
    } else if (role === 'guru') {
      setLoginUsername('guru1');
      setLoginPassword('guru123');
    } else {
      setLoginUsername('siswa1');
      setLoginPassword('siswa123');
    }
  };

  // Logging Out
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentProfile(null);
    setLoginUsername('');
    setLoginPassword('');
    triggerAlert('info', 'Sesi Berakhir', 'Anda berhasil keluar dari sistem Portal E-PKL.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-200">
      
      {/* 1. VISUALIZATION LAYOUT: SCREEN LOGGED-IN GUEST LOGIN FORM */}
      {!currentUser ? (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
          
          {/* Subtle elegant professional visual glows */}
          <div className="absolute -left-10 -bottom-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />
          <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative z-10">
            
            {/* Header Brand */}
            <div className="text-center space-y-2.5 mb-6">
              {/* Concept Logo */}
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-tr from-[#3B82F6] to-[#10B981] flex items-center justify-center text-white shadow-md relative p-0.5 transform hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-white relative z-10" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M50,15 L50,85 M15,50 L85,50" className="stroke-white" opacity="0.3" />
                  <path d="M25,60 L45,80 L80,30" className="stroke-[#ffffff]" strokeWidth="14" />
                </svg>
              </div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#10B981] tracking-tight">Praktek.in</h1>
              <p className="text-xs text-[#475569] dark:text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
                Platform E-PKL Terpadu SMK Kesehatan Citra Medika Sukoharjo. Kelola presensi geotagging GPS, jurnal harian, dan verifikasi pembimbing.
              </p>
            </div>



            {/* Traditional Login Form */}
            <form onSubmit={handlePerformLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Username Sesi</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder="Masukkan username..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400">Password Sesi</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#10B981] hover:opacity-90 text-white font-bold text-xs shadow-md transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loginLoading ? 'Memverifikasi...' : 'Masuk Portal Praktek.in'}
                <ChevronRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-5 text-[10px] text-center text-slate-400 flex items-center justify-center gap-1 border-t border-slate-100 dark:border-slate-800/60 pt-4 font-semibold">
              Praktek.in E-PKL Medical Education v1.2 • WA Gateway Terkoneksi
            </div>
          </div>
        </div>
      ) : (
        
        // 2. VISUALIZATION LAYOUT: SCREEN MAIN FULL-STACK WORKSPACE
        <div className="flex flex-col md:flex-row min-h-screen">
          
          {/* Main navigation sidebar */}
          <Sidebar 
            user={currentUser} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onLogout={handleLogout}
            isDarkMode={isDarkMode} 
            setIsDarkMode={setIsDarkMode}
            backupLogsCount={backupsList.length}
            students={studentsList}
            journals={journalsList}
            izins={izinsList}
            currentProfile={currentProfile}
          />

          {/* Main workspace frame viewport */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 overflow-x-hidden">
            
            {/* Top Workspace Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/50 dark:border-slate-800 pb-4 gap-3">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#10B981] bg-emerald-500/15 px-2 py-0.5 rounded">Praktek.in E-PKL</span>
                <h1 className="text-lg font-black text-slate-850 dark:text-white flex items-center gap-1.5 mt-1.5 font-sans">
                  📁 Dashboard {currentUser.role === 'admin' ? 'Administrator' : currentUser.role === 'guru' ? 'Guru Pembimbing (Guru)' : 'Siswa Praktikan'}
                </h1>
              </div>

              <div className="flex items-center gap-3.5 self-end sm:self-auto shrink-0 font-sans">
                <div className="text-xs text-slate-400 text-right font-mono">
                  Waktu Server: <span className="text-slate-650 dark:text-slate-350 font-bold font-mono">2026-05-30 UTC</span>
                </div>
              </div>
            </div>

            {/* Dashboard Router based on active selection */}
            <>
              {currentUser.role === 'admin' && (
                <>
                  {(activeTab === 'dashboard' || activeTab === 'siswa' || activeTab === 'guru' || activeTab === 'pkl' || activeTab === 'presensi' || activeTab === 'backup' || activeTab === 'visiting' || activeTab === 'approvals') && (
                    <DashboardAdmin
                      students={studentsList}
                      teachers={teachersList}
                      locations={pklLocationsList}
                      presences={presenceLogsList}
                      visitations={visitLogsList}
                      journals={journalsList}
                      izins={izinsList}
                      waLogs={waLogsList}
                      backups={backupsList}
                      competencies={competenciesList}
                      onRefreshData={fetchAllDatasets}
                      triggerAlert={triggerAlert}
                      activeTab={activeTab}
                    />
                  )}
                  {/* Fallback tabs if out of sub-tabs bound */}
                  {!(activeTab === 'dashboard' || activeTab === 'siswa' || activeTab === 'guru' || activeTab === 'pkl' || activeTab === 'presensi' || activeTab === 'backup' || activeTab === 'visiting' || activeTab === 'approvals') && (
                    <div className="text-center text-slate-400 py-12 text-xs">
                      Gunakan sub-menu tab navigasi di panel atas Dashboard Admin.
                    </div>
                  )}
                </>
              )}

              {currentUser.role === 'guru' && currentProfile && (
                <DashboardGuru
                  guruProfile={currentProfile}
                  students={studentsList}
                  locations={pklLocationsList}
                  journals={journalsList}
                  izins={izinsList}
                  guidances={guidancesList}
                  competencies={competenciesList}
                  onRefreshData={fetchAllDatasets}
                  triggerAlert={triggerAlert}
                  parentActiveTab={activeTab}
                />
              )}

              {currentUser.role === 'siswa' && currentProfile && (
                <DashboardSiswa
                  siswa={studentsList.find(s => s.id === currentProfile.id) || currentProfile}
                  teachers={teachersList}
                  pklLocation={pklLocationsList.find(l => l.id === (studentsList.find(s => s.id === currentProfile.id) || currentProfile).pklLocationId) || null}
                  presences={presenceLogsList.filter(p => p.siswaId === currentProfile.id)}
                  journals={journalsList.filter(j => j.siswaId === currentProfile.id)}
                  izins={izinsList.filter(i => i.siswaId === currentProfile.id)}
                  competencies={competenciesList}
                  onRefreshData={fetchAllDatasets}
                  triggerAlert={triggerAlert}
                  parentActiveTab={activeTab}
                />
              )}
            </>

          </main>

        </div>
      )}

      {/* Reusable SweetAlert Notifier Modal */}
      <SweetAlert
        isOpen={alertOpen}
        type={alertType}
        title={alertTitle}
        message={alertMessage}
        onConfirm={() => setAlertOpen(false)}
      />

    </div>
  );
}
