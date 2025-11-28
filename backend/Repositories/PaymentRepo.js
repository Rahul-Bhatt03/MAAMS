import Payment from "../models/Payment.js";

export const createPayment = async (data) => {
    return await Payment.create(data);
}

export const UpdatePaymentStatus = async (paymentId, status, gatewayResponse = {}) => {
    return await Payment.findByIdAndUpdate(
        paymentId, {
        status, gatewayResponse,
        updatedAt: Date.now(),
    },
        { new: true }
    );
};

export const findPaymentById = async (id) => {
    return await Payment.findById(id).populate("order user");
}