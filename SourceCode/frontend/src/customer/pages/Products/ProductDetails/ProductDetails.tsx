import React, { useEffect, useState, useMemo } from 'react'
import StarIcon from '@mui/icons-material/Star';
import { teal } from '@mui/material/colors';
import { Box, Button, Chip, Divider, Grid, IconButton, LinearProgress, Modal, Rating, Typography } from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { Wallet } from '@mui/icons-material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SmilarProduct from '../SimilarProduct/SmilarProduct';
import ZoomableImage from './ZoomableImage';
import { useAppDispatch, useAppSelector } from '../../../../Redux Toolkit/Store';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchProductById, getAllProducts } from '../../../../Redux Toolkit/Customer/ProductSlice';
import { addItemToCart } from '../../../../Redux Toolkit/Customer/CartSlice';
import { addProductToWishlist } from '../../../../Redux Toolkit/Customer/WishlistSlice';
import { fetchCustomerCoupons } from '../../../../Redux Toolkit/Customer/CouponSlice';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import ProductReviewCard from '../../Review/ProductReviewCard';
import RatingCard from '../../Review/RatingCard';
import { fetchReviewsByProductId } from '../../../../Redux Toolkit/Customer/ReviewSlice';
import { computeReviewStatistics } from '../../../../util/reviewStatistics';
import VariantSelector from '../../../components/VariantSelector';
import { ProductImage } from '../../../../types/productTypes';

const style = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "auto",
    height: "100%",
    // bgcolor: 'background.paper',
    boxShadow: 24,
    outline: "none",
};


