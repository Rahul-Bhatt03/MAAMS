// api/paymentApi.js
import axios from 'axios';
import BASE_URL from './Baseurl';

export const verifyPayment = async (paymentData) => {
  const response = await axios.post(`${BASE_URL}/api/payments/verify`, paymentData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const getPaymentStatus = async (orderId) => {
  const response = await axios.get(`${BASE_URL}/api/payments/status/${orderId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const processRefund = async (refundData) => {
  const response = await axios.post(`${BASE_URL}/api/payments/refund`, refundData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const testPaymentGateways = async () => {
  const response = await axios.get(`${BASE_URL}/api/payments/test-connections`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};