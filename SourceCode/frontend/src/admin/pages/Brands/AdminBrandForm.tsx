import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    CircularProgress,
    Switch,
    FormControlLabel,
} from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    createBrand,
    updateBrand,
} from "../../../Redux Toolkit/Admin/adminBrandSlice";
import { Brand } from "../../../types/brandTypes";

interface AdminBrandFormProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    brand: Brand | null;
}

const AdminBrandForm: React.FC<AdminBrandFormProps> = ({
    open,
    onClose,
    onSuccess,
    brand,
}) => {
    const dispatch = useAppDispatch();
    const { loading } = useAppSelector((store) => store.adminBrand);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [website, setWebsite] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>("");
    const [bannerPreview, setBannerPreview] = useState<string>("");
    const [isActive, setIsActive] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);
    const [displayOrder, setDisplayOrder] = useState<number>(0);
    const [metaTitle, setMetaTitle] = useState("");
    const [metaDescription, setMetaDescription] = useState("");
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        if (brand) {
            setName(brand.name);
            setDescription(brand.description || "");
            setWebsite(brand.website || "");
            setLogoPreview(brand.logo || "");
            setBannerPreview(brand.bannerImage || "");
            setIsActive(brand.isActive);
            setIsFeatured(brand.isFeatured);
            setDisplayOrder(brand.displayOrder || 0);
            setMetaTitle(brand.metaTitle || "");
            setMetaDescription(brand.metaDescription || "");
        } else {
            resetForm();
        }
    }, [brand, open]);

    const resetForm = () => {
        setName("");
        setDescription("");
        setWebsite("");
        setLogoFile(null);
        setBannerFile(null);
        setLogoPreview("");
        setBannerPreview("");
        setIsActive(true);
        setIsFeatured(false);
        setDisplayOrder(0);
        setMetaTitle("");
        setMetaDescription("");
        setErrors({});
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerFile(file);
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    const validate = () => {
        const newErrors: { name?: string } = {};
        if (!name.trim()) newErrors.name = "Brand name is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const formData = new FormData();
        formData.append("name", name.trim());
        if (description) formData.append("description", description.trim());
        if (website) formData.append("website", website.trim());
        formData.append("isActive", String(isActive));
        formData.append("isFeatured", String(isFeatured));
        formData.append("displayOrder", String(displayOrder));
        if (metaTitle) formData.append("metaTitle", metaTitle.trim());
        if (metaDescription) formData.append("metaDescription", metaDescription.trim());
        if (logoFile) formData.append("logo", logoFile);
        if (bannerFile) formData.append("bannerImage", bannerFile);

        let result;
        if (brand) {
            result = await dispatch(updateBrand({ id: brand._id, formData }));
        } else {
            result = await dispatch(createBrand(formData));
        }

        if (
            (brand ? updateBrand : createBrand).fulfilled.match(result)
        ) {
            onSuccess();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{brand ? "Edit Brand" : "Create Brand"}</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <TextField
                        label="Brand Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                    />
                    <TextField
                        label="Website"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        fullWidth
                        placeholder="https://example.com"
                    />

                    <Box>
                        <Typography variant="body2" gutterBottom>
                            Logo Image
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                        />
                        {logoPreview && (
                            <Box mt={1}>
                                <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 4 }}
                                />
                            </Box>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="body2" gutterBottom>
                            Banner Image
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerChange}
                        />
                        {bannerPreview && (
                            <Box mt={1}>
                                <img
                                    src={bannerPreview}
                                    alt="Banner preview"
                                    style={{ width: 200, height: 60, objectFit: "cover", borderRadius: 4 }}
                                />
                            </Box>
                        )}
                    </Box>

                    <TextField
                        label="Display Order"
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(Number(e.target.value))}
                        fullWidth
                    />

                    <TextField
                        label="Meta Title"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Meta Description"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        multiline
                        rows={2}
                        fullWidth
                    />

                    <Box display="flex" gap={2}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                    color="success"
                                />
                            }
                            label="Active"
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={isFeatured}
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    color="warning"
                                />
                            }
                            label="Featured"
                        />
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : brand ? (
                        "Update"
                    ) : (
                        "Create"
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.memo(AdminBrandForm);