const ProductDetails = () =>
{
    const [open, setOpen] = React.useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const dispatch = useAppDispatch();
    const { products, review, wishlist, coupone } = useAppSelector(store => store)
    const isWishlisted = wishlist.wishlist?.products?.some((p: any) => p.id === productId) || false;
    const navigate = useNavigate()
    const { productId, categoryId } = useParams<{
        productId: string;
        categoryId: string;
    }>();
    const [selectedImage, setSelectedImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});

    const product = products.product;
    const variants = product?.variants || [];
    const supportedAttributes = product?.category?.supportedAttributes || [];
    const variantAttrs = supportedAttributes.filter(
        (a) => a.active !== false && a.variantAttribute
    );
    const hasDynamicSystem = variantAttrs.length > 0;

    // Find the variant matching the selected attributes
    const selectedVariant = useMemo(() => {
        if (!variants.length) return null;
        return variants.find((v) => {
            if (!v.isActive) return false;
            const attrs = v.attributes;

            if (hasDynamicSystem) {
                const dynamic = attrs.dynamic || [];
                return variantAttrs.every((attrDef) => {
                    const selectedVal = selectedAttributes[attrDef.code] || selectedAttributes[attrDef.name];
                    if (!selectedVal) return true;
                    const variantVal = dynamic.find((d) => d.name === attrDef.code)?.value;
                    return variantVal === selectedVal;
                });
            }

            return (
                (!selectedAttributes.color || attrs.color === selectedAttributes.color) &&
                (!selectedAttributes.size || attrs.size === selectedAttributes.size) &&
                (!selectedAttributes.storage || attrs.storage === selectedAttributes.storage) &&
                (!selectedAttributes.ram || attrs.ram === selectedAttributes.ram)
            );
        }) || null;
    }, [variants, selectedAttributes, hasDynamicSystem, variantAttrs]);

    // Compute effective pricing — use variant if selected, otherwise product-level
    const effectivePrice = selectedVariant
        ? { selling: selectedVariant.price, mrp: selectedVariant.mrpPrice, discount: selectedVariant.discountPercent }
        : { selling: product?.sellingPrice || 0, mrp: product?.mrpPrice || 0, discount: product?.discountPercent || 0 };

    // Compute effective images — use variant images if available and non-empty, otherwise product images
    const effectiveImages: ProductImage[] = useMemo(() => {
        if (selectedVariant?.images && selectedVariant.images.length > 0) {
            return selectedVariant.images;
        }
        return product?.images || [];
    }, [selectedVariant, product]);

    // Compute effective stock
    const effectiveStock = selectedVariant ? selectedVariant.quantity : (product?.quantity || 0);

    // Check if user has actively selected any attributes
    const hasSelectedAttributes = Object.values(selectedAttributes).some((v) => v && v.length > 0);

    // Derive a "size" string from variant attributes for the cart API
    const deriveCartSize = (): string => {
        if (!selectedVariant) return "FREE";
        const attrs = selectedVariant.attributes;
        if (hasDynamicSystem) {
            const dynamic = attrs.dynamic || [];
            if (dynamic.length > 0) {
                return dynamic.map((d) => d.value).filter(Boolean).join(" / ") || "DEFAULT";
            }
            return "DEFAULT";
        }
        return attrs.size || attrs.color || "FREE";
    };

    // Determine primary image — variant's primary or product's primary or first
    const primaryImageIndex = useMemo(() => {
        const primaryIdx = effectiveImages.findIndex((img) => img.isPrimary);
        return primaryIdx >= 0 ? primaryIdx : 0;
    }, [effectiveImages]);

    const reviewStats = useMemo(
        () => computeReviewStatistics(review.reviews),
        [review.reviews]
    );

    useEffect(() =>
    {
        if (productId)
        {
            dispatch(fetchProductById(productId))
            dispatch(fetchReviewsByProductId({ productId }))
        }
        dispatch(getAllProducts({ category: categoryId }));

        if (!coupone.customerCouponsLoaded) {
            dispatch(fetchCustomerCoupons());
        }
    }, [dispatch, productId, categoryId])

    const handleAttributeSelect = (key: string, value: string) =>
    {
        setSelectedAttributes((prev) => ({
            ...prev,
            [key]: prev[key] === value ? "" : value,
        }));
        setSelectedImage(primaryImageIndex);
    };

    const handleAddCart = () =>
    {
        dispatch(addItemToCart({
            jwt: localStorage.getItem('jwt'),
            request: {
                productId,
                variantId: selectedVariant?.id || undefined,
                size: deriveCartSize(),
                quantity
            }
        }))
    }




    return (
        <div className='px-5 lg:px-20 pt-10 '>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>

                <section className='flex flex-col lg:flex-row gap-5'>
                    <div className='w-full lg:w-[15%] flex flex-wrap lg:flex-col gap-3'>
                        {effectiveImages.map((item, index) => <img key={index} onClick={() => setSelectedImage(index)} className='lg:w-full w-[50px] cursor-pointer rounded-md' src={item.url || ""} alt="" />)}
                    </div>
                    <div className='w-full lg:w-[85%]'>
                        <img onClick={handleOpen} className='w-full rounded-md cursor-zoom-out' src={effectiveImages[selectedImage]?.url || ""} alt="" />
                    </div>

                    <Modal
                        open={open}
                        onClose={handleClose}
                        aria-labelledby="modal-modal-title"
                        aria-describedby="modal-modal-description"
                    >
                        <Box sx={style}>

                            <ZoomableImage src={effectiveImages[selectedImage]?.url || ""} alt="" />
                        </Box>
                    </Modal>

                </section>

                <section>
                    <h1 className='font-bold text-lg text-teal-950'>{products.product?.seller?.businessDetails.businessName}</h1>
                    <p className='text-gray-500 font-semibold'>{products.product?.title}</p>

                    <div className='flex justify-between items-center py-2 border w-[180px] px-3 mt-5'>
                        <div className='flex gap-1 items-center'>
                            <span>{reviewStats.averageRating || 0}</span>
                            <StarIcon sx={{ color: teal[600], fontSize: "17px" }} />
                        </div>
                        <Divider orientation="vertical" flexItem />
                        <span>
                            {reviewStats.totalReviews} Ratings
                        </span>
                    </div>

                    <div className='space-y-2'>
                        <div className='price flex items-center gap-3 mt-5 text-lg'>
                            <span className='font-semibold text-gray-800' > ₹{effectivePrice.selling}</span>
                            <span className='text thin-line-through text-gray-400 '>₹{effectivePrice.mrp}</span>
                            <span className='text-[#00927c] font-semibold'>{effectivePrice.discount}% off</span>
                        </div>
                        <p className='text-sm'>Inclusive of all taxes. Free Shipping above ₹1500.</p>
                    </div>

                    {coupone.availableCoupons && coupone.availableCoupons.length > 0 && (
                        <div className='mt-4 p-3 border border-dashed border-teal-400 bg-teal-50 rounded-lg'>
                            <div className='flex items-center gap-2 mb-2'>
                                <LocalOfferIcon sx={{ color: '#00927c', fontSize: 18 }} />
                                <span className='text-sm font-semibold text-teal-800'>Available Coupons</span>
                            </div>
                            <div className='space-y-2'>
                                {coupone.availableCoupons.slice(0, 3).map((coupon) => (
                                    <div key={coupon._id} className='flex items-center justify-between bg-white rounded-md px-3 py-2 border border-teal-100'>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-center gap-2'>
                                                <span className='font-mono font-bold text-teal-700 text-xs'>{coupon.code}</span>
                                                <span className='text-xs text-gray-500'>•</span>
                                                <span className='text-xs font-medium text-teal-700'>
                                                    {coupon.discountType === 'PERCENTAGE'
                                                        ? `${coupon.discountPercentage}% OFF`
                                                        : `₹${coupon.discountValue} OFF`}
                                                </span>
                                            </div>
                                            <p className='text-[11px] text-gray-400 truncate'>Min. ₹{coupon.minimumOrderValue}</p>
                                        </div>
                                    </div>
                                ))}
                                {coupone.availableCoupons.length > 3 && (
                                    <p className='text-[11px] text-teal-600 cursor-pointer hover:underline'
                                       onClick={() => navigate('/account/coupons')}>
                                        +{coupone.availableCoupons.length - 3} more coupons available
                                    </p>
                                )}
                            </div>
                            <p className='text-[11px] text-gray-400 mt-2'>Apply coupons at checkout for extra savings</p>
                        </div>
                    )}

                    <div className='mt-7 space-y-3'>
                        <VariantSelector
                            variants={variants}
                            selectedAttributes={selectedAttributes}
                            onAttributeSelect={handleAttributeSelect}
                            supportedAttributes={supportedAttributes}
                        />

                        {/* No matching variant warning */}
                        {hasSelectedAttributes && !selectedVariant && (
                            <Chip
                                label="This combination is not available. Please try another."
                                color="warning"
                                variant="outlined"
                                sx={{ mt: 1 }}
                            />
                        )}

                        {/* Selected variant info */}
                        {selectedVariant && (
                            <Box className="flex flex-wrap items-center gap-2 mt-1">
                                {selectedVariant.sku && (
                                    <Chip size="small" label={`SKU: ${selectedVariant.sku}`} variant="outlined" sx={{ fontSize: "0.75rem" }} />
                                )}
                                {effectiveStock > 0 && effectiveStock <= 10 ? (
                                    <Chip size="small" label={`Only ${effectiveStock} left`} color="warning" variant="outlined" />
                                ) : effectiveStock > 10 ? (
                                    <Chip size="small" label="In Stock" color="success" variant="outlined" />
                                ) : null}
                            </Box>
                        )}

                        <div className='flex items-center gap-4'>
                            <ShieldIcon sx={{ color: teal[400] }} />
                            <p>Authentic & Quality Assured</p>
                        </div>

                        <div className='flex items-center gap-4'>
                            <WorkspacePremiumIcon sx={{ color: teal[400] }} />
                            <p>100% money back guarantee</p>
                        </div>

                        <div className='flex items-center gap-4'>
                            <LocalShippingIcon sx={{ color: teal[400] }} />
                            <p>Free Shipping & Returns</p>
                        </div>



                        <div className='flex items-center gap-4'>
                            <Wallet sx={{ color: teal[400] }} />
                            <p>Pay on delivery might be available</p>
                        </div>



                    </div>

                    <div className='mt-7 space-y-2'>
                        <h1>QUANTITY:</h1>
                        <div className=' flex items-center gap-2  w-[140px] justify-between'>

                            <Button disabled={quantity === 1} onClick={() => setQuantity(quantity - 1)} variant='outlined'>
                                <RemoveIcon />
                            </Button>
                            <span className='px-3 text-lg font-semibold'>
                                {quantity}
                            </span>
                            <Button onClick={() => setQuantity(quantity + 1)} variant='outlined'>
                                <AddIcon />
                            </Button>

                        </div>
                    </div>

                    <div className="mt-12 flex items-center gap-5">
                        <Button
                            onClick={handleAddCart}
                            disabled={hasSelectedAttributes && !selectedVariant}
                            sx={{ py: "1rem" }}
                            variant='contained' fullWidth startIcon={<AddShoppingCartIcon />}>
                            Add To Bag
                        </Button>
                        <Button
                            sx={{ py: "1rem" }}
                            variant='outlined' fullWidth startIcon={<FavoriteBorderIcon />}
                            onClick={() => {
                                if (productId) {
                                    dispatch(addProductToWishlist({ productId }));
                                }
                            }}
                            color={isWishlisted ? "error" : "inherit"}
                        >
                            {isWishlisted ? "Wishlisted" : "Wishlist"}
                        </Button>

                    </div>
                    <div className='mt-5'>
                        <p >
                            {products.product?.description}
                        </p>
                    </div>
                    <div className="ratings w-full mt-10">
                        <h1 className="font-semibold text-lg pb-4">
                            Review & Ratings
                        </h1>

                        <RatingCard stats={reviewStats} />
                        <div className='mt-10'>
                            <div className="space-y-5">
                                {review.reviews.map((item, i) => (
                                    <div key={item.id} className='space-y-5'>
                                        <ProductReviewCard item={item} />
                                        <Divider />
                                    </div>
                                ))}
                                <Button onClick={() => navigate(`/reviews/${productId}`)}>View All {review.reviews.length} Reviews</Button>
                            </div>
                        </div>



                    </div>
                </section>



            </div>
            <section className='mt-20'>
                <h1 className='text-lg font-bold'>Similar Product</h1>

                <div className='pt-5'>
                    <SmilarProduct />
                </div>

            </section>
        </div>
    )
}

export default ProductDetails