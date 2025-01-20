import { AxiosResponse } from "axios";
import api from "../api";

const token = localStorage.getItem("token");

export const ListCategory = async () => {
  try {
    const response: AxiosResponse = await api.get("listCategory", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
export const CreateCategory = async (name: string) => {
  const body = {
    name,
  };

  try {
    const response: AxiosResponse = await api.post("category", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
