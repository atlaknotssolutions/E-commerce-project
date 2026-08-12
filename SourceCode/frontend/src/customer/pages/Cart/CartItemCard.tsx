import { Button, Divider, IconButton } from '@mui/material'
import React from 'react'
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { CartItem } from '../../../types/cartTypes';
import { useAppDispatch } from '../../../Redux Toolkit/Store';
import { deleteCartItem, updateCartItem } from '../../../Redux Toolkit/Customer/CartSlice';
import { requireAuthentication } from '../../../util/requireAuth';
import { useNavigate } from 'react-router-dom';

interface CartItemProps
{
    item: CartItem
}

const CartItemCard: React.FC<CartItemProps> = ({ item }) =>
{
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleUpdateQuantity = (value: number) =>
    {
        const loginPath = requireAuthentication("Please login to update your cart");
        if (loginPath) {
            navigate(loginPath, { state: { from: `${window.location.pathname}${window.location.search}` } });
            return;
        }

        dispatch(updateCartItem({
            jwt: localStorage.getItem("jwt"),
            cartItemId: item.id, cartItem: { quantity: item.quantity + value }
        }))
    }
    const handleRemoveCartItem = () =>
    {
        const loginPath = requireAuthentication("Please login to update your cart");
        if (loginPath) {
            navigate(loginPath, { state: { from: `${window.location.pathname}${window.location.search}` } });
            return;
        }

        dispatch(deleteCartItem({
            jwt: localStorage.getItem("jwt") || "",
            cartItemId: item.id
        }))
    }
    return (
        <div className=' border rounded-md relative'>
            <div className='p-5 flex gap-3'>

                <div>
                    <img className='w-[90px] rounded-md'
                        src={item.product?.images?.[0]?.url || ""}
                        alt="" />
                </div>
                <div className='space-y-2'>
                    {/* <h1 className="font-semibold text-lg">
                        {item.product?.seller?.businessDetails?.businessName ?? "Unknown Seller"}
                    </h1> */}

                    <h1 className="text-gray-600 font-semibold text-sm">
                        {item.product?.title || "Product no longer available"}
                    </h1>

                    <p className="text-gray-400 text-xs">
                        <strong>Sold by:</strong>{" "}
                        {item.product?.seller?.businessDetails?.businessName ?? "Unknown Seller"}
                    </p>

                    <p className="text-xs">
                        <strong>7 days replacement</strong> available
                    </p>

                    {item.variantId && item.product?.variants && (() => {
                        const matchedVariant = item.product?.variants.find(
                            (v) => v.id === item.variantId
                        );
                        if (!matchedVariant) return null;
                        const attrs = matchedVariant.attributes;
                        const parts: string[] = [];
                        if (attrs.dynamic?.length) {
                            attrs.dynamic.forEach((d) => {
                                if (d.value) parts.push(`${d.name}: ${d.value}`);
                            });
                        }
                        if (attrs.color) parts.push(`Color: ${attrs.color}`);
                        if (attrs.size) parts.push(`Size: ${attrs.size}`);
                        if (attrs.storage) parts.push(`Storage: ${attrs.storage}`);
                        if (attrs.ram) parts.push(`RAM: ${attrs.ram}`);
                        if (attrs.custom?.length) {
                            attrs.custom.forEach((c) => parts.push(`${c.key}: ${c.value}`));
                        }
                        return parts.length > 0 ? (
                            <p className="text-xs text-gray-500">
                                {parts.join(" | ")}
                            </p>
                        ) : null;
                    })()}

                    <p className="text-sm text-gray-500">
                        <strong>Quantity:</strong> {item.quantity}
                    </p>
                </div>

            </div>
            <Divider />
            <div className='px-5 py-2 flex justify-between items-center'>

                <div className=' flex items-center gap-2  w-[140px] justify-between'>

                    <Button size='small' disabled={item.quantity === 1} onClick={() => handleUpdateQuantity(-1)} >
                        <RemoveIcon />
                    </Button>
                    <span className='px-3  font-semibold'>
                        {item.quantity}
                    </span>
                    <Button size='small' onClick={() => handleUpdateQuantity(1)} >
                        <AddIcon />
                    </Button>

                </div>
                <div className="text-right">
                    <p className='text-gray-700 font-medium'>₹{item.sellingPrice.toFixed(2)}</p>
                    {item.mrpPrice > item.sellingPrice && (
                        <p className="text-gray-400 text-xs line-through">₹{item.mrpPrice.toFixed(2)}</p>
                    )}
                </div>


            </div>
            <div className='absolute top-1 right-1'>
                <IconButton onClick={handleRemoveCartItem} color='primary' >
                    <CloseIcon />
                </IconButton>
            </div>

        </div>
    )
}

export default CartItemCard