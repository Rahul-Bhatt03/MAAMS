import { cloudinary } from "../config/cloudinary.js";
import MedicineRepo from "../Repositories/MedicineRepo.js";

const medicineRepo = new MedicineRepo()  //for DI we are injecting it here

class MedicineService {
    constructor(medicineRepo) {
        this.medicineRepo = medicineRepo
    }


    async serachMedicines(queryParams) {
        const { query, category, requiresPrescription, minPrice, maxPrice, inStock } = queryParams;
        const filters = {};

        if (query) filters.$text = { $search: query };
        if (category) filters.category = category;
        if (requiresPrescription !== undefined) filters.requiresPrescription = requiresPrescription === "true";
        if (inStock === "true") filters.stock = { $gt: 0 };

        if (minPrice || maxPrice) {
            filters.price = {};
            if (minPrice) filters.price.$gte = minPrice;
            if (maxPrice) filters.price.$lte = maxPrice;
        }

        const sort = query ? { score: { $meta: "textScore" } } : { name: 1 };

        return medicineRepo.search(filters, sort);
    }

    async getMedicine(id) {
        return await this.medicineRepo.findById(id);
    }

    async addMedicine(data, file) {
        try {
            if (file) {
                data.imageUrl = file.path;
                data.imagePublicUrl = file.filename;
            }
            return await this.medicineRepo.create(data);
        } catch (error) {
            if (file) await cloudinary.uploader.destroy(file.filename)
            throw error;
        }
    }

    async updateMedicine(id, data, file) {
        try {
            const medicine = await medicineRepo.findById(id);
            if (!medicine) return null;

            if (file) {
                if (medicine.imageUrl)
                    await cloudinary.uploader.destroy(medicine.imagePublicUrl);
                data.imageUrl = file.path;
                data.imagePublicUrl = file.filename;
            }
            return await this.medicineRepo.update(id, data)
        } catch (error) {
            console.log("error occured in the servide file ")
        }
    }

    async deleteMedicine(id) {
        try {
            const medicine = await this.medicineRepo.findById(id);
            if (!medicine) {
                console.log(`Medicine with the id ${id} does not exists`);
                return null;
            }
            if (medicine.imagePublicUrl) {
                await cloudinary.uploader.destroy(medicine.imagePublicUrl);
            }
            return this.medicineRepo.delete(id);
        } catch (error) {
            console.log("error deleting medicine")
        }
    }
}

export default new MedicineService(medicineRepo);