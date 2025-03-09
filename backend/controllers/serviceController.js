import Service from "../models/serviceModel.js";
import { cloudinary } from "../config/cloudinary.js";

//no authenticaion required and also excludes sot-deleted ones
export const getAllServices = async (req, res) => {
  try {
    const Services = await Service.find({ isActive: true }).populate("doctors");
    res.status(200).json(Services);
  } catch (error) {
    res.status(500).json({ message: "fething failed", error: error.message });
  }
};

//no authenticaion required and also excludes sot-deleted ones
export const getServicesById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.Params.id,
      isActive: true,
    }).populate("doctors");
    if (!service)
      return res
        .status(404)
        .json({ message: "service not found or has been deleted" });
    res.status(200).json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "fetching by id failed", error: error.message });
  }
};

// ✅ Create New Service (Requires Authentication)
export const createService = async (req, res) => {
    try {
      const { name, category, description, availability, pricing, insuranceAccepted } = req.body;
  
      if (!req.file) return res.status(400).json({ message: "Image is required" });
  
      const imageUrl = req.file.path;
  
      const newService = new Service({
        name,
        category,
        description,
        image: imageUrl,
        availability,
        pricing,
        insuranceAccepted,
      });
  
      await newService.save();
      res.status(201).json(newService);
    } catch (error) {
      res.status(500).json({ message: "Error creating service", error });
    }
  };

// update service and requires authentication
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    let service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "service not found" });
    const updates = req.body;
    if (req.file) {
      await cloudinary.uploader.destroy(service.image); //delete the old image
      updates.image = req.file.path;
    }
    service = await Service.findByIdAndUpdate(id, updates, { new: true });
    res.status(200).json(service);
  } catch (error) {
    res
      .status(500)
      .json({ message: "updating service failed", error: error.message });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    let service = await Service.findById(id);
    if (!service) return res.status(404).json({ message: "service not found" });
    
    service.isActive = false;
    await service.save(
      res.status(200).json({ message: "service has been soft deleted" })
    );
  } catch (error) {
    res
      .status(500)
      .json({ message: "updating service failed", error: error.message });
  }
};
