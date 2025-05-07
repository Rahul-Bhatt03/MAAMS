import Nurse from '../models/nurseModel.js';
import Department from '../models/departmentModel.js';
import mongoose from 'mongoose';

// Get all nurses
export const getAllNurses = async (req, res) => {
  try {
    const nurses = await Nurse.find()
      .populate('department', 'name description');
    
    res.status(200).json(nurses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nurses', error: error.message });
  }
};

// Get single nurse by ID
export const getNurseById = async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id)
      .populate('department', 'name description');

    if (!nurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    res.status(200).json(nurse);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nurse', error: error.message });
  }
};

// Create new nurse
export const createNurse = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      specialization, 
      experience, 
      qualifications, 
      department,
      shift,
      profilePic
    } = req.body;

    // Validate department exists
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
      }
    }

    const newNurse = new Nurse({
      name,
      email,
      phone,
      specialization,
      profilePic,
      experience,
      qualifications: qualifications || [],
      department,
      shift: shift || 'morning'
    });

    const savedNurse = await newNurse.save();

    // Add nurse to department
    if (department) {
      await Department.findByIdAndUpdate(department, {
        $push: { nurses: savedNurse._id }
      });
    }

    res.status(201).json(savedNurse);
  } catch (error) {
    res.status(400).json({ message: 'Error creating nurse', error: error.message });
  }
};

// Update nurse
export const updateNurse = async (req, res) => {
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
      shift,
      profilePic
    } = req.body;

    // Check if department is changing
    const oldNurse = await Nurse.findById(req.params.id);
    const oldDepartment = oldNurse?.department;
    
    // Validate department exists if provided
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
      }
    }

    // Prepare update data
    const updateData = {
      name,
      email,
      phone,
      specialization,
      isActive,
      experience,
      qualifications,
      department,
      shift,
      updatedAt: Date.now()
    };

    // Only update profilePic if provided
    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    const updatedNurse = await Nurse.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department');

    if (!updatedNurse) {
      return res.status(404).json({ message: 'Nurse not found' });
    }

    // Update department references if department has changed
    if (department && oldDepartment && department.toString() !== oldDepartment.toString()) {
      // Remove from old department
      await Department.findByIdAndUpdate(oldDepartment, {
        $pull: { nurses: req.params.id }
      });
      
      // Add to new department
      await Department.findByIdAndUpdate(department, {
        $push: { nurses: req.params.id }
      });
    }

    res.status(200).json(updatedNurse);
  } catch (error) {
    res.status(400).json({ message: 'Error updating nurse', error: error.message });
  }
};


// Soft delete nurse
export const deleteNurse = async (req, res) => {
    try {
      const nurse = await Nurse.findById(req.params.id);
      
      if (!nurse) {
        return res.status(404).json({ message: 'Nurse not found' });
      }
      
      // Remove nurse from department
      if (nurse.department) {
        await Department.findByIdAndUpdate(nurse.department, {
          $pull: { nurses: nurse._id }
        });
      }
      
      // Soft delete by setting isActive to false
      nurse.isActive = false;
      await nurse.save();
  
      res.status(200).json({ message: 'Nurse deactivated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error deactivating nurse', error: error.message });
    }
  };
  
  // Get nurses by department (only active nurses)
  export const getNursesByDepartment = async (req, res) => {
    try {
      const { departmentId } = req.params;
      
      const nurses = await Nurse.find({ department: departmentId, isActive: true })
        .populate('department', 'name description');
      
      res.status(200).json(nurses);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching nurses', error: error.message });
    }
  };
  
