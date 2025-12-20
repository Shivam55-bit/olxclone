// src/apis/productApi.js
import api from "./api";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Get All Products
export const getProducts = async () => {
  const res = await api.get("/products");
  return res.data;
};

// ✅ Get Single Product by ID
export const getProductById = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

// ✅ Add New Product
export const addProduct = async (data) => {
  const token = await AsyncStorage.getItem("token");
  const res = await api.post("/products", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Update Product
export const updateProduct = async (id, data) => {
  const token = await AsyncStorage.getItem("token");
  const res = await api.put(`/products/${id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// ✅ Delete Product
export const deleteProduct = async (id) => {
  const token = await AsyncStorage.getItem("token");
  const res = await api.delete(`/products/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
