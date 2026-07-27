import React, { useState, useEffect, MouseEvent } from 'react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { teal } from '@mui/material/colors';
import { Button, IconButton } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { Product } from '../../../types/productTypes';
import { useAppDispatch } from '../../../Redux Toolkit/Store';
import CloseIcon from '@mui/icons-material/Close';
import CancelIcon from '@mui/icons-material/Cancel';
import { addProductToWishlist } from '../../../Redux Toolkit/Customer/WishlistSlice';

interface ProductCardProps {
    item: Product;
}

const WishlistProductCard: React.FC<ProductCardProps> = ({ item }) => {
    const [currentImage, setCurrentImage] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleIconClick = (e:MouseEvent) => {
        setIsFavorite((prev) => !prev);
        if(item.id)
        dispatch(addProductToWishlist({productId:item.id}))
    };



    return (
        <div className='w-60 relative group cursor-pointer' onClick={() => {
            if (item.id && item.category?.categoryId) {
                navigate(`/product-details/${item.category.categoryId}/${item.title}/${item.id}`);
            }
        }}>
            <div className="w-full overflow-hidden">
                <img
                    className="object-top w-full h-[240px] object-cover group-hover:scale-105 transition-transform duration-300"
                    src={item.images[0]?.url || ""}
                    alt={`product-${item.title}`}
                />
            </div>
            <div className='pt-3 space-y-1 rounded-md'>
                <p className='text-sm text-gray-600 line-clamp-2'>{item.title}</p>
                <div className='flex items-center gap-2'>
                    <span className='font-semibold text-gray-800'>₹{item.sellingPrice}</span>
                    {item.mrpPrice > item.sellingPrice && (
                        <span className='text-gray-400 line-through text-sm'>₹{item.mrpPrice}</span>
                    )}
                    {(item.discountPercent ?? 0) > 0 && (
                        <span className='text-[#00927c] font-semibold text-sm'>{item.discountPercent}% off</span>
                    )}
                </div>
            </div>

            <div className='absolute top-1 right-1' onClick={(e) => e.stopPropagation()}>
                <button onClick={handleIconClick}>
                    <CloseIcon className='cursor-pointer bg-white rounded-full p-1 shadow-sm' sx={{ color: '#ef4444', fontSize: "1.8rem" }} />
                </button>
            </div>
        </div>
    );
};



export default WishlistProductCard