import mongoose from 'mongoose'

const appointmentSchema=new mongoose.Schema({
patient:{type:mongoose.Schema.Types.ObjectId,ref:'Patient',required:function(){return !this.patientName}},
patientName:{type:String,required:function(){return !this.patient}},
user:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
doctor:{type:mongoose.Schema.Types.ObjectId,ref:'Doctor',required:true},
department:{type:mongoose.Schema.Types.ObjectId,ref:'Department',required:true},
date:{type:Date,required:true},
timeSlot: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
      },
      message: props => `${props.value} is not a valid time slot! Use HH:MM format`
    }
  },
status:{type:String,enum:['Pending','Confirmed','Rejected','Completed'],default:'Pending'},
notes:String,
isDeleted:{type:Boolean,default:false},
deletedAt:{type:Date,default:null},
},{timestamps:true,
toJSON:{virtuals:true},
toObject:{virtuals:true}
});

//virtuals for formatted date
appointmentSchema.virtual('formattedDate').get(function(){
    return this.date.toISOString().split('T')[0];
})

//virtual for formatted true
appointmentSchema.virtual('formattedTime').get(function(){
    return this.timeSlot
})

// Indexes for better query performance
appointmentSchema.index({ doctor: 1, date: 1, timeSlot: 1 });
appointmentSchema.index({ patient: 1 });
appointmentSchema.index({ user: 1 });
appointmentSchema.index({ department: 1 });

//pre-find middlware to filter out deleted records by default 
appointmentSchema.pre(/^find/,function(next){
    this.find({isDeleted:{$ne:true}})
    .populate('patient','name email phone')
    .populate('user','name email role')
    .populate('doctor','name specialization')
    .populate('department','name')
    next()
})

const Appointment=mongoose.model('Appointment',appointmentSchema);
export default Appointment;