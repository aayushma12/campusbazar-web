'use client';

import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Loader2,
    AlertCircle,
    DollarSign,
    FileText,
    Tag,
    MapPin,
    CheckCircle2,
    ChevronDown,
    Info,
} from 'lucide-react';
import { toast } from 'sonner';

import ImageUploader, { type UploadedFile } from './ImageUploader';
import { CAMPUS_OPTIONS, CONDITION_OPTIONS, type ProductCondition } from '@/types/product';
import { useCategories } from '@/hooks/useProducts';

// ─── Zod Schema ───────────────────────────────────────────────────────────────

export const productSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be under 100 characters'),
    description: z
        .string()
        .min(15, 'Description must be at least 15 characters')
        .max(1500, 'Description must be under 1500 characters'),
    price: z
        .number({ message: 'Enter a valid price' })
        .nonnegative('Price cannot be negative')
        .max(10_000_000, 'Price seems too high'),
    quantity: z
        .number({ message: 'Enter a valid stock quantity' })
        .int('Quantity must be a whole number')
        .min(0, 'Quantity cannot be negative'),
    negotiable: z.boolean(),
    condition: z.enum(['new', 'like_new', 'good', 'fair', 'poor'], {
        message: 'Select a condition',
    }),
    categoryId: z.string().min(1, 'Select a category'),
    campus: z.string().min(1, 'Select a campus'),
});

export type ProductFormData = z.infer<typeof productSchema>;

// ─── Condition metadata ───────────────────────────────────────────────────────

const CONDITION_META: Record<
    ProductCondition,
    { label: string; emoji: string; color: string; bg: string; description: string }
> = {
    new: {
        label: 'New',
        emoji: '✨',
        color: 'text-green-700',
        bg: 'bg-green-50 border-green-500',
        description: 'Unused, original packaging',
    },
    like_new: {
        label: 'Like New',
        emoji: '🌟',
        color: 'text-teal-700',
        bg: 'bg-teal-50 border-teal-500',
        description: 'Barely used, no defects',
    },
    good: {
        label: 'Good',
        emoji: '👍',
        color: 'text-blue-700',
        bg: 'bg-blue-50 border-blue-500',
        description: 'Minor signs of use',
    },
    fair: {
        label: 'Fair',
        emoji: '🔆',
        color: 'text-amber-700',
        bg: 'bg-amber-50 border-amber-500',
        description: 'Visible wear but functional',
    },
    poor: {
        label: 'Poor',
        emoji: '⚠️',
        color: 'text-red-700',
        bg: 'bg-red-50 border-red-500',
        description: 'Heavy wear, may need repair',
    },
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    children,
}: {
    icon: React.ElementType;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">{title}</h2>
            </div>
            {children}
        </div>
    );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
    id,
    label,
    required,
    error,
    hint,
    counter,
    children,
}: {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    counter?: { current: number; max: number };
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label htmlFor={id} className="text-sm font-bold text-gray-700 flex items-center gap-1">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                {counter && (
                    <span
                        className={`text-xs font-semibold tabular-nums ${counter.current > counter.max * 0.9
                            ? 'text-red-500'
                            : counter.current > counter.max * 0.7
                                ? 'text-amber-500'
                                : 'text-gray-400'
                            }`}
                    >
                        {counter.current}/{counter.max}
                    </span>
                )}
            </div>

            {children}

            {error ? (
                <p className="flex items-center gap-1.5 text-sm text-red-600 font-medium" role="alert">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {error}
                </p>
            ) : hint ? (
                <p className="text-xs text-gray-400">{hint}</p>
            ) : null}
        </div>
    );
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const INPUT = [
    'w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-medium',
    'placeholder:text-gray-400 outline-none transition-all duration-150',
    'focus:border-green-500 focus:ring-3 focus:ring-green-100',
    'disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed',
].join(' ');

