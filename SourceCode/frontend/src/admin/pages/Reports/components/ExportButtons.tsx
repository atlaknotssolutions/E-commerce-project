import React, { useState } from 'react';
import { Button, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import { useAppDispatch } from '../../../../Redux Toolkit/Store';
import { exportReportCsv } from '../../../../Redux Toolkit/Admin/adminReportsSlice';
import { ReportFilters } from '../../../../types/adminReportsTypes';

interface ExportButtonsProps {
    filters: ReportFilters;
    activeTab: string;
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ filters, activeTab }) => {
    const dispatch = useAppDispatch();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const exportType = activeTab === 'dashboard' ? 'orders' : activeTab;

    const handleExportCsv = () => {
        dispatch(exportReportCsv({ type: exportType, filters }));
        handleClose();
    };

    const handleExportExcel = () => {
        dispatch(exportReportCsv({ type: exportType, filters }));
        handleClose();
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleClick}
            >
                Export
            </Button>
            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem onClick={handleExportCsv}>
                    <ListItemIcon>
                        <DescriptionIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as CSV</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleExportExcel}>
                    <ListItemIcon>
                        <TableChartIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Export as Excel</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
};

export default React.memo(ExportButtons);
