import BASE_URL from "./Baseurl";
import axios from "axios";

export const searchMedicines=async(filters={})=>{
const response=await axios.get(`${BASE_URL}/api/medicine`,{params:filters});
return response.data.data;
}

export const getMedicine =async(id)=>{
        const response=await axios.get(`${BASE_URL}/medicine/${id}`);
        return response.data;
}

export const addMedicine =async(medicineData,imageFile)=>{
        const formData=new FormData();
        formData.append("image",imageFile);
        //append all medicine data to form data
        Object.keys(medicineData).forEach((key)=>{
                formData.append(key,medicineData[key]);
        })
        const response=await axios.post(`${BASE_URL}/medicine`,formData,{
            headers:{
                "Content-Type":"multipart/form-data",
                Authorization:`Bearer ${localStorage.getItem("token")}`
            }
        });
        return response.data.data;
}

export const updateMedicine = async (id, medicineData, imageFile) => {
    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    // Append all medicine data
    Object.keys(medicineData).forEach(key => {
      formData.append(key, medicineData[key]);
    });
    
    const response = await axios.put(`${BASE_URL}/api/medicines/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  };
  
  export const deleteMedicine = async (id) => {
    const response = await axios.delete(`${BASE_URL}/api/medicines/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data.data;
  };