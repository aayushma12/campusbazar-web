'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { UploadCloud, X, Star, Plus, AlertCircle } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UploadedFile {
    id: string;
    file?: File;
    preview: string;      // object URL or existing server URL
    isExisting?: boolean; // already on server — don't re-upload
    progress?: number;    // 0-100, simulated upload progress
    error?: string;
}

interface ImageUploaderProps {
    files: UploadedFile[];
    onChange: (files: UploadedFile[]) => void;
    maxFiles?: number;
    error?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// ─── Simulated upload progress ────────────────────────────────────────────────
function simulateProgress(
    id: string,
    setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>
) {
    let progress = 0;
    const tick = () => {
        progress += Math.random() * 25 + 10;
        if (progress >= 100) {
            progress = 100;
            setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, progress: 100 } : f)));
            return;
        }
        setFiles((prev) => {
            return prev.map((f) =>
                f.id === id ? { ...f, progress: Math.round(progress) } : f
            );
        });
        setTimeout(tick, 120 + Math.random() * 150);
    };
    setTimeout(tick, 80);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImageUploader({
    files,
    onChange,
    maxFiles = 8,
    error,
}: ImageUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [internalFiles, setInternalFiles] = useState<UploadedFile[]>(files);
    const [swapFrom, setSwapFrom] = useState<number | null>(null);

    // Keep internal state aligned when parent updates files (e.g., form reset/edit load)
    useEffect(() => {
        setInternalFiles(files);
    }, [files]);

    // Keep parent in sync without firing inside state updater callbacks
    useEffect(() => {
        onChange(internalFiles);
    }, [internalFiles, onChange]);

    const processIncoming = useCallback(
        (incoming: FileList | null) => {
            if (!incoming) return;
            const remaining = maxFiles - internalFiles.length;
            if (remaining <= 0) return;

            const newEntries: UploadedFile[] = [];
            const errors: string[] = [];

            Array.from(incoming)
                .slice(0, remaining)
                .forEach((f) => {
                    if (!ACCEPTED_TYPES.includes(f.type)) {
                        errors.push(`${f.name}: unsupported format`);
                        return;
                    }
                    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                        errors.push(`${f.name}: exceeds ${MAX_FILE_SIZE_MB} MB`);
                        return;
                    }
                    newEntries.push({
                        id: `${Date.now()}-${Math.random()}`,
                        file: f,
                        preview: URL.createObjectURL(f),
                        progress: 0,
                    });
                });

            const next = [...internalFiles, ...newEntries];
            setInternalFiles(next);

            // Simulate upload progress for each new file
            newEntries.forEach((entry) => {
                simulateProgress(entry.id, setInternalFiles);
            });
        },
        [internalFiles, maxFiles]
    );

    const removeFile = useCallback(
        (id: string) => {
            const removed = internalFiles.find((f) => f.id === id);
            if (removed && !removed.isExisting && removed.preview.startsWith('blob:')) {
                URL.revokeObjectURL(removed.preview);
            }
            setInternalFiles(internalFiles.filter((f) => f.id !== id));
        },
        [internalFiles]
    );

    // Reorder via tap-to-swap: tap once to select, tap another to swap
    const handleThumbClick = useCallback(
        (index: number) => {
            if (swapFrom === null) {
                setSwapFrom(index);
                return;
            }
            if (swapFrom === index) {
                setSwapFrom(null);
                return;
            }
            const updated = [...internalFiles];
            [updated[swapFrom], updated[index]] = [updated[index], updated[swapFrom]];
            setInternalFiles(updated);
            setSwapFrom(null);
        },
        [swapFrom, internalFiles]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            processIncoming(e.dataTransfer.files);
        },
        [processIncoming]
    );

    const canAddMore = internalFiles.length < maxFiles;

    return (
        <div className="space-y-4">
            {/* ── Drop zone ──────────────────────────────────────────────────────── */}
            {canAddMore && (
                <div
                    role="button"
                    tabIndex={0}
                    id="image-drop-zone"
                    aria-label="Upload product images"
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    className={[
                        'relative flex flex-col items-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer',
                        'transition-all duration-200 select-none outline-none',
                        isDragging
                            ? 'border-green-500 bg-green-50 scale-[1.01] shadow-lg shadow-green-100'
                            : error
                                ? 'border-red-300 bg-red-50/40 hover:border-red-400'
                                : 'border-gray-200 bg-gray-50/60 hover:border-green-400 hover:bg-green-50/40',
                    ].join(' ')}
                >
                    {/* Animated icon */}
                    <div
                        className={[
                            'w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200',
                            isDragging ? 'bg-green-100 scale-110' : 'bg-white shadow-sm',
                        ].join(' ')}
                    >
                        <UploadCloud
                            className={[
                                'w-8 h-8 transition-colors',
                                isDragging ? 'text-green-600' : error ? 'text-red-400' : 'text-gray-400',
                            ].join(' ')}
                        />
                    </div>

                    <div className="text-center">
                        <p className="font-bold text-sm text-gray-700">
                            {isDragging ? 'Drop to upload!' : 'Click or drag & drop images'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            JPG, PNG, WEBP · Max {MAX_FILE_SIZE_MB}MB each · {internalFiles.length}/{maxFiles} uploaded
                        </p>
                        {swapFrom !== null && (
                            <p className="text-xs text-green-600 font-semibold mt-2 animate-pulse">
                                ↕ Tap another image to swap position
                            </p>
                        )}
                    </div>

                    <input
                        ref={inputRef}
                        id="image-file-input"
                        type="file"
                        accept={ACCEPTED_TYPES.join(',')}
                        multiple
                        className="sr-only"
                        aria-label="Choose product images"
                        onChange={(e) => processIncoming(e.target.files)}
                    />
                </div>
            )}

            {/* ── Preview grid ───────────────────────────────────────────────────── */}
            {internalFiles.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {internalFiles.map((f, index) => (
                        <div
                            key={f.id}
                            onClick={() => handleThumbClick(index)}
                            className={[
                                'relative group aspect-square rounded-xl overflow-hidden cursor-pointer',
                                'border-2 transition-all duration-200',
                                swapFrom === index
                                    ? 'border-green-500 ring-2 ring-green-300 ring-offset-1 scale-105'
                                    : swapFrom !== null
                                        ? 'border-dashed border-gray-300 hover:border-green-400 opacity-80 hover:opacity-100'
                                        : 'border-gray-100 shadow-sm hover:border-green-300 hover:shadow-md',
                            ].join(' ')}
                            role="button"
                            tabIndex={0}
                            aria-label={index === 0 ? 'Primary image' : `Image ${index + 1} — click to reorder`}
                            onKeyDown={(e) => e.key === 'Enter' && handleThumbClick(index)}
                        >
                            {/* Image */}
                            <Image
                                src={f.preview}
                                alt={`Product image ${index + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />

                            {/* Upload progress overlay */}
                            {f.progress !== undefined && f.progress < 100 && (
                                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                                    <div className="w-3/4 h-1.5 bg-white/30 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-400 rounded-full transition-all duration-200"
                                            style={{ width: `${f.progress}%` }}
                                        />
                                    </div>
                                    <span className="text-white text-[10px] font-bold">{f.progress}%</span>
                                </div>
                            )}

                            {/* Primary badge */}
                            {index === 0 && (
                                <span className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-green-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full shadow">
                                    <Star className="w-2.5 h-2.5 fill-white" />
                                    Main
                                </span>
                            )}

                            {/* Existing badge */}
                            {f.isExisting && (
                                <span className="absolute bottom-1.5 left-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                    Saved
                                </span>
                            )}

                            {/* Number badge */}
                            <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {index + 1}
                            </span>

                            {/* Remove button */}
                            <button
                                type="button"
                                id={`remove-image-${index}`}
                                aria-label={`Remove image ${index + 1}`}
                                onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow hover:bg-red-600 hover:scale-110"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            {/* Swap highlight overlay */}
                            {swapFrom !== null && swapFrom !== index && (
                                <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                                    <span className="text-green-700 text-[10px] font-black bg-white/80 px-1.5 py-0.5 rounded-full">
                                        swap here
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Add more tile */}
                    {canAddMore && internalFiles.length > 0 && (
                        <button
                            type="button"
                            id="add-more-images-btn"
                            onClick={() => inputRef.current?.click()}
                            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 hover:border-green-400 bg-gray-50 hover:bg-green-50
                         flex flex-col items-center justify-center gap-1.5 transition-all text-gray-400 hover:text-green-600 hover:scale-[1.02]"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="text-[10px] font-bold">Add</span>
                        </button>
                    )}
                </div>
            )}

            {/* Reorder hint */}
            {internalFiles.length > 1 && swapFrom === null && (
                <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                    <span>💡</span> Tap two images to swap their order. First image is the primary listing photo.
                </p>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 font-medium" role="alert">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
        </div>
    );
}
