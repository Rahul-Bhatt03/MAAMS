import mongoose from 'mongoose'

const departmentSchema=new mongoose.Schema({
name:{type:String,required:true},
description:{type:String,required:true},
doctors:[{type:mongoose.Schema.Types.ObjectId,ref:'Doctor'}],
services:[{type:String}],
timings:{type:String,required:true},
appointments:[{type:mongoose.Schema.Types.ObjectId,ref:'Appointments'}],
isDeleted:{type:Boolean,default:false},
deletedAt:{type:Date,default:null},
},{timestamps:true});

// Pre-find middleware to filter out deleted records by default
departmentSchema.pre(/^find/, function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
  });

const Department = mongoose.model('Department', departmentSchema);
export default Department;