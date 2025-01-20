import { AxiosResponse } from "axios";
import api from "../api";

const token = localStorage.getItem("token");

export const ListProduct = async (categoryId: string) => {
  try {
    const response: AxiosResponse = await api.get(
      `/category/product?${categoryId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    return error;
  }
};

export const CreateProduct = async (data: FormData) => {
  try {
    const response: AxiosResponse = await api.post("product", data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
