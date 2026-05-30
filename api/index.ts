//import express from 'express';
//import path from 'path';
//import fs from 'fs';
//import { 
  User, UserRole, PklLocation, SiswaProfile, 
  GuruProfile, Presence, Journal, Izin, Visit, 
  GuidanceNote, WaLog, BackupHistory, Competency 
//} from '../src/types';

const app = express();
const PORT = 3000;

// Body parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database file path
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const BACKUPS_DIR = path.join(process.cwd(), 'data', 'backups');

// Helper to ensure data directory exists
if (!fs.existsSync(path.join(process.cwd(), 'data'))) {
  fs.mkdirSync(path.join(process.cwd(), 'data'));
}
if (!fs.existsSync(BACKUPS_DIR)) {
  fs.mkdirSync(BACKUPS_DIR);
}

// Initial Seeding Data
const initialUsers: User[] = [
  { id: 'usr-admin', username: 'admin', name: 'Administrator E-PKL', role: 'admin', phone: '081234567890', email: 'admin@epkl.go.id' },
  { id: 'usr-guru1', username: 'guru1', name: 'Pak Budianto, S.Pd.', role: 'guru', phone: '081122334455', email: 'budianto@sekolah.sch.id', nip: '198001012010121001' },
  { id: 'usr-guru2', username: 'guru2', name: 'Bu Sri Rahayu, M.Kom.', role: 'guru', phone: '081122334466', email: 'sri.rahayu@sekolah.sch.id', nip: '198502022012122002' },
  { id: 'usr-siswa1', username: 'siswa1', name: 'Adit Saputra', role: 'siswa', phone: '085211223301', email: 'adit@siswa.id', nisn: '0071234561' },
  { id: 'usr-siswa2', username: 'siswa2', name: 'Beni Kurniawan', role: 'siswa', phone: '085211223302', email: 'beni@siswa.id', nisn: '0071234562' },
  { id: 'usr-siswa3', username: 'siswa3', name: 'Citra Lestari', role: 'siswa', phone: '085211223303', email: 'citra@siswa.id', nisn: '0071234563' }
];

const initialUserPasswords: Record<string, string> = {
  'usr-admin': 'admin123',
  'usr-guru1': 'guru123',
  'usr-guru2': 'guru123',
  'usr-siswa1': 'siswa123',
  'usr-siswa2': 'siswa123',
  'usr-siswa3': 'siswa123'
};

const initialPklLocations: PklLocation[] = [
  { id: 'pkl-telkom', name: 'PT. Telkom Indonesia Witel Yogyakarta', address: 'Jl. Sudirman No. 9, Yogyakarta', latitude: -7.7829, longitude: 110.3700, radius: 100, quota: 5 },
  { id: 'pkl-goto', name: 'GoTo Group HQ Jakarta', address: 'Jl. Gatot Subroto No. 17, Jakarta', latitude: -6.2234, longitude: 106.8189, radius: 100, quota: 4 },
  { id: 'pkl-bukalapak', name: 'Bukalapak Office Bandung', address: 'Jl. Asia Afrika No. 120, Bandung', latitude: -6.9147, longitude: 107.6098, radius: 100, quota: 3 }
];

const initialSiswaProfiles: SiswaProfile[] = [
  {
    id: 'sis-1',
    userId: 'usr-siswa1',
    name: 'Adit Saputra',
    nisn: '0071234561',
    className: 'XII Farmasi Klinis',
    phone: '085211223301',
    pklLocationId: 'pkl-telkom',
    pembimbingId: 'sis-guru1',
    progressCompetency: 75,
    grades: {
      penerimaanObat: 80,
      peracikanObat: 85,
      informasiObat: 75,
      vitalSigns: 70,
      basicCaregiving: 90,
      komunikasiTerapeutik: 85,
      softSkillsMedis: 90
    }
  },
  {
    id: 'sis-2',
    userId: 'usr-siswa2',
    name: 'Beni Kurniawan',
    nisn: '0071234562',
    className: 'XII Keperawatan A',
    phone: '085211223302',
    pklLocationId: 'pkl-telkom',
    pembimbingId: 'sis-guru1',
    progressCompetency: 40,
    grades: {
      penerimaanObat: 70,
      peracikanObat: 65,
      informasiObat: 60,
      vitalSigns: 55,
      basicCaregiving: 80,
      komunikasiTerapeutik: 75,
      softSkillsMedis: 80
    }
  },
  {
    id: 'sis-3',
    userId: 'usr-siswa3',
    name: 'Citra Lestari',
    nisn: '0071234563',
    className: 'XII Keperawatan B',
    phone: '085211223303',
    pklLocationId: 'pkl-bukalapak',
    pembimbingId: 'sis-guru2',
    progressCompetency: 90,
    grades: {
      penerimaanObat: 90,
      peracikanObat: 95,
      informasiObat: 88,
      vitalSigns: 85,
      basicCaregiving: 95,
      komunikasiTerapeutik: 92,
      softSkillsMedis: 95
    }
  }
];

const initialGuruProfiles: GuruProfile[] = [
  { id: 'sis-guru1', userId: 'usr-guru1', name: 'Pak Budianto, S.Pd.', nip: '198001012010121001', phone: '081122334455' },
  { id: 'sis-guru2', userId: 'usr-guru2', name: 'Bu Sri Rahayu, M.Kom.', nip: '198502022012122002', phone: '081122334466' }
];

