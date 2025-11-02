import Medicine from "../models/Medicine.js";

class MedicineRepo {
    async search(filter, sort) {
        return await Medicine.find(filter).sort(sort);
    }

    async findById(id) {
        return await Medicine.findById(id);
    }

    async create(medicineData) {
        const medicine = new Medicine(medicineData)
        return await medicine.save();
    }

    async update(id, updatedData) {
        return await Medicine.findByIdAndUpdate(id, { $set: updatedData }, { new: true });
    }

    async delete(id) {
        return await Medicine.findByIdAndUpdate(id, {
            isActive: false
        }, { new: true })
    }
}

export default MedicineRepo;