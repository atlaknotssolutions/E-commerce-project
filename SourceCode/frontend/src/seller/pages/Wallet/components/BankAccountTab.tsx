import React, { useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent, Button, TextField,
  Alert, Snackbar, Divider,
} from "@mui/material";
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../../Redux Toolkit/Store";
import { fetchSellerProfile, updateSeller } from "../../../../Redux Toolkit/Seller/sellerSlice";
const BankAccountTab = () => {
  const dispatch = useAppDispatch();
  const { sellers } = useAppSelector((store) => store);
  const [isEditing, setIsEditing] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState<{ message: string; severity: "success" | "error" } | null>(null);

  useEffect(() => {
    if (snackbar) {
      const timer = setTimeout(() => setSnackbar(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [snackbar]);

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;
    if (!sellers.profile) dispatch(fetchSellerProfile(jwt));
  }, [dispatch, sellers.profile]);

  const formik = useFormik({
    initialValues: {
      accountHolderName: sellers.profile?.bankDetails?.accountHolderName || "",
      accountNumber: sellers.profile?.bankDetails?.accountNumber || "",
      ifscCode: sellers.profile?.bankDetails?.ifscCode || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      accountHolderName: Yup.string().required("Account Holder Name is required"),
      accountNumber: Yup.string().required("Account Number is required"),
      ifscCode: Yup.string().required("IFSC Code is required"),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(updateSeller({ bankDetails: values }));
      if (updateSeller.fulfilled.match(result)) {
        setSnackbar({ message: "Bank details updated successfully", severity: "success" });
        setIsEditing(false);
      } else {
        setSnackbar({ message: "Failed to update bank details", severity: "error" });
      }
    },
  });

  const profile = sellers.profile;
  const bankDetails = profile?.bankDetails;

  return (
    <Box>
      <Snackbar open={!!snackbar} autoHideDuration={4000} onClose={() => setSnackbar(null)} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert severity={snackbar?.severity} onClose={() => setSnackbar(null)} variant="filled">
          {snackbar?.message}
        </Alert>
      </Snackbar>

      {/* Current Bank Account Info (Read-only view) */}
      {!isEditing && (
        <Card sx={{ mb: 3, maxWidth: 600 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box display="flex" alignItems="center" gap={1}>
                <AccountBalanceIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>Bank Account Details</Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {bankDetails ? (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Account Holder Name</Typography>
                  <Typography variant="body1" fontWeight={500}>{bankDetails.accountHolderName || "—"}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {bankDetails.accountNumber ? `XXXX${bankDetails.accountNumber.slice(-4)}` : "—"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">IFSC Code</Typography>
                  <Typography variant="body1" fontWeight={500}>{bankDetails.ifscCode || "—"}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="caption" color="success.main">Bank account linked for payouts</Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography color="text.secondary">No bank account details found.</Typography>
                <Button variant="contained" sx={{ mt: 2 }} onClick={() => setIsEditing(true)}>
                  Add Bank Account
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Form */}
      {isEditing && (
        <Paper sx={{ p: 3, maxWidth: 500 }}>
          <Typography variant="h6" fontWeight={600} mb={3}>
            {bankDetails ? "Update Bank Account" : "Add Bank Account"}
          </Typography>
          <form onSubmit={formik.handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                id="accountHolderName"
                name="accountHolderName"
                label="Account Holder Name"
                value={formik.values.accountHolderName}
                onChange={formik.handleChange}
                error={formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)}
                helperText={formik.touched.accountHolderName && formik.errors.accountHolderName}
              />
              <TextField
                fullWidth
                id="accountNumber"
                name="accountNumber"
                label="Account Number"
                value={formik.values.accountNumber}
                onChange={formik.handleChange}
                error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                helperText={formik.touched.accountNumber && formik.errors.accountNumber}
              />
              <TextField
                fullWidth
                id="ifscCode"
                name="ifscCode"
                label="IFSC Code"
                value={formik.values.ifscCode}
                onChange={formik.handleChange}
                error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
                helperText={formik.touched.ifscCode && formik.errors.ifscCode}
              />
              <Box display="flex" gap={2} mt={1}>
                <Button variant="outlined" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={sellers.loading}>
                  {sellers.loading ? "Saving..." : "Save"}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      )}
    </Box>
  );
};

export default BankAccountTab;
