import React from 'react'
import { Chip } from '@mui/material'
import { OrderStatus } from '../../../types/orderTypes'

interface OrderStatusBadgeProps {
  status: OrderStatus | string
  size?: 'small' | 'medium'
}

const statusConfig: Record<string, { color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning', label: string }> = {
  [OrderStatus.PENDING]: { color: 'warning', label: 'Pending' },
  [OrderStatus.PLACED]: { color: 'info', label: 'Placed' },
  [OrderStatus.CONFIRMED]: { color: 'primary', label: 'Confirmed' },
  [OrderStatus.PACKED]: { color: 'warning', label: 'Packed' },
  [OrderStatus.SHIPPED]: { color: 'info', label: 'Shipped' },
  [OrderStatus.OUT_FOR_DELIVERY]: { color: 'info', label: 'Out For Delivery' },
  [OrderStatus.DELIVERED]: { color: 'success', label: 'Delivered' },
  [OrderStatus.CANCELLED]: { color: 'error', label: 'Cancelled' },
}

const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'small' }) => {
  const config = statusConfig[status] || { color: 'default' as const, label: status }
  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      variant="filled"
    />
  )
}

export default OrderStatusBadge
