import React from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReplayIcon from '@mui/icons-material/Replay';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import BuildIcon from '@mui/icons-material/Build';
import PaletteIcon from '@mui/icons-material/Palette';

interface SettingsTabsProps {
    activeTab: number;
    onTabChange: (tab: number) => void;
}

const tabs = [
    { label: 'General', icon: <SettingsIcon /> },
    { label: 'Marketplace', icon: <StorefrontIcon /> },
    { label: 'Orders', icon: <ShoppingCartIcon /> },
    { label: 'Returns', icon: <ReplayIcon /> },
    { label: 'Coupons', icon: <LocalOfferIcon /> },
    { label: 'Notifications', icon: <NotificationsIcon /> },
    { label: 'Security', icon: <SecurityIcon /> },
    { label: 'Maintenance', icon: <BuildIcon /> },
    { label: 'Appearance', icon: <PaletteIcon /> },
];

const SettingsTabs: React.FC<SettingsTabsProps> = ({ activeTab, onTabChange }) => {
    return (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
                value={activeTab}
                onChange={(_, v) => onTabChange(v)}
                variant="scrollable"
                scrollButtons="auto"
            >
                {tabs.map((tab, i) => (
                    <Tab key={i} label={tab.label} icon={tab.icon} iconPosition="start" />
                ))}
            </Tabs>
        </Box>
    );
};

export default React.memo(SettingsTabs);
