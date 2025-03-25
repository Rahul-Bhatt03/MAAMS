import Doctor from '../models/doctorModel.js';
import Department from '../models/departmentModel.js';
import mongoose from 'mongoose';

// Get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .populate('department', 'name description');
    
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// Get single doctor by ID
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('department', 'name description');

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor', error: error.message });
  }
};

// Create new doctor
export const createDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      specialization, 
      experience, 
      qualifications, 
      department, 
      availableSlots 
    } = req.body;

    // Handle the uploaded image from Cloudinary
    const profilePic = req.file ? req.file.path : null;

    // Validate department exists
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
      }
    }

    const newDoctor = new Doctor({
      name,
      email,
      phone,
      specialization,
      profilePic,
      experience,
      qualifications: qualifications || [],
      department,
      availableSlots: availableSlots || []
    });

    const savedDoctor = await newDoctor.save();

    // Add doctor to department
    if (department) {
      await Department.findByIdAndUpdate(department, {
        $push: { doctors: savedDoctor._id }
      });
    }

    res.status(201).json(savedDoctor);
  } catch (error) {
    res.status(400).json({ message: 'Error creating doctor', error: error.message });
  }
};

// Update doctor
export const updateDoctor = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      specialization, 
      isActive,
      experience, 
      qualifications, 
      department, 
      availableSlots 
    } = req.body;

    // Handle the uploaded image from Cloudinary
    const profilePic = req.file ? req.file.path : undefined;

    // Check if department is changing
    const oldDoctor = await Doctor.findById(req.params.id);
    const oldDepartment = oldDoctor?.department;
    
    // Validate department exists if provided
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
      }
    }

    // Prepare update data, only including profilePic if a new file was uploaded
    const updateData = {
      name,
      email,
      phone,
      specialization,
      isActive,
      experience,
      qualifications,
      department,
      availableSlots,
      updatedAt: Date.now()
    };

    // Only update profilePic if a new image was uploaded
    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department');

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Update department references if department has changed
    if (department && oldDepartment && department.toString() !== oldDepartment.toString()) {
      // Remove from old department
      await Department.findByIdAndUpdate(oldDepartment, {
        $pull: { doctors: req.params.id }
      });
      
      // Add to new department
      await Department.findByIdAndUpdate(department, {
        $push: { doctors: req.params.id }
      });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(400).json({ message: 'Error updating doctor', error: error.message });
  }
};

// Delete doctor
export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Remove doctor from department
    if (doctor.department) {
      await Department.findByIdAndUpdate(doctor.department, {
        $pull: { doctors: doctor._id }
      });
    }
    
    // Delete the doctor
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error: error.message });
  }
};

// Get doctors by department
export const getDoctorsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const doctors = await Doctor.find({ department: departmentId })
      .populate('department', 'name description');
    
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error: error.message });
  }
};

// Update doctor availability
export const updateAvailability = async (req, res) => {
  try {
    const { availableSlots } = req.body;
    
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    doctor.availableSlots = availableSlots;
    doctor.updatedAt = Date.now();
    await doctor.save();
    
    res.status(200).json(doctor);
  } catch (error) {
    res.status(400).json({ message: 'Error updating doctor availability', error: error.message });
  }
};