const initialPresences: Presence[] = [
  {
    id: 'pres-1',
    siswaId: 'sis-1',
    date: '2026-05-28',
    checkInTime: '07:45:12',
    checkInLatitude: -7.7828,
    checkInLongitude: 110.3701,
    checkInDistance: 15,
    checkInStatus: 'tepat_waktu',
    checkOutTime: '17:02:11',
    checkOutLatitude: -7.7829,
    checkOutLongitude: 110.3700,
    checkOutDistance: 5,
    checkOutStatus: 'normal',
    approved: true
  },
  {
    id: 'pres-2',
    siswaId: 'sis-1',
    date: '2026-05-29',
    checkInTime: '08:15:22',
    checkInLatitude: -7.7831,
    checkInLongitude: 110.3699,
    checkInDistance: 25,
    checkInStatus: 'telat',
    checkOutTime: '17:00:00',
    checkOutLatitude: -7.7829,
    checkOutLongitude: 110.3700,
    checkOutDistance: 2,
    checkOutStatus: 'normal',
    approved: true
  },
  {
    id: 'pres-3',
    siswaId: 'sis-3',
    date: '2026-05-29',
    checkInTime: '07:30:00',
    checkInLatitude: -6.9146,
    checkInLongitude: 107.6097,
    checkInDistance: 12,
    checkInStatus: 'tepat_waktu',
    checkOutTime: '16:30:00',
    checkOutLatitude: -6.9147,
    checkOutLongitude: 107.6098,
    checkOutDistance: 4,
    checkOutStatus: 'normal',
    approved: true
  }
];

const initialJournals: Journal[] = [
  { id: 'jrn-1', siswaId: 'sis-1', date: '2026-05-28', activity: 'Mempelajari arsitektur mikroservis internal Telkom dan setup lingkungan docker server lokal.', rating: 4, status: 'approved', notes: 'Bagus, teruskan eksplorasi sistem Linuxnya!' },
  { id: 'jrn-2', siswaId: 'sis-1', date: '2026-05-29', activity: 'Melakukan troubleshooting router jaringan di departemen IT support lantai 2.', rating: 5, status: 'approved', notes: 'Kerja bagus, selesaikan pelaporannya.' },
  { id: 'jrn-3', siswaId: 'sis-2', date: '2026-05-29', activity: 'Konfigurasi IP statis pada perangkat router Telkom dan setup kabel UTP.', rating: 3, status: 'approved', notes: 'Tingkatkan presisi dalam pemasangan RJ45.' },
  { id: 'jrn-4', siswaId: 'sis-3', date: '2026-05-29', activity: 'Merancang API endpoint backend menggunakan Koa JS untuk modul otentikasi merchant baru di Bukalapak.', rating: 5, status: 'approved', notes: 'Tingkat kesulitan tinggi. Sangat baik.' }
];

const initialIzins: Izin[] = [
  { id: 'iz-1', siswaId: 'sis-2', startDate: '2026-05-27', endDate: '2026-05-28', type: 'sakit', reason: 'Mengalami demam tinggi dan harus istirahat bed rest total dari anjuran klinik.', status: 'approved', approvedBy: 'usr-guru1' }
];

const initialVisits: Visit[] = [
  { id: 'vis-1', guruId: 'sis-guru1', pklLocationId: 'pkl-telkom', date: '2026-05-28', time: '10:30:00', notes: 'Melakukan kunjungan pertama ke Telkom Yogyakarta. Siswa didapati hadir dengan disiplin dan memiliki supervisor pembimbing industri yang kooperatif.', latitude: -7.7829, longitude: 110.3700 }
];

const initialGuidances: GuidanceNote[] = [
  { id: 'gd-1', siswaId: 'sis-1', date: '2026-05-28', notes: 'Siswa Adit menunjukkan inisiatif tinggi pada minggu pertama magang. Sangat tanggap terhadap diskusi infrastruktur cloud.', category: 'akademik', guruId: 'sis-guru1' },
  { id: 'gd-2', siswaId: 'sis-2', date: '2026-05-28', notes: 'Siswa Beni terlambat hari ini. Sudah dibina mengenai kedisiplinan jam kerja industri bersama supervisor.', category: 'kedisiplinan', guruId: 'sis-guru1' }
];

const initialWaLogs: WaLog[] = [
  { id: 'wa-1', phone: '085211223301', message: '[EPKL] Hallo Adit, presensi MASUK Anda pada 2026-05-29 pukul 07:45:12 berhasil dicatatkan dengan jarak 15m (DI DALAM RADIUS).', timestamp: '2026-05-29 07:45:12', status: 'sent' }
];

const initialCompetencies: Competency[] = [
  { id: 'penerimaanObat', code: 'FAR01', name: 'Penerimaan & Penyimpanan Farmasi', description: 'Kemampuan administrasi penerimaan, verifikasi, dan penyimpanan perbekalan farmasi berdasarkan prinsip FIFO/FEFO dan suhu penyimpanan yang sesuai.' },
  { id: 'peracikanObat', code: 'FAR02', name: 'Pelayanan Resep & Peracikan Obat', description: 'Kemampuan membaca resep medis, menghitung dosis obat dasar, melakukan penyelesaian sediaan (puyer, salep, kapsul), serta mengemas obat dengan etiket yang informatif.' },
  { id: 'informasiObat', code: 'FAR03', name: 'KIE & Swamedikasi Dasar', description: 'Kemampuan menjelaskan cara pakai obat yang aman, indikasi/kontraindikasi, efek samping ringan, dan memberikan komunikasi informasi edukasi swamedikasi dasar kepada keluarga pasien.' },
  { id: 'vitalSigns', code: 'KEP01', name: 'Pemeriksaan TTV & Fisik Dasar', description: 'Kemampuan memantau dan mencatat tanda-tanda vital secara akurat (tekanan darah, detak jantung, suhu badan, laju pernafasan), serta melakukan pengamatan kondisi umum fisik pasien.' },
  { id: 'basicCaregiving', code: 'KEP02', name: 'Pemenuhan KDM & Personal Higiene', description: 'Kemampuan mengasuh kebutuhan dasar manusia (makan, minum, eliminasi), membantu memandikan di tempat tidur, melakukan perawatan rambut & gigi mulut, serta melakukan mobilisasi fisik pasien secara aman.' },
  { id: 'komunikasiTerapeutik', code: 'KEP03', name: 'Komunikasi Terapeutik & Etika Medis', description: 'Kemampuan berkomunikasi dengan empati, kesabaran tinggi kepada pasien rentan/lansia (caregiving), menerapkan kode etik kerahasiaan medis, dan mendokumentasikan logbook harian klinis.' },
  { id: 'softSkillsMedis', code: 'SEK01', name: 'Sikap Kerja & Disiplin Sterilitas', description: 'Kepatuhan tinggi pada peraturan tempat kerja, ketepatan kehadiran, etika penampilan medis rapi, kerja sama tim, serta kepatuhan pemakaian APD dan standar kebersihan sterilitas medis.' }
];

