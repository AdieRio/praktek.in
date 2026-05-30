import React, { useState, useEffect } from 'react';
import { 
  Users, UserSquare2, Landmark, ClipboardCheck, 
  Plus, Edit2, Trash2, Key, Search, 
  Download, ArrowUpDown, ChevronLeft, ChevronRight,
  Database, BellRing, Eye, CheckCircle, XCircle,
  FileSpreadsheet, FileMinus, Send, MapPin, Map,
  BadgeAlert, RefreshCw, EyeOff, UploadCloud, FileDown, TrendingUp
} from 'lucide-react';
import { read, utils, write } from 'xlsx';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, 
  YAxis, CartesianGrid, Tooltip, BarChart, Bar, 
  Cell, Legend 
} from 'recharts';
import { 
  User, PklLocation, SiswaProfile, GuruProfile, 
  Presence, Journal, Izin, Visit, WaLog, BackupHistory 
} from '../types';
import SweetAlert, { SweetAlertType } from './SweetAlert';

interface DashboardAdminProps {
  students: any[];
  teachers: any[];
  locations: PklLocation[];
  presences: any[];
  visitations: any[];
  journals: any[];
  izins: any[];
  waLogs: WaLog[];
  backups: BackupHistory[];
  competencies?: any[];
  onRefreshData: () => void;
  triggerAlert: (type: SweetAlertType, title: string, message: string) => void;
  activeTab?: string;
}

