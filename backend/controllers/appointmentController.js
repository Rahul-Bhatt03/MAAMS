import Appointment from "../models/appointmentModel.js";
import Department from '../models/departmentModel.js'
import Doctor from '../models/doctorModel.js'
import Patient from '../models/patientModel.js'
import User from '../models/userModel.js'

// import {sendAppointmentConfirmation} from "../utils/emailService.js"

//helper funtion to validate time slots 
const isValidtimeSlot=(timeSlot)=>{
  const timeRegex=/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeSlot)
};

//helper function to check date is not in pass
const isFutureDate=(date)=>{
  const today=new Date()
  today.setHours(0,0,0,0)
  return date>=today;
}

export const getAppointments=async(req,res)=>{
  try {
    const {page=1,limit=10,status,doctorId,departmentId,patientId}=req.query;
    const query={};
    //filter by status if provided
    if(status)
    {
      query.status=status;
    }

    //filter by doctor if provided
    if(doctorId){
      query.doctor=doctorId;
    }

    //filter by department if provided
    if(departmentId){
      query.department=departmentId
    }
    //filter by patient if provided
    if(patientId){
      query.patient=patientId;
    }
    const options={
page:parseInt(page),
limit:parseInt(limit),
sort:{date:1,timeSlot:1}
    }
    const appointments=await Appointment.paginate(query,options)
    res.status(500).json({success:true,data:appointments})
  } catch (error) {
    res.status(500).json({success:false,message:'failed to fetch appointment',error:error.message})
  }
}

export const getUserAppointments=async(req,res)=>{
  try{
const {status}=req.query;
let query={user:req.user.id};
// if user is a patient , also look up by patientId
if(req.user.role==='patient'&&user.req.patientId)
{
  query={$or:[{user:req.user.id},{patient:req.user.patientId}]}
}
//filter by status if provided
if (status){
  query.status=status
}

const appointments=await Appointment.find(query).sort({date:1,timeSlot:1})
res.status(200).json({success:true,count:appointments.length,data:appointments})
  }catch(error){
    res.status(500).json({success:false,message:'failed to fetch appointment',error:error.message})
  }
}

export const getDoctorAppointments=async(req,res)=>{
  try {
    const {doctorId}=req.params
    const {status}=req.query;

    //validate doctor exists
    const doctor=await Doctor.findById(doctorId)
    if(!doctor){
      return res.status(404).json({success:false,message:'doctor not found'}) 
    }

    //check if user has permission (admin or the doctor themselves)
    if(req.user.role!=='admin'&&req.user.role!=="groupAdmin"&&req.user.role!=='doctor'||!req.user.doctorId.equals(doctorId)){
      return res.status(403).json({success:false,message:'unauthorized to view appointments'})
    }

    let query={doctor:doctorId}
    if(status){
      query.status=status;
    }
    const appointment=await Appointment.find(query).sort({date:1,timeSlot:1})
    res.status(200).json({success:true,count:appointment.length,data:appointment})
  } catch (error) {
    res.status(500).json({success:false,message:'failed to fetch appointment',error:error.message})
  }
}

export const getAppointmentById=async(req,res)=>{
try {
  const appointment=await Appointment.findById(req.params.id)

  if(!appointment){
    return res.status(404).json({success:false,message:'appointment not found'})
  }

  //check if the user has permission to view the appointment or not such that patient can only view their own appointments not someone else
  if(req.user.role==='patient'&&!appointment.user.equals(req.user.id)&&(!appointment.patient||!appointment.patient.equals(req.user.patientId))){
    return res.status(403).json({success:false,message:'unauthorized to view this appointment'} )
  }

  if(req.user.role==='doctor'&&!appointment.doctor.equals(req.user.doctorId)){
    return res.status(403).json({success:false,message:'unauthorized to view this appointment'})
  }

  res.status(200).json({success:true,data:appointment})
} catch (error) {
  res.status(500).json({success:false,message:'failed to fetch appointment',error:error.message})
}
}