interface DbSchema {
  users: User[];
  passwords: Record<string, string>;
  siswaProfiles: SiswaProfile[];
  guruProfiles: GuruProfile[];
  pklLocations: PklLocation[];
  presences: Presence[];
  journals: Journal[];
  izins: Izin[];
  visits: Visit[];
  guidances: GuidanceNote[];
  waLogs: WaLog[];
  backups: BackupHistory[];
  competencies: Competency[];
}

let db: DbSchema = {
  users: initialUsers,
  passwords: initialUserPasswords,
  siswaProfiles: initialSiswaProfiles,
  guruProfiles: initialGuruProfiles,
  pklLocations: initialPklLocations,
  presences: initialPresences,
  journals: initialJournals,
  izins: initialIzins,
  visits: initialVisits,
  guidances: initialGuidances,
  waLogs: initialWaLogs,
  backups: [],
  competencies: initialCompetencies
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
      db = { ...db, ...parsed };
      if (!db.competencies || db.competencies.length === 0 || db.competencies.some(c => c.id === 'instalasiJaringan')) {
        db.competencies = initialCompetencies;
        saveDatabase();
      }
    } else {
      saveDatabase();
    }
  } catch (error) {
    console.error('Failed to load database. Working with RAM fallback.', error);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

loadDatabase();

function sendSimulatedWaMessage(phone: string, text: string) {
  const log: WaLog = {
    id: 'wa-' + Date.now() + Math.floor(Math.random() * 1000),
    phone,
    message: text,
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    status: 'sent'
  };
  db.waLogs.unshift(log);
  saveDatabase();
  console.log(`[WhatsApp Gateway Send] to ${phone}: ${text}`);
  return log;
}

// ---------------------- API ROUTERS ----------------------

// 1. Session & Auth Logic
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username dan Password wajib diisi!' });
  }

  const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Username tidak terdaftar sebagai peserta E-PKL!' });
  }

  const registeredPassword = db.passwords[user.id];
  if (registeredPassword !== password) {
    return res.status(401).json({ error: 'Password yang Anda masukkan salah!' });
  }

  let sisProfile: SiswaProfile | undefined;
  let gurProfile: GuruProfile | undefined;

  if (user.role === 'siswa') {
    sisProfile = db.siswaProfiles.find(s => s.userId === user.id);
  } else if (user.role === 'guru') {
    gurProfile = db.guruProfiles.find(g => g.userId === user.id);
  }

  return res.json({
    success: true,
    user,
    profile: sisProfile || gurProfile || null,
    message: `Selamat datang kembali, ${user.name}!`
  });
});

app.post('/api/auth/reset-password', (req, res) => {
  const { userId, newPassword } = req.body;
  if (!userId || !newPassword) {
    return res.status(400).json({ error: 'User ID dan Password baru wajib diisi!' });
  }

  const user = db.users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
  }

  db.passwords[userId] = newPassword;
  saveDatabase();

  if (user.phone) {
    sendSimulatedWaMessage(user.phone, `[EPKL] Halo ${user.name}, administrator telah mereset kata sandi akun Anda. Password baru Anda sekarang: ${newPassword}. Silakan ganti kata sandi demi keamanan!`);
  }

  return res.json({ success: true, message: `Password siswa/guru ${user.name} berhasil direset.` });
});

// 2. Data Siswa CRUD
app.get('/api/siswa', (req, res) => {
  const mappedSiswa = db.siswaProfiles.map(profile => {
    const user = db.users.find(u => u.id === profile.userId);
    const location = db.pklLocations.find(l => l.id === profile.pklLocationId);
    const pembimbing = db.guruProfiles.find(g => g.id === profile.pembimbingId);
    return {
      ...profile,
      email: user?.email || '',
      username: user?.username || '',
      phone: profile.phone || user?.phone || '',
      locationName: location?.name || 'Belum diplotkan',
      pembimbingName: pembimbing?.name || 'Belum ditugaskan'
    };
  });
  return res.json(mappedSiswa);
});

app.post('/api/siswa', (req, res) => {
  const { name, nisn, className, phone, email, username, password, pklLocationId, pembimbingId } = req.body;

  if (!name || !nisn || !className || !username || !password) {
    return res.status(400).json({ error: 'Nama, NISN, Kelas, Username & Password wajib diisi!' });
  }

  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username sudah digunakan oleh pengguna lain!' });
  }

  const userId = 'usr-' + Date.now();
  const siswaId = 'sis-' + Date.now();

  const newUser: User = { id: userId, username, name, role: 'siswa', phone, email, nisn };
  db.users.push(newUser);
  db.passwords[userId] = password;

  const newProfile: SiswaProfile = {
    id: siswaId,
    userId,
    name,
    nisn,
    className,
    phone: phone || '',
    pklLocationId: pklLocationId || undefined,
    pembimbingId: pembimbingId || undefined,
    progressCompetency: 0,
    grades: {}
  };
  db.siswaProfiles.push(newProfile);
  saveDatabase();

  if (phone) {
    sendSimulatedWaMessage(phone, `[EPKL] Halo ${name}, Akun portal E-PKL Anda telah diaktifkan oleh admin. Username: ${username}, Password: ${password}. Harap melakukan absensi sesuai penempatan PKL.`);
  }

  return res.json({ success: true, data: newProfile });
});

