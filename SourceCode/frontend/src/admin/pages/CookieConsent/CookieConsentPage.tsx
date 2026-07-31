import React, { useEffect, useCallback, useState } from 'react';
import {
    Container, Typography, Box, Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store';
import {
    loadAdminConsentStats,
    clearConsentError,
} from '../../../Redux Toolkit/Customer/cookieConsentSlice';
import { CookieConsent } from '../../../types/cookieConsentTypes';
import ConsentStatsCards from './components/ConsentStatsCards';
import CountryDistributionChart from './components/CountryDistributionChart';
import RecentConsentsTable from './components/RecentConsentsTable';
import ConsentDetailDialog from './components/ConsentDetailDialog';

const CookieConsentPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { adminStats, loading, error } = useAppSelector(
        (store) => store.cookieConsent
    );

    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedConsent, setSelectedConsent] = useState<CookieConsent | null>(null);

    useEffect(() => {
        dispatch(loadAdminConsentStats({ page: 1, limit: 50 }));
    }, [dispatch]);

    const handleDismissError = useCallback(() => {
        dispatch(clearConsentError());
    }, [dispatch]);

    const handleViewDetail = useCallback((consent: CookieConsent) => {
        setSelectedConsent(consent);
        setDetailOpen(true);
    }, []);

    const handleDetailClose = useCallback(() => {
        setDetailOpen(false);
        setSelectedConsent(null);
    }, []);

    return (
        <Container maxWidth="lg">
            <Box mb={3}>
                <Typography variant="h4" fontWeight={700}>Cookie Consent Management</Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Monitor and analyze user cookie consent preferences across the platform.
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={handleDismissError}>
                    {error}
                </Alert>
            )}

            <Box sx={{ mb: 3 }}>
                <ConsentStatsCards
                    statistics={adminStats?.statistics || null}
                    loading={loading}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <CountryDistributionChart
                    data={adminStats?.countryDistribution || []}
                    loading={loading}
                />
            </Box>

            <RecentConsentsTable
                consents={adminStats?.recentConsents || []}
                pagination={adminStats?.pagination || null}
                loading={loading}
                onViewDetail={handleViewDetail}
            />

            <ConsentDetailDialog
                open={detailOpen}
                consent={selectedConsent}
                onClose={handleDetailClose}
            />

        </Container>
    );
};

export default CookieConsentPage;
