import axios from 'axios'
import Payment from '../models/Payment.js'
import stripePackage from 'stripe'
// import { Transaction } from 'mongodb'
// import { connection } from 'mongoose'
const stripe=stripePackage(process.env.STRIPE_SECRET_KEY)

//initiate payment based on method
const initiatePayment=async(order,paymentMethod)=>{
//create paymeent record
const payment=new Payment({
    order:order._id,
    user:order.user,
    amount:order.amount,
    method:paymentMethod,
    status:'initiated'
})

await Payment.save();

let paymentDetails={}

//based on payment method, prepare payment details
switch(paymentMethod){
    case 'esewa':
    paymentDetails=prepareEsewaPayment(order,payment);
    break;
    case 'khalti':
        paymentDetails=await prepareKhaltiPayment(order,payment);
        break;
        case 'stripe':
            paymentDetails=await prepareStripePayment(order,payment);
            break;
        case 'cash':
            paymentDetails={message:'cash payment selected , no online payment required'}
            break;
            default:
                throw new Error('invalid payment method')
}
return {
    paymentId:payment._id,
    paymentDetails:paymentDetails
}
}

// prepare esewa payment
const prepareEsewaPayment=(order,payment)=>{
    const baseUrl=process.env.NODE_ENV==='development'?'https://esewa.com.np/epay/main':'https://uat.esewa.com.np/epay/main';

    return {
        url:baseUrl,
        params:{
            amt:order.amount,
            psc:0, //service charge
            pdc:0, //delivery charge
          txAmt:0, //tax amount
          tAmt:order.amount, //total amount
          pid:payment._id.toString(), //unique payment identifier
          scd:process.env.ESEWA_MERCHANT_CODE, //merchant code
          su:`${process.env.APP_URL}/api/payments/verify/esewa`,  //success url
          fu:`${process.env.APP_URL}/payment-failed` //failure url
        }
    }
}

// prepaere khalti payment /
const prepareKhaltiPayment=async(order,payment)=>{
    try {
        // in a real time implementation, you might initiate the payment here and for the frontend interation ,we just return the needed parameters 

        return {
            publicKey:process.env.KHALTI_PUBLIC_KEY,
            productIdentifier:order._id.toString(),
            productName:`Order #${order._id.toString().substring(0,8)}`,
            amount:order.amount*100, //khalti expects amount in paisa
            paymentId:payment._id.toString(),
            verifyUrl:`${process.env.APP_URL}/api/payments/verify/khalti`,
            mobile:null  // can be pre-filled if user had mob num
        }
    } catch (error) {
console.log("khalti payment prepareation error:",error)
throw new Error('failed to initiate khalti payment')
    }
}


// prepare stripe payment 
const prepareStripePayment=async(order,payment)=>{
    try {
        // create payment intent with stripe 
        const paymentIntent=await stripe.paymentIntents.create({
            amount: order.amount * 100,
            //stripe expects amount in paisa/cents
            currency:'npr',
            metadata:{
                orderId:order._id.toString(),
                paymentId:payment._id.toString()
            },
            description:`Order #${order._id.toString().substring(0,8)}`,
            shipping:order.shippingAddress?{
                address:{
                    line1:order.shippingAddress.street,
                    city:order.shippingAddress.city,
                    state:order.shippingAddress.state,
                    postal_code:order.shippingAddress.postalCode,
                    country:order.shippingAddress.country||'NP'
                },
                name:order.user.name
            }:undefined
        })
        return {
            clientSecret:paymentIntent.client_secret,
            paymentIntentId:paymentIntent.id,
            publicKey:process.env.STRIPE_PUBLIC_KEY
        }
    } catch (error) {
        console.log("stripe payment prepareation error:",error)
            throw new Error('failed to initiate stripe payment')
    }
}


// verify esewa payment
const verifyEsewaPayment=async(data)=>{
    try {
        const {oid,amt,refId}=data;
        const verifyUrl=process.env.NODE_ENV==='development'?'https://esewa.com.np/epay/transrec':'https://uat.esewa.com.np/epay/transrec';
        const params=new URLSearchParams();
        params.append('amt',amt);
        params.append('rid',refId);
        params.append('pid',oid);
        params.append('scd',process.env.ESEWA_MERCHANT_CODE);
        const response=await axios.post(verifyUrl,params);

        //esewa returns XML response
        if(response.data.includes('success')){
            return{
                success:true,
                TransactionId:refId,
                response:response.data
            };
        }
        return {
            success:false,
            message:'esewa payment verification failed',
            response:response.data
        }
    } catch (error) {
        console.log("esewa payment verification error:",error)
        return {
            success:false,
            message:'esewa payment verification failed',
            response:error.message
        }
    }
}


// verify khalti payment
const verifyKhaltiPayment=async(data)=>{
    try {
        const {token,amount}=data;
        const response=await axios.post(
            'https://khalti.com/api/v2/payment/verify/',{token,amount},{
                headers:{
                    'Authorization':`Key ${process.env.KHALTI_SECRET_KEY}`
                }
            })
            if(response.data&&response.data.idx){
                return {
                    success:true,
                    message:'Khalti payment verified successfully',
                    response:response.data
                }
            }
            return {
                success:false,
                message:'Khalti payment verification failed',
                response:response.data
            }
    } catch (error) {
        console.log("khalti verificaation error:",error)
        return {
            success:false,
            message:'Khalti payment verification failed',
            response:error.message||error.response?.data
        }
    }
}

// verify stripepayment 
const verifyStripePayment=async(data)=>{
    try {
        const {paymentIntentId}=data;
        const paymentIntent=await stripe.paymentIntents.retrieve(paymentIntentId);

        if(paymentIntent.status==='succeeded'){
            return {
                success:true,
              transactionId:paymentIntentId,
                response:paymentIntent
            }
        }
        return {
            success:false,
            message:`payment not completed .status:${paymentIntent.status}`,
            response:paymentIntent
        }

    } catch (error) {
        console.log("stripe payment verification error:",error)
        return {
            success:false,
            message:'stripe payment verification failed',
            response:error.message||error.response?.data
        }
    }
}


//utility function to test payment gateway connections
const testPaymentGateways=async()=>{
    const results={
        esewa:false,
        khalti:false,
        stripe:false
    }
    // /test esewa connection
    try {
        const response=await axios.get(process.env.NODE_ENV==='development'?'https://esewa.com.np/epay/main':'https://uat.esewa.com.np/epay/main',{timeout:5000});
        results.esewa=response.status>=200&&response.status<300;
    } catch (error) {
        console.log("esewa connection test error:",error);
    }

// test khalti connection

try {
    const response=await axios.get('https://khalti.com/api/v2/payment/verify/',{
        timeout:5000,
        headers:{
            'Authorization':`Key ${process.env.KHALTI_SECRET_KEY}`
        },
        timeout:5000
    });
    // 401 is excepted with an empty request, it means the service is up
    results.khalti=response.status===401;
} catch (error) {
    console.log("khalti connection test error:",error);
}

// test stripe connection
try {
    const balance=await stripe.balance.retrieve();
    results.stripe=!!balance?.available;
} catch (error) {
    console.log("stripe connection test error:",error);
}

return results;
}

export {
    initiatePayment,verifyEsewaPayment,verifyKhaltiPayment,verifyStripePayment,testPaymentGateways
}