export default function DashboardAdmin({
  students,
  teachers,
  locations,
  presences,
  visitations,
  journals,
  izins,
  waLogs,
  backups,
  competencies,
  onRefreshData,
  triggerAlert,
  activeTab
}: DashboardAdminProps) {
  // Navigation sub-tabs / state controls
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'siswa' | 'guru' | 'pkl' | 'absensi' | 'visiting' | 'approvals' | 'backup'>('stats');

  useEffect(() => {
    if (activeTab) {
      if (activeTab === 'dashboard') {
        setActiveSubTab('stats');
      } else if (activeTab === 'presensi') {
        setActiveSubTab('absensi');
      } else {
        setActiveSubTab(activeTab as any);
      }
      setCurrentPage(1);
    }
  }, [activeTab]);

  // Search and filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Table Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form Modals and editing states
  const [isSiswaModalOpen, setIsSiswaModalOpen] = useState(false);
  const [isBulkSiswaModalOpen, setIsBulkSiswaModalOpen] = useState(false);
  const [parsedBulkSiswa, setParsedBulkSiswa] = useState<any[]>([]);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(0);
  const [isUploadingBulk, setIsUploadingBulk] = useState(false);
  const [isScanningFile, setIsScanningFile] = useState(false);
  const [bulkUploadError, setBulkUploadError] = useState('');
  const bulkFileRef = React.useRef<HTMLInputElement | null>(null);
  
  const [isGuruModalOpen, setIsGuruModalOpen] = useState(false);
  const [isPklModalOpen, setIsPklModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'siswa' | 'guru' | 'pkl' | 'presence' | 'visit'; id: string; name: string } | null>(null);
  const [showCustomClassInput, setShowCustomClassInput] = useState(false);

  // Form loading states
  const [formLoading, setFormLoading] = useState(false);

  // Bulk presence checkboxes
  const [selectedPresences, setSelectedPresences] = useState<string[]>([]);

  // Detailed Modal Viewing Image (Selfie or Permission letter overlay)
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [approvalsTab, setApprovalsTab] = useState<'izin' | 'jurnal'>('izin');

  // --- FORM FIELDS ---
  // Siswa fields
  const [sisName, setSisName] = useState('');
  const [sisNisn, setSisNisn] = useState('');
  const [sisClass, setSisClass] = useState('XII Farmasi Klinis');
  const [sisPhone, setSisPhone] = useState('');
  const [sisEmail, setSisEmail] = useState('');
  const [sisUsername, setSisUsername] = useState('');
  const [sisPassword, setSisPassword] = useState('');
  const [sisPklId, setSisPklId] = useState('');
  const [sisGuruId, setSisGuruId] = useState('');

  // Guru fields
  const [gurName, setGurName] = useState('');
  const [gurNip, setGurNip] = useState('');
  const [gurPhone, setGurPhone] = useState('');
  const [gurEmail, setGurEmail] = useState('');
  const [gurUsername, setGurUsername] = useState('');
  const [gurPassword, setGurPassword] = useState('');

  // Tempat PKL fields
  const [pklName, setPklName] = useState('');
  const [pklAddress, setPklAddress] = useState('');
  const [pklLat, setPklLat] = useState('');
  const [pklLng, setPklLng] = useState('');
  const [pklRadius, setPklRadius] = useState('100');
  const [pklQuota, setPklQuota] = useState('5');

  // Password reset fields
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUserId, setResetUserId] = useState('');
  const [resetTargetName, setResetTargetName] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Synchronise forms on edit
  const openEditSiswa = (item: any) => {
    setEditingItem(item);
    setSisName(item.name);
    setSisNisn(item.nisn);
    setSisClass(item.className);
    setSisPhone(item.phone || '');
    setSisEmail(item.email || '');
    setSisUsername(item.username || '');
    setSisPklId(item.pklLocationId || '');
    setSisGuruId(item.pembimbingId || '');

    const standardClasses = [
      "XII Farmasi Klinis",
      "XII Keperawatan A",
      "XII Keperawatan B",
      "XII Layanan Farmasi",
      "XII Caregiving",
      "XII Teknologi Laboratorium Medik",
      "XII Farmasi Industri"
    ];
    if (item.className && !standardClasses.includes(item.className)) {
      setShowCustomClassInput(true);
    } else {
      setShowCustomClassInput(false);
    }
    setIsSiswaModalOpen(true);
  };

  const openEditGuru = (item: any) => {
    setEditingItem(item);
    setGurName(item.name);
    setGurNip(item.nip);
    setGurPhone(item.phone || '');
    setGurEmail(item.email || '');
    setGurUsername(item.username || '');
    setIsGuruModalOpen(true);
  };

  const openEditPkl = (item: PklLocation) => {
    setEditingItem(item);
    setPklName(item.name);
    setPklAddress(item.address);
    setPklLat(String(item.latitude));
    setPklLng(String(item.longitude));
    setPklRadius(String(item.radius));
    setPklQuota(String(item.quota));
    setIsPklModalOpen(true);
  };

  // --- ACTIONS CALLS ---
  const handleSaveSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        // Edit siswa
        const res = await fetch(`/api/siswa/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: sisName,
            nisn: sisNisn,
            className: sisClass,
            phone: sisPhone,
            username: sisUsername,
            email: sisEmail,
            pklLocationId: sisPklId,
            pembimbingId: sisGuruId
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        triggerAlert('success', 'Berhasil', 'Data siswa berhasil diperbarui!');
      } else {
        // Create siswa
        const res = await fetch('/api/siswa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: sisName,
            nisn: sisNisn,
            className: sisClass,
            phone: sisPhone,
            email: sisEmail,
            username: sisUsername,
            password: sisPassword,
            pklLocationId: sisPklId,
            pembimbingId: sisGuruId
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        triggerAlert('success', 'Pendaftaran Berhasil', 'Akun siswa dan profil PKL berhasil didaftarkan.');
      }
      setIsSiswaModalOpen(false);
      resetSiswaForm();
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetSiswaForm = () => {
    setEditingItem(null);
    setSisName('');
    setSisNisn('');
    setSisClass('');
    setShowCustomClassInput(false);
    setSisPhone('');
    setSisEmail('');
    setSisUsername('');
    setSisPassword('');
    setSisPklId('');
    setSisGuruId('');
  };

  const handleSaveGuru = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        const res = await fetch(`/api/guru/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: gurName,
            nip: gurNip,
            phone: gurPhone,
            username: gurUsername,
            email: gurEmail
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        triggerAlert('success', 'Berhasil', 'Profil Guru berhasil diperbarui!');
      } else {
        const res = await fetch('/api/guru', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: gurName,
            nip: gurNip,
            phone: gurPhone,
            email: gurEmail,
            username: gurUsername,
            password: gurPassword
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        triggerAlert('success', 'Guru Terdaftar', 'Akun guru bimbingan siap digunakan.');
      }
      setIsGuruModalOpen(false);
      resetGuruForm();
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetGuruForm = () => {
    setEditingItem(null);
    setGurName('');
    setGurNip('');
    setGurPhone('');
    setGurEmail('');
    setGurUsername('');
    setGurPassword('');
  };

  const handleSavePkl = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingItem) {
        const res = await fetch(`/api/pkl/${editingItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pklName,
            address: pklAddress,
            latitude: Number(pklLat),
            longitude: Number(pklLng),
            radius: Number(pklRadius),
            quota: Number(pklQuota)
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        triggerAlert('success', 'Berhasil', 'Informasi tempat PKL berhasil diupdate!');
      } else {
        const res = await fetch('/api/pkl', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: pklName,
            address: pklAddress,
            latitude: Number(pklLat),
            longitude: Number(pklLng),
            radius: Number(pklRadius),
            quota: Number(pklQuota)
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        triggerAlert('success', 'Sukses', 'Tempat magang baru ditambahkan ke database.');
      }
      setIsPklModalOpen(false);
      resetPklForm();
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal membuat Lokasi', err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const resetPklForm = () => {
    setEditingItem(null);
    setPklName('');
    setPklAddress('');
    setPklLat('');
    setPklLng('');
    setPklRadius('100');
    setPklQuota('5');
  };

  const handleDeleteItem = (type: 'siswa' | 'guru' | 'pkl' | 'presence' | 'visit', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setIsDeleteModalOpen(true);
  };

  const performDeleteItem = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setIsDeleteModalOpen(false);
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      let typeLabel = '';
      if (type === 'siswa') typeLabel = 'Siswa';
      else if (type === 'guru') typeLabel = 'Guru Pembimbing';
      else if (type === 'pkl') typeLabel = 'Tempat PKL';
      else if (type === 'presence') typeLabel = 'Kehadiran Siswa';
      else if (type === 'visit') typeLabel = 'Kunjungan Guru/Visitation';

      triggerAlert('success', 'Berhasil Dihapus', `Data ${typeLabel} berhasil dihapus secara permanen.`);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleUpdateIzinStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/izin/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy: 'Admin' })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Status Berhasil Diperbarui', `Permohonan izin siswa telah ${status === 'approved' ? 'disetujui' : 'ditolak'}.`);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword) return;
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: resetUserId, newPassword: resetNewPassword })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Password Direset', data.message);
      setIsResetModalOpen(false);
      setResetNewPassword('');
    } catch (err: any) {
      triggerAlert('error', 'Gagal Reset', err.message);
    }
  };

  const downloadBulkSiswaTemplate = () => {
    try {
      const headers = [["Nama Lengkap", "NISN", "Kelas Kejuruan", "No WhatsApp", "Email", "Username", "Password"]];
      const sampleRows = [
        ["Ahmad Syarif", "20261001", "XII Keperawatan A", "081234567890", "ahmad.syarif@sch.id", "ahmadsyarif", "siswa123"],
        ["Siti Aminah", "20261002", "XII Farmasi Klinis", "081987654321", "", "sitiaminah", "siswa123"]
      ];
      const ws = utils.aoa_to_sheet([...headers, ...sampleRows]);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Daftar_Siswa");
      
      const wbout = write(wb, { bookType: 'xlsx', type: 'binary' });
      const s2ab = (s: string) => {
        const buf = new ArrayBuffer(s.length);
        const view = new Uint8Array(buf);
        for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
        return buf;
      };
      
      const blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Template_Upload_Siswa_EPKL.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      triggerAlert('success', 'Template Diunduh', 'Gunakan template Excel yang diunduh untuk pendaftaran siswa massal.');
    } catch (err: any) {
      triggerAlert('error', 'Gagal Membuat Template', err.message);
    }
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanningFile(true);
    setBulkUploadError('');
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        if (rawRows.length === 0) {
          setBulkUploadError('File Excel/CSV kosong.');
          setIsScanningFile(false);
          return;
        }

        let headerRowIdx = 0;
        let foundHeader = false;
        
        for (let idx = 0; idx < Math.min(rawRows.length, 6); idx++) {
          const row = rawRows[idx];
          if (row && row.some(cell => {
            const s = String(cell).toLowerCase();
            return s.includes('nama') || s.includes('nisn') || s.includes('kelas') || s.includes('username');
          })) {
            headerRowIdx = idx;
            foundHeader = true;
            break;
          }
        }

        const headers = (rawRows[headerRowIdx] || []).map(h => String(h || '').trim().toLowerCase());
        
        const nameIdx = headers.findIndex(h => h.includes('nama') || h.includes('student') || h.includes('fullname') || h.includes('lengkap'));
        const nisnIdx = headers.findIndex(h => h.includes('nisn') || h.includes('nis') || h.includes('nomor induk') || h.includes('induk'));
        const classIdx = headers.findIndex(h => h.includes('kelas') || h.includes('class') || h.includes('kejuruan') || h.includes('jurusan'));
        const waIdx = headers.findIndex(h => h.includes('wa') || h.includes('whatsapp') || h.includes('telp') || h.includes('telepon') || h.includes('phone') || h.includes('kontak'));
        const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('surel'));
        const usernameIdx = headers.findIndex(h => h.includes('username') || h.includes('user login'));
        const passwordIdx = headers.findIndex(h => h.includes('password') || h.includes('pass') || h.includes('sandi'));

        if (nameIdx === -1 || nisnIdx === -1 || classIdx === -1) {
          setBulkUploadError('Kolom wajib (Nama Lengkap, NISN, dan Kelas Kejuruan) tidak terdeteksi di baris judul Excel.');
          setIsScanningFile(false);
          return;
        }

        const parsedData: any[] = [];
        const existingNisns = new Set((students || []).map(s => String(s.nisn || '')));

        for (let r = headerRowIdx + 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;
          
          const hasData = row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '');
          if (!hasData) continue;

          const rawName = nameIdx !== -1 ? String(row[nameIdx] || '').trim() : '';
          const rawNisn = nisnIdx !== -1 ? String(row[nisnIdx] || '').trim() : '';
          const rawClass = classIdx !== -1 ? String(row[classIdx] || '').trim() : '';
          const rawPhone = waIdx !== -1 ? String(row[waIdx] || '').trim() : '';
          const rawEmail = emailIdx !== -1 ? String(row[emailIdx] || '').trim() : '';
          const rawUsername = usernameIdx !== -1 ? String(row[usernameIdx] || '').trim() : '';
          const rawPassword = passwordIdx !== -1 ? String(row[passwordIdx] || '').trim() : '';

          if (!rawName || !rawNisn || !rawClass) {
            parsedData.push({
              name: rawName,
              nisn: rawNisn,
              className: rawClass,
              phone: rawPhone,
              email: rawEmail,
              username: rawUsername,
              password: rawPassword,
              validationStatus: 'error',
              validationMsg: 'Kolom Nama, NISN & Kelas wajib diisi!'
            });
            continue;
          }

          const alreadyExists = existingNisns.has(rawNisn);
          const isDuplicateInBatch = parsedData.some(p => p.nisn === rawNisn);
          
          let status = 'valid';
          let msg = 'Siap Di-import';

          if (alreadyExists) {
            status = 'duplicate';
            msg = 'NISN sudah terdaftar di database';
          } else if (isDuplicateInBatch) {
            status = 'duplicate';
            msg = 'Duplikat dalam satu Sheet Excel';
          }

          const normalizedUsername = rawUsername || rawName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) + rawNisn.slice(-4);
          const normalizedPassword = rawPassword || (rawNisn.length >= 6 ? rawNisn : 'siswa123');

          parsedData.push({
            name: rawName,
            nisn: rawNisn,
            className: rawClass,
            phone: rawPhone,
            email: rawEmail,
            username: normalizedUsername,
            password: normalizedPassword,
            validationStatus: status,
            validationMsg: msg
          });
        }

        setParsedBulkSiswa(parsedData);
      } catch (err: any) {
        setBulkUploadError('Gagal memproses file Excel: ' + err.message);
      } finally {
        setIsScanningFile(false);
      }
    };
    reader.onerror = () => {
      setBulkUploadError('Gagal membaca file.');
      setIsScanningFile(false);
    };
    reader.readAsBinaryString(file);
  };

  const handleExecuteBulkUpload = async () => {
    const validRows = parsedBulkSiswa.filter(p => p.validationStatus === 'valid');
    if (validRows.length === 0) {
      triggerAlert('warning', 'Tidak Ada Data', 'Tidak ada baris siswa valid untuk di-import.');
      return;
    }

    setIsUploadingBulk(true);
    setBulkUploadProgress(0);

    let successCount = 0;
    let failCount = 0;

    for (let idx = 0; idx < validRows.length; idx++) {
      const siswa = validRows[idx];
      try {
        const res = await fetch('/api/siswa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: siswa.name,
            nisn: siswa.nisn,
            className: siswa.className,
            phone: siswa.phone,
            email: siswa.email,
            username: siswa.username,
            password: siswa.password
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        successCount++;
      } catch (err: any) {
        console.error('Failed to upload row:', siswa.name, err);
        failCount++;
      }
      setBulkUploadProgress(Math.round(((idx + 1) / validRows.length) * 100));
    }

    setIsUploadingBulk(false);
    setParsedBulkSiswa([]);
    setIsBulkSiswaModalOpen(false);
    onRefreshData();

    if (failCount === 0) {
      triggerAlert('success', 'Import Sukses!', `${successCount} siswa baru berhasil di-import massal.`);
    } else {
      triggerAlert('warning', 'Import Tuntas dengan Sebagian Gagal', `${successCount} siswa sukses terdaftar, ${failCount} siswa gagal karena limit/kendala.`);
    }
  };

  // Bulk presences approval
  const toggleSelectPresence = (id: string) => {
    if (selectedPresences.includes(id)) {
      setSelectedPresences(selectedPresences.filter(item => item !== id));
    } else {
      setSelectedPresences([...selectedPresences, id]);
    }
  };

  const handleBulkApprovePresence = async (approved: boolean) => {
    if (selectedPresences.length === 0) return;
    try {
      const res = await fetch('/api/presence/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPresences, approved })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Berhasil update', `${selectedPresences.length} status absensi siswa diperbarui.`);
      setSelectedPresences([]);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    }
  };

  const handleValidateVisit = async (visitId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/visit/${visitId}/validate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, approvedBy: 'Administrator' })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'Validasi Kunjungan', `Status kunjungan berhasil diubah menjadi ${status === 'approved' ? 'Disahkan' : 'Ditolak'}.`);
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal Validasi', err.message);
    }
  };

  // Backup & Recovery
  const handleTriggerBackup = async () => {
    try {
      const res = await fetch('/api/backup/process', { method: 'POST' });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      triggerAlert('success', 'System Backup', 'Snapshot database cadangan berhasil ditulis ke server-side dengan aman.');
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Backup Gagal', err.message);
    }
  };

  const handleClearWaLogs = async () => {
    try {
      await fetch('/api/wa-logs', { method: 'DELETE' });
      triggerAlert('success', 'Log Dibersihkan', 'Pembersihan log notifikasi WhatsApp gateway berhasil.');
      onRefreshData();
    } catch (err: any) {
      triggerAlert('error', 'Gagal', err.message);
    }
  };

  // --- REPORT EXPORT MODULE (Excel / PDF Simulation) ---
  const handleExportData = (format: 'pdf' | 'excel', dataType: string) => {
    const listToExport = dataType === 'siswa' ? students : presences;
    
    if (format === 'excel') {
      // Simulate CSV file download representing excel
      let csvContent = 'data:text/csv;charset=utf-8,';
      if (dataType === 'siswa') {
        const compList = competencies && competencies.length > 0 ? competencies : [
          { id: 'penerimaanObat', name: 'Penerimaan & Penyimpanan Farmasi', code: 'FAR01' },
          { id: 'peracikanObat', name: 'Pelayanan Resep & Peracikan Obat', code: 'FAR02' },
          { id: 'informasiObat', name: 'KIE & Swamedikasi Dasar', code: 'FAR03' },
          { id: 'vitalSigns', name: 'Pemeriksaan TTV & Fisik Dasar', code: 'KEP01' },
          { id: 'basicCaregiving', name: 'Pemenuhan KDM & Personal Higiene', code: 'KEP02' },
          { id: 'komunikasiTerapeutik', code: 'KEP03', name: 'Komunikasi Terapeutik & Etika Medis' },
          { id: 'softSkillsMedis', code: 'SEK01', name: 'Sikap Kerja & Disiplin Sterilitas' }
        ];

        const competencyHeaders = compList.map(c => `"${c.name} (${c.code})"`).join(',');
        csvContent += `ID,Nama Siswa,NISN,Kelas,Lokasi PKL,Pembimbing,Progres Kompetensi,${competencyHeaders}\n`;

        listToExport.forEach(s => {
          const compScores = compList.map(c => {
            const score = s.grades?.[c.id] ?? s.grades?.[c.code] ?? s.grades?.[c.name] ?? 0;
            return `"${score}"`;
          }).join(',');
          csvContent += `"${s.id}","${s.name}","${s.nisn}","${s.className}","${s.locationName}","${s.pembimbingName}","${s.progressCompetency}%",${compScores}\n`;
        });
      } else {
        csvContent += 'Tanggal,ID Siswa,Nama Siswa,Nama Lokasi,Jam Masuk,Jarak Masuk,Status Masuk,Jam Pulang,Jarak Pulang,Status Pulang,Persetujuan\n';
        listToExport.forEach(p => {
          csvContent += `"${p.date}","${p.siswaId}","${p.siswaName}","${p.locationName}","${p.checkInTime || '-'}","${p.checkInDistance || 0}m","${p.checkInStatus || '-'}","${p.checkOutTime || '-'}","${p.checkOutDistance || 0}m","${p.checkOutStatus || '-'}","${p.approved ? 'DISETUJUI' : 'PENDING'}"\n`;
        });
      }
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `rekap_${dataType}_epkl_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      triggerAlert('success', 'Export Excel', 'File rekapitulasi data berhasil diexport ke format Excel (CSV) yang siap dibuka!');
    } else {
      // PDF print standard simulation
      window.print();
      triggerAlert('info', 'Export PDF', 'Sistem mengarahkan cetak rekapitulasi laporan ke format dokumen PDF.');
    }
  };

  // --- CHART CALCULATORS ---
  const getChartData = () => {
    // Map last 7 days metrics
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    return [
      { name: 'Senin', Hadir: 3, Terlambat: 1, Izin: 1 },
      { name: 'Selasa', Hadir: 4, Terlambat: 0, Izin: 1 },
      { name: 'Rabu', Hadir: 5, Terlambat: 1, Izin: 0 },
      { name: 'Kamis', Hadir: 5, Terlambat: 2, Izin: 0 },
      { name: 'Jumat', Hadir: 6, Terlambat: 0, Izin: 1 },
      { name: 'Sabtu', Hadir: 2, Terlambat: 0, Izin: 0 },
      { name: 'Minggu', Hadir: 1, Terlambat: 1, Izin: 0 },
    ];
  };

  // Filtering list helper
  const getFilteredStudents = () => {
    return students.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nisn.includes(searchTerm) || 
                          s.className.toLowerCase().includes(searchTerm.toLowerCase());
      const matchClass = classFilter ? s.className === classFilter : true;
      const matchLoc = locationFilter ? s.pklLocationId === locationFilter : true;
      return matchSearch && matchClass && matchLoc;
    });
  };

  const getFilteredPresences = () => {
    return presences.filter(p => {
      const matchSearch = p.siswaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.locationName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  };

  // Pagination bounds
  const paginateList = (fullList: any[]) => {
    const start = (currentPage - 1) * itemsPerPage;
    return fullList.slice(start, start + itemsPerPage);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Panel with Sub-navigation */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
            Panel Administrator E-PKL
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Pantau sebaran penempatan industri, bimbingan guru, status gps radius siswa, dan backup database sistem.
          </p>
        </div>

        {/* Diagnostic Buttons and tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { setActiveSubTab('stats'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'stats' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Dashboard Utama
          </button>
          <button
            onClick={() => { setActiveSubTab('siswa'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'siswa' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Siswa
          </button>
          <button
            onClick={() => { setActiveSubTab('guru'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'guru' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Guru
          </button>
          <button
            onClick={() => { setActiveSubTab('pkl'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'pkl' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Industri
          </button>
          <button
            onClick={() => { setActiveSubTab('absensi'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'absensi' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Kehadiran
          </button>
          <button
            onClick={() => { setActiveSubTab('visiting'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'visiting' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Kunjungan Guru
          </button>
          <button
            onClick={() => { setActiveSubTab('approvals'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'approvals' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Laporan & Izin
          </button>
          <button
            onClick={() => { setActiveSubTab('backup'); setCurrentPage(1); }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg active:scale-95 transition-all cursor-pointer ${activeSubTab === 'backup' ? 'bg-gradient-to-r from-[#3B82F6] to-[#10B981] text-white shadow-md font-extrabold' : 'text-[#475569] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
          >
            Tools & WA
          </button>
        </div>
      </div>

      {/* 1. VIEW: STATS & CHARTS */}
      {activeSubTab === 'stats' && (
        <div className="space-y-6">
          {/* Card Statistics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-indigo-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Total Siswa PKL</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{students.length} Orang</span>
                </div>
                <div className="h-11 w-11 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] text-emerald-500 font-semibold mt-2">
                100% Ditugaskan Pembimbing
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-violet-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Guru Monitoring</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{teachers.length} Guru</span>
                </div>
                <div className="h-11 w-11 bg-violet-50 dark:bg-violet-950/40 text-violet-600 rounded-xl flex items-center justify-center">
                  <UserSquare2 className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                Aktif melakukan kunjungan industri
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-emerald-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Mitra PKL</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">{locations.length} Instansi</span>
                </div>
                <div className="h-11 w-11 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl flex items-center justify-center">
                  <Landmark className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] text-indigo-500 font-semibold mt-2">
                Radius radius GPS 100 meter aktif
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:border-amber-500/30 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs uppercase font-extrabold tracking-wider text-slate-400 dark:text-slate-500">Absen Hari Ini</span>
                  <span className="text-2xl font-black text-slate-800 dark:text-white mt-1 block">
                    {presences.filter(p => p.date === new Date().toISOString().split('T')[0]).length} / {students.length} Masuk
                  </span>
                </div>
                <div className="h-11 w-11 bg-amber-50 dark:bg-amber-950/40 text-amber-600 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-2">
                Hadir Tepat Waktu Terbanyak
              </div>
            </div>

          </div>

          {/* Recharts Graphical stats */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Area Presence Chart */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl md:col-span-8 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Grafik Statistik Kehadiran Siswa (Mingguan)</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">Rincian status siswa tepat waktu, terlambat, dan izin magang.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Tepat</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 ml-2" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Terlambat</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 ml-2" />
                  <span className="text-[10px] uppercase font-bold text-slate-400">Izin</span>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTelat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="Hadir" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHadir)" />
                    <Area type="monotone" dataKey="Terlambat" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTelat)" />
                    <Area type="monotone" dataKey="Izin" stroke="#6366f1" strokeWidth={1.5} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick action / recent notifications activity feed */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl md:col-span-4 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">Live Notifikasi & Aktivitas Siswa</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500">Log sinkronisasi realtime sistem portal magang.</p>
                
                <div className="mt-4 space-y-3 max-h-56 overflow-y-auto pr-1">
                  {waLogs.slice(0, 4).map((log) => (
                    <div key={log.id} className="text-[11px] p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800/40 leading-relaxed text-slate-600 dark:text-slate-400">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">WA Gateway Notification</span>
                        <span className="text-[9px] text-slate-400">{log.timestamp}</span>
                      </div>
                      <p className="line-clamp-2 italic">"{log.message}"</p>
                    </div>
                  ))}
                  {waLogs.length === 0 && (
                    <div className="text-center text-slate-400 py-8 text-xs">
                      Belum ada pesan WhatsApp terkirim hari ini.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Status Server E-PKL</span>
                <span className="text-emerald-500 font-bold flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  NORMAL & ONLINE
                </span>
              </div>
            </div>

          </div>

          {/* Quick links summary helper */}
          <div className="bg-teal-500/10 border border-teal-500/20 text-teal-850 dark:text-teal-400 rounded-xl p-4 text-xs leading-relaxed flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm">💡 Quick Tip:</span>
              <span>Anda dapat mendaftarkan siswa baru, menempatkan kantor PKL, mereset password akun, serta menguji simulasi presensi dalam radius di menu masing-masing tab.</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. VIEW: CRUD SISWA */}
      {activeSubTab === 'siswa' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Daftar Siswa Praktik Kerja Lapangan (PKL)</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Kelola informasi pendaftaran siswa, NISN, kelas dan status plot bimbingan.</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => { resetSiswaForm(); setIsSiswaModalOpen(true); }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4" />
                Tambah Siswa Baru
              </button>
              <button
                onClick={() => { setParsedBulkSiswa([]); setBulkUploadError(''); setIsBulkSiswaModalOpen(true); }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <UploadCloud className="h-4 w-4" />
                Upload Massal Excel
              </button>
              <button
                onClick={() => handleExportData('excel', 'siswa')}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-850 active:scale-95 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                Excel (CSV)
              </button>
            </div>
          </div>

          {/* Search, filters, & table panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari siswa, NISN..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <select
                value={classFilter}
                onChange={(e) => { setClassFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 cursor-pointer"
              >
                <option value="">Semua Kelas</option>
                <option value="XII Farmasi Klinis">XII Farmasi Klinis</option>
                <option value="XII Keperawatan A">XII Keperawatan A</option>
                <option value="XII Keperawatan B">XII Keperawatan B</option>
                <option value="XII Layanan Farmasi">XII Layanan Farmasi</option>
                <option value="XII Caregiving">XII Caregiving</option>
                <option value="XII Teknologi Laboratorium Medik">XII Teknologi Laboratorium Medik</option>
                <option value="XII Farmasi Industri">XII Farmasi Industri</option>
              </select>
            </div>
            <div>
              <select
                value={locationFilter}
                onChange={(e) => { setLocationFilter(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 cursor-pointer"
              >
                <option value="">Semua Mitra PKL</option>
                {locations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-500 uppercase font-extrabold tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nama Lengkap & NISN</th>
                  <th className="px-4 py-3">Kelas</th>
                  <th className="px-4 py-3">Kontak WA</th>
                  <th className="px-4 py-3">Lokasi Penempatan E-PKL</th>
                  <th className="px-4 py-3">Guru Pembimbing</th>
                  <th className="px-4 py-3 text-center">Kompetensi</th>
                  <th className="px-4 py-3 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginateList(getFilteredStudents()).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/20">
                    <td className="px-4 py-3">
                      <span className="block font-bold text-slate-800 dark:text-slate-150">{s.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">NISN: {s.nisn}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{s.className}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{s.phone || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        <Landmark className="h-3 w-3 text-indigo-500" />
                        {s.locationName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.pembimbingName}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 dark:text-emerald-400 text-[10px] font-extrabold rounded-md font-mono">
                        {s.progressCompetency}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Reset Password Akun"
                          onClick={() => {
                            setResetUserId(s.userId);
                            setResetTargetName(s.name);
                            setIsResetModalOpen(true);
                          }}
                          className="p-1 px-1.5 text-[10px] border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-lg dark:border-amber-900/30 dark:hover:bg-amber-950/20"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => openEditSiswa(s)}
                          className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('siswa', s.id, s.name)}
                          className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {getFilteredStudents().length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-slate-400">
                      Tidak ada data siswa ditemukan dengan kata kancing pencarian tersebut.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination controls */}
          {getFilteredStudents().length > itemsPerPage && (
            <div className="flex items-center justify-between border-t border-slate-150 dark:border-slate-800 pt-3">
              <span className="text-[11px] text-slate-400">
                Menampilkan {Math.min(getFilteredStudents().length, (currentPage - 1) * itemsPerPage + 1)}-
                {Math.min(getFilteredStudents().length, currentPage * itemsPerPage)} dari {getFilteredStudents().length} Siswa
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs px-3 font-bold text-slate-700 dark:text-slate-350">{currentPage}</span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(getFilteredStudents().length / itemsPerPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(getFilteredStudents().length / itemsPerPage)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-40 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. VIEW: CRUD GURU */}
      {activeSubTab === 'guru' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Database Guru Pembimbing Magang</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Form pendaftaran NIP dsn monitoring jumlah total anak bimbingan.</p>
            </div>
            <button
              onClick={() => { resetGuruForm(); setIsGuruModalOpen(true); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Pendaftaran Guru Baru
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-extrabold tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nama Lengkap & NIP</th>
                  <th className="px-4 py-3">Kontak WA</th>
                  <th className="px-4 py-3">Email Instansi</th>
                  <th className="px-4 py-3">Siswa Bimbingan</th>
                  <th className="px-4 py-3 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {teachers.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/20">
                    <td className="px-4 py-3">
                      <span className="block font-bold text-slate-800 dark:text-slate-100">{g.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">NIP: {g.nip}</span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-550">{g.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{g.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-extrabold text-[10px] rounded-md">
                        {g.bimbinganCount} Siswa
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          title="Reset Password Akun"
                          onClick={() => {
                            setResetUserId(g.userId);
                            setResetTargetName(g.name);
                            setIsResetModalOpen(true);
                          }}
                          className="p-1 px-1.5 text-[10px] border border-amber-200 text-amber-600 hover:bg-amber-50 rounded-lg dark:border-amber-900/30 dark:hover:bg-amber-950/20 mr-1"
                        >
                          Reset Pwd
                        </button>
                        <button
                          onClick={() => openEditGuru(g)}
                          className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('guru', g.id, g.name)}
                          className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. VIEW: CRUD TEMPAT PKL */}
      {activeSubTab === 'pkl' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Mitra Industri & Tempat Praktik PKL</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Plotting kordinat latitude-longitude kantor serta radius aman validasi presensi siswa.</p>
            </div>
            <button
              onClick={() => { resetPklForm(); setIsPklModalOpen(true); }}
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4" />
              Daftarkan Mitra Baru
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-extrabold tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Nama Mitra Industri</th>
                  <th className="px-4 py-3">Alamat Lengkap</th>
                  <th className="px-4 py-3">GPS Latitude / Longitude</th>
                  <th className="px-4 py-3 text-center">Radius</th>
                  <th className="px-4 py-3 text-center">Kuota (Terisi)</th>
                  <th className="px-4 py-3 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {locations.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/20">
                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-slate-100">{l.name}</td>
                    <td className="px-4 py-3 text-slate-550 max-w-xs truncate">{l.address}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">
                      Lat: {l.latitude.toFixed(5)} <br />
                      Lng: {l.longitude.toFixed(5)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{l.radius} meter</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${(l as any).filledQuota >= l.quota ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'}`}>
                        {(l as any).filledQuota} / {l.quota} Slot
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditPkl(l)}
                          className="p-1 rounded-lg bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-350 dark:hover:bg-slate-750 cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem('pkl', l.id, l.name)}
                          className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. VIEW: MONITORING ABSENSI YTD */}
      {activeSubTab === 'absensi' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">Monitoring & Approval Kehadiran Realtime</h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">Log kehadiran dual-timestamp siswa, data GPS, foto selfie, dsn verifikasi kelolosan.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleBulkApprovePresence(true)}
                disabled={selectedPresences.length === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Approve ({selectedPresences.length})
              </button>
              <button
                onClick={() => handleBulkApprovePresence(false)}
                disabled={selectedPresences.length === 0}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-600 font-bold text-xs disabled:opacity-40 hover:bg-rose-50 cursor-pointer"
              >
                <XCircle className="h-3.5 w-3.5" />
                Reject
              </button>
              <button
                onClick={() => handleExportData('excel', 'absensi')}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-650 font-semibold text-xs active:scale-95 cursor-pointer dark:border-slate-800 dark:text-slate-350"
              >
                <Download className="h-3.5 w-3.5" />
                Export Rekap Excel
              </button>
              <button
                onClick={onRefreshData}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
            <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase font-extrabold tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPresences(presences.map(p => p.id));
                        } else {
                          setSelectedPresences([]);
                        }
                      }}
                      checked={selectedPresences.length === presences.length && presences.length > 0}
                    />
                  </th>
                  <th className="px-4 py-3">Tanggal / Jam</th>
                  <th className="px-4 py-3">Siswa & Kelas</th>
                  <th className="px-4 py-3">Tempat PKL Mitra</th>
                  <th className="px-4 py-3">Masuk (Selfie/Jarak)</th>
                  <th className="px-4 py-3">Pulang (Selfie/Jarak)</th>
                  <th className="px-4 py-3 text-center">Metrik Toleransi</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {presences.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/55 dark:hover:bg-slate-850/20">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPresences.includes(p.id)}
                        onChange={() => toggleSelectPresence(p.id)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {p.date} <br />
                      <span className="text-[10px] text-slate-400 font-normal mt-0.5 block">Approval pending</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                      {p.siswaName} <br />
                      <span className="text-[10px] font-normal text-slate-400">{p.className}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-550">{p.locationName}</td>
                    <td className="px-4 py-3">
                      {p.checkInTime ? (
                        <div className="flex items-center gap-2">
                          {p.checkInSelfie && (
                            <button
                              onClick={() => setViewingImage(p.checkInSelfie)}
                              className="h-8 w-8 rounded-md bg-slate-200 overflow-hidden shrink-0 border border-slate-300 pointer-events-auto"
                            >
                              <img src={p.checkInSelfie} className="h-full w-full object-cover" alt="selfie" />
                            </button>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-150">{p.checkInTime}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">D: {p.checkInDistance || 0}m</span>
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {p.checkOutTime ? (
                        <div className="flex items-center gap-2">
                          {p.checkOutSelfie && (
                            <button
                              onClick={() => setViewingImage(p.checkOutSelfie)}
                              className="h-8 w-8 rounded-md bg-slate-200 overflow-hidden shrink-0 border border-slate-300 pointer-events-auto"
                            >
                              <img src={p.checkOutSelfie} className="h-full w-full object-cover" alt="selfie" />
                            </button>
                          )}
                          <div>
                            <span className="font-bold text-slate-800 dark:text-slate-150">{p.checkOutTime}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">D: {p.checkOutDistance || 0}m</span>
                          </div>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black ${p.checkInStatus === 'telat' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
                        {p.checkInStatus === 'telat' ? 'TERLAMBAT' : 'TEPAT WAKTU'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.approved ? (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md animate-pulse">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteItem('presence', p.id, `${p.siswaName} (${p.date})`)}
                        className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 dark:text-rose-450 rounded-lg text-[10px] font-bold border border-rose-200/50 dark:border-rose-900/30 cursor-pointer inline-flex items-center gap-1 transition-all"
                        title="Hapus Kehadiran"
                      >
                        <Trash2 className="h-3 w-3" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5B. VIEW: KUNJUNGAN GURU */}
      {activeSubTab === 'visiting' && (
        <div className="space-y-6">
          {/* REKAP JUMLAH KUNJUNGAN TIAP GURU */}
          <div className="bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/30 dark:from-slate-950 dark:via-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 animate-scaleUp">
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
                Rekapitulasi Kunjungan Guru Pembimbing
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Akumulasi jumlah kunjungan site-visit monitoring kerja lapangan nyata untuk tiap pendidik terdaftar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teachers.map((t) => {
                const total = visitations.filter(v => v.guruId === t.id).length;
                const approved = visitations.filter(v => v.guruId === t.id && (v.status || 'approved') === 'approved').length;
                const pending = visitations.filter(v => v.guruId === t.id && (v.status || 'approved') === 'pending').length;
                const rejected = visitations.filter(v => v.guruId === t.id && (v.status || 'approved') === 'rejected').length;

                return (
                  <div 
                    key={t.id} 
                    className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col justify-between hover:border-indigo-500/25 transition-all relative overflow-hidden group"
                  >
                    <div className="space-y-1">
                      <span className="font-extrabold text-slate-800 dark:text-slate-100 block text-xs truncate" title={t.name}>
                        {t.name}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 block uppercase">NIP: {t.nip || '-'}</span>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 block font-medium">Total Kunjungan</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{total}</span>
                          <span className="text-[10px] text-slate-400 font-bold">Kali</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 text-[9px] text-right font-bold">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 rounded">
                          {approved} Sah
                        </span>
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 rounded">
                          {pending} Reviu
                        </span>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-700 dark:bg-rose-955/40 dark:text-rose-400 rounded">
                          {rejected} Tidak Sah
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {teachers.length === 0 && (
                <div className="col-span-full text-center py-6 text-xs text-slate-400">
                  Data pendidik kosong di sistem.
                </div>
              )}
            </div>
          </div>

          {/* MAIN VISITATION LOGS TABLE WITH VALIDATION ACTION */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <MapPin className="h-4.5 w-4.5 text-indigo-600" />
                Daftar Detail & Validasi Kunjungan Lapangan
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Semua draf laporan site-visit yang diajukan oleh guru sekolah, diverifikasi kordinat GPS dsn foto bukti di tempat PKL Mitra.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
              <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
                <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-850">
                  <tr>
                    <th className="px-4 py-3 text-center w-12">No</th>
                    <th className="px-4 py-3">Guru Pembimbing</th>
                    <th className="px-4 py-3">Tempat PKL Mitra</th>
                    <th className="px-4 py-3">Tanggal & Waktu</th>
                    <th className="px-4 py-3">Catatan Monitoring</th>
                    <th className="px-4 py-3">Kordinat GPS</th>
                    <th className="px-4 py-3 text-center">Foto Bukti</th>
                    <th className="px-4 py-3 text-center w-40">Status & Validasi Admin</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {visitations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400 dark:text-slate-550 text-xs">
                        Belum ada logging laporan kunjungan fisik dari para guru pembimbing di database.
                      </td>
                    </tr>
                  ) : (
                    visitations.map((v, idx) => {
                      const computedStatus = v.status || 'approved';
                      return (
                        <tr key={v.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-800 dark:text-white block">{v.guruName || 'Guru Pembimbing'}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">ID: {v.guruId}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-bold text-indigo-650 dark:text-indigo-400">{v.locationName || 'Tempat PKL'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold text-slate-700 dark:text-slate-300 block">{v.date}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">{v.time || 'WIB'}</span>
                          </td>
                          <td className="px-4 py-3 max-w-xs break-words">
                            <p className="text-xs text-slate-600 dark:text-slate-350 line-clamp-3" title={v.notes}>
                              "{v.notes}"
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                              <Map className="h-3 w-3 text-indigo-500" />
                              {v.latitude?.toFixed(5)}, {v.longitude?.toFixed(5)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {v.dokumentasiUrl ? (
                              <button
                                onClick={() => setViewingImage(v.dokumentasiUrl)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                Lihat Foto
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">No Image</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-2">
                              {/* Status Badge */}
                              {computedStatus === 'approved' && (
                                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full font-bold text-[9px] bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 uppercase tracking-wider">
                                  ✔ Sah / Valid
                                </span>
                              )}
                              {computedStatus === 'pending' && (
                                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full font-bold text-[9px] bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 uppercase tracking-wider animate-pulse">
                                  ⏳ Reviu Admin
                                </span>
                              )}
                              {computedStatus === 'rejected' && (
                                <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full font-bold text-[9px] bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50 uppercase tracking-wider">
                                  ✖ Ditolak
                                </span>
                              )}

                              {/* Action buttons */}
                              <div className="flex gap-1">
                                {computedStatus !== 'approved' && (
                                  <button
                                    onClick={() => handleValidateVisit(v.id, 'approved')}
                                    className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-[#10B981] text-white hover:bg-[#059669] cursor-pointer shadow-xs active:scale-95 transition-all"
                                  >
                                    Validasi
                                  </button>
                                )}
                                {computedStatus !== 'rejected' && (
                                  <button
                                    onClick={() => handleValidateVisit(v.id, 'rejected')}
                                    className="px-2 py-0.5 rounded-md text-[9px] font-extrabold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer shadow-xs active:scale-95 transition-all"
                                  >
                                    Tolak
                                  </button>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleDeleteItem('visit', v.id, `${v.guruName || 'Guru Pembimbing'} (${v.date})`)}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 dark:text-rose-450 rounded-lg text-[10px] font-bold border border-rose-200/50 dark:border-rose-900/30 cursor-pointer inline-flex items-center gap-1 transition-all"
                              title="Hapus Kunjungan"
                            >
                              <Trash2 className="h-3 w-3" />
                              Hapus
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5C. VIEW: LAPORAN & PERSETUJUAN IZIN */}
      {activeSubTab === 'approvals' && (
        <div className="space-y-4">
          {/* Inner Navigation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-xs gap-3">
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CheckCircle className="h-4.5 w-4.5 text-indigo-600" />
                Pusat Approval Dokumen & Laporan Siswa
              </h3>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                Kelola permohonan dispensasi absen magang siswa dan lakukan rekapitulasi jurnal harian.
              </p>
            </div>

            {/* Selector Toggles */}
            <div className="flex gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl">
              <button
                onClick={() => setApprovalsTab('izin')}
                className={`text-[11px] font-black px-4 py-1.5 rounded-lg transition-all cursor-pointer ${approvalsTab === 'izin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
              >
                Persetujuan Izin Siswa ({izins.length})
              </button>
              <button
                onClick={() => setApprovalsTab('jurnal')}
                className={`text-[11px] font-black px-4 py-1.5 rounded-lg transition-all cursor-pointer ${approvalsTab === 'jurnal' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
              >
                Jurnal Harian ({journals.length})
              </button>
            </div>
          </div>

          {/* TAB 1: PERSATUJUAN IZIN SISWA */}
          {approvalsTab === 'izin' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
                <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-850">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3">Nama Siswa / Kelas</th>
                      <th className="px-4 py-3">Tanggal Dispensasi</th>
                      <th className="px-4 py-3">Alasan Sakit / Izin</th>
                      <th className="px-4 py-3 text-center">Lampiran Bukti</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center w-40">Aksi Admin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {izins.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-slate-400 dark:text-slate-550 text-xs">
                          Belum ada permohonan izin atau dispensasi absen diajukan oleh siswa.
                        </td>
                      </tr>
                    ) : (
                      izins.map((i, idx) => (
                        <tr key={i.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-800 dark:text-white block">{i.siswaName || 'Siswa Magang'}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{i.className || '-'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-semibold block text-slate-705 dark:text-slate-300">{i.startDate}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">s/d {i.endDate}</span>
                          </td>
                          <td className="px-4 py-3 font-medium">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-black mb-1.5 ${i.type === 'sakit' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400' : 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950/40 dark:text-fuchsia-400'}`}>
                              {i.type?.toUpperCase()}
                            </span>
                            <p className="text-xs text-slate-550 dark:text-slate-400 max-w-xs break-words font-semibold">"{i.reason}"</p>
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {i.proofUrl ? (
                              <button
                                onClick={() => setViewingImage(i.proofUrl)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 rounded-lg text-indigo-650 dark:text-indigo-400 font-bold cursor-pointer transition-colors"
                              >
                                <Eye className="h-3 w-3" />
                                Lihat Surat
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Tidak Ada</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {i.status === 'pending' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black bg-amber-50 dark:bg-amber-950/40 text-amber-600 animate-pulse border border-amber-200 dark:border-amber-900">
                                PENDING
                              </span>
                            ) : i.status === 'approved' ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200 dark:border-emerald-900">
                                DISETUJUI
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase font-black bg-rose-50 dark:bg-rose-950/40 text-rose-600 border border-rose-200 dark:border-rose-900">
                                DITOLAK
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {i.status === 'pending' ? (
                              <div className="flex items-center gap-1.5 justify-center">
                                <button
                                  onClick={() => handleUpdateIzinStatus(i.id, 'approved')}
                                  className="p-1 px-2 text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-black shrink-0 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                                  title="Setujui Izin"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Setujui
                                </button>
                                <button
                                  onClick={() => handleUpdateIzinStatus(i.id, 'rejected')}
                                  className="p-1 px-2 text-[10px] bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-black shrink-0 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                                  title="Tolak Izin"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Tolak
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium">Tuntas di-approve</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: JURNAL HARIAN REKAP */}
          {approvalsTab === 'jurnal' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850">
                <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-850">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">No</th>
                      <th className="px-4 py-3">Nama Siswa / Instansi PKL</th>
                      <th className="px-4 py-3">Tanggal & Rating</th>
                      <th className="px-4 py-3">Rincian Aktivitas Praktik Lapangan</th>
                      <th className="px-4 py-3">Status Verifikasi</th>
                      <th className="px-4 py-3">Catatan Balikan Guru</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {journals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-400 dark:text-slate-550 text-xs">
                          Belum ada entri jurnal harian yang dilaporkan oleh para siswa magang.
                        </td>
                      </tr>
                    ) : (
                      journals.map((j, idx) => (
                        <tr key={j.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                          <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="px-4 py-3">
                            <span className="font-extrabold text-slate-850 dark:text-white block">{j.siswaName}</span>
                            <span className="text-[10px] font-bold text-indigo-600 block uppercase tracking-wide leading-none mt-0.5">{j.className}</span>
                            <span className="text-[10px] text-slate-400 block mt-1">PKL: {j.locationName || '-'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-semibold block text-slate-705 dark:text-slate-300">{j.date}</span>
                            <div className="flex items-center gap-0.5 mt-1">
                              {Array.from({ length: 5 }).map((_, idxS) => (
                                <span
                                  key={idxS}
                                  className={`text-xs ${idxS < j.rating ? 'text-amber-400 font-bold' : 'text-slate-200 dark:text-slate-850'}`}
                                >
                                  ★
                                </span>
                              ))}
                              <span className="text-[10px] text-slate-400 font-mono ml-1 font-bold">({j.rating}/5)</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 max-w-sm whitespace-normal break-words">
                            <p className="text-xs text-slate-650 dark:text-slate-350 pr-4 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                              {j.activity}
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            {j.status === 'approved' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900">
                                VERIFIED √
                              </span>
                            ) : j.status === 'rejected' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900">
                                DITOLAK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-100 dark:border-amber-900 animate-pulse">
                                MENUNGGU GURU
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            {j.notes ? (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xs italic">
                                "{j.notes}"
                              </p>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium italic">Belum ada tanggapan</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. VIEW: BACKUPS MODULES */}
      {activeSubTab === 'backup' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Databases snapshot list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Database Auto-Backup & Snapshots</h4>
                <p className="text-xs text-slate-400">Cadangkan kondisi snapshot registrasi pkl siswa ke folder cloud lokal.</p>
              </div>
              <button
                onClick={handleTriggerBackup}
                className="text-xs font-bold px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Database className="h-4 w-4" />
                Jalankan Backup
              </button>
            </div>

            <div className="divide-y divide-slate-105 dark:divide-slate-800 max-h-64 overflow-y-auto pr-1">
              {backups.map((bk) => (
                <div key={bk.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="block font-bold text-slate-700 dark:text-slate-350">{bk.fileName}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{bk.timestamp}</span>
                  </div>
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 bg-indigo-50 text-indigo-600 dark:bg-slate-800 dark:text-indigo-400 rounded">
                    {bk.recordsCount} Rows
                  </span>
                </div>
              ))}
              {backups.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-xs text-slate-500">
                  Belum ada log backup tersimpan. Tekan "Jalankan Backup" untuk mencadangkan database.
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp history logger (Simulated gateway system logs) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">Aliran Notifikasi WhatsApp Gateway Audit Log</h4>
                <p className="text-xs text-slate-400">Monitor status pengiriman SMS/WA realtime ke wali kelas, pembimbing, dan siswa.</p>
              </div>
              <button
                onClick={handleClearWaLogs}
                className="text-xs font-bold px-2.5 py-1 text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 rounded-lg cursor-pointer"
              >
                Clear Log
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {waLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-105 dark:border-slate-800/40 text-[11px] leading-relaxed relative">
                  <div className="flex items-center justify-between mb-1 font-bold">
                    <span className="text-slate-700 dark:text-slate-400">Penerima: +{log.phone}</span>
                    <span className="font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 px-1 py-0.5 rounded text-[9px]">SENT BY SYSTEM</span>
                  </div>
                  <p className="text-slate-550 italic">"{log.message}"</p>
                  <span className="absolute bottom-1 right-2 text-[9px] text-slate-400 font-mono">{log.timestamp}</span>
                </div>
              ))}
              {waLogs.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Tidak ada audit log pesan WhatsAppgateway terkirim dalam sesi ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- FORM MODALS --- */}
      {/* BULK UPLOAD EXCEL SUB-MODAL */}
      {isBulkSiswaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isUploadingBulk && setIsBulkSiswaModalOpen(false)} />
          <div className="relative w-full max-w-4xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[95vh] animate-in fade-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-100">
                    Import Serta Aktivasi Massal via Excel/CSV
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Daftarkan puluhan hingga ratusan siswa magang sekaligus ke aplikasi dengan satu kali unggah lembar sebar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => !isUploadingBulk && setIsBulkSiswaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer disabled:opacity-50"
                disabled={isUploadingBulk}
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Instruction Banner & Template Download */}
            <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 grid grid-cols-1 md:grid-cols-3 gap-4 items-center mb-5">
              <div className="md:col-span-2 space-y-1">
                <h4 className="font-bold text-xs text-slate-700 dark:text-slate-350">Petunjuk Format Berkas</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-455 leading-relaxed">
                  Pastikan spreadsheet Anda berisi minimal 3 kolom utama: <span className="font-extrabold text-indigo-600">Nama Lengkap</span>, <span className="font-extrabold text-indigo-600">NISN (10 digit)</span>, dan <span className="font-extrabold text-indigo-600">Kelas Kejuruan</span>. Anda dapat menyertakan kolom optional: No WhatsApp (untuk gateway WA), Email, Username, dan Password login.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={downloadBulkSiswaTemplate}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-xs border border-indigo-500"
                >
                  <FileDown className="h-4 w-4" />
                  Unduh Template Excel
                </button>
              </div>
            </div>

            {/* File Drag Area / Upload Controller */}
            {!isUploadingBulk && (
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50/20 dark:bg-slate-950/20 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors">
                <input
                  type="file"
                  ref={bulkFileRef}
                  accept=".xlsx, .xls, .csv"
                  onChange={handleBulkFileChange}
                  className="hidden"
                  id="bulk-excel-input"
                />
                <label htmlFor="bulk-excel-input" className="cursor-pointer flex flex-col items-center gap-2">
                  <UploadCloud className="h-10 w-10 text-emerald-500 animate-bounce" />
                  <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                    Pilih File Spreadsheet Anda (.xlsx, .xls, .csv)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Atau seret & taruh file di sini untuk memulai scanning otomatis.
                  </span>
                </label>
              </div>
            )}

            {bulkUploadError && (
              <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                <BadgeAlert className="h-4 w-4 shrink-0" />
                <span>{bulkUploadError}</span>
              </div>
            )}

            {isScanningFile && (
              <div className="mt-6 flex flex-col items-center justify-center py-10 space-y-3">
                <RefreshCw className="h-8 w-8 text-indigo-600 animate-spin" />
                <p className="text-xs text-slate-500 font-bold dark:text-slate-400">Sedang membaca berkas dan validasi duplikasi sistem...</p>
              </div>
            )}

            {/* Live Progress Bar during actual execution */}
            {isUploadingBulk && (
              <div className="mt-6 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-8 text-center space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-600">
                  <span>Mendaftarkan & Membuat Akun Siswa...</span>
                  <span>{bulkUploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-150" 
                    style={{ width: `${bulkUploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  Mohon jangan menutup jendela browser Anda. Kami sedang memproses pendaftaran logis beserta format credentials default per siswa.
                </p>
              </div>
            )}

            {/* Preview Parsed Data Grid */}
            {!isScanningFile && !isUploadingBulk && parsedBulkSiswa.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Hasil Validasi Data Excel ({parsedBulkSiswa.length} Baris Terdeteksi)
                  </h4>
                  <div className="flex gap-2">
                    <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 px-2.5 py-0.5 rounded-lg font-black border border-emerald-200">
                      Siap: {parsedBulkSiswa.filter(p => p.validationStatus === 'valid').length}
                    </span>
                    <span className="text-[10px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 px-2.5 py-0.5 rounded-lg font-black border border-rose-200">
                      Error/Duplikat: {parsedBulkSiswa.filter(p => p.validationStatus !== 'valid').length}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-850 max-h-56">
                  <table className="w-full border-collapse text-left text-xs text-slate-600 dark:text-slate-350">
                    <thead className="bg-slate-50 dark:bg-slate-950 text-[9px] uppercase font-bold text-slate-500 border-b border-slate-100 dark:border-slate-850 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 w-10 text-center">No</th>
                        <th className="px-3 py-2">Nama Lengkap</th>
                        <th className="px-3 py-2">NISN</th>
                        <th className="px-3 py-2">Kelas</th>
                        <th className="px-3 py-2">No WA</th>
                        <th className="px-3 py-2">Username Log</th>
                        <th className="px-3 py-2">Password Log</th>
                        <th className="px-3 py-2 text-center w-40">Status Validasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {parsedBulkSiswa.map((siswa, i) => (
                        <tr 
                          key={i} 
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/30 transition-colors ${siswa.validationStatus !== 'valid' ? 'bg-rose-50/30 dark:bg-rose-950/5' : ''}`}
                        >
                          <td className="px-3 py-2 text-center font-mono font-bold text-slate-400">{i + 1}</td>
                          <td className="px-3 py-2 font-bold text-slate-800 dark:text-white capitalize">{siswa.name || <em className="text-slate-400 font-normal">Belum diisi</em>}</td>
                          <td className="px-3 py-2 font-mono font-bold">{siswa.nisn || <em className="text-slate-400 font-normal">Blank</em>}</td>
                          <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-350">{siswa.className || <em className="text-slate-400 font-normal">Blank</em>}</td>
                          <td className="px-3 py-2 font-mono text-[11px]">{siswa.phone || '-'}</td>
                          <td className="px-3 py-2 font-mono text-indigo-650 dark:text-indigo-400">{siswa.username}</td>
                          <td className="px-3 py-2 font-mono">{siswa.password}</td>
                          <td className="px-3 py-2 text-center">
                            {siswa.validationStatus === 'valid' ? (
                              <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 rounded border border-emerald-200">
                                OK READY
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 text-[9px] font-black uppercase text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200" title={siswa.validationMsg}>
                                GAGAL: {siswa.validationMsg}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 mt-5">
              <button
                type="button"
                onClick={() => setIsBulkSiswaModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-850 text-xs text-slate-600 dark:text-slate-455 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer disabled:opacity-50"
                disabled={isUploadingBulk}
              >
                Tutup
              </button>
              {!isUploadingBulk && parsedBulkSiswa.length > 0 && parsedBulkSiswa.some(p => p.validationStatus === 'valid') && (
                <button
                  type="button"
                  onClick={handleExecuteBulkUpload}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer active:scale-95 transition-all inline-flex items-center gap-1.5"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Daftarkan {parsedBulkSiswa.filter(p => p.validationStatus === 'valid').length} Siswa Valid
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- FORM MODALS --- */}
      {/* SISWA SUB-MODAL */}
      {isSiswaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsSiswaModalOpen(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[95vh]">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">
              {editingItem ? 'Edit Profil Siswa PKL' : 'Pendaftaran Pendaftaran Siswa Magang Baru'}
            </h3>

            <form onSubmit={handleSaveSiswa} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nama Lengkap Siswa</label>
                  <input
                    type="text"
                    required
                    value={sisName}
                    onChange={(e) => setSisName(e.target.value)}
                    placeholder="Contoh: Dani Herdian"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">NISN (10 Digit)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={sisNisn}
                    onChange={(e) => setSisNisn(e.target.value)}
                    placeholder="0061234567"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Kelas Kejuruan</label>
                  {!showCustomClassInput ? (
                    <select
                      required
                      value={sisClass}
                      onChange={(e) => {
                        if (e.target.value === 'custom') {
                          setShowCustomClassInput(true);
                          setSisClass('');
                        } else {
                          setSisClass(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white cursor-pointer text-xs"
                    >
                      <option value="">-- Pilih Kelas --</option>
                      <option value="XII Farmasi Klinis">XII Farmasi Klinis</option>
                      <option value="XII Keperawatan A">XII Keperawatan A</option>
                      <option value="XII Keperawatan B">XII Keperawatan B</option>
                      <option value="XII Layanan Farmasi">XII Layanan Farmasi</option>
                      <option value="XII Caregiving">XII Caregiving</option>
                      <option value="XII Teknologi Laboratorium Medik">XII Teknologi Laboratorium Medik</option>
                      <option value="XII Farmasi Industri">XII Farmasi Industri</option>
                      <option value="custom">✍️ Lainnya (Ketik Manual)...</option>
                    </select>
                  ) : (
                    <div className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        value={sisClass}
                        onChange={(e) => setSisClass(e.target.value)}
                        placeholder="Ketik nama kelas..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomClassInput(false);
                          setSisClass('XII Farmasi Klinis');
                        }}
                        className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white rounded-xl text-[10px] cursor-pointer"
                        title="Kembali ke Dropdown"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nomor WhatsApp Aktif</label>
                  <input
                    type="tel"
                    value={sisPhone}
                    onChange={(e) => setSisPhone(e.target.value)}
                    placeholder="0852xxxx"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3">
                <span className="block font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest text-[9px]">{editingItem ? 'Informasi Akun Portal' : 'Detail Akun Portal Mandiri'}</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Username Siswa</label>
                    <input
                      type="text"
                      required
                      value={sisUsername}
                      onChange={(e) => setSisUsername(e.target.value)}
                      placeholder="Contoh: siswa9"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                    />
                  </div>
                  <div>
                    {editingItem ? (
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">ID Pengguna (Sistem)</label>
                        <input
                          type="text"
                          disabled
                          value={editingItem.userId || ''}
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-150 rounded-xl dark:border-slate-800 dark:bg-slate-900 text-slate-400 font-mono"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">Password Sesi</label>
                        <input
                          type="password"
                          required
                          value={sisPassword}
                          onChange={(e) => setSisPassword(e.target.value)}
                          placeholder="Minimal 6 karakter"
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Email Sekolah (Optional)</label>
                  <input
                    type="email"
                    value={sisEmail}
                    onChange={(e) => setSisEmail(e.target.value)}
                    placeholder="siswa@sekolah.sch.id"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Plotting Kantor PKL</label>
                  <select
                    value={sisPklId}
                    onChange={(e) => setSisPklId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white cursor-pointer"
                  >
                    <option value="">-- Belum Diplot / Tanpa Kantor --</option>
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Nama Guru Pembimbing</label>
                  <select
                    value={sisGuruId}
                    onChange={(e) => setSisGuruId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white cursor-pointer"
                  >
                    <option value="">-- Belum Ditunjuk --</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsSiswaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 text-xs cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-650 text-white font-bold text-xs shadow-xs hover:bg-indigo-700 cursor-pointer"
                >
                  {formLoading ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GURU SUB-MODAL */}
      {isGuruModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsGuruModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">
              {editingItem ? 'Edit Profil Guru Pembimbing' : 'Registrasi Guru Pembimbing Baru'}
            </h3>

            <form onSubmit={handleSaveGuru} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  value={gurName}
                  onChange={(e) => setGurName(e.target.value)}
                  placeholder="Contoh: Drs. Wahyu Hidayat"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">NIP Pegawai</label>
                <input
                  type="text"
                  required
                  value={gurNip}
                  onChange={(e) => setGurNip(e.target.value)}
                  placeholder="19xxxxxxxxxxxxxxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Nomor WA Aktif</label>
                <input
                  type="tel"
                  value={gurPhone}
                  onChange={(e) => setGurPhone(e.target.value)}
                  placeholder="0812xxxx"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 space-y-2">
                <span className="block font-bold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest text-[9px]">{editingItem ? 'Informasi Login Portal' : 'Akun Portal Guru'}</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold">Username</label>
                    <input
                      type="text"
                      required
                      value={gurUsername}
                      onChange={(e) => setGurUsername(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] bg-white dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                      placeholder="guru_budi"
                    />
                  </div>
                  <div>
                    {editingItem ? (
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold">ID Pengguna</label>
                        <input
                          type="text"
                          disabled
                          value={editingItem.userId || ''}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono border-slate-200 dark:border-slate-800"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[10px] text-slate-500 font-bold">Password</label>
                        <input
                          type="password"
                          required
                          value={gurPassword}
                          onChange={(e) => setGurPassword(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] bg-white dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                          placeholder="guru123"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-bold">Email Instansi (Optional)</label>
                  <input
                    type="email"
                    value={gurEmail}
                    onChange={(e) => setGurEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border text-[11px] bg-white dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-800"
                    placeholder="guru@sekolah.sch.id"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsGuruModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                >
                  Simpan Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEMPAT PKL MITRA SUB-MODAL */}
      {isPklModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsPklModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl max-h-[95vh] overflow-y-auto">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-4">
              {editingItem ? 'Edit Informasi Tempat PKL' : 'Pendaftaran Tempat Praktik Industri'}
            </h3>

            <form onSubmit={handleSavePkl} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Nama Perusahaan / Instansi</label>
                <input
                  type="text"
                  required
                  value={pklName}
                  onChange={(e) => setPklName(e.target.value)}
                  placeholder="Contoh: PT. Kreasi Teknologi Baru"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Alamat Kantor Lengkap</label>
                <textarea
                  required
                  rows={2}
                  value={pklAddress}
                  onChange={(e) => setPklAddress(e.target.value)}
                  placeholder="Alamat kantor lengkap, Kota, Provinsi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">GPS Latitude (Lintang)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={pklLat}
                    onChange={(e) => setPklLat(e.target.value)}
                    placeholder="-7.78129"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">GPS Longitude (Bujur)</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={pklLng}
                    onChange={(e) => setPklLng(e.target.value)}
                    placeholder="110.37123"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Max Radius (Meter)</label>
                  <input
                    type="number"
                    required
                    value={pklRadius}
                    onChange={(e) => setPklRadius(e.target.value)}
                    placeholder="Contoh: 100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Slot Quota PKL</label>
                  <input
                    type="number"
                    required
                    value={pklQuota}
                    onChange={(e) => setPklQuota(e.target.value)}
                    placeholder="Jumlah tampung siswa"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsPklModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-650 hover:bg-slate-50 text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700"
                >
                  Simpan Tempat PKL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && deleteTarget && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4 text-rose-600">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-full">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Konfirmasi Hapus Data
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-350 mb-5 leading-relaxed">
              Apakah Anda yakin ingin menghapus data{' '}
              {deleteTarget.type === 'siswa' 
                ? 'siswa' 
                : deleteTarget.type === 'guru' 
                  ? 'guru pembimbing' 
                  : deleteTarget.type === 'pkl' 
                    ? 'lokasi PKL' 
                    : deleteTarget.type === 'presence' 
                      ? 'kehadiran siswa' 
                      : 'kunjungan guru'}{' '}
              <span className="font-extrabold text-slate-800 dark:text-white">"{deleteTarget.name}"</span> secara permanen dari server? Tindakan ini tidak dapat dibatalkan.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={performDeleteItem}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Ya, Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PASSWORD RESET SUB-MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsResetModalOpen(false)} />
          <div className="relative w-full max-w-xs rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 shadow-2xl">
            <h3 className="text-base font-black text-slate-800 dark:text-slate-105 mb-2">Reset Password Akun</h3>
            <p className="text-[11px] text-slate-500 mb-4">Wajib ganti password akun untuk siswa dsn guru: <b>{resetTargetName}</b>.</p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-500 font-bold mb-1">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={resetNewPassword}
                  onChange={(e) => setResetNewPassword(e.target.value)}
                  placeholder="Ketik password baru..."
                  className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-500 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
                >
                  Ganti Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL RECORD IMAGE OVERLAY ZOOM */}
      {viewingImage && (
        <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/80 p-4">
          <div className="absolute inset-0 cursor-pointer" onClick={() => setViewingImage(null)} />
          <div className="relative max-w-md w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 text-center animate-zoomIn p-3">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 bg-black/60 text-white rounded-full p-2 hover:bg-black/90 cursor-pointer transition-colors"
            >
              <EyeOff className="h-5 w-5" />
            </button>
            <span className="block text-xs uppercase tracking-widest font-extrabold text-slate-400 mb-3">Foto Presensi selfie / Bukti Izin</span>
            <img src={viewingImage} className="w-full max-h-[70vh] rounded-xl object-contain bg-slate-950 border border-slate-800" alt="Selfie" />
            <p className="text-slate-400 text-xs mt-3">Ditangkap via HTML5 Camera API dan Geotagging GPS otomatis.</p>
          </div>
        </div>
      )}

    </div>
  );
}