app.put('/api/siswa/:id', (req, res) => {
  const { id } = req.params;
  const { name, nisn, className, phone, pklLocationId, pembimbingId, progressCompetency, username, email } = req.body;

  const profile = db.siswaProfiles.find(s => s.id === id);
  if (!profile) return res.status(404).json({ error: 'Profil siswa tidak ditemukan' });

  profile.name = name ?? profile.name;
  profile.nisn = nisn ?? profile.nisn;
  profile.className = className ?? profile.className;
  profile.phone = phone ?? profile.phone;
  profile.pklLocationId = pklLocationId === "" ? undefined : (pklLocationId ?? profile.pklLocationId);
  profile.pembimbingId = pembimbingId === "" ? undefined : (pembimbingId ?? profile.pembimbingId);
  if (progressCompetency !== undefined) {
    profile.progressCompetency = Number(progressCompetency);
  }

  if (req.body.reportFileName !== undefined) profile.reportFileName = req.body.reportFileName;
  if (req.body.reportFileContent !== undefined) profile.reportFileContent = req.body.reportFileContent;
  if (req.body.reportStatus !== undefined) {
    profile.reportStatus = req.body.reportStatus;
    if ((req.body.reportStatus === 'approved' || req.body.reportStatus === 'rejected') && profile.phone) {
      sendSimulatedWaMessage(profile.phone, `[EPKL NOTIFIKASI LAPORAN] Halo ${profile.name}, Laporan observasi PKL Anda telah diperiksa oleh guru pembimbing dengan status: ${req.body.reportStatus.toUpperCase()}. Catatan: "${req.body.reportNotes || '-'}"`);
    }
  }
  if (req.body.reportNotes !== undefined) profile.reportNotes = req.body.reportNotes;
  if (req.body.reportGrade !== undefined) profile.reportGrade = req.body.reportGrade;

  const user = db.users.find(u => u.id === profile.userId);
  if (user) {
    user.name = profile.name;
    user.phone = profile.phone;
    user.nisn = profile.nisn;
    
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ error: 'Username sudah digunakan oleh pengguna lain!' });
      }
      user.username = username;
    }
    if (email !== undefined) {
      user.email = email;
    }
  }

  saveDatabase();
  return res.json({ success: true, data: profile });
});

app.delete('/api/siswa/:id', (req, res) => {
  const { id } = req.params;
  const index = db.siswaProfiles.findIndex(s => s.id === id);
  if (index === -1) return res.status(404).json({ error: 'Profil siswa tidak ditemukan' });

  const profile = db.siswaProfiles[index];
  db.users = db.users.filter(u => u.id !== profile.userId);
  delete db.passwords[profile.userId];

  db.siswaProfiles.splice(index, 1);
  saveDatabase();
  return res.json({ success: true, message: 'Data siswa terhapus secara permanen.' });
});

// 3. Data Guru CRUD
app.get('/api/guru', (req, res) => {
  const mappedGuru = db.guruProfiles.map(profile => {
    const user = db.users.find(u => u.id === profile.userId);
    const bimbinganCount = db.siswaProfiles.filter(s => s.pembimbingId === profile.id).length;
    return {
      ...profile,
      email: user?.email || '',
      username: user?.username || '',
      phone: profile.phone || user?.phone || '',
      bimbinganCount
    };
  });
  return res.json(mappedGuru);
});

app.post('/api/guru', (req, res) => {
  const { name, nip, phone, email, username, password } = req.body;

  if (!name || !nip || !username || !password) {
    return res.status(400).json({ error: 'Nama, NIP/NIDN, Username & Password wajib diisi!' });
  }

  if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ error: 'Username guru sudah terdaftar!' });
  }

  const userId = 'usr-' + Date.now();
  const guruId = 'sis-guru' + Date.now();

  const newUser: User = { id: userId, username, name, role: 'guru', phone, email, nip };
  db.users.push(newUser);
  db.passwords[userId] = password;

  const newProfile: GuruProfile = {
    id: guruId,
    userId,
    name,
    nip,
    phone: phone || ''
  };
  db.guruProfiles.push(newProfile);
  saveDatabase();

  return res.json({ success: true, data: newProfile });
});

app.put('/api/guru/:id', (req, res) => {
  const { id } = req.params;
  const { name, nip, phone, username, email } = req.body;

  const profile = db.guruProfiles.find(g => g.id === id);
  if (!profile) return res.status(404).json({ error: 'Profil guru tidak ditemukan' });

  profile.name = name ?? profile.name;
  profile.nip = nip ?? profile.nip;
  profile.phone = phone ?? profile.phone;

  const user = db.users.find(u => u.id === profile.userId);
  if (user) {
    user.name = profile.name;
    user.phone = profile.phone;
    user.nip = profile.nip;

    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      if (db.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ error: 'Username sudah digunakan oleh pengguna lain!' });
      }
      user.username = username;
    }
    if (email !== undefined) {
      user.email = email;
    }
  }

  saveDatabase();
  return res.json({ success: true, data: profile });
});

app.delete('/api/guru/:id', (req, res) => {
  const { id } = req.params;
  const index = db.guruProfiles.findIndex(g => g.id === id);
  if (index === -1) return res.status(404).json({ error: 'Profil guru tidak ditemukan' });

  const profile = db.guruProfiles[index];
  db.users = db.users.filter(u => u.id !== profile.userId);
  delete db.passwords[profile.userId];

  db.siswaProfiles.forEach(s => {
    if (s.pembimbingId === id) s.pembimbingId = undefined;
  });

  db.guruProfiles.splice(index, 1);
  saveDatabase();
  return res.json({ success: true, message: 'Data guru berhasil dihapus.' });
});

