import mongoose from 'mongoose'

const orderSchema=new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      items:[{
        medicine:{type:mongoose.Schema.Types.ObjectId,ref:'Medicine',required:true},
        quantity:{type:Number,required:true,min:1},
        price:{type:Number,required:true},
      }],
      totalAmount: {
        type: Number,
        required: true
      }, shippingAddress: {
        street: String,
        city: String,
        state: String,
        postalCode: String,
        coordinates: {
          lat: Number,
          lng: Number
        }
      },
      paymentMethod: {
        type: String,
        enum: ['esewa', 'khalti', 'stripe', 'cash'],
        required: true
      },
      paymentId: String,
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'refunded'],
        default: 'pending'
      },
      orderStatus: {
        type: String,
        enum: ['placed', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'placed'
      },
      prescriptionImage: String, // If prescription required
      currentLocation: {
        coordinates: {
          lat: Number,
          lng: Number
        },
        updatedAt: Date
      },
      expectedDeliveryTime: Date,
      notes: String,
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: Date
    });

    //create indexes for common queries
    orderSchema.index({user:1,createdAt:-1});
    orderSchema.index({orderStatus:1});
    orderSchema.index({paymentStatus:1});

    orderSchema.pre(`save`,function(next){
        this.updatedAt=Date.now();
        next(); 
    })

const Order=mongoose.model('Order',orderSchema)
export default Order