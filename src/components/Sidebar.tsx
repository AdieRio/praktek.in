import React, { useState } from 'react';
import { 
  BarChart3, Users, Landmark, MapPin, 
  BookOpen, CalendarDays, Key, LogOut, 
  Menu, X, Smartphone, Moon, Sun, Shield, 
  Map, UserSquare2, Award, ClipboardCheck, 
  BellRing, Database, Settings, HelpCircle
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  backupLogsCount: number;
  students?: any[];
  journals?: any[];
  izins?: any[];
  currentProfile?: any;
}

export default function Sidebar({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  isDarkMode,
  setIsDarkMode,
  backupLogsCount,
  students = [],
  journals = [],
  izins = [],
  currentProfile
}: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Define tab navigation based on role with computed notifications
  const getTabs = () => {
    switch (user.role) {
      case 'admin': {
        const pendingAdminJournals = journals.filter(j => j.status === 'pending').length;
        const pendingAdminIzins = izins.filter(i => i.status === 'pending').length;
        const pendingAdminReports = students.filter(s => s.reportStatus === 'pending').length;
        const totalPendingApprovals = pendingAdminJournals + pendingAdminIzins;

        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'siswa', label: 'Data Siswa', icon: Users, badge: pendingAdminReports || undefined },
          { id: 'guru', label: 'Data Guru', icon: UserSquare2 },
          { id: 'pkl', label: 'Tempat PKL', icon: Landmark },
          { id: 'presensi', label: 'Monitoring Absensi', icon: ClipboardCheck },
          { id: 'visiting', label: 'Kunjungan Guru', icon: MapPin },
          { id: 'approvals', label: 'Laporan & Izin', icon: BookOpen, badge: totalPendingApprovals || undefined },
          { id: 'backup', label: 'Backup & WA Logs', icon: Database, badge: backupLogsCount || undefined }
        ];
      }
      case 'guru': {
        const myStudents = students.filter(s => s.pembimbingId === currentProfile?.id);
        const studentIds = myStudents.map(s => s.id);
        const pendingMyReports = myStudents.filter(s => s.reportStatus === 'pending').length;
        const pendingMyJournals = journals.filter(j => studentIds.includes(j.siswaId) && j.status === 'pending').length;
        const pendingMyIzins = izins.filter(i => studentIds.includes(i.siswaId) && i.status === 'pending').length;

        return [
          { id: 'g-dashboard', label: 'Dashboard Bimbingan', icon: BarChart3 },
          { id: 'g-monitoring', label: 'Monitoring Siswa', icon: ClipboardCheck, badge: pendingMyReports || undefined },
          { id: 'g-visit', label: 'Jurnal Kunjungan', icon: MapPin },
          { id: 'g-validation', label: 'Validasi Jurnal', icon: BookOpen, badge: pendingMyJournals || undefined },
          { id: 'g-izins', label: 'Approval Izin', icon: CalendarDays, badge: pendingMyIzins || undefined },
          { id: 'g-grading', label: 'Penilaian Kompetensi', icon: Award }
        ];
      }
      case 'siswa': {
        const myProfile = students.find(s => s.id === currentProfile?.id) || currentProfile;
        const myRejectedJournals = journals.filter(j => j.siswaId === currentProfile?.id && j.status === 'rejected').length;
        const myRejectedIzins = izins.filter(i => i.siswaId === currentProfile?.id && i.status === 'rejected').length;
        
        const isReportRejected = myProfile?.reportStatus === 'rejected';
        const isReportPending = myProfile?.reportStatus === 'pending';
        const reportBadge = isReportRejected ? 'Revisi ⚠️' : isReportPending ? '⏳ Reviu' : undefined;

        return [
          { id: 's-dashboard', label: 'Beranda Siswa', icon: BarChart3 },
          { id: 's-presensi', label: 'Presensi PKL', icon: Smartphone },
          { id: 's-journal', label: 'Jurnal Harian', icon: BookOpen, badge: myRejectedJournals ? `${myRejectedJournals} Revisi` : undefined },
          { id: 's-izin', label: 'Pengajuan Izin', icon: CalendarDays, badge: myRejectedIzins ? 'Revisi' : undefined },
          { id: 's-results', label: 'Laporan & Nilai', icon: Award, badge: reportBadge }
        ];
      }
      default:
        return [];
    }
  };

  const tabs = getTabs();

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-4 py-3 md:hidden sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#10B981] p-0.5 flex items-center justify-center text-white shadow-xs">
            <svg viewBox="0 0 100 100" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
              <path d="M50,15 L50,85 M15,50 L85,50" className="stroke-white" opacity="0.3" />
              <path d="M25,60 L45,80 L80,30" className="stroke-[#ffffff]" strokeWidth="14" />
            </svg>
          </div>
          <span className="font-extrabold text-slate-800 dark:text-slate-100 tracking-tight text-base">Praktek.in</span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Theme switcher */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-350 dark:hover:bg-slate-800 transition-colors"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Slide-out Backdrop for Mobile Drawer */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main Navigation Sidebar Container */}
      <aside className={`
        fixed md:static inset-y-0 left-0 bg-slate-900 dark:bg-slate-950 text-slate-300 border-r border-slate-850 w-64 z-50 flex flex-col justify-between transition-transform duration-300 transform md:transform-none shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Sidebar Header Brand Area */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#3B82F6] to-[#10B981] p-0.5 flex items-center justify-center text-white shadow-sm">
              <svg viewBox="0 0 100 100" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
                <path d="M50,15 L50,85 M15,50 L85,50" className="stroke-white" opacity="0.3" />
                <path d="M25,60 L45,80 L80,30" className="stroke-[#ffffff]" strokeWidth="14" />
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-white tracking-tight text-md leading-none">Praktek.in</span>
              <span className="block text-[8px] font-bold text-[#10B981] uppercase tracking-widest leading-none mt-1">SMK CITRA MEDIKA</span>
            </div>
          </div>
          
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User profile capsule */}
        <div className="px-4 py-4 mx-2 mt-4 bg-slate-800/40 rounded-2xl border border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-500/10 flex flex-col items-center justify-center font-bold text-blue-400 shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="block font-bold text-white text-sm truncate leading-snug">{user.name}</span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 mt-1 rounded-md text-blue-400 bg-blue-500/10 leading-none">
                <Shield className="h-2.5 w-2.5" />
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Menu Navigation Items (Body) */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-550 px-3 mb-2">
            Menu Navigasi
          </span>
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`
                  w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer group active:scale-98
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white font-bold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-350'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md leading-none tracking-tight shrink-0 transition-transform ${
                    isActive 
                      ? 'bg-white text-indigo-700 shadow-xs' 
                      : typeof tab.badge === 'string' && (tab.badge.includes('Revisi') || tab.badge.includes('⚠️'))
                        ? 'bg-rose-500/10 text-rose-450 border border-rose-500/20 animate-pulse'
                        : 'bg-amber-500 text-white shadow-xs'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Dark Mode toggle (Desktop version) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-3">
              {isDarkMode ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-500" />}
              <span>Mode Tampilan</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 rounded font-bold text-slate-300">
              {isDarkMode ? 'Malam' : 'Siang'}
            </span>
          </button>

          {/* Quick WA gateway notification diagnostic shortcut */}
          <div className="px-3 py-2 bg-slate-800/40 text-[11px] text-slate-500 rounded-lg border border-slate-850">
            WA Gateway: <span className="text-emerald-500 font-bold">Terhubung ●</span>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer active:scale-95"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>
    </>
  );
}