// 4. Tempat PKL CRUD
app.get('/api/pkl', (req, res) => {
  const result = db.pklLocations.map(location => {
    const filled = db.siswaProfiles.filter(s => s.pklLocationId === location.id).length;
    return {
      ...location,
      filledQuota: filled
    };
  });
  return res.json(result);
});

app.post('/api/pkl', (req, res) => {
  const { name, address, latitude, longitude, radius, quota } = req.body;

  if (!name || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Nama, Alamat, dan Titik Koordinat wajib diisi lengkap!' });
  }

  const newPkl: PklLocation = {
    id: 'pkl-' + Date.now(),
    name,
    address,
    latitude: Number(latitude),
    longitude: Number(longitude),
    radius: radius ? Number(radius) : 100,
    quota: quota ? Number(quota) : 5
  };

  db.pklLocations.push(newPkl);
  saveDatabase();
  return res.json({ success: true, data: newPkl });
});

app.put('/api/pkl/:id', (req, res) => {
  const { id } = req.params;
  const { name, address, latitude, longitude, radius, quota } = req.body;

  const pkl = db.pklLocations.find(l => l.id === id);
  if (!pkl) return res.status(404).json({ error: 'Lokasi PKL tidak ditemukan' });

  pkl.name = name ?? pkl.name;
  pkl.address = address ?? pkl.address;
  if (latitude !== undefined) pkl.latitude = Number(latitude);
  if (longitude !== undefined) pkl.longitude = Number(longitude);
  if (radius !== undefined) pkl.radius = Number(radius);
  if (quota !== undefined) pkl.quota = Number(quota);

  saveDatabase();
  return res.json({ success: true, data: pkl });
});

app.delete('/api/pkl/:id', (req, res) => {
  const { id } = req.params;
  const index = db.pklLocations.findIndex(l => l.id === id);
  if (index === -1) return res.status(404).json({ error: 'Lokasi PKL tidak ditemukan' });

  db.siswaProfiles.forEach(s => {
    if (s.pklLocationId === id) s.pklLocationId = undefined;
  });

  db.pklLocations.splice(index, 1);
  saveDatabase();
  return res.json({ success: true, message: 'Lokasi PKL berhasil dihapus.' });
});

// 5. Presensi Masuk & Pulang
app.get('/api/presence', (req, res) => {
  const { siswaId, date } = req.query;
  let list = db.presences;

  if (siswaId) {
    list = list.filter(p => p.siswaId === siswaId);
  }
  if (date) {
    list = list.filter(p => p.date === date);
  }

  const mapped = list.map(p => {
    const s = db.siswaProfiles.find(sp => sp.id === p.siswaId);
    const loc = s ? db.pklLocations.find(l => l.id === s.pklLocationId) : null;
    const guru = s ? db.guruProfiles.find(g => g.id === s.pembimbingId) : null;
    return {
      ...p,
      siswaName: s?.name || 'Siswa Tanpa Nama',
      className: s?.className || '-',
      siswaNisn: s?.nisn || '-',
      pembimbingName: guru?.name || 'Belum diplot',
      pembimbingPhone: guru?.phone || '',
      locationName: loc?.name || 'Belum diplot',
      locationCoords: loc ? { lat: loc.latitude, lng: loc.longitude, radius: loc.radius } : null
    };
  });

  return res.json(mapped);
});

