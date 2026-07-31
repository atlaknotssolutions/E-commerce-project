import React from 'react';
import { useAppSelector } from '../../../Redux Toolkit/Store';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import {
  ShoppingBag,
  Favorite,
  LocalOffer,
  Payment,
  ArrowForward,
  Visibility,
  RateReview,
  LocationOn,
} from '@mui/icons-material';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { orders } = useAppSelector((store) => store);
  const { wishlist } = useAppSelector((store) => store);
  const { coupone } = useAppSelector((store) => store);
  const { user } = useAppSelector((store) => store);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const allOrders = orders?.orders || [];
  const wishlistProducts = wishlist?.wishlist?.products || [];
  const availableCoupons = coupone?.availableCoupons || [];

  const pendingPayments = allOrders.filter(
    (order: any) => order.paymentStatus === 'PENDING'
  ).length;

  const recentOrders = allOrders.slice(0, 3);
  const previewWishlist = wishlistProducts.slice(0, 4);
  const previewCoupons = availableCoupons.slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'SHIPPED':
        return 'info';
      case 'PROCESSING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      default:
        return 'default';
    }
  };

  const stats = [
    {
      label: 'Total Orders',
      value: allOrders.length,
      icon: <ShoppingBag sx={{ fontSize: 28 }} />,
      color: '#00927c',
      path: '/account/orders',
    },
    {
      label: 'Wishlist Items',
      value: wishlistProducts.length,
      icon: <Favorite sx={{ fontSize: 28 }} />,
      color: '#e91e63',
      path: '/wishlist',
    },
    {
      label: 'Available Coupons',
      value: availableCoupons.length,
      icon: <LocalOffer sx={{ fontSize: 28 }} />,
      color: '#ff9800',
      path: '/account/coupons',
    },
    {
      label: 'Pending Payments',
      value: pendingPayments,
      icon: <Payment sx={{ fontSize: 28 }} />,
      color: '#f44336',
      path: '/account/orders',
    },
  ];

  const quickActions = [
    {
      label: 'Track Order',
      icon: <Visibility />,
      path: '/account/orders',
      color: '#00927c',
    },
    {
      label: 'Browse Coupons',
      icon: <LocalOffer />,
      path: '/account/coupons',
      color: '#ff9800',
    },
    {
      label: 'My Reviews',
      icon: <RateReview />,
      path: '/account/reviews',
      color: '#2196f3',
    },
    {
      label: 'Addresses',
      icon: <LocationOn />,
      path: '/account/addresses',
      color: '#9c27b0',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Welcome Section */}
      <Card
        sx={{
          background: 'linear-gradient(135deg, #00927c 0%, #00796b 100%)',
          color: '#fff',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <div className="flex items-center gap-4">
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'rgba(255,255,255,0.2)',
                fontSize: 28,
              }}
            >
              {user.user?.fullName?.charAt(0) || 'U'}
            </Avatar>
            <div>
              <Typography variant="h4" fontWeight={700}>
                {getGreeting()}, {user.user?.fullName || 'User'}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Welcome back to your dashboard. Here's what's happening with your
                account.
              </Typography>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                transform: 'translateY(-2px)',
              },
            }}
            onClick={() => navigate(stat.path)}
          >
            <CardContent sx={{ p: 3 }}>
              <div className="flex items-center justify-between">
                <div>
                  <Typography
                    variant="body2"
                    sx={{ color: '#666', mb: 1, fontWeight: 500 }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {stat.value}
                  </Typography>
                </div>
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: 52,
                    height: 52,
                    backgroundColor: `${stat.color}15`,
                  }}
                >
                  <div style={{ color: stat.color }}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h6" fontWeight={700}>
                Recent Orders
              </Typography>
              <Button
                size="small"
                sx={{ color: '#00927c', textTransform: 'none' }}
                endIcon={<ArrowForward />}
                onClick={() => navigate('/account/orders')}
              >
                View All
              </Button>
            </div>
            <Divider sx={{ mb: 2 }} />
            {recentOrders.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#999', py: 3, textAlign: 'center' }}>
                No orders yet
              </Typography>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate('/account/orders')}
                  >
                    <Avatar
                      src={order.orderItems?.[0]?.product?.image || ''}
                      variant="rounded"
                      sx={{ width: 48, height: 48 }}
                    >
                      <ShoppingBag sx={{ color: '#00927c' }} />
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                      >
                        {order.orderItems?.[0]?.product?.title || `Order #${order.id}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#888' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                    <Chip
                      label={order.status || 'PENDING'}
                      color={getStatusColor(order.status || 'PENDING') as any}
                      size="small"
                      variant="outlined"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Wishlist Preview */}
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h6" fontWeight={700}>
                Wishlist
              </Typography>
              <Button
                size="small"
                sx={{ color: '#00927c', textTransform: 'none' }}
                endIcon={<ArrowForward />}
                onClick={() => navigate('/wishlist')}
              >
                View All
              </Button>
            </div>
            <Divider sx={{ mb: 2 }} />
            {previewWishlist.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#999', py: 3, textAlign: 'center' }}>
                Your wishlist is empty
              </Typography>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {previewWishlist.map((item: any, index: number) => (
                  <div
                    key={item.id || index}
                    className="rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate('/wishlist')}
                  >
                    <Avatar
                      src={item.image || ''}
                      variant="rounded"
                      sx={{ width: '100%', height: 100, borderRadius: 1 }}
                    >
                      <Favorite sx={{ color: '#e91e63' }} />
                    </Avatar>
                    <div className="p-2">
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {item.title || 'Product'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#00927c', fontWeight: 700 }}>
                        ₹{item.price || 0}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Coupons */}
        <Card
          sx={{
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="h6" fontWeight={700}>
                Available Coupons
              </Typography>
              <Button
                size="small"
                sx={{ color: '#00927c', textTransform: 'none' }}
                endIcon={<ArrowForward />}
                onClick={() => navigate('/account/coupons')}
              >
                View All
              </Button>
            </div>
            <Divider sx={{ mb: 2 }} />
            {previewCoupons.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#999', py: 3, textAlign: 'center' }}>
                No coupons available
              </Typography>
            ) : (
              <div className="space-y-3">
                {previewCoupons.map((coupon: any, index: number) => (
                  <div
                    key={coupon.id || index}
                    className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-[#00927c] bg-[#f0faf7] cursor-pointer hover:bg-[#e0f5ef] transition-colors"
                    onClick={() => navigate('/account/coupons')}
                  >
                    <div
                      className="flex items-center justify-center rounded"
                      style={{
                        width: 44,
                        height: 44,
                        backgroundColor: '#00927c',
                      }}
                    >
                      <LocalOffer sx={{ color: '#fff', fontSize: 20 }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{ color: '#00927c' }}
                      >
                        {coupon.code || 'CODE'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        {coupon.discount || coupon.discountPercentage || 0}% off
                      </Typography>
                    </div>
                    <Chip
                      label={coupon.expiryDate ? `Exp: ${new Date(coupon.expiryDate).toLocaleDateString()}` : 'Active'}
                      size="small"
                      sx={{
                        fontSize: 11,
                        color: '#00927c',
                        borderColor: '#00927c',
                      }}
                      variant="outlined"
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card
        sx={{
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Quick Actions
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                sx={{
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  border: `1px solid ${action.color}20`,
                  borderRadius: 2,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: `0 4px 16px ${action.color}25`,
                    transform: 'translateY(-2px)',
                    borderColor: action.color,
                  },
                }}
                onClick={() => navigate(action.path)}
              >
                <CardContent sx={{ py: 3 }}>
                  <div
                    className="flex items-center justify-center mx-auto rounded-full mb-2"
                    style={{
                      width: 56,
                      height: 56,
                      backgroundColor: `${action.color}15`,
                      color: action.color,
                    }}
                  >
                    {action.icon}
                  </div>
                  <Typography variant="body2" fontWeight={600}>
                    {action.label}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
