// controllers/orderController.js
import Order from '../models/Order.js';
import Medicine from '../models/Medicine.js';
import Payment from '../models/Payment.js';
import { initiatePayment } from '../utils/paymentGateways.js';

// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, prescriptionImage } = req.body;

    const validatedItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicineId);
      if (!medicine) {
        return res.status(404).json({
          success: false,
          message: `Medicine with ID ${item.medicineId} not found`,
        });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`,
        });
      }

      if (medicine.requiresPrescription && !prescriptionImage) {
        return res.status(400).json({
          success: false,
          message: `Prescription required for ${medicine.name}`,
        });
      }

      validatedItems.push({
        medicine: medicine._id,
        quantity: item.quantity,
        price: medicine.price,
      });

      totalAmount += medicine.price * item.quantity;
    }

    const order = new Order({
      user: req.user._id,
      items: validatedItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      prescriptionImage,
      orderStatus: 'placed',
      paymentStatus: 'pending',
    });

    await order.save();

    const payment = await initiatePayment(order, paymentMethod);

    res.status(201).json({
      success: true,
      data: {
        order,
        paymentDetails: payment,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders for a user
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.medicine', 'name imageUrl');

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get a specific order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.medicine')
      .populate('user', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      !['admin', 'pharmacist'].includes(req.user.role)
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update order status (for pharmacists/admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, currentLocation, expectedDeliveryTime } = req.body;

    if (!['pharmacist', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updateData = { orderStatus };

    if (orderStatus === 'out_for_delivery') {
      if (currentLocation) {
        updateData.currentLocation = {
          coordinates: currentLocation,
          updatedAt: new Date(),
        };
      }

      if (expectedDeliveryTime) {
        updateData.expectedDeliveryTime = expectedDeliveryTime;
      }
    }

    const order = await Order.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('items.medicine');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Stock should be reduced only when order is confirmed
    if (orderStatus === 'confirmed' && order.orderStatus === 'confirmed') {
      for (const item of order.items) {
        await Medicine.findByIdAndUpdate(item.medicine._id, {
          $inc: { stock: -item.quantity },
        });
      }
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update delivery location (for delivery tracking)
export const updateDeliveryLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.orderStatus !== 'out_for_delivery') {
      return res.status(400).json({
        success: false,
        message: 'Location updates are only available for orders in delivery',
      });
    }

    order.currentLocation = {
      coordinates,
      updatedAt: new Date(),
    };

    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all orders (admin/pharmacist)
export const getAllOrders = async (req, res) => {
  try {
    if (!['pharmacist', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { status, paymentStatus, startDate, endDate } = req.query;
    const filter = {};

    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email phoneNumber')
      .populate('items.medicine', 'name imageUrl');

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