app.post('/api/presence/checkin', (req, res) => {
  const { siswaId, latitude, longitude, selfie } = req.body;

  if (!siswaId || latitude === undefined || longitude === undefined || !selfie) {
    return res.status(400).json({ error: 'Wajib menyertakan Siswa ID, selfie, dan data GPS!' });
  }

  const siswa = db.siswaProfiles.find(s => s.id === siswaId);
  if (!siswa) return res.status(404).json({ error: 'Siswa tidak terdaftar!' });
  if (!siswa.pklLocationId) return res.status(400).json({ error: 'Anda belum ditempatkan di lokasi PKL oleh admin!' });

  const location = db.pklLocations.find(l => l.id === siswa.pklLocationId);
  if (!location) return res.status(404).json({ error: 'Data lokasi PKL penempatan Anda rusak/tidak ditemukan.' });

  const distance = getDistanceMeters(Number(latitude), Number(longitude), location.latitude, location.longitude);
  if (distance > location.radius) {
    return res.status(400).json({ 
      error: `Presensi Gagal! Anda berada ${distance}m di luar jangkauan wilayah PKL. Maksimum radius toleransi adalah ${location.radius} unit meter.`,
      distance
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  let presence = db.presences.find(p => p.siswaId === siswaId && p.date === todayStr);

  if (presence && presence.checkInTime) {
    return res.status(400).json({ error: 'Anda sudah tercatat melakukan presensi MASUK untuk hari ini!' });
  }

  const limitHour = 8;
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const checkInStatus = (currentHour > limitHour || (currentHour === limitHour && currentMinute > 0)) ? 'telat' : 'tepat_waktu';

  if (!presence) {
    presence = {
      id: 'pres-' + Date.now(),
      siswaId,
      date: todayStr,
      approved: false
    };
    db.presences.push(presence);
  }

  presence.checkInTime = timeStr;
  presence.checkInLatitude = Number(latitude);
  presence.checkInLongitude = Number(longitude);
  presence.checkInDistance = distance;
  presence.checkInSelfie = selfie;
  presence.checkInStatus = checkInStatus;

  saveDatabase();

  if (siswa.phone) {
    sendSimulatedWaMessage(siswa.phone, `[EPKL PRESENSI] Halo ${siswa.name}, absensi MASUK berhasil terekam pada pukul ${timeStr} dengan radius ${distance}m dari pusat lokasi magang (${location.name}). Status: ${checkInStatus === 'telat' ? 'TERLAMBAT ⚠️' : 'TEPAT WAKTU ✅'}`);
  }

  const mentor = db.guruProfiles.find(g => g.id === siswa.pembimbingId);
  if (mentor && mentor.phone) {
    sendSimulatedWaMessage(mentor.phone, `[EPKL MONITORING] Siswa bimbingan Anda (${siswa.name}, Kelas ${siswa.className}) baru saja melakukan absensi MASUK PKL di ${location.name} pukul ${timeStr} berjarak ${distance}m dari titik lokasi.`);
  }

  return res.json({ success: true, presence, distance });
});

app.post('/api/presence/checkout', (req, res) => {
  const { siswaId, latitude, longitude, selfie } = req.body;

  if (!siswaId || latitude === undefined || longitude === undefined || !selfie) {
    return res.status(400).json({ error: 'Wajib menyertakan Siswa ID, foto selfie, dan koordinat GPS!' });
  }

  const siswa = db.siswaProfiles.find(s => s.id === siswaId);
  if (!siswa) return res.status(404).json({ error: 'Siswa tidak ditemukan' });
  if (!siswa.pklLocationId) return res.status(400).json({ error: 'Anda belum ditempatkan di lokasi PKL mana pun!' });

  const location = db.pklLocations.find(l => l.id === siswa.pklLocationId);
  if (!location) return res.status(404).json({ error: 'Data lokasi PKL tidak ditemukan.' });

  const distance = getDistanceMeters(Number(latitude), Number(longitude), location.latitude, location.longitude);
  if (distance > location.radius) {
    return res.status(400).json({ 
      error: `Presensi Gagal! Anda berada ${distance}m di luar jangkauan wilayah PKL. Maksimum radius toleransi adalah ${location.radius} unit meter untuk absen PULANG.`,
      distance
    });
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':');

  const presence = db.presences.find(p => p.siswaId === siswaId && p.date === todayStr);
  if (!presence) {
    return res.status(400).json({ error: 'Silakan lakukan presensi MASUK terlebih dahulu sebelum melakukan presensi pulang!' });
  }

  if (presence.checkOutTime) {
    return res.status(400).json({ error: 'Anda sudah mencatatkan presensi PULANG hari ini!' });
  }

  const currentHour = new Date().getHours();
  const checkOutStatus = currentHour < 16 ? 'cepat' : 'normal';

  presence.checkOutTime = timeStr;
  presence.checkOutLatitude = Number(latitude);
  presence.checkOutLongitude = Number(longitude);
  presence.checkOutDistance = distance;
  presence.checkOutSelfie = selfie;
  presence.checkOutStatus = checkOutStatus;
  presence.approved = true;

  saveDatabase();

  if (siswa.phone) {
    sendSimulatedWaMessage(siswa.phone, `[EPKL PRESENSI] Halo ${siswa.name}, absensi PULANG berhasil dicatat pukul ${timeStr}. Jarak radius: ${distance} meter. Hati-hati di jalan.`);
  }

  return res.json({ success: true, presence, distance });
});

app.post('/api/presence/approve', (req, res) => {
  const { ids, approved } = req.body;
  if (!ids || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Parameter ids wajib dalam array!' });
  }

  ids.forEach(id => {
    const presence = db.presences.find(p => p.id === id);
    if (presence) {
      presence.approved = !!approved;
    }
  });

  saveDatabase();
  return res.json({ success: true, message: `${ids.length} data presensi berhasil diproses.` });
});

app.delete('/api/presence/:id', (req, res) => {
  const { id } = req.params;
  const index = db.presences.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Data kehadiran tidak ditemukan!' });
  }
  db.presences.splice(index, 1);
  saveDatabase();
  return res.json({ success: true, message: 'Data kehadiran berhasil dihapus.' });
});

// 6. Guru Kunjungan
app.get('/api/visit', (req, res) => {
  const { guruId } = req.query;
  let visits = db.visits;

  if (guruId) {
    visits = visits.filter(v => v.guruId === guruId);
  }

  const result = visits.map(v => {
    const guru = db.guruProfiles.find(g => g.id === v.guruId);
    const location = db.pklLocations.find(l => l.id === v.pklLocationId);
    return {
      ...v,
      status: v.status || 'approved',
      guruName: guru?.name || 'Guru Magang',
      locationName: location?.name || 'Tempat PKL'
    };
  });

  return res.json(result);
});

app.post('/api/visit', (req, res) => {
  const { guruId, pklLocationId, notes, latitude, longitude, dokumentasiUrl } = req.body;

  if (!guruId || !pklLocationId || !notes || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Mohon lengkapi Guru ID, Lokasi, Catatan, Kordinat GPS!' });
  }

  const newVisit: Visit = {
    id: 'vis-' + Date.now(),
    guruId,
    pklLocationId,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':'),
    notes,
    latitude: Number(latitude),
    longitude: Number(longitude),
    dokumentasiUrl,
    status: 'pending'
  };

  db.visits.unshift(newVisit);
  saveDatabase();

  const pupilsAtLoc = db.siswaProfiles.filter(s => s.pklLocationId === pklLocationId);
  pupilsAtLoc.forEach(siswa => {
    if (siswa.phone) {
      sendSimulatedWaMessage(siswa.phone, `[EPKL GURU KUNJUNGAN] Halo ${siswa.name}, Guru Pembimbing Anda baru saja melakukan logging kunjungan pengawasan pembinaan industri di lokasi Anda pukul ${newVisit.time}. Tetap semangat magang!`);
    }
  });

  return res.json({ success: true, data: newVisit });
});

app.put('/api/visit/:id/validate', (req, res) => {
  const { id } = req.params;
  const { status, approvedBy } = req.body;

  if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Status tidak valid.' });
  }

  const visit = db.visits.find(v => v.id === id);
  if (!visit) {
    return res.status(404).json({ error: 'Data kunjungan tidak ditemukan.' });
  }

  visit.status = status;
  if (approvedBy) {
    visit.approvedBy = approvedBy;
  }
  saveDatabase();

  return res.json({ success: true, visit });
});

