import * as orderRepo from "../Repositories/OrderRepo.js";
import MedicineRepo from "../Repositories/MedicineRepo.js";
import * as paymentService from "../Services/paymentService.js";
import ApiError from "../utils/ApiError.js";

const medicineRepo=new MedicineRepo()

export const getOrders = async () => {
  const orders = await getAllOrders();
  return orders;
}

export const getOrder = async (id) => {
  const order = await getOrderById(id);
  if (!order) {
    throw new Error("order not found");
  }
  return order;
}

export const createOrder = async (data) => {
  const {
    userId, items, shippingAddress, paymentMethod, prescriptionImage, notes, generateOnlyQR = false,
  } = data;

  if (!userId || !items || items.length === 0 || !paymentMethod) {
    throw new ApiError(400, "User, items, and payment method are required");
  }

  //   validate medicines and calculate total 
  let totalAmount = 0;
  const validatedItems = [];

  for (const item of items) {
    const medicine = await medicineRepo.findById(item.medicine)
    if (medicine.stock < item.quantity) {
      throw new ApiError(
        400,
        `Insufficient stock for ${medicine.name}. Available: ${medicine.stock}`
      );
    }
    const itemTotal = medicine.price * item.quantity;
    totalAmount += itemTotal;
    validatedItems.push({
      medicine: medicine._id,
      quantity: item.quantity,
      price: medicine.price,
    })
  }

  // Create order
  const orderData = {
    user: userId,
    items: validatedItems,
    totalAmount,
    shippingAddress,
    paymentMethod,
    prescriptionImage,
    notes,
    paymentStatus: "pending",
    orderStatus: "placed",
  };

  const order = await orderRepo.createOrder(orderData);
  // Initiate payment
  const paymentPayload = {
    orderId: order._id,
    userId,
    amount: totalAmount,
    method: paymentMethod,
  };
  const paymentResult = await paymentService.initiateEsewaPayment(paymentPayload)

  order.paymentID = paymentResult.paymentId
  await order.save()
  return {
    order, paymentResult, totalAmount, generateOnlyQR
  }
}

export const getAllOrders = async (query) => {
  const { page = 1, limit = 10, userId, orderStatus, paymentStatus, sortBy = "creeatedAt", sortOrder = "desc" } = query;

  const filters = {}
  if (userId) filters.user = userId;
  if (orderStatus) filters.orderStatus = orderStatus;
  if (paymentStatus) filters.paymentStatus = paymentStatus;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  return await orderRepo.getAllOrders(filters, { skip, sort, limit });
}

export const updateOrderStatus = async (id, data) => {
  const { orderStatus, currentLocation, expectedDeliveryTime } = data;

  const updateData = { orderStatus };
  if (currentLocation) {
    updateData.currentLocation = {
      coordinates: currentLocation,
      updatedAt: new Date(),
    };
  }
  if (expectedDeliveryTime) {
    updateData.expectedDeliveryTime = new Date(expectedDeliveryTime);
  }

  const order = await orderRepo.updateOrder(id, updateData);
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};

export const getOrderById = async (id) => {
  const order = await orderRepo.getOrderById(id);
  if (!order) throw new ApiError(404, "Order not found");
  return order;
};