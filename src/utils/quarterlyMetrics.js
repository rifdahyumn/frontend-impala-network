import { Users, Package, Users2, DollarSign } from 'lucide-react';
import { METRICS_CONFIG } from './constants';

export const quarterlyMetrics = [
    {
        id: 'clients',
        title: 'Total Clients',
        description: 'Klien baru yang didapat',
        color: METRICS_CONFIG.clients?.color || '#3b82f6',
        icon: Users,
        format: (value) => value?.toLocaleString('id-ID') || '0'
    },
    {
        id: 'programs',
        title: 'Total Programs',
        description: 'Program yang dibuat',
        color: METRICS_CONFIG.programs?.color || '#10b981',
        icon: Package,
        format: (value) => value?.toLocaleString('id-ID') || '0'
    },
    {
        id: 'participants',
        title: 'Total Participants',
        description: 'Peserta program',
        color: METRICS_CONFIG.participants?.color || '#8b5cf6',
        icon: Users2,
        format: (value) => value?.toLocaleString('id-ID') || '0'
    },
    {
        id: 'revenue',
        title: 'Total Revenue',
        description: 'Pendapatan yang dihasilkan',
        color: METRICS_CONFIG.revenue?.color || '#f59e0b',
        icon: DollarSign,
        format: (value) => value ? `IDR ${value.toLocaleString('id-ID')}` : 'IDR 0'
    }
];