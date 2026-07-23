import {
  Alert,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  Snackbar,
} from "@mui/material";
import React, { useRef, useState } from "react";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { updateProfilePhoto } from "../../../Redux Toolkit/Customer/UserSlice";
import ProfileFildCard from "../../../seller/pages/Account/ProfileFildCard";

const UserDetails = () => {
  const { user } = useAppSelector((store) => store);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setSnackbarMsg("Please select a valid image file.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSnackbarMsg("Image must be less than 5MB.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setUploading(true);
    try {
      await dispatch(updateProfilePhoto({ jwt, file })).unwrap();
      setSnackbarMsg("Profile photo updated successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err: any) {
      setSnackbarMsg(err || "Failed to update profile photo.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex justify-center py-10">
      <div className="w-full lg:w-[70%]">
        <div className="flex items-center pb-3 justify-between">
          <h1 className="text-2xl font-bold text-gray-600">
            Personal Details
          </h1>
        </div>
        <div className="space-y-5">
          <Box sx={{ position: "relative", width: "fit-content" }}>
            <Avatar
              sx={{ width: "10rem", height: "10rem" }}
              src={user.user?.profileImage || undefined}
            >
              {!user.user?.profileImage &&
                user.user?.fullName?.charAt(0).toUpperCase()}
            </Avatar>

            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              sx={{
                position: "absolute",
                bottom: 5,
                right: 5,
                bgcolor: "white",
                boxShadow: 2,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              <PhotoCameraIcon />
            </IconButton>

            <input
              hidden
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={handlePhotoUpload}
            />
          </Box>

          {uploading && (
            <p className="text-sm text-gray-500">Uploading photo...</p>
          )}

          <div>
            <ProfileFildCard keys={"Name"} value={user.user?.fullName} />
            <Divider />
            <ProfileFildCard keys={"Email"} value={user.user?.email} />
            <Divider />
            <ProfileFildCard keys={"Mobile"} value={user.user?.mobile} />
          </div>
        </div>
      </div>

      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UserDetails;