app.delete('/api/visit/:id', (req, res) => {
  const { id } = req.params;
  const index = db.visits.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Data kunjungan tidak ditemukan.' });
  }
  db.visits.splice(index, 1);
  saveDatabase();
  return res.json({ success: true, message: 'Data kunjungan berhasil dihapus.' });
});

// 7. Student Daily Journal
app.get('/api/journals', (req, res) => {
  const { siswaId, pembimbingId } = req.query;
  let list = db.journals;

  if (siswaId) {
    list = list.filter(j => j.siswaId === siswaId);
  }

  if (pembimbingId) {
    const bimbinganIds = db.siswaProfiles.filter(s => s.pembimbingId === pembimbingId).map(s => s.id);
    list = list.filter(j => bimbinganIds.includes(j.siswaId));
  }

  const result = list.map(j => {
    const student = db.siswaProfiles.find(s => s.id === j.siswaId);
    const loc = student ? db.pklLocations.find(l => l.id === student.pklLocationId) : null;
    return {
      ...j,
      siswaName: student?.name || 'Tanpa Nama',
      className: student?.className || '-',
      locationName: loc?.name || '-'
    };
  });

  return res.json(result);
});

app.post('/api/journals', (req, res) => {
  const { siswaId, activity, rating } = req.body;

  if (!siswaId || !activity || rating === undefined) {
    return res.status(400).json({ error: 'Wajib memberikan rincian aktivitas harian dan rating progres kompetensi!' });
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newJournal: Journal = {
    id: 'jrn-' + Date.now(),
    siswaId,
    date: todayStr,
    activity,
    rating: Number(rating),
    status: 'pending'
  };

  db.journals.unshift(newJournal);
  saveDatabase();

  return res.json({ success: true, data: newJournal });
});

app.put('/api/journals/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const journal = db.journals.find(j => j.id === id);
  if (!journal) return res.status(404).json({ error: 'Jurnal harian tidak ditemukan' });

  journal.status = status ?? journal.status;
  journal.notes = notes ?? journal.notes;

  saveDatabase();

  const student = db.siswaProfiles.find(s => s.id === journal.siswaId);
  if (student && student.phone) {
    sendSimulatedWaMessage(student.phone, `[EPKL JURNAL VALIDASI] Halo ${student.name}, Jurnal harian Anda tanggal ${journal.date} telah di-${journal.status.toUpperCase()} oleh Guru Pembimbing. Catatan: ${journal.notes || '-'}`);
  }

  return res.json({ success: true, data: journal });
});

// 8. Permissions
app.get('/api/izin', (req, res) => {
  const { siswaId, pembimbingId } = req.query;
  let list = db.izins;

  if (siswaId) {
    list = list.filter(i => i.siswaId === siswaId);
  }

  if (pembimbingId) {
    const bimbinganIds = db.siswaProfiles.filter(s => s.pembimbingId === pembimbingId).map(s => s.id);
    list = list.filter(i => bimbinganIds.includes(i.siswaId));
  }

  const result = list.map(i => {
    const student = db.siswaProfiles.find(s => s.id === i.siswaId);
    return {
      ...i,
      siswaName: student?.name || 'Siswa',
      className: student?.className || '-'
    };
  });

  return res.json(result);
});

app.post('/api/izin', (req, res) => {
  const { siswaId, startDate, endDate, type, reason, proofUrl } = req.body;

  if (!siswaId || !startDate || !endDate || !type || !reason) {
    return res.status(400).json({ error: 'Wajib memberikan Tanggal, Jenis, serta Alasan Izin!' });
  }

  const newIzin: Izin = {
    id: 'iz-' + Date.now(),
    siswaId,
    startDate,
    endDate,
    type: type as 'sakit' | 'izin',
    reason,
    proofUrl,
    status: 'pending'
  };

  db.izins.unshift(newIzin);
  saveDatabase();

  const student = db.siswaProfiles.find(s => s.id === siswaId);
  if (student) {
    const mentor = db.guruProfiles.find(g => g.id === student.pembimbingId);
    if (mentor && mentor.phone) {
      sendSimulatedWaMessage(mentor.phone, `[EPKL APPROVAL IZIN] Siswa Anda (${student.name}) mengajukan izin ${type.toUpperCase()} mulai ${startDate} s/d ${endDate} dengan alasan: "${reason}". Silakan lakukan verifikasi.`);
    }
  }

  return res.json({ success: true, data: newIzin });
});

app.put('/api/izin/:id', (req, res) => {
  const { id } = req.params;
  const { status, approvedBy } = req.body;

  const izin = db.izins.find(i => i.id === id);
  if (!izin) return res.status(404).json({ error: 'Permohonan izin tidak ditemukan' });

  izin.status = status ?? izin.status;
  izin.approvedBy = approvedBy ?? izin.approvedBy;

  saveDatabase();

  const student = db.siswaProfiles.find(s => s.id === izin.siswaId);
  if (student && student.phone) {
    sendSimulatedWaMessage(student.phone, `[EPKL NOTIFIKASI IZIN] Halo ${student.name}, permohonan izin Anda (${izin.type}) dari tanggal ${izin.startDate} s/d ${izin.endDate} telah di-APPROVE/DISETUJUI oleh pembimbing.`);
  }

  return res.json({ success: true, data: izin });
});

