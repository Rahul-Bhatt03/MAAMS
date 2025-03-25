import Research from '../models/researchModel.js';
import Doctor from '../models/doctorModel.js';
import Department from '../models/departmentModel.js';
import mongoose from 'mongoose';

// Get all research projects
export const getAllResearch = async (req, res) => {
  try {
    const researches = await Research.find()
      .populate('principal_investigator_id', 'name specialization')
      .populate('department_id', 'name');
    
    res.status(200).json(researches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching research projects', error: error.message });
  }
};

// Get research project by ID
export const getResearchById = async (req, res) => {
  try {
    const research = await Research.findById(req.params.id)
      .populate('principal_investigator_id')
      .populate('department_id');

    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }

    res.status(200).json(research);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching research project', error: error.message });
  }
};

// Create new research project
export const createResearch = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start_date, 
      end_date, 
      status, 
      funding_source, 
      principal_investigator_id, 
      department_id,
      attachments
    } = req.body;

    // Validate doctor exists
    const doctorExists = await Doctor.findById(principal_investigator_id);
    if (!doctorExists) {
      return res.status(404).json({ message: 'Principal investigator not found' });
    }

    // Validate department exists
    const departmentExists = await Department.findById(department_id);
    if (!departmentExists) {
      return res.status(404).json({ message: 'Department not found' });
    }

    const newResearch = new Research({
      title,
      description,
      start_date,
      end_date,
      status,
      funding_source,
      principal_investigator_id,
      department_id,
      attachments: attachments || []
    });

    const savedResearch = await newResearch.save();
    res.status(201).json(savedResearch);
  } catch (error) {
    res.status(400).json({ message: 'Error creating research project', error: error.message });
  }
};

// Update research project
export const updateResearch = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      start_date, 
      end_date, 
      status, 
      funding_source, 
      principal_investigator_id, 
      department_id,
      attachments
    } = req.body;

    // Validate doctor exists if provided
    if (principal_investigator_id) {
      const doctorExists = await Doctor.findById(principal_investigator_id);
      if (!doctorExists) {
        return res.status(404).json({ message: 'Principal investigator not found' });
      }
    }

    // Validate department exists if provided
    if (department_id) {
      const departmentExists = await Department.findById(department_id);
      if (!departmentExists) {
        return res.status(404).json({ message: 'Department not found' });
      }
    }

    const updatedResearch = await Research.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        start_date,
        end_date,
        status,
        funding_source,
        principal_investigator_id,
        department_id,
        attachments,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    ).populate('principal_investigator_id').populate('department_id');

    if (!updatedResearch) {
      return res.status(404).json({ message: 'Research project not found' });
    }

    res.status(200).json(updatedResearch);
  } catch (error) {
    res.status(400).json({ message: 'Error updating research project', error: error.message });
  }
};

// Soft delete research project
export const deleteResearch = async (req, res) => {
  try {
    const research = await Research.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: Date.now()
      },
      { new: true }
    );

    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }

    res.status(200).json({ message: 'Research project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting research project', error: error.message });
  }
};

// Add attachment to research project
export const addAttachment = async (req, res) => {
  try {
    const { name, url, type } = req.body;
    
    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }
    
    research.attachments.push({
      name,
      url,
      type,
      uploaded_at: Date.now()
    });
    
    research.updatedAt = Date.now();
    await research.save();
    
    res.status(200).json(research);
  } catch (error) {
    res.status(400).json({ message: 'Error adding attachment', error: error.message });
  }
};

// Remove attachment from research project
export const removeAttachment = async (req, res) => {
  try {
    const { attachmentId } = req.body;
    
    const research = await Research.findById(req.params.id);
    
    if (!research) {
      return res.status(404).json({ message: 'Research project not found' });
    }
    
    research.attachments = research.attachments.filter(
      attachment => attachment._id.toString() !== attachmentId
    );
    
    research.updatedAt = Date.now();
    await research.save();
    
    res.status(200).json(research);
  } catch (error) {
    res.status(400).json({ message: 'Error removing attachment', error: error.message });
  }
};

// Get research projects by department
export const getResearchByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    
    const researches = await Research.find({ department_id: departmentId })
      .populate('principal_investigator_id', 'name specialization')
      .populate('department_id', 'name');
    
    res.status(200).json(researches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching research projects', error: error.message });
  }
};

// Get research projects by principal investigator
export const getResearchByInvestigator = async (req, res) => {
  try {
    const { investigatorId } = req.params;
    
    const researches = await Research.find({ principal_investigator_id: investigatorId })
      .populate('principal_investigator_id', 'name specialization')
      .populate('department_id', 'name');
    
    res.status(200).json(researches);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching research projects', error: error.message });
  }
};