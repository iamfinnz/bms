"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../../../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Summary() {
  const [summary, setSummary] = useState({});
  const previousStatusRef = useRef({}); // Menggunakan useRef untuk menyimpan status sebelumnya

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (roomSnapshot) => {
      const rooms = roomSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const bangsalSummary = {};

      rooms.forEach((room) => {
        const bangsal = room.bangsal || "Unknown"; // Menggunakan bangsal dari data ruangan
        if (!bangsalSummary[bangsal]) {
          bangsalSummary[bangsal] = { kosong: 0, terpakai: 0 };
        }

        // Hitung status bed
        bangsalSummary[bangsal].kosong += room.statusBed1 === "KOSONG" ? 1 : 0;
        bangsalSummary[bangsal].kosong += room.statusBed2 === "KOSONG" ? 1 : 0;
        bangsalSummary[bangsal].terpakai += room.statusBed1 === "TERPAKAI" ? 1 : 0;
        bangsalSummary[bangsal].terpakai += room.statusBed2 === "TERPAKAI" ? 1 : 0;

        // Cek perubahan status bed
        const previousStatus = previousStatusRef.current[room.id] || {};
        
        // Cek apakah status bed berubah dari KOSONG ke TERPAKAI
        if (previousStatus.statusBed1 === "KOSONG" && room.statusBed1 === "TERPAKAI") {
          playSound(room.name || "Kamar Tanpa Nama"); // Menggunakan nama kamar
        }
        if (previousStatus.statusBed2 === "KOSONG" && room.statusBed2 === "TERPAKAI") {
          playSound(room.name || "Kamar Tanpa Nama"); // Menggunakan nama kamar
        }

        // Cek apakah kamar sudah penuh
        if (
          (previousStatus.statusBed1 === "KOSONG" && room.statusBed1 === "TERPAKAI" && room.statusBed2 === "TERPAKAI") ||
          (previousStatus.statusBed2 === "KOSONG" && room.statusBed2 === "TERPAKAI" && room.statusBed1 === "TERPAKAI")
        ) {
          playFullSound(room.name || "Kamar Tanpa Nama"); // Memanggil fungsi untuk suara penuh
        }

        // Cek apakah status bed berubah dari TERPAKAI ke KOSONG
        if (previousStatus.statusBed1 === "TERPAKAI" && room.statusBed1 === "KOSONG") {
          playEmptySound(room.name || "Kamar Tanpa Nama"); // Memanggil fungsi untuk suara kosong
        }
        if (previousStatus.statusBed2 === "TERPAKAI" && room.statusBed2 === "KOSONG") {
          playEmptySound(room.name || "Kamar Tanpa Nama"); // Memanggil fungsi untuk suara kosong
        }

        // Cek apakah kedua bed menjadi KOSONG
        if (
          (previousStatus.statusBed1 === "TERPAKAI" && room.statusBed1 === "KOSONG" && room.statusBed2 === "KOSONG") ||
          (previousStatus.statusBed2 === "TERPAKAI" && room.statusBed2 === "KOSONG" && room.statusBed1 === "KOSONG")
        ) {
          playBothEmptySound(room.name || "Kamar Tanpa Nama"); // Memanggil fungsi untuk suara kedua bed kosong
        }
      });

      setSummary(bangsalSummary);
      // Update previous status
      previousStatusRef.current = rooms.reduce((acc, room) => {
        acc[room.id] = { statusBed1: room.statusBed1, statusBed2: room.statusBed2 };
        return acc;
      }, {});
    });

    // Cleanup function to unsubscribe from the listener
    return () => unsubscribe();
  }, []);

  const playSound = (kamar) => {
    const message = `1 bed telah terpakai di kamar ${kamar}`;
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID"; // Set bahasa ke Bahasa Indonesia

    // Memastikan suara diputar
    window.speechSynthesis.speak(speech);
  };

  const playFullSound = (kamar) => {
    const message = `Kamar ${kamar} sudah penuh`;
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID"; // Set bahasa ke Bahasa Indonesia

    // Memastikan suara diputar
    window.speechSynthesis.speak(speech);
  };

  const playEmptySound = (kamar) => {
    const message = `1 bed telah kosong di kamar ${kamar}`;
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID"; // Set bahasa ke Bahasa Indonesia

    // Memastikan suara diputar
    window.speechSynthesis.speak(speech);
  };

  const playBothEmptySound = (kamar) => {
    const message = `Kedua bed di kamar ${kamar} tidak terpakai`;
    const speech = new SpeechSynthesisUtterance(message);
    speech.lang = "id-ID"; // Set bahasa ke Bahasa Indonesia

    // Memastikan suara diputar
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#3e966c', padding: '1.5rem' }}>
      {/* Judul Sistem */}
      <h1 className="text-center text-white text-3xl font-bold mb-6">BED MANAGEMENT SYSTEM - RS SANSANI</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(summary).map(([bangsal, { kosong, terpakai }]) => (
          <div
            key={bangsal}
            className="bg-white text-black shadow-md rounded-lg p-6 border border-gray-200 flex flex-col justify-between"
          >
            <h2 className="text-lg font-semibold text-center">{bangsal}</h2>
            <div className="flex justify-between mt-4">
              <div className="bg-red-500 text-white p-4 rounded-lg text-center flex flex-col">
                <span className="text-2xl font-bold">{terpakai}</span>
                <span>TERPAKAI</span>
              </div>
              <div className="bg-green-500 text-white p-4 rounded-lg text-center flex flex-col">
                <span className="text-2xl font-bold">{kosong}</span>
                <span>KOSONG</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
