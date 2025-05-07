// api/orderApi.js
import axios from 'axios';
import BASE_URL from './Baseurl';

export const createOrder = async (orderData) => {
  const response = await axios.post(`${BASE_URL}/api/orders`, orderData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const getUserOrders = async () => {
  const response = await axios.get(`${BASE_URL}/api/orders/user`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const getOrder = async (id) => {
  const response = await axios.get(`${BASE_URL}/api/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const updateOrderStatus = async (id, statusData) => {
  const response = await axios.put(`${BASE_URL}/api/orders/${id}/status`, statusData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const updateDeliveryLocation = async (id, locationData) => {
  const response = await axios.put(`${BASE_URL}/api/orders/${id}/location`, locationData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};

export const getAllOrders = async (filters = {}) => {
  const response = await axios.get(`${BASE_URL}/api/orders`, {
    params: filters,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data.data;
};