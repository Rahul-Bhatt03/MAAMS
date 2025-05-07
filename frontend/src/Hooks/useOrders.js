import {useQuery,useMutation,useQueryClient} from 'react-query';
import {addOrder,createOrder,deleteOrder,getAllOrders,getOrders,getUserOrders,updateOrder, updateOrderStatus} from '../API/orderApi';

export const useCreateOrder=()=>{
    const queryClient=useQueryClient()
    return useMutation(
        createOrder,{
            onSuccess:()=>{
                queryClient.invalidateQueries('orders')
                queryClient.invalidateQueries('useOrders')
            }
        }
    )
}

export const useUserOrders=()=>{
    return useQuery(
        'userOrders',getUserOrders,{
            staleTime:1000*60*5
        }
    )
}

export const useGetOrder=(id)=>{
    return useQuery(
        ['order',id],()=>getOrders(id),{
            enabled:!!id
        }
    )
}

export const useUpdateOrderStatus=()=>{
    const queryClient=useQueryClient()
    return useMutation(({id,...statusData})=>
        updateOrderStatus(id,statusData),{
            onSuccess:()=>{
queryClient.invalidataeQueries('orders')
queryClient.invalidataeQueries('useOrders')
            }
        }
    )
}

export const updateDeliveryLocation=()=>{
    const queryClient=useQueryClient()
    return useMutation(({id,...locationData})=>updateDeliveryLocation(id,locationData),{
        onSuccess:(data,variables)=>{
 queryClient.invalidataeQueries(['order',variables.id])
        }
    })
}

export const useAllOrders=()=>{
    return useQuery(['orders',flters],
        ()=>getAllOrders(filters),
        {
            enabled:!!filters,
            staleTime:1000*60*5
        }
    )
}