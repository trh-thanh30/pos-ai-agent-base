'use client';

import useToast from '@repo/design-system/hooks/client/use-toast-notification';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback, useRef, useState } from 'react';
import api from '../../libs/axios';

export interface UploadedAsset {
  id: string;
  url: string;
  original_name: string;
}

interface ImageUploadProps {
  /** List of already-uploaded assets (controlled) */
  value?: UploadedAsset[];
  /** Called when the list changes (add or remove) */
  onChange?: (assets: UploadedAsset[]) => void;
  /** Max number of images allowed */
  maxFiles?: number;
  /** Label displayed above the uploader */
  label?: string;
  /** Only upload to temp first, no entityId attached */
  folder?: string;
  disabled?: boolean;
}

export default function ImageUpload({
  value = [],
  onChange,
  maxFiles = 10,
  label = 'Ảnh sản phẩm',
  folder = 'products',
  disabled = false,
}: ImageUploadProps) {
  const { showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadedAsset | null> => {
      // Validate type
      if (!file.type.startsWith('image/')) {
        showErrorToast(`"${file.name}" không phải file ảnh hợp lệ`);
        return null;
      }
      // Validate size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showErrorToast(`"${file.name}" vượt quá 5MB`);
        return null;
      }

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post(
          `/assets/upload?accessType=PUBLIC&folder=${folder}`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        const data = res?.data?.data;
        if (res?.data?.success && data) {
          return {
            id: data.id,
            url: data.url,
            original_name: data.original_name ?? file.name,
          };
        }
        showErrorToast(`Tải ảnh "${file.name}" thất bại`);
        return null;
      } catch {
        showErrorToast(`Lỗi khi tải ảnh "${file.name}"`);
        return null;
      }
    },
    [folder, showErrorToast]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const remaining = maxFiles - value.length;
      if (remaining <= 0) {
        showErrorToast(`Chỉ được tải tối đa ${maxFiles} ảnh`);
        return;
      }

      const toUpload = Array.from(files).slice(0, remaining);
      setUploading(true);

      const results = await Promise.all(toUpload.map(uploadFile));
      const successful = results.filter(Boolean) as UploadedAsset[];

      if (successful.length > 0) {
        onChange?.([...value, ...successful]);
      }

      setUploading(false);
    },
    [maxFiles, value, uploadFile, onChange, showErrorToast]
  );

  const handleRemove = useCallback(
    async (assetId: string) => {
      try {
        await api.delete(`/assets/${assetId}`);
      } catch {
        // Ignore delete errors — remove from UI anyway
      }
      onChange?.(value.filter((a) => a.id !== assetId));
    },
    [value, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const canUploadMore = value.length < maxFiles && !disabled;

  return (
    <div className="flex flex-col gap-3">
      {/* Label */}
      {label && (
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((asset) => (
            <div
              key={asset.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
            >
              <Image
                src={asset.url}
                alt={asset.original_name}
                fill
                className="object-cover"
                sizes="120px"
              />
              {/* Overlay remove button */}
              <button
                type="button"
                onClick={() => handleRemove(asset.id)}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
                title="Xóa ảnh"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {canUploadMore && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`
            relative flex flex-col items-center justify-center gap-2 
            border-2 border-dashed rounded-xl cursor-pointer
            py-6 px-4 transition-all duration-200 select-none
            ${dragOver
              ? 'border-blue-500 bg-blue-50/60'
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/30'
            }
            ${uploading ? 'pointer-events-none opacity-70' : ''}
          `}
        >
          {uploading ? (
            <>
              <Loader2 size={24} className="text-blue-500 animate-spin" />
              <span className="text-sm text-gray-500">Đang tải lên...</span>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                <ImagePlus size={20} className="text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  Kéo thả hoặc{' '}
                  <span className="text-blue-500 underline underline-offset-2">
                    chọn ảnh
                  </span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  PNG, JPG, WEBP · Tối đa 5MB / ảnh · {value.length}/{maxFiles} ảnh
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={!canUploadMore || uploading}
      />
    </div>
  );
}
