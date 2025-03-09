import mongoose from 'mongoose'

const appointmentSchema=new mongoose.Schema({
patientName:{type:String,required:true},
doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true},
department:{type:mongoose.Schema.Types.ObjectId,ref:'Department',required:true},
date:{type:Date,required:true},
status:{type:String,enum:['Pending','Confirmed','Rejected'],default:'Pending'},
isDeleted:{type:Boolean,default:false},
deletedAt:{type:Date,default:null},
},{timestamps:true});

//pre-find middlware to filter out deleted records by default 
appointmentSchema.pre(/^find/,function(next){
    this.find({isDeleted:{$ne:true}})
    next()
})

const Appointment=mongoose.model('Appointment',appointmentSchema);
export default Appointment;