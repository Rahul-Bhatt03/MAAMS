import mongoose from 'mongoose '

const notificaionSchema=new mongoose.Schema({
message:{type:String,required:true},
recipent:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
read:{type:Boolean,default:false},
createdAt:{type:Date,default:Date.now}
})

const Notification=mongoose.model('Notification',notificationSchema)

export default Notification