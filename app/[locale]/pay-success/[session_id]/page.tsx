// Stripe已禁用以提高性能
// import Stripe from 'stripe';
import { handleOrderSession } from '@/services/order';
import { redirect } from 'next/navigation';

export default async function Page(props: { params: Promise<{ session_id: string; locale: string }> }) {
  const params = await props.params;

  try {
    // 处理模拟会话
    if (params.session_id.startsWith('mock_cnpay_')) {
      // 创建模拟会话对象
      const mockSession = {
        id: params.session_id,
        metadata: {
          order_no: params.session_id.replace('mock_cnpay_', ''),
        },
        mode: 'payment',
        payment_status: 'paid',
        status: 'complete',
      };

      await handleOrderSession(mockSession as any);
      redirect(process.env.NEXT_PUBLIC_PAY_SUCCESS_URL || '/');
      return;
    }

    // 原Stripe处理已禁用
    /*
    const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY || '');
    const session = await stripe.checkout.sessions.retrieve(params.session_id);

    await handleOrderSession(session);
    */

    // 直接跳转到成功页面
    redirect(process.env.NEXT_PUBLIC_PAY_SUCCESS_URL || '/');
  } catch (e) {
    console.error('支付处理失败:', e);
    redirect(process.env.NEXT_PUBLIC_PAY_FAIL_URL || '/');
  }
}
