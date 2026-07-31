import { useSocketEvent } from '../../hooks/useSocketEvent';
import { useAppDispatch } from '../../Redux Toolkit/Store';
import { getWishlistByUserId } from '../../Redux Toolkit/Customer/WishlistSlice';
import { notification } from '../../services/notificationService';

export default function SocketEventHandler() {
  const dispatch = useAppDispatch();

  useSocketEvent('order:statusChanged', (data: any) => {
    notification.info(`Order ${data.orderId?.slice(-6)} status → ${data.orderStatus}`);
  });

  useSocketEvent('order:cancelled', (data: any) => {
    notification.warning(`Order ${data.orderId?.slice(-6)} has been cancelled`);
  });

  useSocketEvent('order:trackingUpdated', (data: any) => {
    notification.info(`Tracking #${data.trackingNumber} assigned to your order`);
  });

  useSocketEvent('wishlist:updated', () => {
    dispatch(getWishlistByUserId());
  });

  useSocketEvent('seller:statusChanged', (data: any) => {
    const status = data.status === 'APPROVED' ? 'approved' : data.status === 'REJECTED' ? 'rejected' : 'suspended';
    notification.info(`Your seller account has been ${status}`);
  });

  useSocketEvent('deal:created', () => {
    notification.success('A new deal has been created');
  });

  useSocketEvent('deal:updated', () => {
    notification.info('A deal has been updated');
  });

  useSocketEvent('admin:sellerApproved', () => {
    notification.success('A seller has been approved');
  });

  useSocketEvent('notification:new', (data: any) => {
    notification.info(data?.title || 'New notification');
  });

  return null;
}