export const createAppointment=async(req,res)=>{
  try {
  const { patientId, departmentId, doctorId, date, timeSlot, notes } = req.body;
  //validate required fields
  if(!departmentId||!doctorId||!date||!timeSlot){
    return res.status(400).json({success:false,message:'all fields are required'})
  }

  //validate timeslot format
  if(!isValidtimeSlot(timeSlot)){
    return res.status(400).json({success:false,message:'invalid time slot format. Use HH:MM format'})
  }

  //parse and validate date
  const appointmentDate=new Date(date)
  if(!isFutureDate(appointmentDate)){
    return res.status(400).json({success:false,message:'date must be in the future'})
  }

  // ..check if doctor exists
  const doctor=await Doctor.findById(doctorId)
  if(!doctor){
    return res.status(404).json({success:false,message:'doctor not found'})
  }

  //check if department exists
  const department=await Department.findById(departmentId)
  if(!department){
    return res.status(404).json({success:false,message:'department not found'})
  }

  //check if doctor belongs to department or not
  if(!doctor.department.equals(departmentId)){
    return res.status(400).json({success:false,message:'doctor does not belong to this department'})
  }
  //check if time slot is available 
  const existingAppointment=await Appointment.findOne({
    doctor:doctorId,
    date:appointmentDate,
    timeSlot:timeSlot,
    status:{$nin:['cancelled']}
  })

  if(existingAppointment){
    return res.status(400).json({success:false,message:'time slot is not available'})
  }
  //determine patient based on user role
  let patient;
  let patientName;
  if(req.user.role==='admin'||req.user.role==='groupAdmin'){
    //admin can book for any patient
    if(!patientId){
      return res.status(400).json({success:false,message:'please select a patient'})
  }
  patientName=patient.name;
}else{
  //regular users can book for themself
  patient=await Patient.findOne({user:req.user.id})
  if(!patient){
    return res.status(404).json({success:false,message:'patient not found'})
  }
  patientName=patient.name;
}

//create new appointment
const newAppointment=new Appointment({
  patient: patient ? patient._id : null,
  patientName: patientName,
  user: req.user.id,
  doctor: doctorId,
  department: departmentId,
  date: appointmentDate,
  timeSlot: timeSlot,
  notes: notes,
  status: 'Pending'
})
const savedAppointment=await newAppointment.save()
//update doctor's appointment
await Doctor.findByIdAndUpdate(doctorId,{
  $push:{appointments:savedAppointment._id}
})

//update department's appointment
await Deartment.findByIdAndUpdate(departmentId,{
  $push:{appointments:savedAppointment._id}
})

//update patient's appointment is patient exists
if(patient){
  await Patient.findByIdAndUpdate(patient._id,{$push:{appointments:savedAppointment._id}})
}
sendAppointmentConfirmation(savedAppointment)
res.status(200).json({success:true,data:savedAppointment})

//send confirmation email
try {
  const user=await User.findById(req.user.id)
  await sendAppointmentConfirmation(user.email,savedAppointment,doctor,department)
} catch (error) {
  console.log(emailError,"failed to send confirmation email")
}
res.status(200).json({success:true,data:savedAppointment,message:'appointment created successfully'})
  } catch (error) {
    res.status(500).json({success:false,message:'failed to create appointment',error:error.message})
  }
}

export const updateAppointment=async(req,res)=>{
  try {
    const { departmentId, doctorId, date, timeSlot, notes } = req.body; 
    const appointmentId=req.params.id;

    //find existing appointments 
    const appointments=await Appointment.findById(appointmentId)
    if(!appointments){
      return res.status(404).json({success:false,message:'appointment not found'})
    }
    // check Permissions
    if (req.user.role === 'patient' && !existingAppointment.user.equals(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment"
      });
    }
    
    if (req.user.role === 'doctor' && !existingAppointment.doctor.equals(req.user.doctorId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this appointment"
      });
    }
    
    // Validate time slot if provided
    if (timeSlot && !isValidTimeSlot(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: "Invalid time slot format. Use HH:MM format"
      });
    }

    //parse and validate date if provided
    let appointmentDate=existingAppointment.date
    if(date){
      appointmentDate=new Date(date)
      if(!isFutureDate(appointmentDate)){
        return res.status(400).json({success:false,message:'date cannot be in the past'})
    } 
  }

  //check doctor if changed 
  let doctor=existingAppointment.doctor
  if(doctorId&&!doctor.equals(doctorId)){
const newDoctor=await Doctor.findById(doctorId)
if(!newDoctor){
  return res.status(404).json({success:false,message:'doctor not found'})
}
doctor=doctorId
  }
  //check department if changed 
  let department=existingAppointment.department
  if(departmentId&&!department.equals(departmentId)){
const newDepartment=await Department.findById(departmentId)
if(!newDepartment){
  return res.status(404).json({success:false,message:'department not found'})
}
department=departmentId
}

// check if time slot is available if changed 
const currentTimeSlot=existingAppointment.timeSlot||timeSlot
if((doctorId||date||timeSlot)&&!(existingAppointment.doctor.equals(doctor)&&existingAppointment.date.equals(appointmentDate)&&existingAppointment.timeSlot===currentTimeSlot)){
  const conflictingAppointments=await Appointment.findOne({
    doctor:doctor,
    date:appointmentDate,
    timeSlot:currentTimeSlot,
    _id:{$ne:appointmentId},
    status:{$nin:['cancelled']}
  })
  if (conflictingAppointments) {
    return res.status(400).json({
      success: false,
      message: "Time slot is already taken"
    });
}
}

//update appointment
const updateAppointment=await Appointment.findByIdAndUpdate(appointmentId,{
  doctor,
  department,
  date: appointmentDate,
  timeSlot: currentTimeSlot,
  notes,
  updatedAt: Date.now()
},
{ new: true, runValidators: true }
);
res.status(200).json({success:true,data:updateAppointment,message:'appointment updated successfully'})
  } catch (error) {
    res.status(500).json({success:false,message:'failed to update appointment',error:error.message})
  }
}

