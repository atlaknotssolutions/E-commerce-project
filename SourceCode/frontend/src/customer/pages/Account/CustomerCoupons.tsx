import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../../Redux Toolkit/Store";
import { fetchCustomerCoupons } from "../../../Redux Toolkit/Customer/CouponSlice";
import { Coupon } from "../../../types/couponTypes";
import {
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Chip,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  LocalOffer,
  AccessTime,
  CheckCircle,
  Cancel,
  ContentCopy,
} from "@mui/icons-material";

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const CustomerCoupons = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { coupone } = useAppSelector((store) => store);
  const [tabValue, setTabValue] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (!coupone.customerCouponsLoaded) {
      dispatch(fetchCustomerCoupons());
    }
  }, [dispatch, coupone.customerCouponsLoaded]);

  const availableCoupons = [...(coupone.availableCoupons || [])].sort(
    (a, b) =>
      new Date(a.validityEndDate).getTime() -
      new Date(b.validityEndDate).getTime()
  );

  const expiringSoon = availableCoupons.filter((c) => {
    const daysLeft =
      (new Date(c.validityEndDate).getTime() - Date.now()) /
      (1000 * 60 * 60 * 24);
    return daysLeft <= 7 && daysLeft > 0;
  });

  const usedCoupons = coupone.usedCoupons || [];
  const expiredCoupons = coupone.expiredCoupons || [];

  const tabData = [
    {
      label: "Available Coupons",
      icon: <LocalOffer sx={{ fontSize: 18 }} />,
      coupons: availableCoupons,
    },
    {
      label: "Expiring Soon",
      icon: <AccessTime sx={{ fontSize: 18 }} />,
      coupons: expiringSoon,
    },
    {
      label: "Used Coupons",
      icon: <CheckCircle sx={{ fontSize: 18 }} />,
      coupons: usedCoupons,
    },
    {
      label: "Expired Coupons",
      icon: <Cancel sx={{ fontSize: 18 }} />,
      coupons: expiredCoupons,
    },
  ];

  const currentCoupons = tabData[tabValue]?.coupons || [];

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusConfig = (coupon: Coupon, tab: number) => {
    if (tab === 0) return { label: "Available", color: "success" as const, bgColor: "bg-green-100 text-green-800" };
    if (tab === 1) return { label: "Expiring Soon", color: "warning" as const, bgColor: "bg-amber-100 text-amber-800" };
    if (tab === 2) return { label: "Used", color: "default" as const, bgColor: "bg-gray-100 text-gray-600" };
    return { label: "Expired", color: "error" as const, bgColor: "bg-red-100 text-red-800" };
  };

  const getBorderColor = (tab: number) => {
    if (tab === 0 || tab === 1) return "border-l-teal-600";
    if (tab === 2) return "border-l-gray-400";
    return "border-l-red-500";
  };

  const getDiscountText = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `Get extra ${coupon.discountPercentage}% OFF`;
    }
    return `Get \u20B9${coupon.discountValue} OFF`;
  };

  if (coupone.loading && !coupone.customerCouponsLoaded) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <CircularProgress sx={{ color: "#00927c" }} />
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <LocalOffer sx={{ color: "#00927c", fontSize: 28 }} />
          <Typography variant="h4" className="font-bold" sx={{ color: "#1a1a1a" }}>
            My Coupons
          </Typography>
        </div>
        <Typography variant="body2" className="text-gray-500">
          View and manage your coupons. Apply available coupons at checkout for extra savings.
        </Typography>
      </div>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              minHeight: 48,
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#00927c",
            },
            "& .MuiTab-root.Mui-selected": {
              color: "#00927c",
            },
          }}
        >
          {tabData.map((tab, i) => (
            <Tab
              key={i}
              icon={tab.icon}
              label={`${tab.label} (${tab.coupons.length})`}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Coupon Grid */}
      {currentCoupons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <LocalOffer sx={{ fontSize: 48, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6" className="text-gray-400">
            No coupons found
          </Typography>
          <Typography variant="body2" className="text-gray-400 mt-1">
            {tabValue === 0
              ? "You don't have any available coupons right now."
              : tabValue === 1
              ? "No coupons expiring within 7 days."
              : tabValue === 2
              ? "You haven't used any coupons yet."
              : "No expired coupons."}
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentCoupons.map((coupon) => {
            const status = getStatusConfig(coupon, tabValue);
            return (
              <Card
                key={coupon._id}
                className={`border-l-4 ${getBorderColor(tabValue)} shadow-sm hover:shadow-md transition-shadow rounded-lg`}
                sx={{ borderTop: "1px solid #e5e7eb", borderRight: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb" }}
              >
                <CardContent className="p-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <Chip
                      label={status.label}
                      size="small"
                      className={`${status.bgColor} text-xs font-semibold`}
                      sx={{ height: 22 }}
                    />
                    {(tabValue === 0 || tabValue === 1) && (
                      <AccessTime sx={{ fontSize: 16, color: "#00927c" }} />
                    )}
                    {tabValue === 2 && (
                      <CheckCircle sx={{ fontSize: 16, color: "#9e9e9e" }} />
                    )}
                    {tabValue === 3 && (
                      <Cancel sx={{ fontSize: 16, color: "#ef4444" }} />
                    )}
                  </div>

                  {/* Coupon Code */}
                  <div
                    onClick={() => handleCopyCode(coupon.code)}
                    className="flex items-center justify-between border-2 border-dashed border-teal-500 bg-teal-50 rounded-md px-3 py-2 mb-3 cursor-pointer hover:bg-teal-100 transition-colors group"
                  >
                    <Typography
                      variant="h6"
                      className="font-mono font-bold tracking-wider"
                      sx={{ color: "#00927c" }}
                    >
                      {coupon.code}
                    </Typography>
                    <Box className="flex items-center gap-1 text-gray-400 group-hover:text-teal-600 transition-colors">
                      {copiedCode === coupon.code ? (
                        <>
                          <CheckCircle sx={{ fontSize: 16 }} />
                          <Typography variant="caption" className="text-teal-600">
                            Copied!
                          </Typography>
                        </>
                      ) : (
                        <>
                          <ContentCopy sx={{ fontSize: 16 }} />
                          <Typography variant="caption">Copy</Typography>
                        </>
                      )}
                    </Box>
                  </div>

                  {/* Discount */}
                  <Typography
                    variant="subtitle1"
                    className="font-bold mb-1"
                    sx={{ color: "#00927c" }}
                  >
                    {getDiscountText(coupon)}
                  </Typography>

                  {/* Description */}
                  {coupon.description && (
                    <Typography variant="body2" className="text-gray-500 mb-2 line-clamp-2">
                      {coupon.description}
                    </Typography>
                  )}

                  {/* Details */}
                  <div className="space-y-1 mb-3">
                    <Typography variant="caption" className="text-gray-600 block">
                      Min. order {"\u20B9"}{coupon.minimumOrderValue}
                    </Typography>
                    {coupon.maximumDiscount > 0 && (
                      <Typography variant="caption" className="text-gray-600 block">
                        Max. discount {"\u20B9"}{coupon.maximumDiscount}
                      </Typography>
                    )}
                    <Typography variant="caption" className="text-gray-600 block">
                      Valid until {formatDate(coupon.validityEndDate)}
                    </Typography>
                  </div>

                  {/* Apply Button */}
                  {(tabValue === 0 || tabValue === 1) && (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => navigate("/cart")}
                      sx={{
                        backgroundColor: "#00927c",
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: "8px",
                        py: 1,
                        "&:hover": {
                          backgroundColor: "#007a68",
                        },
                      }}
                    >
                      Apply at Checkout
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerCoupons;
