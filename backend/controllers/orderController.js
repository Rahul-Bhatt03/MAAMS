import * as orderService from "../Services/OrderService.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import mongoose from "mongoose";


export const createOrder = asyncHandler(async (req, res) => {
  const result = await orderService.createOrder(req.body);
  const { order, paymentResult, totalAmount, generateOnlyQR } = result;

  if (generateOnlyQR) {
    return res.status(201).json(
      new ApiResponse(201, {
        orderId: order._id,
        paymentId: paymentResult.paymentId,
        qrCode: paymentResult.qrCode,
        paymentUrl: paymentResult.paymentUrl,
        totalAmount,
      }, "Order created. QR generated")
    );
  }

  return res.status(201).json(
    new ApiResponse(201, {
      orderId: order._id,
      paymentId: paymentResult.paymentId,
      paymentUrl: paymentResult.paymentUrl,
      totalAmount,
      order,
    }, "Order created successfully")
  );
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const { orders, total } = await orderService.getAllOrders(req.query);
  const { page = 1, limit = 10 } = req.query;

  return res.status(200).json(
    new ApiResponse(200, {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }, "Orders fetched successfully")
  );
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid order ID");

  const updated = await orderService.updateOrderStatus(id, req.body);
  return res.status(200).json(new ApiResponse(200, updated, "Order status updated"));
});

export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, "Invalid order ID");

  const order = await orderService.getOrderById(id);
  return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});