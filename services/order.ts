import { getIsoTimestr } from '@/lib/time';
import { findOrderByOrderNo, OrderStatus, updateOrderStatus } from '@/models/order';
import { CreditsTransType, increaseCredits } from './credit';

// Stripe导入已禁用以提高性能
// import Stripe from 'stripe';

// 使用自定义类型代替Stripe类型
interface CheckoutSession {
  id: string;
  metadata?: {
    order_no?: string;
  };
  payment_status?: string;
  customer_details?: {
    email?: string;
  };
  customer_email?: string;
  mode?: string;
  status?: string;
}

export async function handleOrderSession(session: CheckoutSession) {
  try {
    if (!session || !session.metadata || !session.metadata.order_no || (session.payment_status !== 'paid' && session.status !== 'complete')) {
      throw new Error('invalid session');
    }

    const order_no = session.metadata.order_no;
    const paid_email = session.customer_details?.email || session.customer_email || '';
    const paid_detail = JSON.stringify(session);

    const order = await findOrderByOrderNo(order_no);
    if (!order || order.status !== 'created') {
      throw new Error('invalid order');
    }

    const paid_at = getIsoTimestr();
    if (!order.id) {
      throw new Error('invalid order');
    }
    await updateOrderStatus(order.id, OrderStatus.Paid);

    if (order.user_uuid && order.credits > 0) {
      // increase credits for paied order
      await increaseCredits({
        user_uuid: order.user_uuid,
        trans_type: CreditsTransType.OrderPay,
        credits: order.credits,
        expired_at: order.expired_at,
        order_no: order_no,
      });
    }

    console.log('handle order session successed: ', order_no, paid_at, paid_email, paid_detail);
  } catch (e) {
    console.log('handle order session failed: ', e);
    throw e;
  }
}
