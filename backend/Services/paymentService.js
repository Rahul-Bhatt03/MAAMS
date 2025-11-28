import { Error } from "mongoose";
import { generateEsewaPayment, verifyEsewaTransaction } from "../Repositories/EsewaRepo.js";
import { createPayment, findPaymentById, UpdatePaymentStatus } from "../Repositories/PaymentRepo.js";

export const initiateEsewaPayment = async (payload) => {
    const { orderId, userId, amount, method } = payload;
    if (!orderId || !userId || !amount || !method) {
        throw new Error("user id , order id ,amount or method , might be missing");
    };

    const payment = await createPayment({
        order: orderId,
        user: userId,
        amount,
        method,
        status: "initiated",
    })

    // to generate qr and url 
    const esewaData = await generateEsewaPayment(payment);

    return {
        paymentId: payment._id,
        paymentUrl: esewaData.paymentUrl,
        qrCode: esewaData.qrCode
    }
}

export const verifyEsewaPayment = async (paymentId, refId) => {
    const payment = await findPaymentById(paymentId);
    if (!payment)
        throw new Error("payment not found")

    const verified = await verifyEsewaTransaction(refId, paymentId, payment.amount);

    const status = verified ? "completed" : "failed"
    await UpdatePaymentStatus(paymentId, status, { refId }, refId)

    return { status, paymentId, refId }
}

export const findPaymentByIds=async(id)=>{
    return await findPaymentById(id);
}