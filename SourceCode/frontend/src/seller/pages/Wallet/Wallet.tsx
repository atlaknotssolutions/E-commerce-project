import React, { useState } from "react";
import { Container, Typography, Box, Tabs, Tab, Paper } from "@mui/material";
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import OverviewTab from "./components/OverviewTab";
import TransactionsTab from "./components/TransactionsTab";
import PayoutsTab from "./components/PayoutsTab";
import SettlementReportsTab from "./components/SettlementReportsTab";
import BankAccountTab from "./components/BankAccountTab";

const tabs = [
  { label: "Overview", icon: <AccountBalanceWalletIcon /> },
  { label: "Transactions" },
  { label: "Payouts" },
  { label: "Settlement Reports" },
  { label: "Bank Account" },
];

const Wallet = () => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <Container maxWidth="lg">
      <Box mb={3}>
        <Typography variant="h4" fontWeight={700}>Wallet</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          Manage your earnings, transactions, payouts, and bank details.
        </Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, i) => (
            <Tab key={i} label={tab.label} {...(tab.icon ? { icon: tab.icon, iconPosition: "start" as const } : {})} />
          ))}
        </Tabs>
      </Paper>

      <Box>
        {activeTab === 0 && <OverviewTab />}
        {activeTab === 1 && <TransactionsTab />}
        {activeTab === 2 && <PayoutsTab />}
        {activeTab === 3 && <SettlementReportsTab />}
        {activeTab === 4 && <BankAccountTab />}
      </Box>
    </Container>
  );
};

export default Wallet;
