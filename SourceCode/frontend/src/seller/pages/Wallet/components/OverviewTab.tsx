import React, { useEffect } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { fetchPayoutBalance } from "../../../../Redux Toolkit/Seller/payoutSlice";
import { fetchSellerReport } from "../../../../Redux Toolkit/Seller/sellerSlice";
import { fetchSellerLedgerStats, fetchSellerSettlementStats } from "../../../../Redux Toolkit/Seller/walletSlice";

const OverviewTab = () => {
  const dispatch = useAppDispatch();
  const { sellers, payouts, wallet } = useAppSelector((store) => store);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    if (!sellers.reportLoaded) dispatch(fetchSellerReport(jwt));
    if (!payouts.balanceLoaded) dispatch(fetchPayoutBalance(jwt));
    if (!wallet.ledgerStatsLoaded) dispatch(fetchSellerLedgerStats());
    if (!wallet.settlementStatsLoaded) dispatch(fetchSellerSettlementStats());
  }, [dispatch, sellers.reportLoaded, payouts.balanceLoaded, wallet.ledgerStatsLoaded, wallet.settlementStatsLoaded]);

  const report = sellers.report;
  const balance = payouts.balance;

  const overviewCards = [
    {
      label: "Available Balance",
      value: `₹${balance?.availableBalance?.toLocaleString() ?? 0}`,
      icon: <AccountBalanceIcon sx={{ fontSize: 40 }} />,
      color: "#1976d2",
      bg: "#e3f2fd",
    },
    {
      label: "Pending Settlement",
      value: `₹${balance?.lockedPayouts?.toLocaleString() ?? 0}`,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: "#f57c00",
      bg: "#fff3e0",
    },
    {
      label: "Lifetime Earnings",
      value: `₹${report?.totalEarnings?.toLocaleString() ?? 0}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#2e7d32",
      bg: "#e8f5e9",
    },
    {
      label: "Net Earnings",
      value: `₹${report?.netEarnings?.toLocaleString() ?? 0}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#1565c0",
      bg: "#e3f2fd",
    },
    {
      label: "Withdrawn Amount",
      value: `₹${(balance ? (balance.netEarnings - balance.availableBalance - balance.lockedPayouts - balance.activeCommissions) : 0).toLocaleString()}`,
      icon: <MoneyOffIcon sx={{ fontSize: 40 }} />,
      color: "#6a1b9a",
      bg: "#f3e5f5",
    },
    {
      label: "Active Commissions",
      value: `₹${balance?.activeCommissions?.toLocaleString() ?? 0}`,
      icon: <ReceiptIcon sx={{ fontSize: 40 }} />,
      color: "#d32f2f",
      bg: "#ffebee",
    },
    {
      label: "Total Sales",
      value: `₹${report?.totalSales?.toLocaleString() ?? 0}`,
      icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
      color: "#00796b",
      bg: "#e0f2f1",
    },
    {
      label: "Total Refunds",
      value: `₹${report?.totalRefunds?.toLocaleString() ?? 0}`,
      icon: <MoneyOffIcon sx={{ fontSize: 40 }} />,
      color: "#c62828",
      bg: "#ffebee",
    },
  ];

  return (
    <Box>
      <Grid container spacing={3}>
        {overviewCards.map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ height: "100%", position: "relative", overflow: "visible" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      {card.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} mt={0.5}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      backgroundColor: card.bg,
                      borderRadius: 2,
                      p: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {React.cloneElement(card.icon, { sx: { color: card.color, fontSize: 32 } })}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OverviewTab;
