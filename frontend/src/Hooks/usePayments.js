import {useQuery,useQueryClient,useMutation} from 'react-query';
import { getPaymentStatus, testPaymentGateways, verifyPayment } from '../API/paymentApi';

export const useVerifyPayment=()=>{
    return useMutation(verifyPayment)
}

export const usePaymentStatus=(orderId)=>{
return useQuery(
    ['paymentStatus',orderId],
    ()=>getPaymentStatus(orderId),
    {enabled:!!orderId}
)
}

export const useProcessRefund=()=>{
    return useMutation(processRefund)
}

export const useTestPaymentGateways=()=>{
    return useQuery('paymentGatewaysTest',testPaymentGateways,{
        staleTime:1000*60*5
    })
}