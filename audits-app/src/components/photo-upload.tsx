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

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {photos.map((p) => (
          <div key={p.id} className="relative">
            <img src={p.url} alt="Finding photo" className="w-24 h-24 object-cover rounded border" />
          </div>
        ))}
      </div>
      {photos.length < 3 && (
        <label className="cursor-pointer inline-block bg-gray-100 border rounded px-3 py-1 text-sm hover:bg-gray-200">
          {uploading ? 'Uploading...' : `Add Photo (${photos.length}/3)`}
          <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
        </label>
      )}
    </div>
  );
}
