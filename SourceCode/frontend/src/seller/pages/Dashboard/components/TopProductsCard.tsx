import React, { useMemo } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Chip,
    Skeleton,
} from '@mui/material';
import { useAppSelector } from '../../../../Redux Toolkit/Store';

const TopProductsCard: React.FC = () => {
    const products = useAppSelector((state) => state.sellerDashboard.products);
    const loading = useAppSelector((state) => state.sellerDashboard.loading);
    const refreshing = useAppSelector((state) => state.sellerDashboard.refreshing);

    const isLoading = loading || refreshing;

    const topProducts = useMemo(() => {
        return products?.topSelling?.slice(0, 5) ?? [];
    }, [products]);

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'error' as const };
        if (stock < 10) return { label: 'Low Stock', color: 'warning' as const };
        return { label: 'In Stock', color: 'success' as const };
    };

    if (isLoading && !products) {
        return (
            <Card className="h-full">
                <CardHeader title={<Skeleton variant="text" width="40%" />} />
                <CardContent>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 mb-3">
                            <Skeleton variant="rounded" width={48} height={48} />
                            <div className="flex-1">
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="50%" />
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full">
            <CardHeader
                title={<span className="text-sm font-semibold text-gray-700">Top Products</span>}
            />
            <CardContent className="pt-0">
                {topProducts.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8" role="status">
                        No product data available
                    </div>
                ) : (
                    <List disablePadding aria-label="Top selling products">
                        {topProducts.map((product) => {
                            const stockStatus = getStockStatus(product.remainingStock);
                            return (
                                <ListItem key={product.id} disablePadding className="mb-2">
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            src={product.thumbnail}
                                            alt={product.title || 'Product image'}
                                            sx={{ width: 48, height: 48 }}
                                        >
                                            {product.title?.charAt(0) || '?'}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <span className="text-sm font-medium text-gray-800 line-clamp-1">
                                                {product.title || 'Untitled Product'}
                                            </span>
                                        }
                                        secondary={
                                            <span className="text-xs text-gray-500">
                                                {product.totalSold ?? 0} sold · ₹{(product.revenue ?? 0).toLocaleString('en-IN')}
                                            </span>
                                        }
                                    />
                                    <Chip
                                        label={stockStatus.label}
                                        color={stockStatus.color}
                                        size="small"
                                        variant="outlined"
                                        aria-label={`Stock status: ${stockStatus.label}`}
                                    />
                                </ListItem>
                            );
                        })}
                    </List>
                )}
            </CardContent>
        </Card>
    );
};

export default React.memo(TopProductsCard);
