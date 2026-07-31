import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AssignmentIcon from '@mui/icons-material/Assignment';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const ORDER_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'PLACED', label: 'Placed' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'RETURNED', label: 'Returned' },
];

const PAYMENT_STATUSES = [
  { value: '', label: 'All Payments' },
  { value: 'PAID', label: 'Paid' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'PENDING', label: 'Pending' },
];

const PAYMENT_METHODS = [
  { value: '', label: 'All Methods' },
  { value: 'RAZORPAY', label: 'Razorpay' },
  { value: 'STRIPE', label: 'Stripe' },
  { value: 'COD', label: 'Cash on Delivery' },
];

export interface Filters {
  search: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
}

interface Props {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
  onReset: () => void;
  onExport: (format: 'csv' | 'xlsx') => void;
  onBulkDownload: (documentType: 'customer' | 'seller' | 'packing') => void;
  exporting: boolean;
}

const FilterBar: React.FC<Props> = ({ filters, onFilterChange, onReset, onExport, onBulkDownload, exporting }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bulkAnchorEl, setBulkAnchorEl] = useState<null | HTMLElement>(null);

  const update = (patch: Partial<Filters>) => {
    onFilterChange({ ...filters, ...patch });
  };

  const hasActiveFilters = filters.search || filters.orderStatus || filters.paymentStatus || filters.paymentMethod;

  const handleExportClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleExportClose = () => {
    setAnchorEl(null);
  };

  const handleExportFormat = (format: 'csv' | 'xlsx') => {
    handleExportClose();
    onExport(format);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
        mb: 2.5,
        p: 2,
        bg: '#FAFAFA',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <TextField
        placeholder="Search Order ID, Customer, Product..."
        value={filters.search}
        onChange={(e) => update({ search: e.target.value })}
        size="small"
        sx={{ minWidth: 240, flex: { xs: '1 1 100%', sm: '1 1 220px' } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        aria-label="Search orders"
      />

      <TextField
        select
        label="Status"
        value={filters.orderStatus}
        onChange={(e) => update({ orderStatus: e.target.value })}
        size="small"
        sx={{ minWidth: 140, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 140px' } }}
        aria-label="Filter by order status"
      >
        {ORDER_STATUSES.map((s) => (
          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Payment"
        value={filters.paymentStatus}
        onChange={(e) => update({ paymentStatus: e.target.value })}
        size="small"
        sx={{ minWidth: 140, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 140px' } }}
        aria-label="Filter by payment status"
      >
        {PAYMENT_STATUSES.map((s) => (
          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
        ))}
      </TextField>

      <TextField
        select
        label="Method"
        value={filters.paymentMethod}
        onChange={(e) => update({ paymentMethod: e.target.value })}
        size="small"
        sx={{ minWidth: 140, flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 140px' } }}
        aria-label="Filter by payment method"
      >
        {PAYMENT_METHODS.map((m) => (
          <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
        ))}
      </TextField>

      {hasActiveFilters && (
        <Tooltip title="Reset filters">
          <IconButton onClick={onReset} size="small" aria-label="Reset filters" sx={{ color: 'text.secondary' }}>
            <RestartAltIcon />
          </IconButton>
        </Tooltip>
      )}

      <Box sx={{ flex: 1 }} />

      <Button
        variant="outlined"
        size="small"
        startIcon={<FileDownloadIcon />}
        onClick={(e) => setBulkAnchorEl(e.currentTarget)}
        aria-label="Bulk download documents"
        sx={{ whiteSpace: 'nowrap' }}
      >
        Bulk Download
      </Button>
      <Menu
        anchorEl={bulkAnchorEl}
        open={Boolean(bulkAnchorEl)}
        onClose={() => setBulkAnchorEl(null)}
      >
        <MenuItem onClick={() => { setBulkAnchorEl(null); onBulkDownload('customer'); }}>
          <ListItemIcon><ReceiptLongIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Customer Invoices (ZIP)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setBulkAnchorEl(null); onBulkDownload('seller'); }}>
          <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Seller Settlements (ZIP)</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setBulkAnchorEl(null); onBulkDownload('packing'); }}>
          <ListItemIcon><Inventory2Icon fontSize="small" /></ListItemIcon>
          <ListItemText>Packing Slips (ZIP)</ListItemText>
        </MenuItem>
      </Menu>

      <Button
        variant="outlined"
        size="small"
        disabled={exporting}
        startIcon={exporting ? undefined : <FileDownloadIcon />}
        onClick={handleExportClick}
        aria-label="Export orders"
        sx={{ whiteSpace: 'nowrap' }}
      >
        {exporting ? 'Exporting...' : 'Export'}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={() => handleExportFormat('csv')} disabled={exporting}>
          <ListItemIcon><DescriptionIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExportFormat('xlsx')} disabled={exporting}>
          <ListItemIcon><TableChartIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export as Excel</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default React.memo(FilterBar);
