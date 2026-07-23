import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Box,
} from '@mui/material';
import {
    ProductReportItem,
    SellerReportItem,
    LowStockProduct,
    CouponUsageItem,
    ReturnStatusBreakdown,
    TopReturnedProduct,
} from '../../../../types/adminReportsTypes';

interface ReportTableProps {
    title: string;
    children: React.ReactNode;
}

const ReportTableWrapper: React.FC<ReportTableProps> = ({ title, children }) => (
    <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
            {title}
        </Typography>
        {children}
    </Paper>
);

export const BestSellingProductsTable: React.FC<{ data: ProductReportItem[] }> = ({ data }) => (
    <ReportTableWrapper title="Best Selling Products">
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Qty Sold</strong></TableCell>
                        <TableCell align="right"><strong>Revenue</strong></TableCell>
                        <TableCell align="right"><strong>Orders</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{row.title}</TableCell>
                            <TableCell align="right">{row.totalQuantity}</TableCell>
                            <TableCell align="right">₹{row.totalRevenue.toLocaleString('en-IN')}</TableCell>
                            <TableCell align="right">{row.orderCount}</TableCell>
                            <TableCell align="right">₹{row.sellingPrice?.toLocaleString('en-IN') || '-'}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {data.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
            </Box>
        )}
    </ReportTableWrapper>
);

export const TopSellersTable: React.FC<{ data: SellerReportItem[] }> = ({ data }) => (
    <ReportTableWrapper title="Top Sellers">
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Seller</strong></TableCell>
                        <TableCell><strong>Business</strong></TableCell>
                        <TableCell align="right"><strong>Revenue</strong></TableCell>
                        <TableCell align="right"><strong>Orders</strong></TableCell>
                        <TableCell align="right"><strong>Avg Order</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{row.sellerName}</TableCell>
                            <TableCell>{row.businessName || '-'}</TableCell>
                            <TableCell align="right">₹{row.totalRevenue.toLocaleString('en-IN')}</TableCell>
                            <TableCell align="right">{row.totalOrders}</TableCell>
                            <TableCell align="right">₹{row.averageOrderValue.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {data.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No data available</Typography>
            </Box>
        )}
    </ReportTableWrapper>
);

export const LowStockTable: React.FC<{ data: LowStockProduct[] }> = ({ data }) => (
    <ReportTableWrapper title="Low Stock Products">
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Stock</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{row.title}</TableCell>
                            <TableCell align="right">
                                <Typography
                                    color={row.quantity <= 2 ? 'error' : 'warning.main'}
                                    fontWeight={600}
                                >
                                    {row.quantity}
                                </Typography>
                            </TableCell>
                            <TableCell align="right">₹{row.sellingPrice.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {data.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No low stock products</Typography>
            </Box>
        )}
    </ReportTableWrapper>
);

export const CouponTable: React.FC<{ data: CouponUsageItem[] }> = ({ data }) => (
    <ReportTableWrapper title="Coupon Usage">
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Code</strong></TableCell>
                        <TableCell><strong>Type</strong></TableCell>
                        <TableCell align="right"><strong>Discount</strong></TableCell>
                        <TableCell align="right"><strong>Usage</strong></TableCell>
                        <TableCell align="right"><strong>Limit</strong></TableCell>
                        <TableCell><strong>Active</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell><strong>{row.code}</strong></TableCell>
                            <TableCell>{row.discountType}</TableCell>
                            <TableCell align="right">
                                {row.discountType === 'PERCENTAGE' ? `${row.discountPercentage}%` : `₹${row.discountValue}`}
                            </TableCell>
                            <TableCell align="right">{row.usageCount}</TableCell>
                            <TableCell align="right">{row.usageLimit || 'Unlimited'}</TableCell>
                            <TableCell>
                                <Typography color={row.isActive ? 'success.main' : 'error.main'}>
                                    {row.isActive ? 'Yes' : 'No'}
                                </Typography>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {data.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No coupons found</Typography>
            </Box>
        )}
    </ReportTableWrapper>
);

export const ReturnStatusTable: React.FC<{ data: ReturnStatusBreakdown[] }> = ({ data }) => (
    <ReportTableWrapper title="Returns by Status">
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Status</strong></TableCell>
                        <TableCell align="right"><strong>Count</strong></TableCell>
                        <TableCell align="right"><strong>Refund Amount</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{row._id}</TableCell>
                            <TableCell align="right">{row.count}</TableCell>
                            <TableCell align="right">₹{row.totalRefundAmount.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    </ReportTableWrapper>
);

export const TopReturnedProductsTable: React.FC<{ data: TopReturnedProduct[] }> = ({ data }) => (
    <ReportTableWrapper title="Top Returned Products">
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell><strong>Product</strong></TableCell>
                        <TableCell align="right"><strong>Returns</strong></TableCell>
                        <TableCell align="right"><strong>Refund Amount</strong></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row._id}>
                            <TableCell>{row.title}</TableCell>
                            <TableCell align="right">{row.returnCount}</TableCell>
                            <TableCell align="right">₹{row.totalRefundAmount.toLocaleString('en-IN')}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        {data.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No returns data</Typography>
            </Box>
        )}
    </ReportTableWrapper>
);
