'use client';

import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import FindingForm from '@/components/finding-form';
import { useAuth } from '@/lib/auth';
import { useState, useRef } from 'react';

export default function NewFindingPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || photoFiles.length >= 3) return;
    const remaining = 3 - photoFiles.length;
    const toAdd = files.slice(0, remaining);
    setPhotoFiles((prev) => [...prev, ...toAdd]);
    setPhotoPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
    if (e.target) e.target.value = '';
  };

  const removePhoto = (idx: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== idx));
    setPhotoPreviews((prev) => {
      URL.revokeObjectURL(prev[idx]);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSave = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const res = await api.post(`/api/audits/${id}/findings`, data);
      const findingId = res.data.id;
      for (const file of photoFiles) {
        const formData = new FormData();
        formData.append('photo', file);
        await api.post(`/api/findings/${findingId}/photos`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      router.push(`/findings/${findingId}`);
    } catch {
      alert('Failed to create finding');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-dvh flex items-center justify-center dark:text-white">
      <div className="animate-pulse">Loading...</div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-gray-50 dark:bg-gray-900 p-3 sm:p-6">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-lg sm:text-2xl font-bold mb-5 sm:mb-6 dark:text-white">New Finding</h1>
        <FindingForm auditId={id as string} onSave={handleSave} loading={loading} user={user} onCancel={() => router.back()}
          renderAfterActions={
            <div className="space-y-2">
              <p className="text-sm font-medium dark:text-gray-300">Photos ({photoFiles.length}/3)</p>
              <div className="flex gap-2 flex-wrap">
                {photoPreviews.map((preview, idx) => (
                  <div key={idx} className="relative group">
                    <img src={preview} alt={`Photo ${idx + 1}`} className="w-20 h-20 object-cover rounded border dark:border-gray-600" />
                    <button type="button" onClick={() => removePhoto(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                  </div>
                ))}
                {photoFiles.length < 3 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed dark:border-gray-600 rounded flex items-center justify-center text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <span className="text-2xl font-light">+</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" multiple />
            </div>
          }
        />
      </div>
    </div>
  );
}
