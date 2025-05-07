import Pharmacist from '../models/PharmacistModel.js';
import Department from '../models/departmentModel.js';
import mongoose from 'mongoose';

// Get all pharmacists (excluding soft deleted)
export const getAllPharmacists = async (req, res) => {
  try {
    const pharmacists = await Pharmacist.find()
      .populate('department', 'name description');
    
    res.status(200).json(pharmacists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacists', error: error.message });
  }
};

// Get single pharmacist by ID (including soft deleted if specified)
export const getPharmacistById = async (req, res) => {
  try {
    const { includeDeleted } = req.query;
    const query = { _id: req.params.id };
    
    if (!includeDeleted) {
      query.isDeleted = false;
    }

    const pharmacist = await Pharmacist.findOne(query)
      .populate('department', 'name description');

    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    res.status(200).json(pharmacist);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacist', error: error.message });
  }
};

// Create new pharmacist
export const createPharmacist = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      licenseNumber,
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

    const newPharmacist = new Pharmacist({
      name,
      email,
      phone,
      licenseNumber,
      profilePic,
      experience,
      qualifications: qualifications || [],
      department,
      shift: shift || 'morning'
    });

    const savedPharmacist = await newPharmacist.save();

    // Add pharmacist to department
    if (department) {
      await Department.findByIdAndUpdate(department, {
        $push: { pharmacists: savedPharmacist._id }
      });
    }

    res.status(201).json(savedPharmacist);
  } catch (error) {
    res.status(400).json({ message: 'Error creating pharmacist', error: error.message });
  }
};

// Update pharmacist
export const updatePharmacist = async (req, res) => {
  try {
    const { 
      name, 
      email, 
      phone, 
      licenseNumber,
      isActive,
      experience, 
      qualifications, 
      department,
      shift,
      profilePic
    } = req.body;

    // Check if department is changing
    const oldPharmacist = await Pharmacist.findById(req.params.id);
    const oldDepartment = oldPharmacist?.department;
    
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
      licenseNumber,
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

    const updatedPharmacist = await Pharmacist.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('department');

    if (!updatedPharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }

    // Update department references if department has changed
    if (department && oldDepartment && department.toString() !== oldDepartment.toString()) {
      // Remove from old department
      await Department.findByIdAndUpdate(oldDepartment, {
        $pull: { pharmacists: req.params.id }
      });
      
      // Add to new department
      await Department.findByIdAndUpdate(department, {
        $push: { pharmacists: req.params.id }
      });
    }

    res.status(200).json(updatedPharmacist);
  } catch (error) {
    res.status(400).json({ message: 'Error updating pharmacist', error: error.message });
  }
};

// Soft delete pharmacist
export const deletePharmacist = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findById(req.params.id);
    
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found' });
    }
    
    // Perform soft delete
    await pharmacist.softDelete();
    
    res.status(200).json({ message: 'Pharmacist soft deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting pharmacist', error: error.message });
  }
};

// Restore soft deleted pharmacist
export const restorePharmacist = async (req, res) => {
  try {
    const pharmacist = await Pharmacist.findOne({
      _id: req.params.id,
      isDeleted: true
    });
    
    if (!pharmacist) {
      return res.status(404).json({ message: 'Pharmacist not found or not deleted' });
    }
    
    // Restore the pharmacist
    await pharmacist.restore();
    
    res.status(200).json({ message: 'Pharmacist restored successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error restoring pharmacist', error: error.message });
  }
};

// Get pharmacists by department
export const getPharmacistsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const pharmacists = await Pharmacist.find({ department: departmentId })
      .populate('department', 'name description');
    
    res.status(200).json(pharmacists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacists', error: error.message });
  }
};

// Get all pharmacists including soft deleted (for admin)
export const getAllPharmacistsWithDeleted = async (req, res) => {
  try {
    const pharmacists = await Pharmacist.find({})
      .populate('department', 'name description');
    
    res.status(200).json(pharmacists);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching pharmacists', error: error.message });
  }
};