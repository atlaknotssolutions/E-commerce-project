import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    Button,
    Card,
    CardMedia,
    Chip,
    CircularProgress,
    Divider,
    Grid,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import LaunchIcon from "@mui/icons-material/Launch";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { Brand } from "../../../types/brandTypes";
import { fetchBrandBySlug } from "../../../services/brandApi";

const PublicBrandDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [brand, setBrand] = useState<Brand | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBrand = async () => {
            if (!slug) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetchBrandBySlug(slug);
                setBrand(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Brand not found");
            } finally {
                setLoading(false);
            }
        };
        loadBrand();
    }, [slug]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !brand) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" py={10}>
                <StorefrontIcon sx={{ fontSize: 80, color: "#bdbdbd", mb: 2 }} />
                <Typography variant="h5" color="text.secondary" mb={2}>
                    {error || "Brand not found"}
                </Typography>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                    Go Back
                </Button>
            </Box>
        );
    }

    return (
        <Box>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            {/* Banner */}
            {brand.bannerImage && (
                <Box mb={4}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="250"
                            image={brand.bannerImage}
                            alt={`${brand.name} banner`}
                            sx={{ objectFit: "cover" }}
                        />
                    </Card>
                </Box>
            )}

            <Grid container spacing={4}>
                {/* Logo + Info */}
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 3, textAlign: "center" }}>
                        {brand.logo ? (
                            <Box
                                component="img"
                                src={brand.logo}
                                alt={brand.name}
                                sx={{
                                    width: "100%",
                                    maxWidth: 200,
                                    height: "auto",
                                    objectFit: "contain",
                                    mb: 2,
                                }}
                            />
                        ) : (
                            <StorefrontIcon sx={{ fontSize: 80, color: "#bdbdbd", mb: 2 }} />
                        )}

                        <Typography variant="h4" fontWeight={700} mb={1}>
                            {brand.name}
                        </Typography>

                        <Chip
                            size="small"
                            label={brand.isActive ? "Active" : "Inactive"}
                            color={brand.isActive ? "success" : "default"}
                            sx={{ mb: 2 }}
                        />

                        {brand.website && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<LaunchIcon />}
                                href={brand.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ mt: 1 }}
                            >
                                Visit Website
                            </Button>
                        )}
                    </Card>
                </Grid>

                {/* Details */}
                <Grid item xs={12} md={8}>
                    <Card sx={{ p: 3 }}>
                        <Typography variant="h5" fontWeight={600} mb={2}>
                            About {brand.name}
                        </Typography>

                        <Divider sx={{ mb: 2 }} />

                        {brand.description ? (
                            <Typography variant="body1" color="text.secondary" paragraph>
                                {brand.description}
                            </Typography>
                        ) : (
                            <Typography variant="body1" color="text.secondary" paragraph>
                                No description available for this brand.
                            </Typography>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="caption" color="text.secondary">
                                    Brand ID
                                </Typography>
                                <Typography variant="body2" fontWeight={500}>
                                    {brand._id}
                                </Typography>
                            </Grid>
                            {brand.createdAt && (
                                <Grid item xs={6}>
                                    <Typography variant="caption" color="text.secondary">
                                        Listed Since
                                    </Typography>
                                    <Typography variant="body2" fontWeight={500}>
                                        {new Date(brand.createdAt).toLocaleDateString()}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default PublicBrandDetail;
