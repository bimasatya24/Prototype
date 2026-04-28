'use client';

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import ExcelJS from 'exceljs';

export default function DownloadButton({ data }: { data: any[] }) {
  const handleDownload = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data Presensi');

    // Fetch and add logo
    try {
      const response = await fetch('/Logo.png');
      if (response.ok) {
        const imageBlob = await response.blob();
        const arrayBuffer = await imageBlob.arrayBuffer();
        
        const imageId = workbook.addImage({
          buffer: arrayBuffer,
          extension: 'png',
        });

        // Add floating image to the top left corner
        worksheet.addImage(imageId, {
          tl: { col: 2, row: 0.2 },
          ext: { width: 50, height: 50 },
        });
      }
    } catch (err) {
      console.error('Failed to load logo:', err);
    }

    // Headers and Title
    worksheet.addRow(['BREADGIFT']);
    worksheet.addRow(['Gg. Mushola Tawakal, Sukarame, Kec. Sukarame, Kota Bandar Lampung, Lampung 35122']);
    worksheet.addRow([]); // empty row

    // Increase row height to accommodate the logo better
    worksheet.getRow(1).height = 30;
    worksheet.getRow(2).height = 25;

    worksheet.mergeCells('A1:F1');
    worksheet.mergeCells('A2:F2');

    const title1 = worksheet.getCell('A1');
    title1.font = { bold: true, size: 14 };
    title1.alignment = { horizontal: 'center', vertical: 'middle' };

    const title2 = worksheet.getCell('A2');
    title2.font = { bold: true, size: 11 };
    title2.alignment = { horizontal: 'center', vertical: 'middle' };

    const headers = ['No', 'Nama Karyawan', 'Role', 'Status', 'Tanggal', 'Waktu', 'Koordinat'];
    worksheet.addRow(headers);
    
    // Header styling
    const headerRow = worksheet.getRow(4);
    headerRow.font = { bold: true };
    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' },
        bottom: { style: 'thin' }, right: { style: 'thin' },
      };
    });

    data.forEach((p, index) => {
      const nama = p.user.nama;
      const role = p.user.id === 1 ? 'Admin' : 'Karyawan';
      const status = p.status;
      
      let tanggal = '-';
      let waktu = '-';
      let koordinat = '-';
      
      if (p.presensi) {
        const dateObj = new Date(p.presensi);
        tanggal = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        
        if (status !== 'Alpha' || p.latitude) {
          waktu = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
        }
      }

      if (p.latitude && p.longitude) {
        koordinat = `${p.latitude.toFixed(6)}, ${p.longitude.toFixed(6)}`;
      }
      
      const row = worksheet.addRow([index + 1, nama, role, status, tanggal, waktu, koordinat]);
      row.eachCell((cell) => {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' }, left: { style: 'thin' },
          bottom: { style: 'thin' }, right: { style: 'thin' },
        };
      });
    });

    worksheet.columns = [
      { width: 5 },  // No
      { width: 30 }, // Nama Karyawan
      { width: 15 }, // Role
      { width: 15 }, // Status
      { width: 25 }, // Tanggal
      { width: 15 }, // Waktu
      { width: 25 }, // Koordinat
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Presensi_${new Date().toISOString().split('T')[0]}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleDownload} 
      type="button" 
      className="btn glass border-white/10 bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500 h-14 px-8 rounded-2xl transition-all shadow-lg active:scale-95 whitespace-nowrap w-full xl:w-auto"
    >
      <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
      <span className="font-bold tracking-widest uppercase text-xs">Download Data</span>
    </button>
  );
}
