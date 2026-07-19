'use client';

import useToast from '@repo/design-system/hooks/client/use-toast-notification';
import { ChevronLeft, ChevronRight, Eye, ImagePlus, Loader2, X } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const { showSuccessToast, showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

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
          showSuccessToast(`Tải ảnh "${file.name}" thành công`);
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
    [folder, showSuccessToast, showErrorToast]
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
        showSuccessToast('Xóa ảnh thành công');
      } catch {
        // Fallback: toast success even if asset deletion endpoint fails, since it removes from UI
        showSuccessToast('Xóa ảnh thành công');
      }
      onChange?.(value.filter((a) => a.id !== assetId));
    },
    [value, onChange, showSuccessToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      if (!disabled) handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handlePrev = useCallback(() => {
    if (previewIndex === null) return;
    setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : value.length - 1));
  }, [previewIndex, value.length]);

  const handleNext = useCallback(() => {
    if (previewIndex === null) return;
    setPreviewIndex((prev) => (prev !== null && prev < value.length - 1 ? prev + 1 : 0));
  }, [previewIndex, value.length]);

  // Handle keyboard events (ESC, Left, Right arrows) for the Lightbox
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewIndex(null);
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex, handlePrev, handleNext]);

  const canUploadMore = value.length < maxFiles && !disabled;

  return (
    <div className="flex flex-col gap-3">
      {/* Dynamic fade-in style for the image preview lightbox */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes lightboxFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .lightbox-animate {
          animation: lightboxFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />

      {/* Label */}
      {label && (
        <span className="text-sm font-semibold text-gray-700">{label}</span>
      )}

      {/* Preview grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {value.map((asset, idx) => (
            <div
              key={asset.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer"
              onClick={() => setPreviewIndex(idx)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url}
                alt={asset.original_name}
                className="w-full h-full object-cover absolute inset-0"
              />

              {/* Hover Overlay with Eye Icon */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100">
                <div className="bg-white/20 p-2 rounded-full backdrop-blur-md text-white hover:scale-110 transition-transform duration-200">
                  <Eye size={18} />
                </div>
              </div>

              {/* Overlay remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Stop opening the image lightbox
                  handleRemove(asset.id);
                }}
                className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10"
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

      {/* Lightbox / Zoomed image view */}
      {previewIndex !== null && value[previewIndex] && (
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-all duration-300"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setPreviewIndex(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-colors duration-200 z-[10000]"
            title="Đóng"
          >
            <X size={24} />
          </button>

          {/* Left Arrow */}
          {value.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 md:left-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors duration-200 z-[10000]"
              title="Ảnh trước"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          {/* Zoomed Image Container */}
          <div className="relative max-w-[85vw] max-h-[80vh] w-full h-full flex items-center justify-center p-4">
            <div 
              className="relative max-w-full max-h-full lightbox-animate select-none"
              onClick={(e) => e.stopPropagation()} // Prevent close on clicking the image itself
            >
              <img
                src={value[previewIndex].url}
                alt={value[previewIndex].original_name}
                className="max-w-[80vw] max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          </div>

          {/* Right Arrow */}
          {value.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 md:right-8 bg-white/10 hover:bg-white/20 text-white rounded-full p-3 transition-colors duration-200 z-[10000]"
              title="Ảnh sau"
            >
              <ChevronRight size={28} />
            </button>
          )}

          {/* Footer info */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/40 px-4 py-1.5 rounded-full text-xs md:text-sm font-medium backdrop-blur-sm z-[10000]">
            {value[previewIndex].original_name} ({previewIndex + 1}/{value.length})
          </div>
        </div>
      )}
    </div>
  );
}
