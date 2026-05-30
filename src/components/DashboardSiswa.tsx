import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, MapPin, ClipboardCheck, BookOpen, 
  CalendarDays, Award, Star, CheckCircle2, 
  XCircle, AlertTriangle, RefreshCw, Upload, 
  Download, FileSpreadsheet, Eye, User, Key, Info,
  Smartphone, EyeOff, Sparkles, LogIn, LogOut
} from 'lucide-react';
import { SiswaProfile, PklLocation, Presence, Journal, Izin } from '../types';
import MapContainer from './MapContainer';

interface DashboardSiswaProps {
  siswa: SiswaProfile;
  teachers?: any[];
  pklLocation: PklLocation | null;
  presences: Presence[];
  journals: Journal[];
  izins: Izin[];
  competencies?: any[];
  onRefreshData: () => void;
  triggerAlert: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  parentActiveTab?: string;
}

export default function DashboardSiswa({
  siswa,
  teachers,
  pklLocation,
  presences,
  journals,
  izins,
  competencies,
  onRefreshData,
  triggerAlert,
  parentActiveTab
}: DashboardSiswaProps) {
  // Navigation tabs for student
  const [activeTab, setActiveTab] = useState<'presensi' | 'jurnal' | 'izin' | 'nilai'>('presensi');

  // Helper check presence log of today
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPresence = presences.find(p => p.date === todayStr);

  // Find teacher supervisor name
  const pembimbing = teachers?.find(t => t.id === siswa.pembimbingId);
  const pembimbingName = pembimbing?.name || siswa.pembimbingName || 'Belum diplot';

  // Sync internal tab state if parent activeTab changes from Sidebar click
  useEffect(() => {
    if (parentActiveTab) {
      if (parentActiveTab === 's-presensi') {
        setActiveTab('presensi');
      } else if (parentActiveTab === 's-journal') {
        setActiveTab('jurnal');
      } else if (parentActiveTab === 's-izin') {
        setActiveTab('izin');
      } else if (parentActiveTab === 's-results') {
        setActiveTab('nilai');
      }
    }
  }, [parentActiveTab]);

  // GPS Simulation state
  const [siswaLat, setSiswaLat] = useState<number | null>(null);
  const [siswaLng, setSiswaLng] = useState<number | null>(null);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [hasClickedRealGps, setHasClickedRealGps] = useState(false);
  const [autoPresence, setAutoPresence] = useState(false);

  // Selfie capture states
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Journal form states
  const [journalText, setJournalText] = useState('');
  const [journalRating, setJournalRating] = useState(4);
  const [submittingJournal, setSubmittingJournal] = useState(false);

  // Izin form states
  const [izinType, setIzinType] = useState<'sakit' | 'izin'>('sakit');
  const [izinStart, setIzinStart] = useState('');
  const [izinEnd, setIzinEnd] = useState('');
  const [izinReason, setIzinReason] = useState('');
  const [izinProof, setIzinProof] = useState<string | null>(null);
  const [submittingIzin, setSubmittingIzin] = useState(false);

  // PDF report upload state
  const [pdfAttachedName, setPdfAttachedName] = useState<string | null>(null);
  const [pdfFileContent, setPdfFileContent] = useState<string | null>(null);
  const [submittingPdf, setSubmittingPdf] = useState(false);

  // Set initial simulated coordinates matching office (to let students pass easily by default)
  useEffect(() => {
    if (pklLocation) {
      // Direct exact match
      setSiswaLat(pklLocation.latitude);
      setSiswaLng(pklLocation.longitude);
    }
  }, [pklLocation]);

  // Helper to calculate distance in meters
  const getSiswaDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  };

  const currentSiswaDistance = (siswaLat !== null && siswaLng !== null && pklLocation)
    ? getSiswaDistanceMeters(siswaLat, siswaLng, pklLocation.latitude, pklLocation.longitude)
    : null;

  const isSiswaWithinRadius100m = currentSiswaDistance !== null && currentSiswaDistance <= 100;

  // Auto presence toggle behavior based on active GPS and 100m radius
  useEffect(() => {
    if (siswaLat !== null && siswaLng !== null && isSiswaWithinRadius100m) {
      if (!autoPresence) {
        setAutoPresence(true);
        triggerAlert('success', 'Otomatis Absen Menyala', 'Sistem mendeteksi GPS aktif dalam radius 100m kantor. Fitur automatis absen masuk/pulang menyala otomatis!');
      }
    }
  }, [siswaLat, siswaLng, isSiswaWithinRadius100m]);

  // QR Code generator using simple Canvas on mount
  useEffect(() => {
    const canvas = document.getElementById('siswa-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 120, 120);
        ctx.fillStyle = '#2563eb';
        
        // Draw nice dummy abstract code qr matrix patterns
        for (let i = 4; i < 116; i += 8) {
          for (let j = 4; j < 116; j += 8) {
            if (Math.random() > 0.4 || (i < 30 && j < 30) || (i > 85 && j < 30) || (i < 30 && j > 85)) {
              ctx.fillRect(i, j, 6, 6);
            }
          }
        }
        // Draw standard QR corner squares
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#2563eb';
        ctx.strokeRect(8, 8, 22, 22);
        ctx.strokeRect(90, 8, 22, 22);
        ctx.strokeRect(8, 90, 22, 22);
      }
    }
  }, [siswa]);

  // Fetch true GPS location of student browser (Fallback if iframe allows)
  const handleFetchTrueGps = () => {
    setHasClickedRealGps(true);
    setFetchingGps(true);
    if (!navigator.geolocation) {
      triggerAlert('error', 'GPS Tidak Didukung', 'Browser Anda tidak mensupport layanan Geolocation.');
      setFetchingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setSiswaLat(pos.coords.latitude);
        setSiswaLng(pos.coords.longitude);
        setFetchingGps(false);
        triggerAlert('success', 'GPS Terdeteksi', 'Lokasi geografis Anda berhasil dimuat secara otomatis.');
      },
      (err) => {
        setFetchingGps(false);
        // Provide friendly instruction, as standard preview iframes can block hardware access
        triggerAlert(
          'info', 
          'Iframe Limitasi GPS', 
          'Akses sensor GPS terblokir oleh iframe sandboxing. Silakan gunakan tombol simulasi lokasi pada peta di bawah dengan aman!'
        );
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // CAMERA SELFE CAPTURE API ACTIONS
  const startCamera = async () => {
    setCameraActive(true);
    setCapturedSelfie(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      // Fallback
      setCameraActive(false);
      triggerAlert('info', 'Webcam Terblokir', 'Sistem gagal mengakses kamera (biasanya disebabkan sandboxing browser). Unggah foto selfie manual lewat tombol di bawah.');
    }
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Add watermark overlay for E-PKL evidence
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px monospace';
        const timestamp = new Date().toLocaleString();
        ctx.fillText(`E-PKL VERIFIED | GPS: ${siswaLat?.toFixed(4)},${siswaLng?.toFixed(4)} | ${timestamp}`, 10, canvas.height - 15);

        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedSelfie(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleManualSelfieUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCapturedSelfie(event.target.result as string);
          triggerAlert('success', 'Selfie Dimuat', 'Foto berhasil diunggah.');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // PRESENCE TRIGGER SUBMISSIONS
  const handleCheckIn = async () => {
    if (!capturedSelfie) {
      triggerAlert('warning', 'Selfie Wajib', 'Mohon ambil foto selfie Anda sebelum mendaftarkan presensi.');
      return;
    }
    if (siswaLat === null || siswaLng === null) {
      triggerAlert('warning', 'GPS Wajib', 'Sistem harus mengkonfirmasi kordinat GPS Anda.');
      return;
    }

    try {
      const res = await fetch('/api/presence/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswa.id,
          latitude: siswaLat,
          longitude: siswaLng,
          selfie: capturedSelfie
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Terjadi gangguan presensi.');
      }
      triggerAlert('success', 'Absen Masuk Berhasil', 'Presensi MASUK Anda hari ini berhasil disetujui. WA Notifikasi otomatis terpancar!');
      setCapturedSelfie(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Presensi Ditolak', err.message);
    }
  };

  const handleCheckOut = async () => {
    if (!capturedSelfie) {
      triggerAlert('warning', 'Selfie Wajib', 'Silakan ambil foto selfie pulang Anda.');
      return;
    }
    if (siswaLat === null || siswaLng === null) {
      triggerAlert('warning', 'GPS Wajib', 'Koordinat Anda belum terbaca.');
      return;
    }

    try {
      const res = await fetch('/api/presence/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswa.id,
          latitude: siswaLat,
          longitude: siswaLng,
          selfie: capturedSelfie
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error);
      }
      triggerAlert('success', 'Absen Pulang Berhasil', 'Silakan merapikan meja kerja. Presensi pulang sukses disimpan.');
      setCapturedSelfie(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Presensi Ditolak', err.message);
    }
  };

  // Automatic check-in/out once a photo is captured or uploaded and auto-presence is active
  useEffect(() => {
    if (autoPresence && isSiswaWithinRadius100m && capturedSelfie) {
      if (!todayPresence?.checkInTime) {
        handleCheckIn();
      } else if (!todayPresence?.checkOutTime) {
        handleCheckOut();
      }
    }
  }, [autoPresence, isSiswaWithinRadius100m, capturedSelfie, todayPresence]);

  // JOURNAL SUBMISSION
  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) {
      triggerAlert('warning', 'Jurnal Belum Diisi', 'Silakan tulis deskripsi kegiatan harian Anda terlebih dahulu sebelum mengirim!');
      return;
    }
    setSubmittingJournal(true);
    try {
      const res = await fetch('/api/journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswa.id,
          activity: journalText,
          rating: journalRating
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Jurnal Tersimpan', 'Aktivitas harian berhasil dilaporkan ke pembimbing untuk divalidasi!');
      setJournalText('');
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setSubmittingJournal(false);
    }
  };

  // IZIN SUBMISSION
  const handleIzinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setIzinProof(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!izinStart || !izinEnd || !izinReason) {
      triggerAlert('warning', 'Lengkapi Form', 'Silakan isi parameter tanggal dsn alasan izin.');
      return;
    }
    setSubmittingIzin(true);
    try {
      const res = await fetch('/api/izin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: siswa.id,
          startDate: izinStart,
          endDate: izinEnd,
          type: izinType,
          reason: izinReason,
          proofUrl: izinProof || undefined
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Pengajuan Terkirim', 'Izin Anda telah diteruskan ke Guru Pembimbing. Tunggu konfirmasi WA.');
      setIzinStart('');
      setIzinEnd('');
      setIzinReason('');
      setIzinProof(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setSubmittingIzin(false);
    }
  };

  // PDF OBSERVATION REPORT UPLOAD
  const handlePdfUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfAttachedName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPdfFileContent(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePdfReport = async () => {
    if (!pdfAttachedName) return;
    setSubmittingPdf(true);
    try {
      const res = await fetch(`/api/siswa/${siswa.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportFileName: pdfAttachedName,
          reportFileContent: pdfFileContent || "Dokumen PDF Laporan Akhir Observasi PKL",
          reportStatus: "pending"
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal mengunggah laporan.');
      }
      triggerAlert('success', 'Laporan Terkirim', `Dokumen "${pdfAttachedName}" berhasil diunggah dan diajukan ke Guru Pembimbing Anda.`);
      setPdfAttachedName(null);
      setPdfFileContent(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal Unggah', err.message);
    } finally {
      setSubmittingPdf(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 1. LEFT SIDE: Student Quick Info, Profile Card dsn QR Code */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Dynamic E-ID QR Card Badge */}
        <div className="bg-gradient-to-br from-[#3B82F6] to-[#10B981] rounded-2xl p-5 text-white shadow-md space-y-4 relative overflow-hidden">
          {/* Ambient light glow */}
          <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 h-28 w-28 rounded-full bg-white/15 blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black tracking-widest bg-white/20 px-2 py-0.5 rounded">E-PKL STUDENT BADGE</span>
            <Sparkles className="h-4 w-4 text-emerald-300 animate-pulse" />
          </div>

          <div className="flex items-center gap-4 py-2 border-b border-white/10">
            {/* Visual Canvas QR Code */}
            <div className="p-1 px-[5px] bg-white rounded-lg inline-block shrink-0 shadow-sm">
              <canvas id="siswa-qr-canvas" className="h-24 w-24 object-contain" />
              <span className="block text-[8px] text-center font-bold font-mono text-[#3B82F6] mt-1 uppercase">NISN: {siswa.nisn}</span>
            </div>

            <div className="min-w-0 flex-1 space-y-1 text-xs">
              <h3 className="font-extrabold text-base truncate">{siswa.name}</h3>
              <p className="font-semibold text-[#ecfdf5]">{siswa.className}</p>
              <p className="font-mono text-[10px] text-emerald-100">Mitra: {pklLocation?.name || 'Bukan Mitra'}</p>
              <p className="font-mono text-[10px] text-emerald-150 font-bold">Pembimbing: {pembimbingName}</p>
              <div className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-extrabold uppercase">
                STATUS: AKTIF PENEMPATAN
              </div>
            </div>
          </div>

          <p className="text-[10px] text-emerald-50 leading-snug">
            Gunakan QR Code di atas sebagai bukti identitas siswa magang saat audit kunjungan mendadak oleh pengawas sekolah.
          </p>
        </div>

        {/* Competency Indicators Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="font-black text-slate-850 dark:text-slate-100 text-sm flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#10B981] animate-bounce" />
              Penilaian Kompetensi & Progres
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Penilaian disubmit secara terpadu oleh guru pembimbing.</p>
          </div>

          <div className="space-y-2.5">
            {(competencies && competencies.length > 0 ? competencies : [
              { id: 'instalasiJaringan', name: 'Instalasi Jaringan', code: 'KOMP01' },
              { id: 'pemrogramanWeb', name: 'Pemrograman Web (Full-stack)', code: 'KOMP02' },
              { id: 'databaseManagement', name: 'Manajemen Basis Data', code: 'KOMP03' },
              { id: 'troubleshooting', name: 'Troubleshooting Sistem', code: 'KOMP04' },
              { id: 'softSkills', name: 'Sikap & Kedisiplinan Kerja (Soft Skills)', code: 'KOMP05' }
            ]).map((c: any) => {
              const score = siswa.grades?.[c.id] ?? siswa.grades?.[c.code] ?? siswa.grades?.[c.name] ?? 0;
              
              // Dynamic status color styles for a premium vibe
              const badgeStyle = score >= 85
                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20'
                : score >= 70
                ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/20';

              const barGradient = score >= 85
                ? 'from-emerald-500 to-teal-400'
                : score >= 70
                ? 'from-blue-500 to-indigo-500'
                : 'from-amber-500 to-orange-400';

              return (
                <div 
                  key={c.id} 
                  className="group relative p-3 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 border border-slate-100 dark:border-slate-800/80 rounded-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                          {c.code}
                        </span>
                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-705" />
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate">
                          Kompetensi PKL
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                        {c.name}
                      </h5>
                    </div>
                    
                    <div className={`px-2.5 py-1 rounded-lg border text-xs font-black font-mono flex items-baseline gap-0.5 shadow-2xs ${badgeStyle}`}>
                      <span className="text-[13px]">{score}</span>
                      <span className="text-[9px] opacity-65 font-medium">/100</span>
                    </div>
                  </div>
                  
                  <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-100/50 dark:border-slate-800/50">
                    <div 
                      className={`h-full bg-gradient-to-r ${barGradient} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Average circle progress */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500">Rerata Progres Kompetensi:</span>
            <span className="px-2.5 py-0.5 rounded-full font-black font-mono text-[10px] uppercase bg-emerald-50 text-[#10B981] dark:bg-emerald-950 dark:text-emerald-400">
              {siswa.progressCompetency}% Dikuasai
            </span>
          </div>

        </div>

      </div>

      {/* 2. RIGHT SIDE: Core tabs modules (Absensi, Jurnal harian, Izin, Nilai) */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Module selection header bar */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-sm gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('presensi')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'presensi' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
          >
            <Smartphone className="h-4 w-4" />
            <span>Ambil Presensi Geotagging</span>
          </button>

          <button
            onClick={() => setActiveTab('jurnal')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'jurnal' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Jurnal Kegiatan Harian</span>
            {journals.filter(j => j.status === 'rejected').length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] animate-pulse">REVISI ({journals.filter(j => j.status === 'rejected').length})</span>
            ) : journals.filter(j => j.status === 'pending').length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px]">{journals.filter(j => j.status === 'pending').length} PENDING</span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('izin')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'izin' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
          >
            <CalendarDays className="h-4 w-4" />
            <span>Pengajuan Surat Izin</span>
            {izins.filter(i => i.status === 'rejected').length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] animate-pulse">REVISI</span>
            ) : izins.filter(i => i.status === 'pending').length > 0 ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px]">PENDING</span>
            ) : null}
          </button>

          <button
            onClick={() => setActiveTab('nilai')}
            className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${activeTab === 'nilai' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
          >
            <Award className="h-4 w-4" />
            <span>Nilai & Observasi</span>
            {siswa.reportStatus === 'rejected' ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] animate-pulse">REVISI LAPORAN</span>
            ) : siswa.reportStatus === 'pending' ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-[9px]">DIREVIU</span>
            ) : siswa.reportStatus === 'approved' ? (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-emerald-500 text-white font-black text-[9px]">DISETUJUI</span>
            ) : null}
          </button>
        </div>

        {/* --- VIEW: PRESENSI GEOTAGGER --- */}
        {activeTab === 'presensi' && (
          <div className="space-y-6">
            
            {/* Camera Setup dsn Validation Controls */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Ambil Presensi Masuk & Pulang</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Sistem memverifikasi kordinat GPS Anda dalam perimeter aman radius 100 meter dari pusat kantor.</p>
              </div>

              {/* Status Absensi hari ini */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-slate-400">Presensi MASUK</span>
                    <span className="block font-black text-slate-800 dark:text-slate-150 text-sm mt-1">
                      {todayPresence?.checkInTime ? `${todayPresence.checkInTime} WIB` : 'Belum Absen'}
                    </span>
                    {todayPresence?.checkInTime && (
                      <span className="text-[10px] text-slate-400 block font-mono">Status: {todayPresence.checkInStatus === 'telat' ? 'Terlambat ⚠️' : 'Tepat Waktu ✅'}</span>
                    )}
                  </div>
                  <LogIn className={`h-8 w-8 ${todayPresence?.checkInTime ? 'text-indigo-500' : 'text-slate-350 animate-pulse'}`} />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="block text-slate-400">Presensi PULANG</span>
                    <span className="block font-black text-slate-800 dark:text-slate-150 text-sm mt-1">
                      {todayPresence?.checkOutTime ? `${todayPresence.checkOutTime} WIB` : 'Belum Absen'}
                    </span>
                    {todayPresence?.checkOutTime && (
                      <span className="text-[10px] text-emerald-500 block">Selesai Kerja ✅</span>
                    )}
                  </div>
                  <LogOut className={`h-8 w-8 ${todayPresence?.checkOutTime ? 'text-emerald-500' : 'text-slate-350'}`} />
                </div>
              </div>

              {/* Realtime Geo Camera Viewport Capture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Visual Camera Box Container */}
                <div id="selfie-camera-box" className="bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex flex-col items-center justify-center border border-slate-850 w-full max-w-[280px] min-h-[140px] mx-auto sm:mx-0">
                  
                  {cameraActive ? (
                    <>
                      <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover scale-x-[-1]" />
                      <button
                        onClick={handleCapturePhoto}
                        className="absolute bottom-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-650 cursor-pointer active:scale-95 transition-transform"
                      >
                        <Camera className="h-4 w-4" />
                        Jepret Selfie Sekarang
                      </button>
                    </>
                  ) : capturedSelfie ? (
                    <>
                      <img src={capturedSelfie} className="h-full w-full object-cover" alt="Captured self" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                        <button
                          onClick={startCamera}
                          className="bg-white/90 hover:bg-white text-slate-850 font-bold px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                        >
                          Ulangi Foto
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 text-slate-400 space-y-3">
                      <Camera className="h-8 w-8 text-indigo-500 mx-auto animate-pulse" />
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-205">Webcam atau Foto Selfie</p>
                        <p className="text-[10px] text-slate-500">Gunakan live kamera atau upload file manual di bawah.</p>
                      </div>

                      <div className="flex justify-center gap-2 pt-2">
                        <button
                          onClick={startCamera}
                          className="text-[11px] font-bold px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                        >
                          Aktifkan Kamera
                        </button>
                        
                        <label className="text-[11px] font-bold px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 cursor-pointer text-center">
                          <Upload className="h-3 w-3 inline mr-1" />
                          File Selfie
                          <input type="file" accept="image/*" onChange={handleManualSelfieUpload} className="hidden" />
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Tiny Hidden Helper canvas */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {/* Submissions form trigger */}
                <div className="flex flex-col justify-between py-1">
                  <div className="space-y-3">
                    <span className="inline-flex w-full items-center justify-between px-3 py-2 bg-indigo-500/10 text-indigo-750 dark:bg-slate-950/40 dark:text-indigo-400 border border-indigo-500/10 rounded-xl leading-normal text-xs">
                      <span className="flex items-center gap-1.5 leading-none font-bold">
                        <Info className="h-4 w-4 shrink-0" />
                        Validasi Koordinat GPS
                      </span>
                    </span>

                    <p className="text-xs text-slate-500 leading-relaxed text-slate-400">
                      Sebelum menekan tombol Absen Masuk/Pulang, sesuaikan kordinat simulasi Anda di dalam radius 100m dari target jika sensor GPS browser sedang terblokir.
                    </p>

                    <button
                      onClick={handleFetchTrueGps}
                      disabled={fetchingGps}
                      className="text-xs font-semibold px-4 py-2 rounded-xl border border-indigo-200 text-indigo-650 hover:bg-indigo-50/50 cursor-pointer inline-flex items-center gap-1"
                    >
                      {fetchingGps ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <MapPin className="h-3.5 w-3.5" />}
                      Gunakan Real GPS Sensor
                    </button>

                    {/* Automatis Absen Control Toggle Wrapper */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-850/80">
                        <div className="flex flex-col pr-2">
                          <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" />
                            Fitur Automatis Absen
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500">
                            {!hasClickedRealGps && !isSiswaWithinRadius100m
                              ? "Tekan 'Gunakan Real GPS Sensor' untuk mengaktifkan"
                              : isSiswaWithinRadius100m
                                ? "Menyala otomatis (Dalam Radius 100m) ✨"
                                : "Siap ditekan / diaktifkan"}
                          </span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={autoPresence}
                            disabled={!hasClickedRealGps && !isSiswaWithinRadius100m}
                            onChange={(e) => setAutoPresence(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className={`w-8 h-4 rounded-full transition-colors relative ${
                            autoPresence ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'
                          } ${(!hasClickedRealGps && !isSiswaWithinRadius100m) ? 'opacity-40 cursor-not-allowed' : ''}`}>
                            <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all shadow-xs ${
                              autoPresence ? 'right-0.5 translate-x-0' : 'left-0.5 translate-x-0'
                            }`} />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {autoPresence && isSiswaWithinRadius100m && (
                    <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-500/10 flex items-center justify-center gap-1 animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      Silakan ambil foto selfie untuk memicu absensi otomatis!
                    </div>
                  )}

                  <div className="flex gap-2.5 pt-4">
                    <button
                      onClick={handleCheckIn}
                      disabled={!!todayPresence?.checkInTime}
                      className={`w-full text-center py-3 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer
                        ${todayPresence?.checkInTime 
                          ? 'bg-slate-100 text-[#475569]/50 shadow-none border border-slate-200 dark:border-slate-800 cursor-not-allowed dark:bg-slate-950 dark:text-slate-505' 
                          : 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-sm hover:opacity-95'}`}
                    >
                      <LogIn className="h-4 w-4" />
                      Absen MASUK Kerja
                    </button>

                    <button
                      onClick={handleCheckOut}
                      disabled={!todayPresence?.checkInTime || !!todayPresence?.checkOutTime}
                      className={`w-full text-center py-3 rounded-xl font-extrabold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer
                        ${(!todayPresence?.checkInTime || todayPresence?.checkOutTime)
                          ? 'bg-slate-100 text-[#475569]/50 shadow-none border border-slate-200 dark:border-slate-800 cursor-not-allowed dark:bg-slate-950 dark:text-slate-505' 
                          : 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-sm hover:opacity-95'}`}
                    >
                      <LogOut className="h-4 w-4" />
                      Absen PULANG Kerja
                    </button>
                  </div>

                </div>

              </div>
            </div>

            {/* Geotagging Map visual Simulator */}
            <MapContainer 
              location={pklLocation || undefined} 
              siswaLat={siswaLat || undefined} 
              siswaLng={siswaLng || undefined} 
              onCoordinatesSimulated={(lat, lng) => {
                setSiswaLat(lat);
                setSiswaLng(lng);
              }}
            />
          </div>
        )}

        {/* --- VIEW: SISWA DAILY HARIAN JOURNALS --- */}
        {activeTab === 'jurnal' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-5">
            <div>
              <h3 className="font-black text-slate-800 dark:text-slate-100 text-base">Jurnal Logbook Aktivitas Harian</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Laporkan deskripsi pekerjaan teknis nyata kancah industri yang didokumentasikan harian.</p>
            </div>

            <form onSubmit={handleSaveJournal} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-500 font-bold mb-1.5">Deskripsi Aktivitas & Pembelajaran Teknis</label>
                <textarea
                  rows={3}
                  required
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="Contoh: Menguji modul router kantor, merancang database Postgresql, merakit kabel LAN..."
                  className="w-full px-3.5 py-3 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <span className="block text-xs text-slate-500 font-bold mb-1">Skala Progress Pemahaman Anda</span>
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-2 border border-slate-100 dark:border-slate-850 rounded-xl max-w-[170px]">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        type="button"
                        key={num}
                        onClick={() => setJournalRating(num)}
                        className="p-1 focus:outline-none transition-transform active:scale-125 cursor-pointer"
                      >
                        <Star className={`h-5 w-5 ${num <= journalRating ? 'text-amber-400 fill-amber-400' : 'text-slate-355'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <button
                    type="submit"
                    disabled={submittingJournal}
                    className="px-5 py-2.5 rounded-xl bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-200 dark:shadow-none cursor-pointer transition-all active:scale-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  >
                    {submittingJournal ? 'Melaporkan...' : 'Laporkan Jurnal Hari Ini'}
                  </button>
                </div>
              </div>
            </form>

            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
              <span className="block text-xs uppercase font-extrabold tracking-widest text-slate-400">Riwayat Catatan Jurnal</span>
              
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {journals.map((j) => (
                  <div key={j.id} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/50 text-xs leading-relaxed space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{j.date}</span>
                      <span className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        j.status === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' :
                        j.status === 'rejected' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20' :
                        'bg-amber-50 text-amber-600 dark:bg-amber-950/20'
                      }`}>
                        {j.status}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 italic">"{j.activity}"</p>

                    <div className="flex items-center gap-1.5 pt-1.5 text-[11px] text-slate-400">
                      <span>Progres:</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < j.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>

                    {j.notes && (
                      <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/10 rounded-lg text-indigo-750 dark:text-indigo-400 text-[11px] font-medium leading-normal">
                        Feedback Guru: <span className="font-semibold italic">"{j.notes}"</span>
                      </div>
                    )}
                  </div>
                ))}
                {journals.length === 0 && (
                  <div className="text-center py-10 text-slate-400">
                    Belum ada jurnal entri dilaporkan.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: SISWA IZIN SICK SURAT --- */}
        {activeTab === 'izin' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Form pengajuan */}
            <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-5 shadow-xs md:col-span-5 space-y-4">
              <div>
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">Pengajuan Surat Izin / Sakit</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Unggah rujukan surat dokter jika sakit.</p>
              </div>

              <form onSubmit={handleSaveIzin} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kategori Kepentingan</label>
                  <select
                    value={izinType}
                    onChange={(e) => setIzinType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  >
                    <option value="sakit">Sakit (Minta Istirahat)</option>
                    <option value="izin">Izin (Keperluan Khusus)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Mulai Tgl</label>
                    <input
                      type="date"
                      required
                      value={izinStart}
                      onChange={(e) => setIzinStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Sampai Tgl</label>
                    <input
                      type="date"
                      required
                      value={izinEnd}
                      onChange={(e) => setIzinEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Alasan Detail</label>
                  <textarea
                    rows={2}
                    required
                    value={izinReason}
                    onChange={(e) => setIzinReason(e.target.value)}
                    placeholder="Tuliskan keterangan detail sakit/izin..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-bold mb-1">Unggah Surat Bukti (Jpeg/Png)</label>
                  <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950 rounded-xl cursor-pointer">
                    <Upload className="h-5 w-5 text-indigo-500 mb-1" />
                    <span className="text-[10px] text-slate-500">Pilih berkas surat kesehatan</span>
                    <input type="file" accept="image/*" onChange={handleIzinUpload} className="hidden" />
                  </label>
                  {izinProof && (
                    <span className="block text-[10px] font-bold text-emerald-600 mt-1">✔ Lampiran Berhasil Dipasang</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submittingIzin}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-755 font-bold text-xs"
                >
                  {submittingIzin ? 'Mengirim...' : 'Kirim Pengajuan Izin'}
                </button>
              </form>
            </div>

            {/* List tracker */}
            <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-5 shadow-xs md:col-span-7 space-y-4">
              <div>
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">Tracking Status Izin Magang Anda</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Status dan respon persetujuan resmi guru pembimbing.</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {izins.map((iz) => (
                  <div key={iz.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850/40 text-xs leading-relaxed">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-extrabold text-indigo-650 dark:text-indigo-400 font-mono text-[10px] uppercase bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-md">
                        {iz.type === 'sakit' ? 'Sakit 🏥' : 'Izin Khusus 📅'}
                      </span>
                      <span className={`px-2 py-0.5 font-bold rounded text-[10px] uppercase ${
                        iz.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        iz.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {iz.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-350">
                      Berlaku: {iz.startDate} s/d {iz.endDate}
                    </div>

                    <p className="text-slate-500 mt-1 leading-snug">"Alasan: {iz.reason}"</p>
                    
                    {iz.proofUrl && (
                      <span className="block text-[10px] font-mono font-medium text-indigo-600 dark:text-indigo-400 mt-2 hover:underline">
                        ✔ Ada Lampiran Dokumen Surat Sakit
                      </span>
                    )}
                  </div>
                ))}
                {izins.length === 0 && (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    Belum ada pengajuan izin dilaporkan semester ini.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: OBSERVATION REPORT FILE & GRADES PDF FILE -- */}
        {activeTab === 'nilai' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            
            {/* Laporan Observasi Document Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <span className="p-1.5 rounded-lg bg-blue-50 text-[#3B82F6] dark:bg-slate-800">
                      <Upload className="h-4 w-4" />
                    </span>
                    Upload Laporan Observasi PKL
                  </h4>
                  <p className="text-xs text-[#475569] dark:text-slate-400 mt-1">
                    Unggah dokumen laporan akhir magang berbentuk format PDF untuk dinilai oleh Guru Pembimbing.
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-500">Status Laporan:</span>
                  {siswa.reportStatus === 'pending' && (
                    <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 uppercase">
                      ⏳ Menunggu Penilaian
                    </span>
                  )}
                  {siswa.reportStatus === 'approved' && (
                    <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 uppercase">
                      ✅ Disetujui Pembimbing
                    </span>
                  )}
                  {siswa.reportStatus === 'rejected' && (
                    <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 uppercase">
                      ❌ Perlu Revisi / Ditolak
                    </span>
                  )}
                  {(!siswa.reportStatus || siswa.reportStatus === 'belum_unggah') && (
                    <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-slate-100 text-[#475569] dark:bg-slate-800 dark:text-slate-400 border border-slate-200/40 uppercase">
                      📭 Belum Diunggah
                    </span>
                  )}
                </div>

                {siswa.reportFileName && (
                  <div className="p-3 bg-blue-50/50 dark:bg-slate-950 border border-blue-100/50 dark:border-slate-850 rounded-xl flex items-center gap-2.5 text-xs">
                    <span className="text-lg">📄</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-[#3B82F6] truncate">{siswa.reportFileName}</p>
                      <p className="text-[10px] text-slate-400">Terlampir di platform E-PKL</p>
                    </div>
                  </div>
                )}

                {/* Upload Form (Show only if not approved) */}
                {siswa.reportStatus !== 'approved' ? (
                  <div className="p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/20 dark:bg-slate-950/10">
                    <Upload className="h-7 w-7 text-slate-400 mx-auto animate-pulse mb-2" />
                    <span className="block text-xs font-semibold text-slate-600 dark:text-slate-300">Format unggahan wajib: PDF Dokumen</span>
                    
                    <label className="inline-block mt-3 px-3 py-2 bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white font-extrabold text-xs rounded-xl hover:opacity-95 transition-all cursor-pointer justify-center shadow-xs">
                      Cari File PDF Anda
                      <input type="file" accept="application/pdf" onChange={handlePdfUploadMock} className="hidden" />
                    </label>
                    
                    {pdfAttachedName && (
                      <span className="block text-xs text-[#3B82F6] font-bold mt-2 font-mono truncate">
                        Akan Diunggah: {pdfAttachedName}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center text-xs text-slate-500 leading-snug">
                    Laporan Anda telah disetujui secara permanen. Anda tidak perlu mengirimkan ulang dokumen laporan akhir lagi.
                  </div>
                )}
              </div>

              {pdfAttachedName && siswa.reportStatus !== 'approved' && (
                <div className="pt-2">
                  <button
                    onClick={handleSavePdfReport}
                    disabled={submittingPdf}
                    className="w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white font-black text-xs shadow-md"
                  >
                    {submittingPdf ? 'Mengekstrak PDF...' : 'Kirim Laporan Resmi ke Guru'}
                  </button>
                </div>
              )}
            </div>

            {/* Overall Grading notes details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                    <span className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981] dark:bg-slate-800">
                      <Award className="h-4 w-4" />
                    </span>
                    Informasi & Penilaian Pembimbing
                  </h4>
                  <p className="text-xs text-[#475569] dark:text-slate-400 mt-1">
                    Hasil penilaian kumulatif dan evaluasi laporan observasi PKL dari Guru Pembimbing sekolah.
                  </p>
                </div>

                {/* Score block */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50/20 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-center space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nilai Laporan</span>
                    <span className="block text-3xl font-black text-[#3B82F6] font-mono">
                      {siswa.reportGrade !== undefined && siswa.reportGrade !== null ? siswa.reportGrade : '-'}
                    </span>
                  </div>
                  <div className="p-4 bg-emerald-50/20 dark:bg-slate-950 border border-slate-105 dark:border-slate-850 rounded-xl text-center space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kompetensi</span>
                    <span className="block text-3xl font-black text-[#10B981] font-mono">
                      {siswa.progressCompetency}%
                    </span>
                  </div>
                </div>

                {/* Feedback Notes */}
                <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 text-xs leading-relaxed space-y-1.5">
                  <span className="font-extrabold text-slate-650 dark:text-slate-300 flex items-center gap-1">
                    💬 Catatan Evaluasi Guru Pembimbing:
                  </span>
                  <p className="text-[#475569] dark:text-slate-400 italic">
                    {siswa.reportNotes ? `"${siswa.reportNotes}"` : '"Belum ada ulasan atau catatan revisi tertulis dari guru pembimbing untuk laporan Anda."'}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-r from-[#3B82F6]/5 to-[#10B981]/5 rounded-xl border border-[#3B82F6]/10 text-xs leading-relaxed text-[#475569] dark:text-slate-400 space-y-1">
                  <span className="font-bold text-[#3B82F6] text-[13px] block">🏆 Kelayakan Kelulusan PKL</span>
                  <p>Mata Pelajaran: Praktik Kerja Lapangan (XII Keperawatan / XII Farmasi)</p>
                  <p>Bobot SKS: Mandatori Kelulusan SMK Citra Medika Sukoharjo</p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 flex justify-between items-center text-xs">
                <span className="text-slate-450 font-semibold">Status Kelulusan Siswa:</span>
                {siswa.reportStatus === 'approved' && (siswa.reportGrade || 0) >= 75 ? (
                  <span className="font-black text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded uppercase">
                    MEMENUHI SYARAT (LULUS) ✅
                  </span>
                ) : (
                  <span className="font-black text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded uppercase">
                    BELUM LENGKAP / TINJAUAN ⏳
                  </span>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
