// hooks/useMedicines.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  searchMedicines, 
  getMedicine, 
  addMedicine, 
  updateMedicine, 
  deleteMedicine 
} from '../API/medicineApi';

export const useSearchMedicines = (filters) => {
  return useQuery(
    ['medicines', filters], 
    () => searchMedicines(filters),
    {
      enabled: !!filters, // Only run query when filters are provided
      staleTime: 1000 * 60 * 5 // 5 minutes
    }
  );
};

export const useGetMedicine = (id) => {
  return useQuery(
    ['medicine', id], 
    () => getMedicine(id),
    {
      enabled: !!id // Only run query when ID is provided
    }
  );
};

export const useAddMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ medicineData, imageFile }) => addMedicine(medicineData, imageFile),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medicines');
      }
    }
  );
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    ({ id, medicineData, imageFile }) => updateMedicine(id, medicineData, imageFile),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medicines');
      }
    }
  );
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation(
    (id) => deleteMedicine(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('medicines');
      }
    }
  );
};