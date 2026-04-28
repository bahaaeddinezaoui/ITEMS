import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MaintenanceItemRequestsPage from './MaintenanceItemRequestsPage';

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            is_superuser: false,
            roles: [{ role_code: 'maintenance_chief' }],
        },
        isSuperuser: false,
    }),
}));

const getAllMock = vi.fn();

vi.mock('../services/api', () => ({
    maintenanceStepItemRequestService: {
        getAll: (...args) => getAllMock(...args),
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key, fallback, vars) => {
            if (typeof fallback === 'string') return fallback;
            if (vars && typeof fallback === 'string') return fallback;
            return key;
        },
    }),
}));

const renderPage = () => {
    return render(
        <MemoryRouter>
            <MaintenanceItemRequestsPage />
        </MemoryRouter>
    );
};

describe('MaintenanceItemRequestsPage', () => {
    beforeEach(() => {
        getAllMock.mockReset();
    });

    it('renders cards and supports search/filter/sort', async () => {
        getAllMock.mockResolvedValue([
            {
                maintenance_step_item_request_id: 1,
                maintenance_id: 10,
                maintenance_step: 100,
                asset_id: 500,
                asset_name: 'Printer HP',
                request_type: 'stock_item',
                status: 'pending',
                requested_stock_item_model: 7,
                note: 'Need cartridge',
                maintenance_status: 'in_progress',
                maintenance_step_status: 'pending (waiting for stock item)',
                created_at: '2026-01-02T10:00:00.000Z',
            },
            {
                maintenance_step_item_request_id: 2,
                maintenance_id: 11,
                maintenance_step: 101,
                asset_id: 501,
                asset_name: 'Laptop Dell',
                request_type: 'consumable',
                status: 'fulfilled',
                requested_consumable_model: 9,
                note: 'Thermal paste',
                maintenance_status: 'done',
                maintenance_step_status: 'In Progress',
                created_at: '2026-01-03T10:00:00.000Z',
            },
        ]);

        renderPage();

        await waitFor(() => {
            expect(getAllMock).toHaveBeenCalledTimes(1);
        });

        expect(screen.getByText('Requests')).toBeInTheDocument();
        expect(screen.getByText('#1 — Printer HP')).toBeInTheDocument();
        expect(screen.getByText('#2 — Laptop Dell')).toBeInTheDocument();

        // Search
        const search = screen.getByLabelText('Search');
        fireEvent.change(search, { target: { value: 'printer' } });
        expect(await screen.findByText('#1 — Printer HP')).toBeInTheDocument();
        expect(screen.queryByText('#2 — Laptop Dell')).not.toBeInTheDocument();

        // Reset
        fireEvent.click(screen.getByText('Reset'));
        expect(await screen.findByText('#2 — Laptop Dell')).toBeInTheDocument();

        // Filter by type
        fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'consumable' } });
        expect(await screen.findByText('#2 — Laptop Dell')).toBeInTheDocument();
        expect(screen.queryByText('#1 — Printer HP')).not.toBeInTheDocument();

        // Sort by status asc (still one item, but ensures control exists)
        fireEvent.change(screen.getByLabelText('Sort by'), { target: { value: 'status' } });
        fireEvent.change(screen.getByLabelText('Direction'), { target: { value: 'asc' } });
        expect(screen.getByText('#2 — Laptop Dell')).toBeInTheDocument();
    });
});
