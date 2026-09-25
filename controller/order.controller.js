import Order from '../models/order.model.js';
import { sendOrderNotificationEmail } from '../libs/mailer.js';

// Create a new order (from storefront checkout)
export const createOrder = async (req, res) => {
  try {
    const { customer, items, subtotal, shippingFee, grandTotal, paymentMethod } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address || !customer.city) {
      return res.status(400).json({ 
        success: false, 
        message: 'Customer name, phone, address, and city are required.' 
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart cannot be empty.' 
      });
    }

    // Clean and validate items
    const formattedItems = items.map(item => ({
      id: item.id || '',
      productId: item.productId || item._id || item.id,
      name: item.name,
      image: item.image || '',
      size: item.size || '50ml',
      price: Number(item.price) || 0,
      regularPrice: Number(item.regularPrice) || Number(item.price) || 0,
      quantity: Number(item.quantity) || 1
    }));

    const calculatedSubtotal = Number(subtotal) || formattedItems.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const calculatedShipping = typeof shippingFee !== 'undefined' ? Number(shippingFee) : (calculatedSubtotal > 0 ? 200 : 0);
    const calculatedGrandTotal = Number(grandTotal) || (calculatedSubtotal + calculatedShipping);

    const newOrder = new Order({
      customer: {
        fullName: customer.fullName.trim(),
        email: customer.email ? customer.email.trim() : '',
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city.trim()
      },
      items: formattedItems,
      subtotal: calculatedSubtotal,
      shippingFee: calculatedShipping,
      grandTotal: calculatedGrandTotal,
      status: 'Pending',
      paymentMethod: paymentMethod || 'Cash on Delivery'
    });

    const savedOrder = await newOrder.save();

    // Trigger async email notification (does not block client response)
    sendOrderNotificationEmail(savedOrder).catch(err =>
      console.error('Async email notification error:', err.message)
    );

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: savedOrder
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ success: false, message: 'Server error placing order', error: error.message });
  }
};

// Get all orders (for Admin portal)
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error fetching orders', error: error.message });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching order', error: error.message });
  }
};

// Update order status (Pending -> Processing -> Delivered -> Cancelled)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending', 'Processing', 'Delivered', 'Cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server error updating status', error: error.message });
  }
};

// Delete an order (Admin maintenance)
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting order', error: error.message });
  }
};
