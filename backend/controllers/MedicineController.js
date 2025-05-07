import Medicine from '../models/Medicine.js'
import {cloudinary} from '../config/cloudinary.js'

const medicineController={
    //search medicine with advanced filtering
    search:async(req,res)=>{
        try {
            const {query,category,requiresPrescription,minPrice,maxPrice,inStock}=req.query;

            const filters={};

            //text search if query provided
            if(query){
                filter.$text={$search:query}
            }

            //add other filters
            if(category){
                filters.category=category
            }
            if(requiresPrescription!==undefined){
                filters.requiresPrescription=requiresPrescription==='true'
            }
            if(inStock==='true'){
                filters.inStock={$gt:0}
            }
            //price range filter
            if(minPrice||maxPrice){
                filter.price={};
                if(minPrice){
                    filter.price.$gte=minPrice
                }
                if(maxPrice){
                    filter.price.$lte=maxPrice
                }
            }

            const medicines=await Medicine.find(filters).sort(query?{score:{$meta:'textScore'}}:{name:1});
            res.status(200).json({success:true,data:medicines})
            }
         catch (error) {
        res.status(500).json({success:false,message:'failed to fetch medicines',error:error.message})   
        }
    },

    //get a single medicine by id
getMedicine:async(req,res)=>{
    try {
        const medicineId=req.params.id;
        const medicine=await Medicine.findById(medicineId);
        if(!medicine){
            return res.status(404).json({success:false,message:'medicine not found'})
        }
        res.status(200).json({success:true,data:medicine})
    } catch (error) {
        res.status(500).json({success:false,message:'failed to fetch medicine',error:error.message})
    }
},

addMedicine:async(req,res)=>{
    try {
        const medicineData=req.body;
        //if image was uploaded , add url to medicine data
        if(req.file){
            medicineData.imageUrl=req.file.path;
            medicineData.imagePublicId=req.file.filename;
        }

        const medicine=new Medicine(medicineData);
        await medicine.save();
        res.status(201).json({success:true,data:medicine});
    } catch (error) {
        //if there was an error and image was uploaded , delete the uploaded image from cloudinary 
        if(req.file){
            await cloudinary.uploader.destroy(req.file.filename);
        }
        res.status(500).json({success:false,message:'failed to create medicine',error:error.message})
    }
},

updateMedicine:async(req,res)=>{
    try {
        const medicineId=req.params.id;
        const medicine=await Medicine.findById(medicineId);
        if(!medicine){
            return res.status(404).json({success:false,message:'medicine not found'})
        }
      const updates=req.body;
      //handle image update
      if(req.file){
        //delete old image from cloudinary
        if(medicine.imagePublicId){
            await cloudinary.uploader.destroy(medicine.imagePublicId);
        }
            //add new image url
        medicine.imageUrl=req.file.path;
        medicine.imagePublicId=req.file.filename;
      }
const updatedMedicine=await Medicine.findByIdAndUpdate(medicineId,updates,{new:true});
res.status(200).json({success:true,data:updatedMedicine,runValidators:true})
res.status(200).json({success:true,data:updatedMedicine})
        }
     catch (error) {
          // If there was an error and new image was uploaded, delete it from Cloudinary
      if (req.file) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      res.status(400).json({ success: false, message: error.message });
    }
},

deleteMedicine:async(req,res)=>{
    try {
        const medicine=await Medicine.findById(req.params.id);
        if(!medicine){
            return res.status(404).json({success:false,message:'medicine not found'})
        }

        //delete image from cloudinary 
        if(medicine.imagePublicId){
            await cloudinary.uploader.destroy(medicine.imagePublicId);
        }
        await Medicine.findByIdAndDelete(req.params.id);
        res.status(200).json({success:true,data:medicine})
    } catch (error) {
        res.status(500).json({success:false,message:'failed to delete medicine',error:error.message})
    }
}


}


export default medicineController