// 9. Competency Assessment
app.post('/api/grades/grade', (req, res) => {
  const { siswaId, grades, progressCompetency } = req.body;

  if (!siswaId || !grades) {
    return res.status(400).json({ error: 'ID Siswa dan data nilai kompetensi wajib diisi!' });
  }

  const profile = db.siswaProfiles.find(s => s.id === siswaId);
  if (!profile) return res.status(404).json({ error: 'Siswa tidak ditemukan' });

  profile.grades = {
    ...profile.grades,
    ...grades
  };

  if (progressCompetency !== undefined) {
    profile.progressCompetency = Number(progressCompetency);
  } else {
    const values = Object.values(profile.grades);
    const avg = values.reduce((sum, current) => sum + current, 0) / values.length;
    profile.progressCompetency = Math.round(avg);
  }

  saveDatabase();
  return res.json({ success: true, data: profile });
});

// 10. Catatan Pembinaan Siswa
app.get('/api/guidances', (req, res) => {
  const { siswaId, guruId } = req.query;
  let list = db.guidances;

  if (siswaId) {
    list = list.filter(g => g.siswaId === siswaId);
  }
  if (guruId) {
    list = list.filter(g => g.guruId === guruId);
  }

  const result = list.map(g => {
    const student = db.siswaProfiles.find(s => s.id === g.siswaId);
    const teacher = db.guruProfiles.find(t => t.id === g.guruId);
    return {
      ...g,
      siswaName: student?.name || 'Siswa',
      className: student?.className || '-',
      guruName: teacher?.name || 'Guru Pembimbing'
    };
  });

  return res.json(result);
});

app.post('/api/guidances', (req, res) => {
  const { siswaId, notes, category, guruId } = req.body;

  if (!siswaId || !notes || !category || !guruId) {
    return res.status(400).json({ error: 'Wajib menyertakan Siswa, Kategori, Guru ID, dan Catatan pembinaan!' });
  }

  const newNote: GuidanceNote = {
    id: 'gd-' + Date.now(),
    siswaId,
    date: new Date().toISOString().split('T')[0],
    notes,
    category,
    guruId
  };

  db.guidances.unshift(newNote);
  saveDatabase();

  return res.json({ success: true, data: newNote });
});

app.get('/api/competencies', (req, res) => {
  return res.json(db.competencies || []);
});

app.post('/api/competencies', (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) {
    return res.status(400).json({ error: 'Kode dan Nama Kompetensi wajib diisi!' });
  }

  const existing = db.competencies.find(c => c.code.toLowerCase() === code.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Kode Kompetensi sudah digunakan!' });
  }

  const newComp: Competency = {
    id: 'comp-' + Date.now(),
    code,
    name,
    description: description || ''
  };

  db.competencies.push(newComp);
  saveDatabase();

  return res.json({ success: true, data: newComp });
});

app.put('/api/competencies/:id', (req, res) => {
  const { id } = req.params;
  const { code, name, description } = req.body;

  const comp = db.competencies.find(c => c.id === id);
  if (!comp) {
    return res.status(404).json({ error: 'Kompetensi tidak ditemukan!' });
  }

  if (code) {
    const existing = db.competencies.find(c => c.id !== id && c.code.toLowerCase() === code.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'Kode Kompetensi sudah digunakan!' });
    }
    comp.code = code;
  }

  if (name) comp.name = name;
  if (description !== undefined) comp.description = description;

  saveDatabase();
  return res.json({ success: true, data: comp });
});

app.delete('/api/competencies/:id', (req, res) => {
  const { id } = req.params;

  const index = db.competencies.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Kompetensi tidak ditemukan!' });
  }

  db.competencies.splice(index, 1);
  saveDatabase();
  return res.json({ success: true, message: 'Kompetensi berhasil dihapus!' });
});

// 11. WhatsApp Simulator Logs
app.get('/api/wa-logs', (req, res) => {
  return res.json(db.waLogs);
});

app.delete('/api/wa-logs', (req, res) => {
  db.waLogs = [];
  saveDatabase();
  return res.json({ success: true, message: 'Log pesan WhatsApp dibersihkan.' });
});

// 12. Backup Database Module
app.get('/api/backup/history', (req, res) => {
  return res.json(db.backups);
});

app.post('/api/backup/process', (req, res) => {
  try {
    const timestamp = new Date().toISOString();
    const cleanDateStr = timestamp.replace(/[:T]/g, '-').split('.')[0];
    const fileName = `backup-${cleanDateStr}.json`;
    const targetFile = path.join(BACKUPS_DIR, fileName);

    fs.writeFileSync(targetFile, JSON.stringify(db, null, 2), 'utf-8');

    const totals = db.siswaProfiles.length + db.guruProfiles.length + db.presences.length;

    const backupRecord: BackupHistory = {
      id: 'bak-' + Date.now(),
      timestamp: timestamp.replace('T', ' ').substring(0, 19),
      fileName,
      recordsCount: totals
    };

    db.backups.unshift(backupRecord);
    saveDatabase();

    return res.json({ success: true, data: backupRecord, message: 'Data backup tersimpan di server secara aman.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Gagal melakukan eksekusi backup: ' + error.message });
  }
});

// Menyalakan server lokal (app.listen) HANYA jika berjalan di laptop Anda (Development)
if (process.env.NODE_ENV !== 'production') {
  const PORT_LOCAL = process.env.PORT || 3000;
  app.listen(PORT_LOCAL, () => {
    console.log(`[E-PKL Server] Live on http://localhost:${PORT_LOCAL}`);
  });
}

// Ekspor modul app agar dikenali oleh serverless engine milik Vercel
export default app;