import { ChangeEvent, useState } from 'react';
import { AxiosError } from 'axios';
import { attachmentApi } from '../services/api';

interface FileUploadProps {
    ownerType: 'dossier' | 'voiture';
    ownerId: number;
    onUploaded?: () => void;
}

export default function FileUpload({ ownerType, ownerId, onUploaded }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filename, setFilename] = useState<string | null>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setError(null);
        setUploading(true);
        try {
            await attachmentApi.upload(ownerType, ownerId, file);
            setFilename(file.name);
            onUploaded?.();
        } catch (err) {
            const ax = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
            setError(
                ax.response?.data?.message ??
                    (ax.response?.data?.errors
                        ? Object.values(ax.response.data.errors).flat().join(' ')
                        : null) ??
                    'Upload failed.',
            );
        } finally {
            setUploading(false);
            // Reset the input so the same file can be selected again.
            e.target.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer">
                <span className="bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-lg transition">
                    {uploading ? 'Uploading…' : '📎 Choose file'}
                </span>
                <span className="text-sm text-gray-500">
                    {filename ? `Uploaded: ${filename}` : 'No file chosen'}
                </span>
                <input
                    type="file"
                    onChange={(e) => void handleFileChange(e)}
                    disabled={uploading}
                    className="hidden"
                />
            </label>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded px-2 py-1">
                    {error}
                </div>
            )}
        </div>
    );
}
