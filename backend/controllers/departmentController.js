import Department from '../models/departmentModel.js';

// Get all departments
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find().populate('doctors');
    res.status(200).json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error: error.message });
  }
};

// Get single department by ID
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('doctors')
      .populate({
        path: 'appointments',
        match: { isDeleted: { $ne: true } }
      });

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error: error.message });
  }
};

// Create new department
export const createDepartment = async (req, res) => {
  try {
    const { name, description, services, timings } = req.body;

    const newDepartment = new Department({
      name,
      description,
      services: services || [],
      timings,
      doctors: [],
      appointments: []
    });

    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating department', error: error.message });
  }
};

// Update department
export const updateDepartment = async (req, res) => {
  try {
    const { name, description, services, timings } = req.body;

    const updatedDepartment = await Department.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        services,
        timings,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedDepartment) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json(updatedDepartment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department', error: error.message });
  }
};

// Soft delete department
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: Date.now()
      },
      { new: true }
    );

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error: error.message });
  }
};

// Add doctor to department
export const addDoctorToDepartment = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Check if doctor is already in department
    if (department.doctors.includes(doctorId)) {
      return res.status(400).json({ message: 'Doctor is already in this department' });
    }

    department.doctors.push(doctorId);
    department.updatedAt = Date.now();
    await department.save();

    res.status(200).json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error adding doctor to department', error: error.message });
  }
};

// Remove doctor from department
export const removeDoctorFromDepartment = async (req, res) => {
  try {
    const { doctorId } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    department.doctors = department.doctors.filter(
      doctor => doctor.toString() !== doctorId
    );

    department.updatedAt = Date.now();
    await department.save();

    res.status(200).json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error removing doctor from department', error: error.message });
  }
};
