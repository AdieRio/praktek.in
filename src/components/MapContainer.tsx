import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, CircleHelp, Info } from 'lucide-react';
import { PklLocation } from '../types';

interface MapContainerProps {
  location?: PklLocation;
  siswaLat?: number;
  siswaLng?: number;
  onCoordinatesSimulated?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

export default function MapContainer({
  location,
  siswaLat,
  siswaLng,
  onCoordinatesSimulated,
  readOnly = false
}: MapContainerProps) {
  // If no location is plotted yet
  if (!location) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-8 text-center dark:bg-slate-800/40 border border-slate-200 border-dashed dark:border-slate-800 min-h-[300px]">
        <MapPin className="h-10 w-10 text-slate-400 animate-bounce mb-3" />
        <h4 className="text-base font-semibold text-slate-700 dark:text-slate-350">Lokasi PKL Belum Ditentukan</h4>
        <p className="mt-1 text-sm text-slate-400 dark:text-slate-500 max-w-xs">
          Konsultasikan dengan administrator atau pembimbing untuk melakukan plotting lokasi magang Anda.
        </p>
      </div>
    );
  }

  // Calculate distance in meters for display
  const getDistanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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

  const distance = siswaLat && siswaLng 
    ? getDistanceMeters(siswaLat, siswaLng, location.latitude, location.longitude)
    : null;

  const isWithinRadius = distance !== null && distance <= location.radius;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white shadow-xs dark:bg-slate-900">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 p-4 dark:bg-slate-950/40 gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <Compass className="h-4 w-4 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
            Radar Geotagging & Validasi GPS
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Radius aman: <b>{location.radius} meter</b> dari kantor.
          </p>
        </div>
      </div>

      {/* Main Radar Screen Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[280px]">
        
        {/* Left Side: Radar visualization */}
        <div className="md:col-span-8 relative bg-slate-950 flex items-center justify-center overflow-hidden h-[260px] md:h-auto border-b md:border-b-0 md:border-r border-slate-800">
          
          {/* Radar background grid animation circles */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
          
          {/* Animated sweep line */}
          <div className="absolute w-1/2 h-1/2 top-0 left-0 bg-gradient-to-br from-indigo-500/10 to-transparent origin-bottom-right rotate-anim pointer-events-none" />

          {/* 100m Radar circle rings */}
          <div className="absolute h-48 w-48 rounded-full border border-dashed border-indigo-900/40 flex items-center justify-center pointer-events-none">
            <div className="absolute h-36 w-36 rounded-full border border-indigo-900/60 flex items-center justify-center">
              {/* Authorized boundaries */}
              <div className="absolute h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                <span className="text-[9px] font-semibold text-emerald-400/80 uppercase">Area PKL</span>
              </div>
            </div>
          </div>

          {/* Center node (The PKL Office Location) */}
          <div className="absolute flex flex-col items-center">
            <div className="h-5 w-5 bg-indigo-500 rounded-lg flex items-center justify-center ring-4 ring-indigo-500/30 shadow-lg text-white z-10 animate-bounce">
              <MapPin className="h-3 w-3" />
            </div>
            <span className="absolute mt-5 text-[9px] uppercase tracking-wider font-bold text-slate-350 bg-slate-900 px-1.5 py-0.5 rounded shadow-sm border border-slate-800 max-w-[120px] truncate">
              {location.name}
            </span>
          </div>

          {/* Draggable or Plotted Student Location Marker */}
          {siswaLat && siswaLng && (
            <div 
              className="absolute transition-all duration-700 flex flex-col items-center"
              style={{
                // Interpolating visual offset to place on grid relative to maximum 350 meters view
                transform: `translate(${
                  distance !== null && distance > 0
                    ? Math.sign(siswaLng - location.longitude) * Math.min(80, (distance / 350) * 80)
                    : 0
                }px, ${
                  distance !== null && distance > 0
                    ? Math.sign(location.latitude - siswaLat) * Math.min(80, (distance / 350) * 80)
                    : 0
                }px)`
              }}
            >
              <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ring-4 shadow-xl z-20 ${
                isWithinRadius ? 'bg-emerald-500 ring-emerald-500/30 animate-pulse' : 'bg-rose-500 ring-rose-500/30 animate-bounce'
              }`}>
                <Navigation className="h-3.5 w-3.5" />
              </div>
              <span className={`absolute mt-7 text-[10px] font-bold text-white px-1.5 py-0.5 rounded shadow-xs border ${
                isWithinRadius ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'
              }`}>
                {isWithinRadius ? 'ANDA (Aman)' : 'ANDA (Luar)'}
              </span>
            </div>
          )}
        </div>

        {/* Right Side: Coordinate data & stats */}
        <div className="md:col-span-4 p-5 flex flex-col justify-between bg-slate-50 dark:bg-slate-950/20">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Koordinat Target PKL</span>
              <div className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm leading-relaxed">
                Lat: {location.latitude.toFixed(6)} <br />
                Lng: {location.longitude.toFixed(6)}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Posisi GPS Anda (Realtime)</span>
              {siswaLat && siswaLng ? (
                <div className="font-mono text-xs text-slate-700 dark:text-slate-300 mt-1 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm leading-relaxed">
                  Lat: {siswaLat.toFixed(6)} <br />
                  Lng: {siswaLng.toFixed(6)}
                </div>
              ) : (
                <div className="text-xs text-amber-500 bg-amber-50 dark:bg-amber-950/20 p-2 rounded-lg mt-1 border border-amber-100 dark:border-amber-900/30 flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 animate-pulse" />
                  Mencari sinyal GPS siswa...
                </div>
              )}
            </div>

            {distance !== null && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">Hasil Keakuratan</span>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Jarak saat ini:</span>
                  <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{distance} meter</span>
                </div>
                <div className="mt-2.5">
                  {isWithinRadius ? (
                    <span className="inline-flex w-full items-center justify-center gap-1 text-center rounded-lg bg-emerald-500 text-white font-bold py-1.5 text-xs">
                      MASUK RADIUS PERUSAHAAN ✅
                    </span>
                  ) : (
                    <span className="inline-flex w-full items-center justify-center gap-1 text-center rounded-lg bg-rose-500 text-white font-bold py-1.5 text-xs animate-shake">
                      DI LUAR RADIUS (DITOLAK) ❌
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-5 text-[11px] text-slate-400 dark:text-slate-500 leading-normal bg-blue-50/50 dark:bg-blue-950/20 p-2 rounded-lg border border-blue-100/55 dark:border-blue-950/30 flex gap-2">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Sistem menggunakan Haversine Formula untuk kalkulasi radius linear. GPS di-refresh berkala secara otomatis.
            </span>
          </div>

        </div>
      </div>

      {/* Visual CSS sweep rotating animation */}
      <style>{`
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .rotate-anim {
          animation: rotate-slow 4s linear infinite;
        }
      `}</style>
    </div>
  );
}
