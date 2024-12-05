"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

export default function SettingsPage() {
  const [roomStatus, setRoomStatus] = useState([]);
  const [roomName, setRoomName] = useState(''); // State untuk nama ruangan
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const roomsCollection = collection(db, 'rooms');
      const roomSnapshot = await getDocs(roomsCollection);
      const roomList = roomSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRoomStatus(roomList);
    };

    fetchRooms();
  }, []);

  const handleLogout = () => {
    router.push('/login');
  };

  const getBangsal = (roomNumber) => {
    const number = parseInt(roomNumber, 10);
    if (number >= 300 && number < 400) return 'Tulip';
    if (number >= 400 && number < 500) return 'Bougenville';
    if (number >= 500 && number < 600) return 'Jasmine';
    if (number >= 600 && number < 700) return 'Sakura';
    return 'Unknown'; // Jika tidak dalam rentang yang ditentukan
  };

  const toggleBedStatus = async (id, bed) => {
    const updatedRooms = roomStatus.map((room) => {
      if (room.id === id) {
        const newStatus = bed === 'bed1' 
          ? (room.statusBed1 === 'KOSONG' ? 'TERPAKAI' : 'KOSONG') 
          : (room.statusBed2 === 'KOSONG' ? 'TERPAKAI' : 'KOSONG');
        
        return {
          ...room,
          statusBed1: bed === 'bed1' ? newStatus : room.statusBed1,
          statusBed2: bed === 'bed2' ? newStatus : room.statusBed2,
        };
      }
      return room;
    });

    setRoomStatus(updatedRooms);

    const roomRef = doc(db, 'rooms', id);
    await updateDoc(roomRef, {
      statusBed1: updatedRooms.find(room => room.id === id).statusBed1,
      statusBed2: updatedRooms.find(room => room.id === id).statusBed2,
    });
  };

  const addRoom = async () => {
    if (!/^\d+$/.test(roomName)) {
      alert("Nomor kamar harus berupa angka."); // Validasi untuk memastikan nama hanya angka
      return;
    }

    const bangsal = getBangsal(roomName); // Mendapatkan bangsal berdasarkan nomor kamar
    const newRoom = { 
      name: roomName, 
      bangsal: bangsal, // Menyimpan bangsal
      statusBed1: 'KOSONG', 
      statusBed2: 'KOSONG' 
    }; // Menyimpan nama ruangan dan status bed
    try {
      const docRef = await addDoc(collection(db, 'rooms'), newRoom);
      setRoomStatus([...roomStatus, { id: docRef.id, ...newRoom }]);
      setRoomName(''); // Reset input setelah menambah kamar
    } catch (error) {
      console.error("Error adding room: ", error);
    }
  };

  const deleteRoom = async (id) => {
    try {
      const roomRef = doc(db, 'rooms', id);
      await deleteDoc(roomRef);
      setRoomStatus(roomStatus.filter(room => room.id !== id));
    } catch (error) {
      console.error("Error deleting room: ", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <div className="bg-green-600 p-4 text-white flex justify-between items-center">
        <h1 className="text-xl font-bold">Bed Management System RS Sansani</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
        >
          Logout
        </button>
      </div>

      {/* Input untuk Nama Ruangan */}
      <div className="p-4">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Masukkan Nomor Kamar"
          className="border rounded p-2 text-black w-full"
        />
        <button
          onClick={addRoom}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded mt-2"
        >
          Tambah Kamar
        </button>
      </div>

      {/* Room Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {roomStatus.map((room) => (
          <div
            key={room.id}
            className="border rounded-lg shadow-md p-4 flex justify-between items-center bg-white"
          >
            <h2 className="text-lg text-black font-bold">Kamar {room.name}</h2>
            <div className="flex flex-col">
              {/* Bed 1 */}
              <div className={`flex items-center mb-2 p-2 rounded ${room.statusBed1 === 'KOSONG' ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={`font-semibold ${room.statusBed1 === 'KOSONG' ? 'text-green-600' : 'text-red-600'}`}>
                  Bed 1: {room.statusBed1}
                </p>
                <input
                  type="checkbox"
                  checked={room.statusBed1 === 'TERPAKAI'}
                  onChange={() => toggleBedStatus(room.id, 'bed1')}
                  className="ml-2 cursor-pointer"
                />
              </div>
              {/* Bed 2 */}
              <div className={`flex items-center p-2 rounded ${room.statusBed2 === 'KOSONG' ? 'bg-green-100' : 'bg-red-100'}`}>
                <p className={`font-semibold ${room.statusBed2 === 'KOSONG' ? 'text-green-600' : 'text-red-600'}`}>
                  Bed 2: {room.statusBed2}
                </p>
                <input
                  type="checkbox"
                  checked={room.statusBed2 === 'TERPAKAI'}
                  onChange={() => toggleBedStatus(room.id, 'bed2')}
                  className="ml-2 cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={() => deleteRoom(room.id)}
              className="mt-2 bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
