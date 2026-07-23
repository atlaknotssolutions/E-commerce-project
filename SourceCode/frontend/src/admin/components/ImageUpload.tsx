import * as React from "react";
import { useState, useRef } from "react";
import {
  Box, Button, Typography, LinearProgress, IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { uploadToCloudinary } from "../../util/uploadToCloudinary";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

interface Props {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
}

function ImageUpload({ value, onChange, folder = "home" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Unsupported format. Use jpg, jpeg, png, or webp.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 5 MB.";
    }
    return null;
  };

  const handleFile = async (file: File) => {
    setError(null);
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    try {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
            reject(new Error(`Image too small. Minimum ${MIN_WIDTH}x${MIN_HEIGHT} px.`));
          } else {
            resolve();
          }
        };
        img.onerror = () => reject(new Error("Invalid image file."));
        img.src = objectUrl;
      });
    } catch (err) {
      URL.revokeObjectURL(objectUrl);
      setError(err instanceof Error ? err.message : "Invalid image file.");
      return;
    }
    URL.revokeObjectURL(objectUrl);

    setUploading(true);
    setProgress(0);
    try {
      const url = await uploadToCloudinary(file, folder, (p) => setProgress(p));
      onChange(url);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(axiosErr?.response?.data?.message || axiosErr?.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  return (
    <Box
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      sx={{
        border: "2px dashed",
        borderColor: error ? "error.main" : "grey.300",
        borderRadius: 2,
        p: 2,
        textAlign: "center",
        bgcolor: "grey.50",
        position: "relative",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          if (inputRef.current) inputRef.current.value = "";
        }}
      />

      {value ? (
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Box
            component="img"
            src={value}
            alt="Preview"
            sx={{ maxHeight: 160, maxWidth: "100%", borderRadius: 1, objectFit: "contain" }}
            onError={() => setError("Image failed to load. The URL may be broken.")}
          />
          {!uploading && (
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={{ position: "absolute", top: -8, right: -8, bgcolor: "background.paper" }}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      ) : (
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? `Uploading... ${progress}%` : "Choose Image"}
        </Button>
      )}

      {uploading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">{progress}%</Typography>
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ display: "block", mt: 1 }}>
          {error}
          <Button size="small" onClick={() => setError(null)} sx={{ ml: 1 }}>Retry</Button>
        </Typography>
      )}
    </Box>
  );
}

export default ImageUpload;
