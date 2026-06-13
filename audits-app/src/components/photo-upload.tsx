'use client';

import { useState } from 'react';
import api, { photoUrl } from '@/lib/api';
import { Photo } from '@/types';

interface PhotoUploadProps {
  findingId: string;
  photos: Photo[];
  onUpdate: () => void;
}

export default function PhotoUpload({ findingId, photos, onUpdate }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
          <div key={p.id} className="relative">
            <button type="button" onClick={() => setPreviewUrl(photoUrl(p.url))} className="p-0 border-0">
              <img src={photoUrl(p.url)} alt="Finding photo" className="w-20 h-20 sm:w-28 sm:h-28 object-cover rounded border dark:border-gray-600 cursor-pointer hover:opacity-90" />
            </button>
            <button type="button" onClick={() => handleDelete(p.id)}
              className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-600 text-white text-sm rounded-full flex items-center justify-center shadow-md">
              &times;
            </button>
          </div>
        ))}
        {photos.length < 3 && (
          <label className="cursor-pointer inline-flex items-center justify-center w-20 h-20 sm:w-28 sm:h-28 border-2 border-dashed dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-400 dark:text-gray-500">
            <span className="text-2xl font-light">{uploading ? '...' : '+'}</span>
            <input type="file" accept="image/*" capture="environment" onChange={handleUpload} className="hidden" />
          </label>
        )}
      </div>

      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <div className="relative max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} alt="Photo preview" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
            <button type="button" onClick={() => setPreviewUrl(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-full shadow-lg flex items-center justify-center text-lg font-bold">
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
