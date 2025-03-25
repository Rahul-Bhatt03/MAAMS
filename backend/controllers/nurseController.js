import Department from "../models/departmentModel";
import Nurse from "../models/nurseModel";

export const getAllNurse = async (req, res) => {
  try {
    const nurses = await Nurse.find().populate(
      "department",
      "name description"
    );

    res.status(200).json(nurses);
  } catch (error) {
    res
      .status(500)
      .json({ message: "error fetching nurses", error: error.message });
  }
};

export const getNurseById = async (req, res) => {
  try {
    const nurse = await Nurse.findById(req.params.id).populate(
      "department",
      "name description"
    );

    if (!nurse) return res.status(400).json({ message: "nurse not found" });
    res.status(200).json(nurse);
  } catch (error) {
    res
      .status(500)
      .json({ message: "error fetching nurse", error: error.message });
  }
};

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
    } = req.body;
    const profilePic = req.file ? req.file.path : null;

    //validate department exists
    if (department) {
      const departmentExists = await Department.findById(department);
      if (!departmentExists)
        return res.status(404).json({ message: "department not found" });
    }

    const newNurse=new Nurse({
        name, 
        email, 
        phone, 
        specialization, 
        experience, 
        qualifications:qualifications||null, 
        department,
        shift:shift||'morning'
    })

    const savedNurse=await newNurse.save()

    //add nurse to department
    if (department){
        await Department.findByIdAndUpdate(department,{
            $push:{nurses:savedNurse.id}
        })
    }

    res.status(200).json(savedNurse)
  } catch (error) {
    res.status(400).json({message:"error creating new nurse",error:error.message})
  }
};

export const
