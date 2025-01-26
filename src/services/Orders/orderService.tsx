import { AxiosResponse } from "axios";
import api from "../api";

const token = localStorage.getItem("token");

export const ListOrders = async () => {
  try {
    const response: AxiosResponse = await api.get(`orders`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
export const DetailOrders = async (order_id: string) => {
  try {
    const response: AxiosResponse = await api.get(`order/detail${order_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

interface IAddItemToOrder {
  order_id: string;
  product_id: string;
  amount: number;
}

export const AddItemToOrder = async ({
  amount,
  order_id,
  product_id,
}: IAddItemToOrder) => {
  const body = {
    amount,
    order_id,
    product_id,
  };

  try {
    const response: AxiosResponse = await api.post("order/add", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

interface IEditItemToOrder {
  product_id: string;
  newAmount: number;
}
export const EditItemToOrder = async ({
  newAmount,
  product_id,
}: IEditItemToOrder) => {
  const body = {
    newAmount,
    product_id,
  };

  try {
    const response: AxiosResponse = await api.put("order/update", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

interface ICreateOrder {
  table: number;
  name: string;
}
export const CreateOrder = async ({ name, table }: ICreateOrder) => {
  const body = {
    name,
    table,
  };

  try {
    const response: AxiosResponse = await api.post("order", body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

export const SendOrder = async (order_id: string) => {
  const body = {
    order_id,
  };
  try {
    const response: AxiosResponse = await api.put(`order/send`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

export const CancelOrder = async (item_id: string) => {
  try {
    const response: AxiosResponse = await api.delete(`order/delete`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        item_id, // O Axios adiciona automaticamente na query string
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

export const FinishOrder = async (order_id: string) => {
  const body = {
    order_id,
  };
  try {
    const response: AxiosResponse = await api.put(`order/finish`, body, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};
