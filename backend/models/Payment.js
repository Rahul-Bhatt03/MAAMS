import mongoose from "mongoose";

const paymentSchema=new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      amount: {
        type: Number,
        required: true
      },
      currency: {
        type: String,
        default: 'NPR' // Assuming Nepalese Rupee as default
      },
      method: {
        type: String,
        enum: ['esewa', 'khalti', 'stripe', 'cash'],
        required: true
      },
      gatewayTransactionId: String,
      gatewayResponse: Object,
      status: {
        type: String,
        enum: ['initiated', 'processing', 'completed', 'failed', 'refunded'],
        default: 'initiated'
      },
      refundAmount: Number,
      refundReason: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: Date
    });
    
paymentSchema.pre(`save`,function(next){
    this.updatedAt=Date.now();
    next(); 
})

const Payment=mongoose.model('Payment',paymentSchema)
export default Payment;