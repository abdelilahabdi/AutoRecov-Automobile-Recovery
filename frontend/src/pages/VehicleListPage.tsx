import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AxiosError } from 'axios';
import { TruckIcon } from '@heroicons/react/24/outline';
import { Card, CardHeader } from '../components/Card';
import PageHeader from '../components/PageHeader';
import {
    DataTable,
    DataTableColumn,
    EmptyState,
    FormField,
    inputCls,
    primaryBtnCls,
    secondaryBtnCls,
} from '../components/ui';
import { voitureApi, VoitureListParams } from '../services/api';
import { Paginated, Voiture } from '../types';

export default function VehicleListPage() {
    const [vehicles, setVehicles] = useState<Voiture[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<VoitureListParams>({
        make: '',
        model: '',
        plate_number: '',
        chassis_number: '',
    });

    const load = async (override?: VoitureListParams) => {
        setLoading(true);
        setError(null);
        try {
            const merged: VoitureListParams = { ...filters, ...override };
            const clean: VoitureListParams = {};
            for (const [k, v] of Object.entries(merged)) {
                if (v !== undefined && v !== null && v !== '') {
                    (clean as Record<string, string>)[k] = String(v);
                }
            }
            const page: Paginated<Voiture> = await voitureApi.list(clean);
            setVehicles(page.data);
        } catch (err) {
            const ax = err as AxiosError<{ message?: string }>;
            setError(ax.response?.data?.message ?? 'Failed to load vehicles.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const columns: DataTableColumn<Voiture>[] = [
        { key: 'mm', header: 'Make / Model', render: (v) => <span className="font-medium text-slate-800">{v.make} {v.model}</span> },
        { key: 'year', header: 'Year', render: (v) => v.year },
        { key: 'plate', header: 'Plate #', render: (v) => <span className="font-mono text-slate-700">{v.plate_number || '—'}</span> },
        { key: 'chassis', header: 'Chassis #', render: (v) => <span className="font-mono text-slate-700">{v.chassis_number}</span> },
        {
            key: 'dossier', header: 'Dossier',
            render: (v) => v.dossier ? (
                <Link to={`/dossiers/${v.dossier.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    {v.dossier.case_number}
                </Link>
            ) : (
                <Link to={`/dossiers/${v.dossier_id}`} className="text-blue-600 hover:text-blue-800 font-medium">
                    #{v.dossier_id}
                </Link>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <PageHeader title="Vehicles" description="All vehicles across recovery cases" />

            <Card>
                <CardHeader title="Filters" description="Refine the list of vehicles" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {(['make', 'model', 'plate_number', 'chassis_number'] as const).map((key) => (
                        <FormField key={key} label={key.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}>
                            <input
                                value={String(filters[key] ?? '')}
                                onChange={(e) => setFilters((f) => ({ ...f, [key]: e.target.value }))}
                                placeholder={`Filter by ${key.replace('_', ' ')}`}
                                className={inputCls}
                            />
                        </FormField>
                    ))}
                </div>
                <div className="mt-4 flex gap-2 justify-end">
                    <button
                        onClick={() => {
                            setFilters({ make: '', model: '', plate_number: '', chassis_number: '' });
                            void load({ make: '', model: '', plate_number: '', chassis_number: '' });
                        }}
                        className={secondaryBtnCls}
                    >
                        Reset
                    </button>
                    <button onClick={() => void load()} className={primaryBtnCls}>
                        Apply filters
                    </button>
                </div>
            </Card>

            <Card padded={false}>
                {loading ? (
                    <div className="py-16 text-center text-sm text-slate-500">Loading vehicles…</div>
                ) : error ? (
                    <div className="p-6 text-red-600 text-sm">{error}</div>
                ) : vehicles.length === 0 ? (
                    <EmptyState
                        icon={<TruckIcon className="h-6 w-6" />}
                        title="No vehicles found"
                        description="Vehicles added to dossiers will appear here."
                    />
                ) : (
                    <DataTable columns={columns} rows={vehicles} rowKey={(v) => v.id} />
                )}
            </Card>
        </div>
    );
}
