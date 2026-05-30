import React, { useState, useEffect } from 'react';
import { 
  Users, MapPin, ClipboardCheck, BookOpen, 
  CalendarDays, Award, Star, CheckCircle, XCircle, 
  AlertTriangle, RefreshCw, Upload, Eye, FileSpreadsheet,
  TrendingUp, HelpCircle, Save, Check, FileMinus,
  Plus, Notebook
} from 'lucide-react';
import { 
  SiswaProfile, PklLocation, Presence, Journal, 
  Izin, Visit, GuidanceNote, User 
} from '../types';

interface DashboardGuruProps {
  guruProfile: any;
  students: any[];
  locations: PklLocation[];
  journals: any[];
  izins: any[];
  guidances: any[];
  competencies: any[];
  onRefreshData: () => void;
  triggerAlert: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  parentActiveTab?: string;
}

export default function DashboardGuru({
  guruProfile,
  students,
  locations,
  journals,
  izins,
  guidances,
  competencies,
  onRefreshData,
  triggerAlert,
  parentActiveTab
}: DashboardGuruProps) {
  // Navigation controls
  const [activeTab, setActiveTab] = useState<'roster' | 'journals' | 'izins' | 'visit' | 'guidance' | 'competencies'>('roster');

  // Synchronize internal activeTab when sidebar is clicked
  useEffect(() => {
    if (parentActiveTab) {
      if (parentActiveTab === 'g-monitoring') {
        setActiveTab('roster');
      } else if (parentActiveTab === 'g-visit') {
        setActiveTab('visit');
      } else if (parentActiveTab === 'g-validation') {
        setActiveTab('journals');
      } else if (parentActiveTab === 'g-izins') {
        setActiveTab('izins');
      } else if (parentActiveTab === 'g-grading') {
        setActiveTab('competencies');
      }
    }
  }, [parentActiveTab]);

  // Filter roster bimbingan
  const bimbinganStudents = students.filter(s => s.pembimbingId === guruProfile.id);

  // Visitation form states
  const [valPklLocationId, setValPklLocationId] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [visitLat, setVisitLat] = useState('');
  const [visitLng, setVisitLng] = useState('');
  const [visitDoc, setVisitDoc] = useState<string | null>(null);
  const [submittingVisit, setSubmittingVisit] = useState(false);

  // Grading states
  const [selectedStudentToGrade, setSelectedStudentToGrade] = useState<any | null>(null);
  const [dynamicGrades, setDynamicGrades] = useState<Record<string, string>>({});
  const [submittingGrades, setSubmittingGrades] = useState(false);
  const [reportGradeVal, setReportGradeVal] = useState<string>('');
  const [reportStatusVal, setReportStatusVal] = useState<'pending' | 'approved' | 'rejected' | 'belum_unggah'>('belum_unggah');
  const [reportNotesVal, setReportNotesVal] = useState<string>('');
  const [previewingReportSiswa, setPreviewingReportSiswa] = useState<any | null>(null);

  // Competencies CRUD states
  const [editingComp, setEditingComp] = useState<any | null>(null);
  const [compCode, setCompCode] = useState('');
  const [compName, setCompName] = useState('');
  const [compDesc, setCompDesc] = useState('');
  const [isCreatingComp, setIsCreatingComp] = useState(false);
  const [submittingComp, setSubmittingComp] = useState(false);

  // Counseling Guidance note state
  const [selectedStudentToCounsel, setSelectedStudentToCounsel] = useState<any | null>(null);
  const [counselNotes, setCounselNotes] = useState('');
  const [counselCategory, setCounselCategory] = useState<'akademik' | 'kedisiplinan' | 'motivasi' | 'masalah'>('akademik');
  const [submittingCounsel, setSubmittingCounsel] = useState(false);

  // Journal feedback states
  const [journalActionId, setJournalActionId] = useState<string | null>(null);
  const [journalFeedbackNotes, setJournalFeedbackNotes] = useState('');

  // Set default simulated location for visit
  useEffect(() => {
    if (bimbinganStudents.length > 0 && locations.length > 0) {
      const firstTargetLocId = bimbinganStudents[0].pklLocationId;
      const targetLoc = locations.find(l => l.id === firstTargetLocId);
      if (targetLoc) {
        setValPklLocationId(targetLoc.id);
        setVisitLat(String(targetLoc.latitude + 0.0001)); // Close within 10 meters
        setVisitLng(String(targetLoc.longitude + 0.0001));
      } else {
        setValPklLocationId(locations[0].id);
        setVisitLat(String(locations[0].latitude));
        setVisitLng(String(locations[0].longitude));
      }
    }
  }, [students, locations]);

  // VISITATION CONTROLLER
  const handleVisitDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setVisitDoc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitVisitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valPklLocationId || !visitNotes || !visitLat || !visitLng) {
      triggerAlert('warning', 'Lengkapi Form', 'Silakan tentukan Lokasi, koordinat GPS dan Berikan Catatan Kunjungan.');
      return;
    }
    setSubmittingVisit(true);
    try {
      const res = await fetch('/api/visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guruId: guruProfile.id,
          pklLocationId: valPklLocationId,
          notes: visitNotes,
          latitude: Number(visitLat),
          longitude: Number(visitLng),
          dokumentasiUrl: visitDoc || undefined
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Kunjungan Dicatatkan', 'Kunjungan industri berhasil diverifikasi secara GPS dsn terpublikasi ke siswa bersangkutan!');
      setVisitNotes('');
      setVisitDoc(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setSubmittingVisit(false);
    }
  };

  // JOURNAL VALIDATING ACTS
  const handleValidateJournal = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/journals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: journalFeedbackNotes || undefined
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Validasi Jurnal', `Jurnal siswa berhasil di-${status.toUpperCase()}. SMS/WA notifikasi dikirimkan!`);
      setJournalActionId(null);
      setJournalFeedbackNotes('');
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal memproses jurnal', err.message);
    }
  };

  // SICK IZIN APPROVAL ACTS
  const handleApproveIzin = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/izin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          approvedBy: guruProfile.userId
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Status Diupdate', `Permohonan izin sakit/keperluan siswa telah di-${status.toUpperCase()}`);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    }
  };

  // SUBMIT COMPETENCY SCORE CARD GRADES
  const openGradingCard = (std: any) => {
    setSelectedStudentToGrade(std);
    const initialGradingMap: Record<string, string> = {};
    (competencies || []).forEach((c: any) => {
      const score = std.grades?.[c.id] ?? std.grades?.[c.code] ?? std.grades?.[c.name] ?? '80';
      initialGradingMap[c.id] = String(score);
    });
    setDynamicGrades(initialGradingMap);
    setReportGradeVal(std.reportGrade !== undefined && std.reportGrade !== null ? String(std.reportGrade) : '85');
    setReportStatusVal(std.reportStatus || 'belum_unggah');
    setReportNotesVal(std.reportNotes || '');
  };

  const handleSaveGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentToGrade) return;
    setSubmittingGrades(true);
    try {
      const gradesToSave: Record<string, number> = {};
      Object.keys(dynamicGrades).forEach((key) => {
        gradesToSave[key] = Number(dynamicGrades[key] || 0);
      });

      // 1. Save core competencies grades
      const res = await fetch('/api/grades/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedStudentToGrade.id,
          grades: gradesToSave
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 2. Save PDF Report status, notes and grade
      const resReport = await fetch(`/api/siswa/${selectedStudentToGrade.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportGrade: reportGradeVal !== '' ? Number(reportGradeVal) : undefined,
          reportStatus: reportStatusVal,
          reportNotes: reportNotesVal
        })
      });
      const dataReport = await resReport.json();
      if (!resReport.ok) throw new Error(dataReport.error || 'Gagal menyimpan penilaian laporan.');

      triggerAlert('success', 'Nilai & Laporan Disimpan', `Rapor nilai kompetensi dan evaluasi laporan ${selectedStudentToGrade.name} sukses diperbarui.`);
      setSelectedStudentToGrade(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setSubmittingGrades(false);
    }
  };

  // CRUD Handlers for Competency
  const handleAddCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compCode || !compName) return;
    setSubmittingComp(true);
    try {
      const res = await fetch('/api/competencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: compCode,
          name: compName,
          description: compDesc
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      triggerAlert('success', 'Kompetensi Ditambahkan', `Kompetensi dengan kode ${compCode} berhasil ditambahkan.`);
      setCompCode('');
      setCompName('');
      setCompDesc('');
      setIsCreatingComp(false);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setSubmittingComp(false);
    }
  };

  const handleUpdateCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp || !compCode || !compName) return;
    setSubmittingComp(true);
    try {
      const res = await fetch(`/api/competencies/${editingComp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: compCode,
          name: compName,
          description: compDesc
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      triggerAlert('success', 'Kompetensi Diperbarui', `Kompetensi ${compCode} berhasil diupdate.`);
      setEditingComp(null);
      setCompCode('');
      setCompName('');
      setCompDesc('');
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setSubmittingComp(false);
    }
  };

  const handleDeleteCompetency = async (id: string, code: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus kompetensi ${code}?`)) return;
    try {
      const res = await fetch(`/api/competencies/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      triggerAlert('success', 'Kompetensi Dihapus', `Kompetensi dengan kode ${code} berhasil dihapus.`);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    }
  };

  const startEditComp = (comp: any) => {
    setEditingComp(comp);
    setCompCode(comp.code);
    setCompName(comp.name);
    setCompDesc(comp.description);
    setIsCreatingComp(false);
  };

  const cancelCompEdit = () => {
    setEditingComp(null);
    setCompCode('');
    setCompName('');
    setCompDesc('');
    setIsCreatingComp(false);
  };

  // COUNSEL LOG ENTRIES
  const handleSubmitCounselNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentToCounsel || !counselNotes) return;
    setSubmittingCounsel(true);
    try {
      const res = await fetch('/api/guidances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siswaId: selectedStudentToCounsel.id,
          notes: counselNotes,
          category: counselCategory,
          guruId: guruProfile.id
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Catatan Disimpan', `Catatan pembinaan kategori ${counselCategory.toUpperCase()} berhasil dilaunching.`);
      setCounselNotes('');
      setSelectedStudentToCounsel(null);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal menyimpan', err.message);
    } finally {
      setSubmittingCounsel(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Mentor Brief Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Total Bimbingan</span>
              <span className="block text-2xl font-black mt-1 text-slate-850 dark:text-white">{bimbinganStudents.length} Siswa</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-[#10B981] bg-emerald-500/10 px-2 py-0.5 rounded block max-w-max ml-auto">
                Guru Pembimbing
              </span>
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-1">{guruProfile.name}</span>
              <span className="block text-[10px] font-mono text-slate-400">NIP: {guruProfile.nip || '-'}</span>
            </div>
          </div>
          <p className="text-xs text-indigo-650 dark:text-indigo-400 font-semibold mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">Ditetapkan oleh Panitia PKL</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Jurnal Pending</span>
          <span className="block text-2xl font-black mt-1 text-slate-850 dark:text-white">
            {journals.filter(j => j.status === 'pending').length} Entri
          </span>
          <p className="text-xs text-amber-600 font-semibold mt-1">Wajib divalidasi pembimbing</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">Kunjungan Terlaksana</span>
          <span className="block text-2xl font-black mt-1 text-slate-850 dark:text-white">
            {guidances.length} Konseling
          </span>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Disiplin & pembinaan aktif</p>
        </div>

      </div>

      {/* Navigation Sub-menu Tabs */}
      <div className="flex bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2 rounded-2xl shadow-sm gap-1.5 overflow-x-auto">
        <button
          onClick={() => setActiveTab('roster')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeTab === 'roster' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <Users className="h-4 w-4" />
          <span>Anak Roster Bimbingan</span>
          {bimbinganStudents.filter(s => s.reportStatus === 'pending').length > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-rose-500 text-white font-black text-[9px] animate-pulse leading-none">
              {bimbinganStudents.filter(s => s.reportStatus === 'pending').length} REVIU
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('journals')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeTab === 'journals' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Validasi Jurnal Harian</span>
          {journals.filter(j => j.status === 'pending').length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md font-black text-[9px] leading-none ${activeTab === 'journals' ? 'bg-white text-indigo-700' : 'bg-indigo-650 text-white animate-bounce'}`}>
              {journals.filter(j => j.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('izins')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeTab === 'izins' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Approval Sakit/Izin</span>
          {izins.filter(i => i.status === 'pending').length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-md font-black text-[9px] leading-none ${activeTab === 'izins' ? 'bg-white text-indigo-700' : 'bg-indigo-650 text-white animate-bounce'}`}>
              {izins.filter(i => i.status === 'pending').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('visit')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeTab === 'visit' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <MapPin className="h-4 w-4" />
          <span>Lapor Kunjungan GPS</span>
        </button>

        <button
          onClick={() => setActiveTab('guidance')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeTab === 'guidance' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <Notebook className="h-4 w-4" />
          <span>Catatan Pembinaan / Konseling</span>
        </button>

        <button
          onClick={() => setActiveTab('competencies')}
          className={`text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${activeTab === 'competencies' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
        >
          <Award className="h-4 w-4" />
          <span>Data Kompetensi</span>
        </button>
      </div>

      {/* --- VIEW 1: ROSTER BIMBINGAN WITH GRADING ACTION BUTTONS --- */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Student roster table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs lg:col-span-8 space-y-4">
            <div>
              <h3 className="font-black text-slate-805 dark:text-slate-100 text-base">Siswa Dalam Tanggung Jawab Bimbingan Anda</h3>
              <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">Input dsn sinkronisasi nilai kepesertaan magang anak bimbingan industri.</p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
              <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-extrabold tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Nama Siswa</th>
                    <th className="px-4 py-3">Kelas</th>
                    <th className="px-4 py-3">Tempat PKL</th>
                    <th className="px-4 py-3 text-center">Kompetensi</th>
                    <th className="px-4 py-3 text-right">Penilaian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {bimbinganStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/45 dark:hover:bg-slate-850/20">
                      <td className="px-4 py-3">
                        <span className="block font-bold text-slate-800 dark:text-slate-150">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block mt-0.5">NISN: {s.nisn}</span>
                        {s.reportStatus ? (
                          <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                            {s.reportStatus === 'pending' && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/55 animate-pulse">
                                ⏳ Reviu Laporan
                              </span>
                            )}
                            {s.reportStatus === 'approved' && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/55">
                                ✅ Lapor Ok (Nilai: {s.reportGrade ?? '-'})
                              </span>
                            )}
                            {s.reportStatus === 'rejected' && (
                              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[9px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/55">
                                ❌ Revisi Laporan
                              </span>
                            )}
                            {s.reportFileName && (
                              <button
                                type="button"
                                onClick={() => setPreviewingReportSiswa(s)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[9px] font-extrabold uppercase bg-indigo-50 text-indigo-650 dark:bg-indigo-950/40 dark:text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer shadow-xs"
                              >
                                <Eye className="h-2.5 w-2.5" />
                                <span>Lihat Draf</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-450 dark:text-slate-500 block mt-1.5">📭 Belum unggah laporan</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-semibold">{s.className}</td>
                      <td className="px-4 py-3 text-slate-500">{s.locationName}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 font-bold font-mono rounded">
                          {s.progressCompetency}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openGradingCard(s)}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold bg-indigo-50 text-indigo-650 hover:bg-indigo-100 dark:bg-slate-800 dark:text-indigo-300 cursor-pointer"
                          >
                            Input Nilai
                          </button>
                          <button
                            onClick={() => setSelectedStudentToCounsel(s)}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-820 dark:text-slate-350 cursor-pointer"
                          >
                            Bina
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {bimbinganStudents.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        Anda belum diklasifikasikan memegang siswa bimbingan magang oleh admin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Inline Grading Form (If selected) */}
          <div className="lg:col-span-4">
            {selectedStudentToGrade ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 animate-scaleUp">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase text-xs tracking-wider">Input Skor Kompetensi</h4>
                    <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400">{selectedStudentToGrade.name}</span>
                  </div>
                  <button onClick={() => setSelectedStudentToGrade(null)} className="text-slate-400 hover:text-slate-600">×</button>
                </div>

                <form onSubmit={handleSaveGrades} className="space-y-4 text-xs">
                  {(competencies || []).map((c: any) => (
                    <div key={c.id}>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                        {c.name} ({c.code}) - (0-100)
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={100}
                        value={dynamicGrades[c.id] || ''}
                        onChange={(e) => setDynamicGrades({
                          ...dynamicGrades,
                          [c.id]: e.target.value
                        })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-250 dark:border-slate-820 bg-white dark:bg-slate-950 dark:text-white font-mono"
                      />
                    </div>
                  ))}

                  {/* SECTION: INTEGRATED OBSERVATION REPORT EVALUATION */}
                  <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                    <div>
                      <h5 className="font-extrabold text-[11px] text-slate-700 dark:text-slate-200 uppercase tracking-wide">
                        📋 Evaluasi Laporan Akhir PKL
                      </h5>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Tinjau dan berikan penilaian terhadap draf laporan observasi mandiri siswa.
                      </p>
                    </div>

                    {/* Attachment status info */}
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 text-[11px] leading-snug">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-semibold text-slate-500 block">Draf Dokumen Siswa:</span>
                        {selectedStudentToGrade.reportFileName && (
                          <button
                            type="button"
                            onClick={() => setPreviewingReportSiswa(selectedStudentToGrade)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-755 text-white font-extrabold text-[10px] transition-all cursor-pointer shadow-xs active:scale-95"
                          >
                            <Eye className="h-3 w-3 shrink-0" />
                            <span>Buka Draf</span>
                          </button>
                        )}
                      </div>
                      {selectedStudentToGrade.reportFileName ? (
                        <div className="flex items-center gap-1.5 font-bold text-[#3B82F6] p-1.5 bg-blue-500/5 rounded-lg border border-blue-500/10">
                          <span>📄</span>
                          <span className="truncate max-w-[120px]">{selectedStudentToGrade.reportFileName}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 ml-auto shrink-0 uppercase tracking-widest">
                            Terlampir
                          </span>
                        </div>
                      ) : (
                        <span className="text-rose-500 italic block">
                          ⚠️ Belum ada draf PDF diunggah oleh siswa bimbingan
                        </span>
                      )}
                    </div>

                    {/* Status Dropdown */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                        Status Validasi Laporan
                      </label>
                      <select
                        value={reportStatusVal}
                        onChange={(e) => setReportStatusVal(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                      >
                        <option value="belum_unggah">Belum Diunggah / Kosong</option>
                        <option value="pending">⏳ Menunggu Penilaian (Pending)</option>
                        <option value="approved">✅ Disetujui (Approved)</option>
                        <option value="rejected">❌ Perlu Revisi / Ditolak (Rejected)</option>
                      </select>
                    </div>

                    {/* Report Grade input */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                        Skor Evaluasi Laporan (0-100)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={reportGradeVal}
                        onChange={(e) => setReportGradeVal(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                        placeholder="Masukkan nilai misal 85"
                      />
                    </div>

                    {/* Notes feedback */}
                    <div>
                      <label className="block text-slate-500 dark:text-slate-400 font-bold mb-1">
                        Catatan Evaluasi / Rekomendasi Guru
                      </label>
                      <textarea
                        rows={3}
                        value={reportNotesVal}
                        onChange={(e) => setReportNotesVal(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                        placeholder="Tulis ulasan/saran revisi secara jelas agar dipahami oleh siswa..."
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2.5 justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentToGrade(null)}
                      className="px-3.5 py-1.5 rounded-lg border text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingGrades}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 hover:shadow-xs active:scale-95 transition-all text-center cursor-pointer"
                    >
                      {submittingGrades ? 'Menyimpan...' : 'Simpan Nilai'}
                    </button>
                  </div>
                </form>
              </div>
            ) : selectedStudentToCounsel ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-105 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 animate-scaleUp">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase text-xs tracking-wider">Log Pembinaan Karakter</h4>
                    <span className="text-xs font-semibold text-indigo-650 dark:text-indigo-400">{selectedStudentToCounsel.name}</span>
                  </div>
                  <button onClick={() => setSelectedStudentToCounsel(null)} className="text-slate-400 hover:text-slate-650">×</button>
                </div>

                <form onSubmit={handleSubmitCounselNote} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Kategori Masalah / Catatan</label>
                    <select
                      value={counselCategory}
                      onChange={(e) => setCounselCategory(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                    >
                      <option value="akademik">Akademik/Teknis</option>
                      <option value="kedisiplinan">Kedisiplinan/Absensi</option>
                      <option value="motivasi">Motivasi/Sikap</option>
                      <option value="masalah">Isu Masalah Hubungan Kerja</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Rincian Narasi Pembinaan / Konseling</label>
                    <textarea
                      rows={3}
                      required
                      value={counselNotes}
                      onChange={(e) => setCounselNotes(e.target.value)}
                      placeholder="Masukkan nasihat pembinaan dsn bimbingan siswa..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentToCounsel(null)}
                      className="px-3.5 py-1.5 rounded-lg border text-xs"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={submittingCounsel}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-650 text-white font-bold text-xs"
                    >
                      Submisi Catatan
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 border-dashed rounded-2xl p-6 text-center text-slate-400 h-full flex flex-col justify-center items-center py-16">
                <TrendingUp className="h-8 w-8 text-indigo-400 animate-pulse mb-2.5" />
                <h4 className="font-semibold text-xs text-slate-650">Form Interaksi Cepat</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[170px] mx-auto">Klik tombol "Input Nilai" atau "Bina" pada tabel roster siswa untuk mengawali pengisian rapor PKL.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* --- VIEW 2: VALIDASI JURNAL DENGAN LOGBOOK FEEDBACK FEED --- */}
      {activeTab === 'journals' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-101 text-base">Validasi Laporan Jurnal Harian Siswa</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tinjau uraian dan performa teknis hasil magang mandiri anak bimbingan industri Anda harian.</p>
          </div>

          <div className="space-y-4">
            {journals.map((j) => (
              <div key={j.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-105 dark:border-slate-850/40 text-xs flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-805 dark:text-slate-150 text-sm">{j.siswaName}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-205 dark:bg-slate-850 rounded font-mono text-slate-500">{j.className}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{j.date}</span>
                  </div>

                  <p className="text-slate-650 dark:text-slate-400 italic font-mono leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-150/50 dark:border-slate-800">
                    "Aktivitas: {j.activity}"
                  </p>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="font-medium mr-1">Rapor Skala Siswa:</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < j.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>

                  {j.notes && (
                    <div className="text-[11px] p-2 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 rounded-lg text-indigo-755 dark:text-indigo-400">
                      Feedback Anda: <b>"{j.notes}"</b>
                    </div>
                  )}
                </div>

                {j.status === 'pending' ? (
                  <div className="shrink-0 space-y-3 md:w-48 text-right self-center">
                    {journalActionId === j.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          required
                          placeholder="Beri arahan/feedback..."
                          value={journalFeedbackNotes}
                          onChange={(e) => setJournalFeedbackNotes(e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[11px] rounded-lg"
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleValidateJournal(j.id, 'approved')}
                            className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1.5 rounded-md cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleValidateJournal(j.id, 'rejected')}
                            className="text-[10px] bg-rose-600 text-white font-bold px-2 py-1.5 rounded-md cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => { setJournalActionId(null); setJournalFeedbackNotes(''); }}
                            className="text-[10px] border text-slate-500 px-2 py-1.5 rounded-md"
                          >
                            X
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setJournalActionId(j.id)}
                        className="text-xs font-bold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
                      >
                        ✔ Berikan Verifikasi Jurnal
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="shrink-0 flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-xl text-xs font-extrabold uppercase">
                    <Check className="h-4 w-4" />
                    Verified
                  </div>
                )}
              </div>
            ))}
            {journals.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                Hubungi siswa bimbingan untuk segera mensubmit logbook harian mereka.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- VIEW 3: APPROVAL SICK OR LEAVE SICKNESS --- */}
      {activeTab === 'izins' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-101 text-base">Approval Permohonan Surat Izin / Sakit</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tinjau rujukan sakit dokter dsn berikan validasi surat izin berhalangan hadir.</p>
          </div>

          <div className="space-y-4">
            {izins.map((i) => (
              <div key={i.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/45 border border-slate-100 max-w-full text-xs">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{i.siswaName}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-850 rounded text-slate-500">{i.className}</span>
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-650 font-bold rounded font-mono text-[9px] uppercase tracking-wide">
                        {i.type.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-slate-650 dark:text-slate-450 italic">"Alasan: {i.reason}"</p>
                    <p className="text-slate-400 font-semibold">Tenggat Berhalangan: {i.startDate} s/d {i.endDate}</p>
                    
                    {i.proofUrl && (
                      <button
                        onClick={() => window.open(i.proofUrl!, '_blank')}
                        className="text-[10px] inline-flex items-center gap-1.5 hover:underline text-indigo-600 dark:text-indigo-400 font-bold"
                      >
                        👁 Lihat Lampiran Surat Dokter
                      </button>
                    )}
                  </div>

                  <div className="shrink-0 self-center">
                    {i.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApproveIzin(i.id, 'approved')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                        >
                          Ijinkan
                        </button>
                        <button
                          onClick={() => handleApproveIzin(i.id, 'rejected')}
                          className="px-3 py-1.5 rounded-lg border border-rose-250 text-rose-600 font-bold text-xs hover:bg-rose-50"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className={`inline-block px-2.5 py-1 font-bold rounded uppercase ${i.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {i.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {izins.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                Belum ada pengajuan izin dilaporkan dari siswa bimbingan Anda.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- VIEW 4: VISITATION LAUNCHING --- */}
      {activeTab === 'visit' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Lapor kunjungan form */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs md:col-span-5 space-y-4">
            <div>
              <h4 className="font-black text-slate-850 dark:text-slate-100 text-sm">Lapor Kunjungan Pengawasan Magang</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Logging GPS lokasi kunjungan fisik ke instansi PKL sebagai bukti real bimbingan.</p>
            </div>

            <form onSubmit={handleSubmitVisitation} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Pilih Target Kantor Mitra</label>
                <select
                  value={valPklLocationId}
                  onChange={(e) => {
                    setValPklLocationId(e.target.value);
                    const matchedLoc = locations.find(l => l.id === e.target.value);
                    if (matchedLoc) {
                      setVisitLat(String(matchedLoc.latitude));
                      setVisitLng(String(matchedLoc.longitude));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white cursor-pointer"
                >
                  <option value="">-- Tentukan Mitra PKL --</option>
                  {locations.map(l => (
                    <option key={l.id} value={l.id}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">GPS Lintang</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={visitLat}
                    onChange={(e) => setVisitLat(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">GPS Bujur</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={visitLng}
                    onChange={(e) => setVisitLng(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Uraian Catatan Evaluasi Industri</label>
                <textarea
                  rows={2}
                  required
                  value={visitNotes}
                  onChange={(e) => setVisitNotes(e.target.value)}
                  placeholder="Review kondisi kedisiplinan siswa di lapangan..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Unggah Swafoto Kunjungan (Optional)</label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-820 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl cursor-pointer">
                  <Upload className="h-5 w-5 text-indigo-500 mb-1" />
                  <span className="text-[10px] text-slate-500">Pilih berkas foto bersama supervisor industri</span>
                  <input type="file" accept="image/*" onChange={handleVisitDocUpload} className="hidden" />
                </label>
                {visitDoc && (
                  <span className="block text-[10px] font-bold text-emerald-600 mt-1">✔ Bukti Foto Terintegrasi</span>
                )}
              </div>

              <button
                type="submit"
                disabled={submittingVisit}
                className="w-full py-2.5 rounded-xl bg-indigo-650 text-white hover:bg-indigo-700 font-bold text-xs"
              >
                {submittingVisit ? 'Mengirim data...' : 'Logging Kunjungan Resmi'}
              </button>
            </form>
          </div>

          {/* Visitations log lists */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs md:col-span-7 space-y-4">
            <div>
              <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">Riwayat Logging Kunjungan Guru Pelapor</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Daftar absensi kunjungan terstruktur Anda di lapangan.</p>
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {guidances.map((g) => (
                <div key={g.id} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-105 dark:border-slate-850/40 text-xs text-slate-650 leading-relaxed">
                  <div className="flex items-center justify-between font-bold mb-1.5">
                    <span className="text-slate-800 dark:text-slate-150 text-sm">{g.siswaName}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-indigo-50 text-indigo-650 rounded uppercase">{g.category}</span>
                  </div>
                  <p className="italic">"Catatan: {g.notes}"</p>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 font-mono pt-1.5 border-t border-slate-150/40">
                    <span>Oleh: {g.guruName}</span>
                    <span>Tgl: {g.date}</span>
                  </div>
                </div>
              ))}
              {guidances.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  Belum ada laporan kunjungan dicatatkan.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* --- VIEW 5: COUNSELING LOGS --- */}
      {activeTab === 'guidance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-101 text-base">Catatan Pembinaan & Bimbingan Karakter Siswa</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Riwayat pembinaan psikologis, kedisiplinan dan integrasi kompetensi siswa.</p>
          </div>

          <div className="space-y-3">
            {guidances.map((gd) => (
              <div key={gd.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 text-xs leading-normal">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm text-indigo-700 dark:text-indigo-400">{gd.siswaName} ({gd.className})</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Kategori: {gd.category}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-450 italic">"Pembinaan: {gd.notes}"</p>
                <div className="text-right text-[10px] text-slate-400 mt-2 font-mono">
                  Sesi: {gd.date} | Mentor: {gd.guruName}
                </div>
              </div>
            ))}
            {guidances.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                Belum ada berkas pembinaan terdaftar untuk roster magang saat ini.
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- VIEW 6: DATA KOMPETENSI CRUD --- */}
      {activeTab === 'competencies' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-extrabold text-slate-850 dark:text-slate-100 text-base">Manajemen Kompetensi Keahlian SMK</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Atur standar, indikator kelulusan, dan butir kompetensi magang siswa bimbingan.</p>
            </div>
            
            {!isCreatingComp && !editingComp && (
              <button
                onClick={() => {
                  setIsCreatingComp(true);
                  setEditingComp(null);
                  setCompCode('');
                  setCompName('');
                  setCompDesc('');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
              >
                <Plus className="h-4 w-4" />
                Tambah Kompetensi
              </button>
            )}
          </div>

          {/* Form Create or Edit Competency */}
          {(isCreatingComp || editingComp) && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 animate-scaleUp">
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                {editingComp ? 'Edit Detail Kompetensi' : 'Tambah Kompetensi Baru'}
              </h4>
              <form onSubmit={editingComp ? handleUpdateCompetency : handleAddCompetency} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="block text-slate-500 dark:text-slate-400 font-bold">Kode Kompetensi (Contoh: KOMP06)</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan kode..."
                    value={compCode}
                    onChange={(e) => setCompCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="block text-slate-500 dark:text-slate-400 font-bold">Nama Kompetensi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan nama kompetensi..."
                    value={compName}
                    onChange={(e) => setCompName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-slate-500 dark:text-slate-400 font-bold">Deskripsi Indikator / Keterangan Kunci</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Masukkan deskripsi kompetensi..."
                    value={compDesc}
                    onChange={(e) => setCompDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={cancelCompEdit}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingComp}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    {submittingComp ? 'Menyimpan...' : 'Simpan Kompetensi'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Competency Bento-Grid / Card-list */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(competencies || []).map((c: any) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/35 hover:shadow-xs transition-all duration-200 gap-4 relative overflow-hidden group">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 bg-blue-50 text-blue-650 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-500/10 rounded-md">
                      {c.code}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-white leading-snug">
                    {c.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                    {c.description || 'Tidak ada spesifikasi deskripsi detail.'}
                  </p>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-3 flex items-center justify-between mt-1 text-[10px] text-slate-400 font-medium">
                  <span>Standard Kelulusan Rapor</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">Aktif</span>
                </div>
              </div>
            ))}

            {(competencies || []).length === 0 && (
              <div className="col-span-full text-center py-12 text-slate-400">
                Belum ada kategori kompetensi magang terdaftar saat ini. Silakan tambahkan kompetensi baru!
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewingReportSiswa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-td-2xl rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">📄</span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-850 dark:text-white uppercase tracking-wider">
                    Pratinjau Draf Laporan Akhir PKL
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Berkas: <span className="font-semibold text-indigo-600 font-mono">{previewingReportSiswa.reportFileName}</span> • Oleh: <span className="font-semibold">{previewingReportSiswa.name}</span>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewingReportSiswa(null)}
                className="p-1 px-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-all font-black"
                id="close-preview-btn"
              >
                ✕ Close
              </button>
            </div>

            {/* Document Toolbar */}
            <div className="px-6 py-2.5 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">
                Mode Kontrol: Pratinjau Terpadu
              </span>
              <div className="flex gap-2">
                {previewingReportSiswa.reportFileContent && previewingReportSiswa.reportFileContent.startsWith('data:') ? (
                  <a
                    href={previewingReportSiswa.reportFileContent}
                    download={previewingReportSiswa.reportFileName || 'laporan_pkl.pdf'}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                    id="download-doc-btn"
                  >
                    <span>📥</span>
                    <span>Download Berkas</span>
                  </a>
                ) : (
                  <button
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Laporan PKL - ${previewingReportSiswa.name}</title>
                              <style>
                                body { font-family: 'Times New Roman', Times, serif; padding: 40px; line-height: 1.6; color: #000; }
                                h1, h2, h3 { text-align: center; }
                                .line { border-bottom: 2px solid #000; margin-bottom: 20px; }
                                p { text-align: justify; text-indent: 40px; }
                                .sign-box { display: flex; justify-content: space-between; margin-top: 50px; }
                                .sign-col { text-align: center; }
                              </style>
                            </head>
                            <body>
                              <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 15px; margin-bottom: 30px;">
                                <h1 style="margin: 0; font-size: 22px;">LAPORAN HASIL OBSERVASI PRAKTEK KERJA LAPANGAN</h1>
                                <h2 style="margin: 5px 0 0 0; font-size: 18px; font-weight: normal;">SMK NEGERI MITRA INDUSTRI E-PKL</h2>
                              </div>
                              <p><strong>Nama Siswa:</strong> ${previewingReportSiswa.name}</p>
                              <p><strong>NISN:</strong> ${previewingReportSiswa.nisn || '0098254117'}</p>
                              <p><strong>Kelas:</strong> ${previewingReportSiswa.className || 'TKJ / RPL'}</p>
                              <p><strong>Lokasi PKL:</strong> ${previewingReportSiswa.locationName || 'Kantor Industri Mitra'}</p>
                              <h3 style="margin-top: 30px;">RINGKASAN OBSERVASI LAPORAN</h3>
                              <p>Praktek Kerja Lapangan (PKL) dikerjakan secara nyata guna meningkatkan profesionalisme kerja di kancah industri rintisan maupun korporasi modern. Penulis menyusun naskah draf ini sebagai representasi otentik keahlian komparatif.</p>
                              <p>Siswa bersangkutan memiliki rekam jejak progres penguasaan standar kompetensi industri sebesar ${previewingReportSiswa.progressCompetency ?? 80}% yang disupervisi langsung oleh instruktur internal dsn pembimbing eksternal.</p>
                              <div class="sign-box">
                                <div class="sign-col">
                                  <p>Siswa Bersangkutan,</p>
                                  <br/><br/><br/>
                                  <p><strong>${previewingReportSiswa.name}</strong></p>
                                </div>
                                <div class="sign-col">
                                  <p>Guru Pembimbing PKL,</p>
                                  <br/><br/><br/>
                                  <p><strong>${guruProfile?.name || 'Guru Pembimbing'}</strong></p>
                                </div>
                              </div>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                        printWindow.print();
                      } else {
                        window.print();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 font-extrabold text-[11px] flex items-center gap-1 cursor-pointer transition-all"
                    id="print-doc-btn"
                  >
                    <span>🖨️</span>
                    <span>Cetak / Simpan PDF</span>
                  </button>
                )}
              </div>
            </div>

            {/* Document Content / Reading Pane */}
            <div className="p-6 overflow-y-auto flex-grow bg-slate-100 dark:bg-slate-950 flex justify-center">
              {/* If it is a real uploaded PDF in Base64 format */}
              {previewingReportSiswa.reportFileContent && previewingReportSiswa.reportFileContent.startsWith('data:application/pdf') ? (
                <div className="w-full h-[60vh] rounded-xl overflow-hidden border border-slate-200 bg-white">
                  <iframe 
                    src={previewingReportSiswa.reportFileContent} 
                    className="w-full h-full" 
                    title="Real PDF Report Viewer"
                  />
                </div>
              ) : previewingReportSiswa.reportFileContent && previewingReportSiswa.reportFileContent.startsWith('data:image/') ? (
                <div className="max-w-full text-center bg-white p-4 rounded-xl border border-slate-205 flex flex-col justify-center items-center">
                  <p className="text-xs text-slate-400 mb-2 font-mono">File pratinjau berupa Gambar/Lampiran:</p>
                  <img 
                    src={previewingReportSiswa.reportFileContent} 
                    alt="Lampiran draf siswa" 
                    className="max-w-full max-h-[55vh] rounded-lg shadow-md border hover:scale-102 transition-transform" 
                  />
                </div>
              ) : (
                /* High-fidelity Mock/Generated document layout if no real file uploaded or has mock string */
                <div 
                  id="mockup-report-doc" 
                  className="bg-white text-slate-900 p-8 md:p-12 w-full max-w-2xl border border-slate-300 shadow-md min-h-[700px] font-serif space-y-6 text-xs text-[13px] leading-relaxed relative rounded-md"
                >
                  {/* Watermarked label */}
                  <div className="absolute right-6 top-6 text-[9px] uppercase font-mono tracking-widest text-slate-300 border border-dashed border-slate-200 px-2 py-0.5 select-none">
                    Draf Pengajuan • Sistem E-PKL
                  </div>

                  {/* TITLE OF REPORT */}
                  <div className="text-center space-y-2 pt-4 pb-3 border-b-2 border-slate-800">
                    <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase">
                      LAPORAN PROGRAM PRAKTEK KERJA LAPANGAN (PKL)
                    </h2>
                    <h3 className="text-sm font-semibold uppercase text-slate-600">
                      RANCANGAN DRAFT HASIL OBSERVASI PRAKTIS MANDIRI
                    </h3>
                    <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">
                      Kompetensi Keahlian: {previewingReportSiswa.className || 'Teknik Komputer & Jaringan'}
                    </p>
                  </div>

                  {/* LOGO BOX DECOR */}
                  <div className="flex justify-center my-4">
                    <div className="h-14 w-14 rounded-full border-2 border-double border-indigo-600 bg-indigo-50 flex items-center justify-center font-extrabold text-sm text-indigo-700 select-none">
                      SMK
                    </div>
                  </div>

                  {/* STUDENT IDENTITY INFO TABLE */}
                  <div className="border border-slate-200 p-3.5 rounded-lg bg-slate-50/50 space-y-1.5 font-sans text-[11px]">
                    <div className="grid grid-cols-3">
                      <span className="font-semibold text-slate-500">Nama Siswa magang</span>
                      <span className="col-span-2">: <strong className="text-slate-800 font-bold">{previewingReportSiswa.name}</strong></span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-semibold text-slate-500">Nomor Induk Siswa (NISN)</span>
                      <span className="col-span-2 font-mono">: {previewingReportSiswa.nisn || '0098254117'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-semibold text-slate-500">Kelas</span>
                      <span className="col-span-2">: {previewingReportSiswa.className || 'TKJ / RPL'}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="font-semibold text-slate-500">Instansi / Industri PKL</span>
                      <span className="col-span-2 font-bold text-indigo-700">: {previewingReportSiswa.locationName || 'Kantor Industri Mitra PKL'}</span>
                    </div>
                  </div>

                  {/* PARAGRAPHS */}
                  <div className="space-y-3 pt-2 text-justify">
                    <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-0.5 text-slate-900">
                      BAB I - LATAR BELAKANG & TUJUAN
                    </h4>
                    <p className="indent-6">
                      Praktek Kerja Lapangan (PKL) didesain secara adaptif guna menjembatani lulusan sekolah kejuruan dengan tuntutan kompetensi kancah industri profesional. Penulis menyusun rancangan draf laporan akhir ini sebagai rangkuman hasil observasi magang harian di lingkungan kerja nyata.
                    </p>

                    <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-0.5 text-slate-900 pt-2">
                      BAB II - ANALISIS LINGKUNGAN PKL
                    </h4>
                    <p className="indent-6">
                      Selama menjalankan program magang di <strong>{previewingReportSiswa.locationName || 'Kantor Industri Mitra'}</strong>, penulis menganalisis regulasi kerja profesional, alur workflow produksi, kepemimpinan tim kerja, serta tantangan-tantangan integrasi lapangan. Pengalaman ini meningkatkan softskills secara berkala.
                    </p>

                    <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-0.5 text-slate-900 pt-2">
                      BAB III - TINGKAT PENGUASAAN KOMPETENSI
                    </h4>
                    <p className="indent-6">
                      Penulis telah menuntaskan kurikulum penugasan praktis dengan tingkat kemajuan progres penguasaan standar instrumen kompetensi dasar sebesar <strong>{previewingReportSiswa.progressCompetency ?? 80}%</strong>. Berkas pendukung logbook, presensi digital geotagging, dsn jurnal harian telah dipalidkan oleh pembimbing industri bersangkutan.
                    </p>

                    <h4 className="font-bold text-xs uppercase border-b border-slate-200 pb-0.5 text-slate-900 pt-2">
                      BAB IV - REKOMENDASI & PENUTUP
                    </h4>
                    <p className="indent-6">
                      Melalui pengajuan draf laporan akhir ini, penulis mengharapkan bimbingan review umpan balik berkesinambungan serta saran perbaikan naskah terstruktur dari guru sekolah guna melengkapi data administratif penunjang sertifikasi kelulusan rapor magang.
                    </p>
                  </div>

                  {/* SIGNATURES */}
                  <div className="pt-8 flex justify-between font-sans text-[10px] text-center">
                    <div>
                      <p className="text-slate-450 mb-8">Diajukan oleh Siswa,</p>
                      <p className="font-bold underline text-slate-800">{previewingReportSiswa.name}</p>
                      <p className="text-[9px] font-mono text-slate-400">NISN. {previewingReportSiswa.nisn || '0098254117'}</p>
                    </div>

                    <div>
                      <p className="text-slate-450 mb-8">Memeriksa, Guru Sekolah</p>
                      <p className="font-bold underline text-slate-800">{guruProfile?.name || 'Guru Pembimbing'}</p>
                      <p className="text-[9px] font-mono text-slate-400">NIP. 19820514 200801 1 004</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[9px] font-semibold text-slate-400">
                E-PKL Digital Document Evaluator System
              </span>
              <button
                onClick={() => setPreviewingReportSiswa(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 font-bold text-xs cursor-pointer transition-all"
                id="close-preview-footer-btn"
              >
                Tutup Dokumentasi
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
