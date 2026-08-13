import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    TextField,
    Pagination,
    InputAdornment,
    CircularProgress,
    Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useAppDispatch, useAppSelector } from "../../../Redux Toolkit/Store";
import {
    fetchActiveBrands,
    fetchFeaturedBrands,
} from "../../../Redux Toolkit/Customer/publicBrandSlice";

const PublicBrandList = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { brands, featuredBrands, loading } = useAppSelector(
        (state) => state.publicBrand
    );

    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

    useEffect(() => {
        const params: any = {
            page: page - 1,
            limit: 12,
        };
        if (search.trim()) params.search = search.trim();
        dispatch(fetchActiveBrands(params));
    }, [dispatch, page, search]);

    useEffect(() => {
        if (featuredBrands.length === 0) {
            dispatch(fetchFeaturedBrands(8));
        }
    }, [dispatch, featuredBrands.length]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            setPage(1);
            const params: any = { page: 0, limit: 12 };
            if (search.trim()) params.search = search.trim();
            dispatch(fetchActiveBrands(params));
        }
    };

    const handlePageChange = (_: any, value: number) => {
        setPage(value);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleBrandClick = (brand: any) => {
        navigate(`/brands/${brand.slug || brand._id}`);
    };

    return (
        <Box sx={{ minHeight: "60vh" }}>
            {/* Featured Brands */}
            {!search && featuredBrands.length > 0 && (
                <Box mb={5}>
                    <Typography variant="h4" fontWeight={700} mb={3} textAlign="center">
                        Featured Brands
                    </Typography>
                    <Grid container spacing={3} justifyContent="center">
                        {featuredBrands.map((brand) => (
                            <Grid item key={brand._id} xs={6} sm={4} md={3}>
                                <Card
                                    sx={{
                                        cursor: "pointer",
                                        transition: "transform 0.2s, boxShadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 6,
                                        },
                                    }}
                                    onClick={() => handleBrandClick(brand)}
                                >
                                    {brand.logo ? (
                                        <CardMedia
                                            component="img"
                                            height="140"
                                            image={brand.logo}
                                            alt={brand.name}
                                            sx={{ objectFit: "contain", p: 2, bgcolor: "#f9f9f9" }}
                                        />
                                    ) : (
                                        <Box
                                            height="140"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            bgcolor="#f9f9f9"
                                        >
                                            <StorefrontIcon sx={{ fontSize: 60, color: "#bdbdbd" }} />
                                        </Box>
                                    )}
                                    <CardContent sx={{ textAlign: "center" }}>
                                        <Typography variant="subtitle1" fontWeight={600} noWrap>
                                            {brand.name}
                                        </Typography>
                                        {brand.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                            >
                                                {brand.description}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {/* All Brands */}
            <Typography variant="h4" fontWeight={700} mb={2} textAlign="center">
                {search ? `Results for "${search}"` : "All Brands"}
            </Typography>

            {/* Search Bar */}
            <Box display="flex" justifyContent="center" mb={4}>
                <TextField
                    size="small"
                    placeholder="Search brands..."
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    sx={{ width: "100%", maxWidth: 400 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : brands.length > 0 ? (
                <>
                    <Grid container spacing={3}>
                        {brands.map((brand) => (
                            <Grid item key={brand._id} xs={6} sm={4} md={3} lg={2}>
                                <Card
                                    sx={{
                                        cursor: "pointer",
                                        transition: "transform 0.2s, boxShadow 0.2s",
                                        "&:hover": {
                                            transform: "translateY(-4px)",
                                            boxShadow: 6,
                                        },
                                        height: "100%",
                                    }}
                                    onClick={() => handleBrandClick(brand)}
                                >
                                    {brand.logo ? (
                                        <CardMedia
                                            component="img"
                                            height="120"
                                            image={brand.logo}
                                            alt={brand.name}
                                            sx={{ objectFit: "contain", p: 2, bgcolor: "#f9f9f9" }}
                                        />
                                    ) : (
                                        <Box
                                            height="120"
                                            display="flex"
                                            alignItems="center"
                                            justifyContent="center"
                                            bgcolor="#f9f9f9"
                                        >
                                            <StorefrontIcon sx={{ fontSize: 50, color: "#bdbdbd" }} />
                                        </Box>
                                    )}
                                    <CardContent sx={{ textAlign: "center", pt: 1 }}>
                                        <Typography variant="body1" fontWeight={600} noWrap>
                                            {brand.name}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    <Box display="flex" justifyContent="center" mt={5}>
                        <Pagination
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            count={Math.ceil(brands.length / 12) || 1}
                            shape="rounded"
                        />
                    </Box>
                </>
            ) : (
                <Box display="flex" flexDirection="column" alignItems="center" py={8}>
                    <StorefrontIcon sx={{ fontSize: 80, color: "#bdbdbd", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No brands found
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default PublicBrandList;
