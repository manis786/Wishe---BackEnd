import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const createTransporter = () => {
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS not set. Email notifications will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: user,
      pass: pass
    }
  });
};

/**
 * Send HTML order notification email to Admin and Customer
 */
export const sendOrderNotificationEmail = async (order) => {
  try {
    const transporter = createTransporter();
    if (!transporter) return;

    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'wishefragrance@gmail.com';
    const orderId = order._id ? `ORD-${order._id.slice(-6).toUpperCase()}` : (order.id || 'CONFIRMED');

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong><br/>
          <span style="font-size: 12px; color: #777;">Size: ${item.size}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">Rs. ${Number(item.price * item.quantity).toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaea; border-radius: 10px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #111111; color: #ffffff; padding: 25px; text-align: center;">
          <h1 style="margin: 0; font-size: 26px; letter-spacing: 2px;">WISHÉ</h1>
          <p style="margin: 5px 0 0 0; color: #d4af37; font-size: 13px; font-weight: bold; letter-spacing: 1px;">NEW ORDER NOTIFICATION</p>
        </div>

        <div style="padding: 25px;">
          <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; padding: 16px; border-radius: 8px; margin-bottom: 22px;">
            <p style="margin: 0 0 8px 0; font-size: 15px;"><strong>Order ID:</strong> <span style="color: #111; font-weight: bold;">${orderId}</span></p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Customer:</strong> ${order.customer?.fullName || 'N/A'}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Phone:</strong> ${order.customer?.phone || 'N/A'}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Delivery Address:</strong> ${order.customer?.address || ''}, ${order.customer?.city || ''}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Payment Method:</strong> Cash on Delivery (COD)</p>
          </div>

          <h3 style="margin-bottom: 12px; color: #111; font-size: 16px;">Ordered Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f1f3f5; text-align: left; font-size: 13px;">
                <th style="padding: 10px;">Item</th>
                <th style="padding: 10px; text-align: center;">Qty</th>
                <th style="padding: 10px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 10px; text-align: right; color: #666; font-size: 14px;">Subtotal:</td>
                <td style="padding: 10px; text-align: right; font-weight: bold; font-size: 14px;">Rs. ${Number(order.subtotal || 0).toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="padding: 6px 10px; text-align: right; color: #666; font-size: 14px;">Shipping Fee:</td>
                <td style="padding: 6px 10px; text-align: right; font-weight: bold; font-size: 14px;">Rs. ${Number(order.shippingFee || 0).toLocaleString()}</td>
              </tr>
              <tr style="font-size: 16px; border-top: 2px solid #111;">
                <td colspan="2" style="padding: 12px 10px; text-align: right; font-weight: bold;">Grand Total:</td>
                <td style="padding: 12px 10px; text-align: right; font-weight: bold; color: #d4af37;">Rs. ${Number(order.grandTotal || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; font-size: 12px; color: #888;">
            WISHÉ Luxury Fragrances Store • Automated Notification
          </div>
        </div>
      </div>
    `;

    // 1. Send to Store Admin
    await transporter.sendMail({
      from: `"WISHÉ Store" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `🚨 New Order ${orderId} - Rs. ${Number(order.grandTotal || 0).toLocaleString()} by ${order.customer?.fullName}`,
      html: emailHtml
    });

    // 2. If customer email provided, send confirmation copy
    if (order.customer?.email && order.customer.email.includes('@')) {
      await transporter.sendMail({
        from: `"WISHÉ Luxury Fragrances" <${process.env.SMTP_USER}>`,
        to: order.customer.email,
        subject: `Order Confirmation: ${orderId} - WISHÉ`,
        html: emailHtml
      });
    }

    console.log(`✅ Order notification email dispatched for ${orderId}`);
  } catch (error) {
    console.error('⚠️ Error dispatching order email:', error.message);
  }
};