const INPUT_ERROR = 'border-red-300 focus:border-red-400 focus:ring-red-100';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ProductFormProps {
    defaultValues?: Partial<ProductFormData & { images?: string[] }>;
    onSubmit: (data: ProductFormData, images: UploadedFile[]) => Promise<void>;
    isEditing?: boolean;
    isSubmitting?: boolean;
    submitError?: string | null;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProductForm({
    defaultValues,
    onSubmit,
    isEditing = false,
    isSubmitting = false,
    submitError,
}: ProductFormProps) {
    // ── React Hook Form ────────────────────────────────────────────────────
    const {
        register,
        handleSubmit,
        control,
        watch,
        setValue,
        formState: { errors, dirtyFields },
    } = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            title: defaultValues?.title ?? '',
            description: defaultValues?.description ?? '',
            price: defaultValues?.price,
            quantity: defaultValues?.quantity ?? 1,
            negotiable: defaultValues?.negotiable ?? false,
            condition: defaultValues?.condition,
            categoryId: defaultValues?.categoryId ?? '',
            campus: defaultValues?.campus ?? '',
        },
        mode: 'onBlur',
    });

    // ── Images ─────────────────────────────────────────────────────────────
    const [images, setImages] = useState<UploadedFile[]>(() =>
        (defaultValues?.images ?? []).map((url, i) => ({
            id: `existing-${i}`,
            preview: url,
            isExisting: true,
            progress: 100,
        }))
    );
    const [imageError, setImageError] = useState<string | undefined>();

    // ── Categories ─────────────────────────────────────────────────────────
    const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

    type RawCategory = {
        id?: string;
        _id?: string;
        name?: string;
        parentId?: string | null;
        parent?: string | { id?: string; _id?: string } | null;
    };

    const rawCategories = (categoriesData?.data ?? []) as RawCategory[];

    const categories = Array.from(
        rawCategories.reduce((acc, raw, index) => {
            const id = raw?.id || raw?._id;
            if (!id) return acc;

            const parentFromObj = typeof raw?.parent === 'object' && raw?.parent
                ? (raw.parent.id || raw.parent._id)
                : undefined;

            const parentId = raw?.parentId || (typeof raw?.parent === 'string' ? raw.parent : parentFromObj);
            const name = raw?.name?.trim() || `Category ${index + 1}`;

            if (!acc.has(id)) {
                acc.set(id, {
                    id,
                    name,
                    parentId: parentId || undefined,
                });
            }

            return acc;
        }, new Map<string, { id: string; name: string; parentId?: string }>())
        .values()
    );

    // Group: parents first, then children (basic tree)
    const parentCategories = categories.filter((c) => !c.parentId);
    const childCategories = categories.filter((c) => c.parentId);

    // ── Watched values for UI ──────────────────────────────────────────────
    const titleVal = watch('title') ?? '';
    const descVal = watch('description') ?? '';
    const selectedCondition = watch('condition');
    const negotiable = watch('negotiable');
    const quantityVal = watch('quantity') ?? 0;

    // ── Submit ─────────────────────────────────────────────────────────────
    async function handleFormSubmit(data: ProductFormData) {
        if (images.length === 0 && !isEditing) {
            setImageError('Please upload at least 1 photo');
            return;
        }

        setImageError(undefined);

        await onSubmit(data, images);
    }

    return (
        <form
            onSubmit={handleSubmit(handleFormSubmit)}
            noValidate
            className="space-y-10"
            id="product-listing-form"
        >
            {/* ── Global error ──────────────────────────────────────────────────── */}
            {submitError && (
                <div
                    role="alert"
                    className="flex items-start gap-3 bg-red-50 border-2 border-red-200 rounded-2xl px-5 py-4 animate-in slide-in-from-top-2 duration-300"
                >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-red-800">Submission failed</p>
                        <p className="text-sm text-red-700 mt-0.5">{submitError}</p>
                    </div>
                </div>
            )}

            {/* ════════════════════════════════════════════════════════════════════
          Section 1 — Photos
      ════════════════════════════════════════════════════════════════════ */}
            <Section icon={FileText} title="Photos">
                <div className="space-y-2">
                    <ImageUploader
                        files={images}
                        onChange={setImages}
                        maxFiles={8}
                        error={imageError}
                    />
                    {images.length === 0 && !isEditing && (
                        <div className="flex items-start gap-2 text-xs text-gray-400 font-medium">
                            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            At least 1 photo is required. Listings with multiple photos get 3× more views.
                        </div>
                    )}
                </div>
            </Section>

            {/* ════════════════════════════════════════════════════════════════════
          Section 2 — Item Details
      ════════════════════════════════════════════════════════════════════ */}
            <Section icon={Tag} title="Item Details">
                <div className="space-y-5">
                    {/* Title */}
                    <Field
                        id="product-title"
                        label="Title"
                        required
                        error={errors.title?.message}
                        counter={{ current: titleVal.length, max: 100 }}
                        hint='E.g., "Engineering Mechanics Textbook — 2nd Edition"'
                    >
                        <input
                            id="product-title"
                            type="text"
                            placeholder="What are you selling?"
                            autoComplete="off"
                            className={`${INPUT} ${errors.title ? INPUT_ERROR : ''}`}
                            {...register('title')}
                        />
                    </Field>

                    {/* Description */}
                    <Field
                        id="product-description"
                        label="Description"
                        required
                        error={errors.description?.message}
                        counter={{ current: descVal.length, max: 1500 }}
                        hint="Include condition details, age, original price, what's included, and any defects."
                    >
                        <textarea
                            id="product-description"
                            rows={6}
                            placeholder="Describe your item honestly — buyers appreciate transparency…"
                            className={`${INPUT} resize-y min-h-35 leading-relaxed ${errors.description ? INPUT_ERROR : ''
                                }`}
                            {...register('description')}
                        />
                    </Field>

                    {/* Condition — visual button group */}
                    <Field
                        id="product-condition"
                        label="Condition"
                        required
                        error={errors.condition?.message}
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5" role="radiogroup" aria-label="Item condition">
                            {(Object.keys(CONDITION_META) as ProductCondition[]).map((val) => {
                                const meta = CONDITION_META[val];
                                const selected = selectedCondition === val;
                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        id={`condition-btn-${val}`}
                                        role="radio"
                                        aria-checked={selected}
                                        onClick={() => setValue('condition', val, { shouldValidate: true, shouldDirty: true })}
                                        className={[
                                            'relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-center transition-all duration-150',
                                            selected
                                                ? `${meta.bg} shadow-md scale-[1.03] ${meta.color}`
                                                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50',
                                        ].join(' ')}
                                    >
                                        <span className="text-xl leading-none">{meta.emoji}</span>
                                        <span className="text-xs font-black leading-tight">{meta.label}</span>
                                        <span className="text-[10px] font-medium leading-tight opacity-70 hidden sm:block">
                                            {meta.description}
                                        </span>
                                        {selected && (
                                            <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 opacity-80" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </Field>
                </div>
            </Section>

            {/* ════════════════════════════════════════════════════════════════════
          Section 3 — Pricing
      ════════════════════════════════════════════════════════════════════ */}
            <Section icon={DollarSign} title="Pricing">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-start">
                    {/* Price */}
                    <Field
                        id="product-price"
                        label="Asking Price"
                        required
                        error={errors.price?.message}
                        hint="Set Rs. 0 if you're giving it away for free."
                    >
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-gray-500 select-none pointer-events-none">
                                Rs.
                            </span>
                            <input
                                id="product-price"
                                type="number"
                                min="0"
                                step="1"
                                placeholder="0"
                                className={`${INPUT} pl-12 ${errors.price ? INPUT_ERROR : ''}`}
                                {...register('price', { valueAsNumber: true })}
                            />
                        </div>
                    </Field>

                    {/* Negotiable toggle */}
                    <div className="flex flex-col justify-end sm:pt-6">
                        <Controller
                            control={control}
                            name="negotiable"
                            render={({ field }) => (
                                <button
                                    type="button"
                                    id="product-negotiable-toggle"
                                    role="switch"
                                    aria-checked={field.value}
                                    onClick={() => field.onChange(!field.value)}
                                    className={[
                                        'flex items-center gap-4 w-full px-5 py-4 rounded-xl border-2 text-left transition-all duration-200',
                                        field.value
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 bg-white hover:border-gray-300',
                                    ].join(' ')}
                                >
                                    {/* Toggle pill */}
                                    <div
                                        className={[
                                            'w-11 h-6 rounded-full transition-all duration-200 shrink-0 relative',
                                            field.value ? 'bg-green-500' : 'bg-gray-300',
                                        ].join(' ')}
                                    >
                                        <span
                                            className={[
                                                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200',
                                                field.value ? 'left-5' : 'left-0.5',
                                            ].join(' ')}
                                        />
                                    </div>
                                    <div>
                                        <p className={`text-sm font-bold ${field.value ? 'text-green-800' : 'text-gray-700'}`}>
                                            Price is negotiable
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Buyers can message you with offers</p>
                                    </div>
                                </button>
                            )}
                        />
                    </div>

                    {/* Stock quantity */}
                    <Field
                        id="product-quantity"
                        label="Stock Quantity"
                        required
                        error={errors.quantity?.message}
                        hint="Set 0 to mark as out of stock."
                    >
                        <input
                            id="product-quantity"
                            type="number"
                            min="0"
                            step="1"
                            placeholder="0"
                            className={`${INPUT} ${errors.quantity ? INPUT_ERROR : ''}`}
                            {...register('quantity', { valueAsNumber: true })}
                        />
                        <p className="text-xs text-gray-400 mt-1">Current input: <span className="font-semibold text-gray-600">{quantityVal}</span></p>
                    </Field>
                </div>
            </Section>

            {/* ════════════════════════════════════════════════════════════════════
          Section 4 — Classification
      ════════════════════════════════════════════════════════════════════ */}
            <Section icon={MapPin} title="Category & Location">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Category */}
                    <Field id="product-category" label="Category" required error={errors.categoryId?.message}>
                        <div className="relative">
                            <select
                                id="product-category"
                                disabled={categoriesLoading}
                                className={`${INPUT} pr-10 appearance-none ${errors.categoryId ? INPUT_ERROR : ''}`}
                                {...register('categoryId')}
                            >
                                <option key="placeholder" value="">
                                    {categoriesLoading ? 'Loading categories…' : '— Choose a category —'}
                                </option>
                                {/* Top-level categories */}
                                {parentCategories.map((cat) => {
                                    const children = childCategories.filter((c) => c.parentId === cat.id);
                                    if (children.length > 0) {
                                        return (
                                            <optgroup key={cat.id} label={cat.name}>
                                                <option key={`${cat.id}-all`} value={cat.id}>{cat.name} (all)</option>
                                                {children.map((child) => (
                                                    <option key={child.id} value={child.id}>
                                                        &nbsp;&nbsp;{child.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        );
                                    }
                                    return (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    );
                                })}
                                {/* Orphan children (flat) */}
                                {childCategories
                                    .filter((c) => !parentCategories.find((p) => p.id === c.parentId))
                                    .map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                            Category creation endpoint is not available on the backend. Please use an existing category or ask backend to enable category creation.
                        </p>
                    </Field>

                    {/* Campus */}
                    <Field id="product-campus" label="Campus / Location" required error={errors.campus?.message}>
                        <div className="relative">
                            <select
                                id="product-campus"
                                className={`${INPUT} pr-10 appearance-none ${errors.campus ? INPUT_ERROR : ''}`}
                                {...register('campus')}
                            >
                                <option value="">— Choose your campus —</option>
                                {CAMPUS_OPTIONS.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </Field>
                </div>
            </Section>

            {/* ════════════════════════════════════════════════════════════════════
          Submit
      ════════════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
                <button
                    type="submit"
                    id="product-form-submit-btn"
                    disabled={isSubmitting}
                    className={[
                        'flex-1 flex items-center justify-center gap-2.5 py-4 px-8 rounded-xl font-black text-base text-white',
                        'transition-all duration-200 shadow-lg',
                        isSubmitting
                            ? 'bg-green-400 cursor-not-allowed shadow-none'
                            : 'bg-green-600 hover:bg-green-700 hover:shadow-green-200 hover:shadow-xl active:scale-[0.98]',
                    ].join(' ')}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{isEditing ? 'Saving changes…' : 'Publishing listing…'}</span>
                        </>
                    ) : (
                        <span>{isEditing ? '💾  Save Changes' : '🚀  Publish for Sale'}</span>
                    )}
                </button>
            </div>
        </form>
    );
}
