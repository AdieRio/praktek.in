/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  nip?: string; // For Guru
  nisn?: string; // For Siswa
}

export interface PklLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters, default 100
  quota: number;
}

export interface SiswaProfile {
  id: string;
  userId: string;
  name: string;
  nisn: string;
  className: string;
  phone: string;
  pklLocationId?: string;
  pembimbingId?: string; // Guru ID
  pembimbingName?: string;
  locationName?: string;
  qrCodeDataUrl?: string;
  progressCompetency: number; // 0 - 100
  grades: Record<string, number>;
  reportFileName?: string;
  reportFileContent?: string; // Base64 or mock string
  reportStatus?: 'pending' | 'approved' | 'rejected' | 'belum_unggah';
  reportNotes?: string;
  reportGrade?: number;
}

export interface GuruProfile {
  id: string;
  userId: string;
  name: string;
  nip: string;
  phone: string;
}

export interface Presence {
  id: string;
  siswaId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:MM:ss
  checkOutTime?: string; // HH:MM:ss
  checkInLatitude?: number;
  checkInLongitude?: number;
  checkOutLatitude?: number;
  checkOutLongitude?: number;
  checkInDistance?: number; // Distance in meters from PKL center
  checkOutDistance?: number;
  checkInSelfie?: string; // base64 image
  checkOutSelfie?: string; // base64 image
  checkInStatus?: 'tepat_waktu' | 'telat';
  checkOutStatus?: 'normal' | 'cepat';
  approved: boolean; // Approved by pembimbing or admin
}

export interface Journal {
  id: string;
  siswaId: string;
  date: string; // YYYY-MM-DD
  activity: string;
  rating: number; // 1-5 scale of progress
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface Izin {
  id: string;
  siswaId: string;
  startDate: string;
  endDate: string;
  type: 'sakit' | 'izin';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  proofUrl?: string; // base64 image of letter
  approvedBy?: string;
}

export interface Visit {
  id: string;
  guruId: string;
  pklLocationId: string;
  date: string;
  time: string;
  notes: string;
  latitude: number;
  longitude: number;
  dokumentasiUrl?: string; // base64 image
  status?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
}

export interface GuidanceNote {
  id: string;
  siswaId: string;
  date: string;
  notes: string;
  category: 'akademik' | 'kedisiplinan' | 'motivasi' | 'masalah';
  guruId: string;
}

export interface WaLog {
  id: string;
  phone: string;
  message: string;
  timestamp: string;
  status: 'sent' | 'failed';
}

export interface BackupHistory {
  id: string;
  timestamp: string;
  fileName: string;
  recordsCount: number;
}

export interface Competency {
  id: string;
  code: string;
  name: string;
  description: string;
}
