import React from 'react'
import ElectricBoltIcon from '@mui/icons-material/ElectricBolt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Avatar, IconButton } from '@mui/material';
import { teal } from '@mui/material/colors';
import { useNavigate } from 'react-router-dom';
import { notification } from '../../../services/notificationService';
import { Order, OrderItem } from '../../../types/orderTypes';
import { formatDate } from '../../util/fomateDate';
import { PRODUCT_UNAVAILABLE_NAME, toOrderItemView } from '../../util/orderItemView';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderItemCardProps{
    item:OrderItem,
    order:Order
}
const OrderItemCard:React.FC<OrderItemCardProps> = ({item,order}) => {
    const navigate = useNavigate()
    const view = toOrderItemView(item);

    const handleCopyOrderId = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(order.orderId || order.id).then(() => {
            notification.info('Order ID copied');
        });
    };

    return (
        <div onClick={() => navigate(`/account/orders/${order.id}/${item.id}`)} className='text-sm bg-white border rounded-md cursor-pointer hover:shadow-md transition-shadow'>

            <div className='flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100'>
                <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-500'>Order ID:</span>
                    <span className='font-mono font-medium text-xs'>{order.orderId || order.id}</span>
                    <IconButton size="small" onClick={handleCopyOrderId} sx={{ padding: '2px' }}>
                        <ContentCopyIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    </IconButton>
                </div>
                <OrderStatusBadge status={order.orderStatus} />
            </div>

            <div className='p-4'>
                <div className='flex items-center gap-3 mb-3'>
                    <Avatar sizes='small' sx={{ bgcolor: teal[500], width: 28, height: 28 }}>
                        <ElectricBoltIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <div>
                        <p className='text-xs text-gray-500'>Arriving by {formatDate(order.deliverDate)}</p>
                    </div>
                </div>

                <div className='flex gap-3 bg-teal-50 p-3 rounded-lg'>
                    <img className='w-[70px] h-[70px] object-cover rounded'
                     src={view.image} alt={view.name} />
                    <div className='flex-1 min-w-0 space-y-1'>
                        {view.productAvailable ? (
                            <>
                                <h1 className='font-bold text-sm truncate'>{view.sellerName}
                                </h1>
                                <p className='text-xs truncate'>
                                    {view.name}
                                </p>
                            </>
                        ) : (
                            <>
                                <h1 className='font-bold text-sm truncate'>{view.name}
                                </h1>
                                <p className='text-xs truncate text-gray-500'>
                                    {view.hasHistoricalName ? PRODUCT_UNAVAILABLE_NAME : ''}
                                </p>
                            </>
                        )}
                        <p className='text-xs text-gray-600'>
                            {view.variantLabel}
                        </p>
                        {!view.productAvailable && (
                            <p className='text-xs text-gray-600'>
                                Qty: {view.quantity}
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

export default OrderItemCard
