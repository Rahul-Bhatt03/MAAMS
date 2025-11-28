import Order from "../models/Order.js";


export const createOrder = async (OrderData) => {
    return await Order.create(OrderData)
};

export const updateOrderStatus = async (orderId, status) => {
    return await Order.findByIdAndUpdate(orderId, { status }, { new: true })
}

export const getAllOrders = async (filters, options) => {
    const { skip, limit, sort } = options;
    const orders= await Order.find(filters).populate("user", "name email phone").populate("items.medicine", "name price").sort(sort).skip(skip).limit(limit);
    const total=await Order.countDocuments(filters);
    return {orders,total};
}

export const getOrderById = async (id) => {
    return await Order.findById(id).populate("users", "name email phone").populate("items.medicine");
}