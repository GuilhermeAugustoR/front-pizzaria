import axios, { AxiosResponse } from "axios";
import api from "../api";

export const DetailUser = async () => {
  try {
    const response: AxiosResponse = await api.get("detailUser");

    return response.data;
  } catch (error) {
    return error;
  }
};

interface ILogin {
  email: string;
  password: string;
}

export const AuthLogin = async ({ email, password }: ILogin) => {
  try {
    const body = { email, password };

    const response: AxiosResponse = await api.post("session", body);

    return response.data;
  } catch (error) {
    return error;
  }
};

export const CreateUser = async () => {
  try {
    const dataToSend = { name: "John Doe", age: 25 };

    const response: AxiosResponse = await api.post("session", dataToSend);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
    } else {
      console.error("General error:", error);
    }
  }
};
