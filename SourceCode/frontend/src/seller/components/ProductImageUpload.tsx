import * as React from "react";
import { useState, useRef, useCallback } from "react";
import {
  Box, Button, Typography, LinearProgress, IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { uploadToCloudinary } from "../../util/uploadToCloudinary";
import { ProductImage } from "../../types/productTypes";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 10;

interface Props {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
}

function ProductImageUpload({ images, onChange }: Props) {
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

  const handleFiles = useCallback(async (fileList: FileList) => {
    const files = Array.from(fileList);
    if (images.length + files.length > MAX_IMAGES) {
      setError(`Maximum ${MAX_IMAGES} images allowed. You can add ${MAX_IMAGES - images.length} more.`);
      return;
    }

    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);
    setUploading(true);
    setProgress(0);

    try {
      const results = await Promise.all(
        files.map((file) =>
          uploadToCloudinary(file, "products", () => {})
        )
      );

      const newImages: ProductImage[] = results.map((url, i) => ({
        url,
        isPrimary: images.length === 0 && i === 0,
      }));

      onChange([...images, ...newImages]);
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } }; message?: string };
      setError(axiosErr?.response?.data?.message || axiosErr?.message || "One or more uploads failed.");
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [images, onChange]);

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      isPrimary: i === 0 ? true : false,
    }));
    if (updated.length > 0) updated[0].isPrimary = true;
    onChange(updated);
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = Array.from(images);
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    onChange(updated);
  };

  return (
    <Box>
      <Box
        sx={{
          border: "2px dashed",
          borderColor: error ? "error.main" : "grey.300",
          borderRadius: 2,
          p: 2,
          textAlign: "center",
          bgcolor: "grey.50",
          mb: 1,
        }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple
          accept=".jpg,.jpeg,.png,.webp"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
          }}
        />
        <Button
          variant="outlined"
          component="span"
          startIcon={<CloudUploadIcon />}
          onClick={() => inputRef.current?.click()}
          disabled={uploading || images.length >= MAX_IMAGES}
        >
          {uploading ? `Uploading... ${progress}%` : `Choose Images (${images.length}/${MAX_IMAGES})`}
        </Button>
      </Box>

      {uploading && (
        <Box sx={{ mb: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
          <Typography variant="caption" color="text.secondary">{progress}%</Typography>
        </Box>
      )}

      {error && (
        <Typography variant="caption" color="error" sx={{ display: "block", mb: 1 }}>
          {error}
          <Button size="small" onClick={() => setError(null)} sx={{ ml: 1 }}>Dismiss</Button>
        </Typography>
      )}

      {images.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {images.map((img, index) => (
            <Box
              key={index}
              sx={{
                position: "relative",
                width: 100,
                height: 100,
                border: "1px solid",
                borderColor: "grey.200",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                component="img"
                src={img.url}
                alt={`Product image ${index + 1}`}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              {img.isPrimary && (
                <StarIcon
                  sx={{
                    position: "absolute",
                    top: 2,
                    left: 2,
                    fontSize: 18,
                    color: "warning.main",
                    bgcolor: "rgba(255,255,255,0.8)",
                    borderRadius: "50%",
                  }}
                />
              )}
              {!img.isPrimary && (
                <IconButton
                  size="small"
                  onClick={() => handleSetPrimary(index)}
                  title="Set as primary"
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    p: 0.3,
                    bgcolor: "rgba(255,255,255,0.8)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.95)" },
                  }}
                >
                  <StarBorderIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
              <IconButton
                size="small"
                onClick={() => handleRemove(index)}
                title="Remove image"
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  p: 0.3,
                  bgcolor: "rgba(255,255,255,0.8)",
                  "&:hover": { bgcolor: "error.main", color: "white" },
                }}
              >
                <DeleteIcon sx={{ fontSize: 16 }} />
              </IconButton>
              {index > 0 && (
                <IconButton
                  size="small"
                  onClick={() => handleMove(index, index - 1)}
                  title="Move left"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    p: 0.2,
                    bgcolor: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                  }}
                >
                  {"<"}
                </IconButton>
              )}
              {index < images.length - 1 && (
                <IconButton
                  size="small"
                  onClick={() => handleMove(index, index + 1)}
                  title="Move right"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    p: 0.2,
                    bgcolor: "rgba(255,255,255,0.8)",
                    fontSize: 12,
                  }}
                >
                  {">"}
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default ProductImageUpload;
