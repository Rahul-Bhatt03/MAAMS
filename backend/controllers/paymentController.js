import * as paymentService from "../Services/paymentService.js"
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const initiatePayment = asyncHandler(async (req, res) => {
  const result = await paymentService.initiateEsewaPayment(req.body);
 return res.status(200).json(new ApiResponse(200,result,"payment initiated successfully"));

});


export const verifyPayment = asyncHandler(async (req, res) => {
  
    const { paymentId, refId } = req.body;
    const result = await paymentService.verifyEsewaPayment(paymentId, refId);
    if(result.status==="completed"){
      const payment=await paymentService.findPaymentByIds(id)

      if(!payment){
        throw new Error("payment not found")
      }

      const order=await Order.findById(payment.order);
      if(!order){
        throw new Error("order not found")
      }
      order.paymentStatus="completed";
      order.orderStatus="confirmed"
      await order.save()

       for (const item of order.items) {
      await Medicine.findByIdAndUpdate(item.medicine, {
        $inc: { stock: -item.quantity },
      });
    }

 return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentStatus: result.status,
          orderId: order._id,
          orderStatus: order.orderStatus,
          message: "Payment verified and order confirmed",
        },
        "Payment verified successfully"
      )
    );
  }
  // Payment failed
  const payment = await paymentService.findPaymentByIds(paymentId);
  if (payment) {
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = "failed";
      await order.save();
    }
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        paymentStatus: result.status,
        message: "Payment verification failed",
      },
      "Payment verification completed"
    )
  );
});


export const getPaymentStatus=asyncHandler(async(req,res)=>{
  const {paymentId}=req.params;
  if(!paymentId){
    throw new Error("payment id not found")
  }
  const status=await paymentService.getPaymentStatus(paymentId);
  return res.status(200).json(new ApiResponse(200,status,"status fetched successfully"))
})
