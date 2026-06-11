'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { Photo } from '@/types';

interface PhotoUploadProps {
  findingId: string;
  photos: Photo[];
  onUpdate: () => void;
}

export default function PhotoUpload({ findingId, photos, onUpdate }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 3) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await api.post(`/api/findings/${findingId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdate();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.delete(`/api/findings/${findingId}/photos/${photoId}`);
      onUpdate();
    } catch {
      alert('Failed to delete photo');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => (
          <div key={p.id} className="relative group">
            <img src={p.url} alt="Finding photo" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded border dark:border-gray-600" />
            <button type="button" onClick={() => handleDelete(p.id)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              &times;
            </button>
          </div>
        ))}
        {photos.length < 3 && (
          <label className="cursor-pointer inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500">
            <span className="text-2xl font-light">{uploading ? '...' : '+'}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>
    </div>
  );
}
