// import React, { useState } from 'react';
// import { useProductContext } from '../../context/ProductContext';
// import { OrderWithUserInfo } from '../../api/post';

// interface Order {
//   _id: string;
//   status: 'Pending' | 'Delivered' | 'Completed';
// }

// const OrderActionButtons = ({ order, isMyOrders }: { order: OrderWithUserInfo; isMyOrders: boolean }) => {
//   const [isUpdating, setIsUpdating] = useState(false);
//   // const { cancelOrder, updateOrderStatus } = useProductContext();

//   const nextStatus: { [key in Order['status']]?: string } = {
//     Pending: 'Delivered',
//     Delivered: 'Completed',
//   };

//   const handleCancel = async () => {
//     try {
//       // await cancelOrder(order._id);
//     } catch (error) {
//       console.error('Error canceling order:', error);
//     }
//   };

//   const handleStatusUpdate = async () => {
//     try {
//       setIsUpdating(true);
//       // await updateOrderStatus(order._id, nextStatus[order.status]);
//     } catch (error) {
//       console.error('Error updating status:', error);
//     } finally {
//       setIsUpdating(false);
//     }
//   };

//   if (isMyOrders) {
//     return order.status === 'Pending' ? (
//       <button onClick={handleCancel} className="btn btn-error btn-sm text-xs">
//         Cancel Order
//       </button>
//     ) : null;
//   } else {
//     return nextStatus[order.status] ? (
//       <button onClick={handleStatusUpdate} disabled={isUpdating} className="btn btn-primary btn-sm text-xs">
//         {isUpdating ? (
//           <span className="loading loading-spinner loading-xs"></span>
//         ) : (
//           `Mark as ${nextStatus[order.status]}`
//         )}
//       </button>
//     ) : null;
//   }
// };

// export default OrderActionButtons;
