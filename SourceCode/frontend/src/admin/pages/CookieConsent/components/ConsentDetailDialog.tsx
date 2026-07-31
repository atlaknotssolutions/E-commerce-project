import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Box, Typography, Chip, Button, Divider, IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { CookieConsent, PopulatedUser, ConsentStatus } from '../../../../types/cookieConsentTypes';

interface ConsentDetailDialogProps {
    open: boolean;
    consent: CookieConsent | null;
    onClose: () => void;
}

const computeStatus = (c: CookieConsent): ConsentStatus => {
    const count = [c.analyticsAccepted, c.marketingAccepted, c.preferencesAccepted].filter(Boolean).length;
    if (count === 3) return 'accepted';
    if (count === 0) return 'rejected';
    return 'customized';
};

const STATUS_CONFIG: Record<ConsentStatus, { label: string; color: 'success' | 'warning' | 'error' }> = {
    accepted: { label: 'Accepted', color: 'success' },
    customized: { label: 'Customized', color: 'warning' },
    rejected: { label: 'Rejected', color: 'error' },
};

const DEVICE_ICONS: Record<string, string> = {
    desktop: 'Desktop',
    mobile: 'Mobile',
    tablet: 'Tablet',
    unknown: 'Unknown',
};

const ConsentDetailDialog: React.FC<ConsentDetailDialogProps> = ({ open, consent, onClose }) => {
    if (!consent) return null;

    const status = computeStatus(consent);
    const statusCfg = STATUS_CONFIG[status];
    const user = consent.userId as PopulatedUser | null;
    const isRegistered = user && typeof user === 'object' && '_id' in user;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const InfoRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1.2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140, fontWeight: 500 }}>
                {label}
            </Typography>
            <Typography variant="body2" fontWeight={500} sx={{ textAlign: 'right', flex: 1 }}>
                {value}
            </Typography>
        </Box>
    );

    const CategoryBadge: React.FC<{ label: string; accepted: boolean }> = ({ label, accepted }) => (
        <Chip
            icon={accepted ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <CancelIcon sx={{ fontSize: 16 }} />}
            label={`${label}: ${accepted ? 'Enabled' : 'Disabled'}`}
            size="small"
            color={accepted ? 'success' : 'default'}
            variant={accepted ? 'filled' : 'outlined'}
        />
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: '16px' } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Consent Details</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Recorded {formatDate(consent.acceptedAt || consent.createdAt)}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
                <Box sx={{ mb: 2 }}>
                    <Chip
                        label={statusCfg.label}
                        color={statusCfg.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>

                <Divider sx={{ mb: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.5, mb: 0.5, color: '#1a1a2e' }}>
                    User Information
                </Typography>

                <InfoRow
                    label="User"
                    value={isRegistered ? (
                        <Box>
                            <Typography variant="body2" fontWeight={600}>{user.fullName}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                        </Box>
                    ) : (
                        <Typography variant="body2" color="text.secondary">Anonymous Visitor</Typography>
                    )}
                />

                {isRegistered && (
                    <InfoRow
                        label="Role"
                        value={<Chip label={user.role.replace('ROLE_', '')} size="small" />}
                    />
                )}

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.5, mb: 0.5, color: '#1a1a2e' }}>
                    Device & Browser
                </Typography>

                <InfoRow label="Browser" value={consent.browser || 'Unknown'} />
                <InfoRow label="Operating System" value={consent.os || 'Unknown'} />
                <InfoRow label="Device Type" value={DEVICE_ICONS[consent.deviceType] || consent.deviceType} />
                <InfoRow label="Language" value={consent.language || 'Unknown'} />
                <InfoRow label="Timezone" value={consent.timezone || 'Unknown'} />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.5, mb: 0.5, color: '#1a1a2e' }}>
                    Location
                </Typography>

                <InfoRow label="Country" value={consent.country || 'Unknown'} />
                <InfoRow label="City" value={consent.city || 'Unknown'} />

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.5, mb: 1, color: '#1a1a2e' }}>
                    Cookie Categories
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <CategoryBadge label="Necessary" accepted={true} />
                    <CategoryBadge label="Analytics" accepted={consent.analyticsAccepted} />
                    <CategoryBadge label="Marketing" accepted={consent.marketingAccepted} />
                    <CategoryBadge label="Preferences" accepted={consent.preferencesAccepted} />
                </Box>

                <Divider sx={{ my: 1 }} />

                <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1.5, mb: 0.5, color: '#1a1a2e' }}>
                    Consent Metadata
                </Typography>

                <InfoRow label="Policy Version" value={`v${consent.policyVersion}`} />
                <InfoRow label="Consent Version" value={`v${consent.consentVersion}`} />
                <InfoRow label="Accepted At" value={formatDate(consent.acceptedAt)} />
                <InfoRow label="Last Updated" value={formatDate(consent.updatedAt)} />
                {consent.sourcePage && (
                    <InfoRow label="Source Page" value={consent.sourcePage} />
                )}
                {!isRegistered && consent.anonymousId && (
                    <InfoRow
                        label="Anonymous ID"
                        value={
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                {consent.anonymousId}
                            </Typography>
                        }
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" sx={{ textTransform: 'none', borderRadius: '8px' }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(ConsentDetailDialog);