export const updateAppointmentStatus=async(req,res)=>{
try {
  const {id}=req.params;
  const {status}=req.body;
  if (!["Pending", "Confirmed", "Cancelled", "Completed"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status"
    });
  }

  const appointment = await Appointment.findById(id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found"
    });
  }

  if (req.user.role === 'patient' && !appointment.user.equals(req.user.id)) {
    return res.status(403).json({ success: false, message: "Not authorized to update this appointment" });
  }

  if (req.user.role === 'doctor' && !appointment.doctor.equals(req.user.doctorId)) {
    return res.status(403).json({ success: false, message: "Not authorized to update this appointment" });
  }
 // Validate status transitions
 if (appointment.status === 'Completed' && status !== 'Completed') {
  return res.status(400).json({
    success: false,
    message: "Completed appointments cannot be modified"
  });
}

if (appointment.status === 'Cancelled' && status !== 'Cancelled') {
  return res.status(400).json({
    success: false,
    message: "Cancelled appointments cannot be modified"
  });
}

const updatedAppointment = await Appointment.findByIdAndUpdate(
  id,
  { status, updatedAt: Date.now() },
  { new: true }
);

res.status(200).json({
  success: true,
  message: "Appointment status updated successfully",
  data: updatedAppointment
});
} catch (error) {
res.status(500).json({
  success: false,
  message: "Failed to update appointment status",
  error: error.message
});
}
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private
export const deleteAppointment = async (req, res) => {
try {
const appointment = await Appointment.findById(req.params.id);

if (!appointment) {
  return res.status(404).json({
    success: false,
    message: "Appointment not found"
  });
}

// Check permissions
if (req.user.role === 'patient' && !appointment.user.equals(req.user.id)) {
  return res.status(403).json({
    success: false,
    message: "Not authorized to delete this appointment"
  });
}

if (req.user.role === 'doctor' && !appointment.doctor.equals(req.user.doctorId)) {
  return res.status(403).json({
    success: false,
    message: "Not authorized to delete this appointment"
  });
}

// Soft delete
await Appointment.findByIdAndUpdate(
  req.params.id,
  {
    isDeleted: true,
    deletedAt: Date.now()
  }
);

res.status(200).json({
  success: true,
  message: "Appointment deleted successfully"
});
} catch (error) {
res.status(500).json({
  success: false,
  message: "Failed to delete appointment",
  error: error.message
});
}
};

// @desc    Get appointments by department
// @route   GET /api/appointments/department/:departmentId
// @access  Private/Admin
export const getAppointmentsByDepartment = async (req, res) => {
try {
const { departmentId } = req.params;
const { status } = req.query;

// Validate department exists
const department = await Department.findById(departmentId);
if (!department) {
  return res.status(404).json({
    success: false,
    message: "Department not found"
  });
}

let query = { department: departmentId };

// Filter by status if provided
if (status) {
  query.status = status;
}

const appointments = await Appointment.find(query)
  .sort({ date: 1, timeSlot: 1 });

res.status(200).json({
  success: true,
  count: appointments.length,
  data: appointments
});
} catch (error) {
res.status(500).json({
  success: false,
  message: "Error fetching department appointments",
  error: error.message
});
}
};

// @desc    Get available time slots for a doctor on a specific date
// @route   GET /api/appointments/availability/:doctorId
// @access  Private
export const getAvailableTimeSlots = async (req, res) => {
try {
const { doctorId } = req.params;
const { date } = req.query;

if (!date) {
  return res.status(400).json({
    success: false,
    message: "Date parameter is required"
  });
}

const appointmentDate = new Date(date);

// Check if doctor exists
const doctor = await Doctor.findById(doctorId);
if (!doctor) {
  return res.status(404).json({
    success: false,
    message: "Doctor not found"
  });
}

// Get doctor's working hours (assuming these fields exist in the Doctor model)
const workingHours = {
  start: doctor.workingHoursStart || '09:00',
  end: doctor.workingHoursEnd || '17:00'
};

// Generate all possible time slots for the day based on working hours
const allSlots = generateTimeSlots(workingHours.start, workingHours.end, 30);

// Get booked appointments for this doctor on this date
const bookedAppointments = await Appointment.find({
  doctor: doctorId,
  date: appointmentDate,
  status: { $nin: ['Cancelled'] }
});

const bookedSlots = bookedAppointments.map(app => app.timeSlot);

// Filter out booked slots
const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

res.status(200).json({
  success: true,
  data: {
    doctor: doctor.name,
    date: appointmentDate.toISOString().split('T')[0],
    availableSlots,
    bookedSlots
  }
});
} catch (error) {
res.status(500).json({
  success: false,
  message: "Failed to fetch available time slots",
  error: error.message
});
}
};

// Helper function to generate time slots
function generateTimeSlots(startTime, endTime, intervalMinutes) {
const slots = [];
let currentTime = startTime;

while (currentTime < endTime) {
slots.push(currentTime);

// Add interval
const [hours, minutes] = currentTime.split(':').map(Number);
const date = new Date();
date.setHours(hours, minutes + intervalMinutes, 0, 0);

// Format back to HH:MM
currentTime = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

return slots;
}
