import Payment from "../models/Payment";
import Order from "../models/Order";
 import {verifyEsewaPayment,verifyKhaltiPayment,verifyStripePAyment} from "../utils/paymentGateways";

 export const verifyPayment=async(req,res)=>{
    try {
        const {paymentMethod,orderId}=req.body;
        const order=await Order.findById(orderId);
        if(!order){
            return res.status(404).json({success:false,message:"Order not found"});
        }
        let varificationResult;
        switch(paymentMethod){
            case 'esewa':
                varificationResult=await verifyEsewaPayment(req.body);
                break;
            case 'khalti':
                varificationResult=await verifyKhaltiPayment(req.body);
                break;
            case 'stripe':
                varificationResult=await verifyStripePAyment(req.body);
                break;
            default:
                return res.status(400).json({success:false,message:"Invalid payment method"});
        }
        if(varificationResult.success){
const payment=await Payment.findOneAndUpdate({
    order:order._id
},{
    status:'completed',
    gatewayTransactionId:varificationResult.transactionId,
    gatewayResponse:varificationResult.response
},{
    new:true,
    runValidators:true
});
order.paymentStatus='completed';
order.orderStatus='placed';
await order.save();
res.json({success:true,data:payment});
        }else{
          const payment=await Payment.findOneAndUpdate({order:order._id},  {
            status: 'failed',
            gatewayResponse: verificationResult.response
          },
          { new: true }
        );
  
        res.status(400).json({
          success: false,
          message: verificationResult.message,
          data: { payment }
        })
        }
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
 }

 export const getPaymentStatus=async(req,res)=>{
    try {
        const payment=await Payment.findOne({order:req.params.orderId});
        if(!payment){
            return res.status(404).json({success:false,message:"Payment not found"});
        }
        res.json({success:true,data:payment});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
 }

 export const processRefund=async(req,res)=>{
    try {
        if(req.user.role!=='admin'){
            return res.status(403).json({success:false,message:"Not authorized"});
        }
        const {orderId,amount,reason}=req.body;
        const payment=await Payment.findOne({order:orderId});
        if(!payment){
            return res.status(404).json({success:false,message:"Payment not found"});
        }
        if(payment.status!=='completed'){
            return res.status(400).json({
                success:false,
                message:"Payment is not completed. can only refund completed payments"
            })
        }
        payment.status='refunded'
        payment.refundAmount=amount||payment.amount;
        payment.refundReason=reason;
        await payment.save();

        const order=await Order.findById(payment.order);
        order.paymentStatus='refunded';
        order.orderStatus='cancelled';
        await order.save();
        res.json({success:true,data:payment});
    } catch (error) {
        res.status(500).json({success:false,message:error.message});
    }
 }