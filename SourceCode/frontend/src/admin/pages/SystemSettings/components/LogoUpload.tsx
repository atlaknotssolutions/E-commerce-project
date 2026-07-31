import React, { useRef, useState, useCallback } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ImageIcon from '@mui/icons-material/Image';

interface LogoUploadProps {
  currentLogo: string;
  platformName: string;
  onUpload: (file: FormData) => Promise<void>;
  uploading: boolean;
}

const LogoUpload: React.FC<LogoUploadProps> = ({ currentLogo, platformName, onUpload, uploading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFile = useCallback(async (file: File) => {
    const validTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(file.type)) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
    setUploadStatus('uploading');
    const fd = new FormData();
    fd.append('logo', file);
    try {
      await onUpload(fd);
      setUploadStatus('success');
    } catch {
      setUploadStatus('error');
    }
  }, [onUpload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleClick = () => inputRef.current?.click();

  const handleRemove = () => {
    setPreview(null);
    setUploadStatus('idle');
  };

  const displayUrl = preview || currentLogo;

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: 'center',
        gap: 3,
        p: 4,
        border: '2px dashed',
        borderColor: dragOver ? '#4F46E5' : '#E5E7EB',
        borderRadius: 3,
        bgcolor: dragOver ? '#F5F3FF' : '#F9FAFB',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        '&:hover': { borderColor: '#4F46E5', bgcolor: '#F5F3FF' },
        minHeight: 160,
      }}
      onClick={handleClick}
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept=".png,.svg,.jpg,.jpeg,.webp"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      {displayUrl ? (
        <Box
          component="img"
          src={displayUrl}
          alt={platformName}
          sx={{
            width: 100, height: 100, objectFit: 'contain', borderRadius: 2,
            border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', p: 1,
            flexShrink: 0,
          }}
        />
      ) : (
        <Box
          sx={{
            width: 100, height: 100, borderRadius: 2,
            bgcolor: '#FFFFFF', border: '1px solid #E5E7EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: '#D1D5DB' }} />
        </Box>
      )}

      <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
        <Typography variant="body2" fontWeight={600} sx={{ color: '#374151', mb: 0.3 }}>
          {currentLogo ? 'Replace Logo' : 'Upload Logo'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, lineHeight: 1.5 }}>
          Drag & drop your logo here, or click to browse.
        </Typography>
        <Typography variant="caption" sx={{ color: '#9CA3AF', display: 'block', mb: 2, fontSize: 11 }}>
          Supports PNG, SVG, JPEG, WEBP — max 2MB
        </Typography>

        {uploadStatus === 'success' && (
          <Typography variant="caption" sx={{ color: '#059669', fontWeight: 600, display: 'block', mb: 1 }}>
            Logo uploaded successfully
          </Typography>
        )}
        {uploadStatus === 'error' && (
          <Typography variant="caption" sx={{ color: '#DC2626', fontWeight: 600, display: 'block', mb: 1 }}>
            Upload failed. Please try again.
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'center', sm: 'flex-start' } }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={uploading ? <CircularProgress size={14} /> : <CloudUploadIcon />}
            disabled={uploading}
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
            sx={{
              textTransform: 'none', borderRadius: 2, fontSize: 12, fontWeight: 600,
              borderColor: '#D1D5DB', color: '#374151',
              '&:hover': { borderColor: '#4F46E5', bgcolor: '#F5F3FF' },
            }}
          >
            {uploading ? 'Uploading...' : 'Choose File'}
          </Button>
          {currentLogo && (
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              sx={{ color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default LogoUpload;
