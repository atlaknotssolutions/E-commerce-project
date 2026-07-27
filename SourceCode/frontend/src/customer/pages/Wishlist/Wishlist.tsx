import React from 'react'
import { useAppDispatch, useAppSelector } from '../../../Redux Toolkit/Store'
import WishlistProductCard from './WishlistProductCard';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

const Wishlist = () => {
    const navigate = useNavigate();
    const { wishlist } = useAppSelector(store => store)

    if (wishlist.loading) {
        return (
            <div className="h-[60vh] flex justify-center items-center">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className='min-h-[70vh] p-5 lg:p-20'>
            {wishlist.wishlist?.products?.length ? (
                <section>
                    <h1 className="text-xl font-bold pb-2">My Wishlist <span className="text-gray-400 font-normal text-base">({wishlist.wishlist.products.length} items)</span></h1>
                    <div className='pt-5 flex flex-wrap gap-5'>
                        {wishlist.wishlist.products.map((item: any) => (
                            <WishlistProductCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            ) : (
                <div className="h-full flex justify-center items-center flex-col gap-4">
                    <div className="text-center py-5">
                        <h1 className="text-xl font-medium">Your wishlist is empty</h1>
                        <p className="text-gray-500 text-sm mt-2">
                            Save items that you like in your wishlist. Review them anytime and easily move them to the bag.
                        </p>
                    </div>
                    <Button variant="contained" onClick={() => navigate("/")} sx={{ backgroundColor: '#00927c', '&:hover': { backgroundColor: '#007a6a' } }}>
                        Continue Shopping
                    </Button>
                </div>
            )}
        </div>
    )
}

export default Wishlist
