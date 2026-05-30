import React, { useState, useEffect, useRef } from 'react';
import { Bell, Shield, Info, Award, AlertCircle, FileText, CheckCircle2, Clipboard } from 'lucide-react';
import { User, SiswaProfile, Izin } from '../types';

interface NotificationPanelProps {
  user: User;
  students: SiswaProfile[];
  izins: Izin[];
  currentProfile: any;
}

interface AppNotification {
  id: string;
  icon: React.ReactNode;
  title: string;
  message: string;
  badgeType: 'info' | 'success' | 'warning' | 'danger';
  time: string;
}

export default function NotificationPanel({ user, students, izins, currentProfile }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const list: AppNotification[] = [];

    if (user.role === 'siswa' && currentProfile) {
      const myStudentProfile = students.find(s => s.id === currentProfile.id) || currentProfile;
      const myIzins = izins.filter(i => i.siswaId === currentProfile.id);

      // 1. Izin Statuses Notifications
      myIzins.forEach((iz) => {
        if (iz.status === 'approved') {
          list.push({
            id: `iz-app-${iz.id}`,
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            title: 'Pengajuan Izin Disetujui',
            message: `Absensi luar/izin Anda tanggal ${iz.startDate} s/d ${iz.endDate} disetujui Guru pembimbing.`,
            badgeType: 'success',
            time: 'Hari ini'
          });
        } else if (iz.status === 'rejected') {
          list.push({
            id: `iz-rej-${iz.id}`,
            icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
            title: 'Pengajuan Izin Ditolak',
            message: `Izin tanggal ${iz.startDate} dicatat ditolak. Alasan: "${iz.reason}".`,
            badgeType: 'danger',
            time: 'Perlu Tinjauan'
          });
        } else if (iz.status === 'pending') {
          list.push({
            id: `iz-pend-${iz.id}`,
            icon: <Clipboard className="h-4 w-4 text-amber-500 animate-pulse" />,
            title: 'Izin Menunggu Persetujuan',
            message: `Izin sakit/terlambat sedang ditinjau pembimbing akademik sekolah.`,
            badgeType: 'warning',
            time: 'Menunggu'
          });
        }
      });

      // 2. Report Upload & Scores (Nilai Observasi)
      if (myStudentProfile.reportStatus === 'approved') {
        list.push({
          id: 'rep-app',
          icon: <Award className="h-4 w-4 text-emerald-500" />,
          title: 'Laporan PKL Disetujui! 🎉',
          message: `Laporan revisi disetujui dengan Nilai Akhir: ${myStudentProfile.reportGrade || 85}. Catatan: "${myStudentProfile.reportNotes || 'Lulus Memenuhi Syarat'}"`,
          badgeType: 'success',
          time: 'Terverifikasi'
        });
      } else if (myStudentProfile.reportStatus === 'rejected') {
        list.push({
          id: 'rep-rej',
          icon: <AlertCircle className="h-4 w-4 text-rose-500 animate-bounce" />,
          title: 'Revisi Laporan PKL',
          message: `Draf laporan Anda dikembalikan. Catatan Guru: "${myStudentProfile.reportNotes || 'Revisi bagian kesimpulan'}"`,
          badgeType: 'danger',
          time: 'Revisi Segera'
        });
      } else if (myStudentProfile.reportStatus === 'pending') {
        list.push({
          id: 'rep-pend',
          icon: <FileText className="h-4 w-4 text-blue-500 animate-pulse" />,
          title: 'Laporan Sedang Diperiksa',
          message: 'Berkas PDF Laporan Observasi Anda telah diterima di platform dan sedang diperiksa.',
          badgeType: 'info',
          time: 'Antrean Reviu'
        });
      }

      // 3. Competency Progress (Capaian Kompetensi)
      if (myStudentProfile.progressCompetency && myStudentProfile.progressCompetency > 0) {
        list.push({
          id: 'comp-prog',
          icon: <CheckCircle2 className="h-4 w-4 text-indigo-500" />,
          title: 'Kualifikasi Kompetensi Diperbarui',
          message: `Selamat, pencapaian target skl Anda sudah menyentuh angka ${myStudentProfile.progressCompetency}%.`,
          badgeType: 'info',
          time: 'Baru'
        });
      }
    }

    if (user.role === 'guru' && currentProfile) {
      const myStudents = students.filter(s => s.pembimbingId === currentProfile.id);
      const studentIds = myStudents.map(s => s.id);
      const pendingIzins = izins.filter(i => studentIds.includes(i.siswaId) && i.status === 'pending');
      const pendingReports = myStudents.filter(s => s.reportStatus === 'pending');

      // 1. Pending Izin Requests
      pendingIzins.forEach((iz) => {
        const student = myStudents.find(s => s.id === iz.siswaId);
        list.push({
          id: `guru-iz-${iz.id}`,
          icon: <AlertCircle className="h-4 w-4 text-amber-500" />,
          title: `Pengajuan Izin: ${student?.name || 'Siswa'}`,
          message: `Mengajukan permohonan dispensasi surat sakit: "${iz.reason}". Segera validasi di tab izin.`,
          badgeType: 'warning',
          time: 'URGENT'
        });
      });

      // 2. Pending Report Valids
      pendingReports.forEach((s) => {
        list.push({
          id: `guru-rep-${s.id}`,
          icon: <FileText className="h-4 w-4 text-blue-500" />,
          title: `Draf Laporan PKL: ${s.name}`,
          message: 'Mengunggah draf format PDF Laporan Observasi PKL. Harap berikan evaluasi skor dan input kelulusan.',
          badgeType: 'info',
          time: 'Butuh Nilai'
        });
      });

      // 3. Underperforming competencies warnings
      myStudents.forEach((s) => {
        if (s.progressCompetency && s.progressCompetency < 60) {
          list.push({
            id: `guru-lowcomp-${s.id}`,
            icon: <AlertCircle className="h-4 w-4 text-rose-500" />,
            title: `Butuh Bimbingan: ${s.name}`,
            message: `Capaian kompetensi magang masih rendah (${s.progressCompetency}%). Berikan penugasan tambahan.`,
            badgeType: 'danger',
            time: 'Perhatian'
          });
        }
      });
    }

    if (user.role === 'admin') {
      const pendingAllIzins = izins.filter(i => i.status === 'pending');
      if (pendingAllIzins.length > 0) {
        list.push({
          id: 'admin-izins',
          icon: <Shield className="h-4 w-4 text-blue-500" />,
          title: 'Pengajuan Dispensasi Menumpuk',
          message: `Ada ${pendingAllIzins.length} persetujuan dispensasi izin/sakit siswa yang belum dikonfirmasi guru bimbingan.`,
          badgeType: 'info',
          time: 'Sistem'
        });
      }
    }

    setNotifications(list);
  }, [user, students, izins, currentProfile]);

  return (
    <div className="relative" ref={dropdownRef} id="top-notification-bell-widget">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-[#3B82F6] hover:border-[#3B82F6]/30 dark:hover:text-[#10B981] cursor-pointer transition-all focus:outline-none flex items-center justify-center"
        aria-label="Notifikasi"
      >
        <Bell className="h-4.5 w-4.5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white font-sans animate-bounce shadow-md">
            {notifications.length}
          </span>
        )}
      </button>

      {/* Dropdown / Botton Sheet Container */}
      {isOpen && (
        <>
          {/* Frosted glass backdrop overlay - Mobile only */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 sm:hidden animate-fadeIn"
            onClick={() => setIsOpen(false)}
          />

          <div className="fixed bottom-0 inset-x-0 rounded-t-3xl bg-white dark:bg-slate-900 z-[60] flex flex-col max-h-[85vh] border-t border-slate-100 dark:border-slate-800 shadow-2xl sm:absolute sm:bottom-auto sm:top-full sm:right-0 sm:left-auto sm:inset-x-auto sm:w-96 sm:max-h-[480px] sm:rounded-2xl sm:border sm:mt-2.5 sm:shadow-xl sm:z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 animate-fadeIn">
            {/* Cute Native Grab Handle (shows only on mobile for interactive bottom-sheet feel) */}
            <div className="mx-auto w-12 h-1.5 bg-slate-200 dark:bg-slate-750 rounded-full my-2 sm:hidden shrink-0" />

            {/* Header */}
            <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
              <span className="font-extrabold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-widest flex items-center gap-1.5 font-sans">
                🔔 Pusat Notifikasi E-PKL
              </span>
              <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-450 px-2.5 py-1 rounded-full">
                {notifications.length} Aktif
              </span>
            </div>

            {/* List items with improved touch targets & scrolling */}
            <div className="overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 font-sans flex-1 max-h-[50vh] sm:max-h-[340px]">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-4 hover:bg-slate-50/70 dark:hover:bg-slate-950/20 transition-all flex gap-3 items-start text-xs align-top cursor-default active:bg-slate-50 dark:active:bg-slate-950/10 sm:active:bg-transparent"
                >
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl shrink-0 mt-0.5">
                    {notif.icon}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug block">
                        {notif.title}
                      </span>
                      <span className="text-[8px] uppercase font-bold tracking-wider text-slate-400 shrink-0 font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                        {notif.time}
                      </span>
                    </div>
                    <p className="text-[#475569] dark:text-slate-400 text-[11px] leading-relaxed font-semibold">
                      {notif.message}
                    </p>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-12 text-slate-400 font-sans text-xs flex flex-col items-center justify-center space-y-2">
                  <span className="text-3xl">🎉</span>
                  <p className="font-semibold text-slate-500">Semua aktivitas aman terkontrol!</p>
                  <p className="text-[10px] text-slate-400 leading-snug px-7">
                    Belum ada notifikasi baru mengenai dispensasi izin, penilaian laporan observasi, atau kemajuan kompetensi magang semester ini.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950/20 text-center shrink-0">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center py-2.5 sm:py-1.5 rounded-xl text-xs sm:text-[11px] text-slate-650 hover:text-slate-900 border border-slate-200 dark:border-slate-800 font-bold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer shadow-xs"
              >
                Tutup Panel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
