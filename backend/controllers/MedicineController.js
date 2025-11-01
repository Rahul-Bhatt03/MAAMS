import Medicine from '../models/Medicine.js'
import { cloudinary } from '../config/cloudinary.js'
import MedicineService from '../Services/MedicineService.js'

const medicineService=MedicineService;

const medicineController = {
 async search(req,res){
try {
    const medicines=await medicineService.serachMedicines(req.query);
    res.status(200).json({success:true,data:medicines});
} catch (error) {
    res.status(500).json({success:false,message:error.message})
}
 },

 async getMedicine(req,res){
    try {
        const medicine=await medicineService.getMedicine(req.params.id);
        if(!medicine){
            res.status(404).json({success:false,message:`medicine with id ${id} not found`})
        }
        res.status(200).json({success:true,data:medicine})
    } catch (error) {
           res.status(500).json({success:false,message:error.message})
    }
 },

 async addMedicine(req,res){
    try {
        const response=await medicineService.addMedicine(req.body,req.file);
        res.status(200).json({success:true,data:response})
    } catch (error) {
           res.status(500).json({success:false,message:error.message})
    }
 },

 async updateMedicine(req,res){
    try {
        const medicine=await medicineService.getMedicine(req.param.id);
        if(!medicine){
               res.status(404).json({success:false,message:"medicine not found"})
        }
        const response=await medicineService.updateMedicine(req.params.id,req.body,req.file);
        res.status(200).json({
            success:true,data:response
        })
    } catch (error) {
        
    }
 },

  async deleteMedicine(req, res) {
    try {
      const medicine = await medicineService.deleteMedicine(req.params.id);

      if (!medicine)
        return res.status(404).json({ success: false, message: "Medicine not found" });

      res.json({ success: true, data: medicine });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

}


export default medicineController
