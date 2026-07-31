import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import { fetchAdminProfile, updateAdminProfilePhoto } from "../../../Redux Toolkit/Admin/AdminSlice";
import { notification } from "../../../services/notificationService";

const AdminAccount = () => {
  const dispatch = useAppDispatch();
  const { admin } = useAppSelector((store) => store);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (admin.profileLoaded) return;
    const jwt = localStorage.getItem("jwt");
    if (jwt) {
      dispatch(fetchAdminProfile(jwt));
    }
  }, [dispatch, admin.profileLoaded]);

  useEffect(() => {
    if (admin.error) {
      notification.error(admin.error || "Failed to load profile");
    }
  }, [admin.error]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notification.error("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      notification.error("File size should be less than 5MB.");
      return;
    }

    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setUploading(true);
    try {
      await dispatch(updateAdminProfilePhoto({ jwt, file })).unwrap();
    } catch {
      notification.error("Failed to update profile photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (admin.loading && !admin.profile) {
    return (
      <Box display="flex" justifyContent="center" py={10}>
        <div className="text-gray-500">Loading profile...</div>
      </Box>
    );
  }

  const profile = admin.profile;

  return (
    <div className="lg:p-20 space-y-20">
      {/* Personal Information */}
      <div className="w-full lg:w-[70%]">
        <div className="flex items-center pb-3 justify-between">
          <h1 className="text-2xl font-bold text-gray-600">
            Personal Information
          </h1>
        </div>
        <div className="space-y-5">
          <Box sx={{ position: "relative", width: "fit-content" }}>
            <Avatar
              sx={{ width: "10rem", height: "10rem" }}
              src={profile?.profileImage || undefined}
            >
              {!profile?.profileImage &&
                profile?.fullName?.charAt(0).toUpperCase()}
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
            <FieldRow label="Full Name" value={profile?.fullName} />
            <Divider />
            <FieldRow label="Email" value={profile?.email} />
            <Divider />
            <FieldRow label="Mobile" value={profile?.mobile || "Not provided"} />
            <Divider />
            <FieldRow
              label="Role"
              value={
                <Chip
                  size="small"
                  label={profile?.role?.replace("ROLE_", "") || "ADMIN"}
                  color="primary"
                />
              }
            />
            <Divider />
            <FieldRow label="Account Status" value="Active" />
            <Divider />
            <FieldRow label="Joined" value={formatDate(profile?.createdAt)} />
            <Divider />
            <FieldRow label="Last Updated" value={formatDateTime(profile?.updatedAt)} />
          </div>
        </div>
      </div>

      {/* Security Information */}
      <div className="w-full lg:w-[70%]">
        <div className="flex items-center pb-3 justify-between">
          <h1 className="text-2xl font-bold text-gray-600">
            Security Information
          </h1>
        </div>
        <div className="space-y-5">
          <div>
            <FieldRow label="Role" value={profile?.role || "ROLE_ADMIN"} />
            <Divider />
            <FieldRow label="Account Created" value={formatDate(profile?.createdAt)} />
            <Divider />
            <FieldRow label="Last Updated" value={formatDateTime(profile?.updatedAt)} />
          </div>
        </div>
      </div>

      {/* Future Placeholder: Change Password */}
      {/* <div className="w-full lg:w-[70%]">
        <h1 className="text-2xl font-bold text-gray-600 pb-3">
          Security Settings
        </h1>
        <div className="space-y-4">
          <PlaceholderCard
            icon={<LockOutlinedIcon />}
            title="Change Password"
            description="Update your account password for enhanced security."
          />
          <PlaceholderCard
            icon={<VerifiedUserIcon />}
            title="Two Factor Authentication"
            description="Add an extra layer of security to your account."
          />
          <PlaceholderCard
            icon={<DevicesIcon />}
            title="Login Sessions"
            description="View and manage your active login sessions."
          />
        </div>
      </div> */}

    </div>
  );
};

const FieldRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="p-5 flex items-center bg-slate-50">
    <p className="w-20 lg:w-36 pr-5">{label}</p>
    <Divider orientation="vertical" flexItem />
    <div className="pl-4 lg:pl-10 font-semibold lg:text-lg">{value}</div>
  </div>
);

export default AdminAccount;
