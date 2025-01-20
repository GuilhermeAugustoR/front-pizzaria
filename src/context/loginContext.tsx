import { AuthLogin } from "@/services/Login/loginService";
import React, { createContext, useState } from "react";

interface IUser {
  id: number | string;
  name: string;
  email: string;
}
interface ILogin {
  email: string;
  password: string;
}

interface LoginContextType {
  user: IUser;
  setUser: React.Dispatch<React.SetStateAction<IUser>>;
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  signIn: ({ email, password }: ILogin) => Promise<void>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
}

export const LoginContext = createContext({} as LoginContextType);

interface Prop {
  children: React.ReactNode;
}

export const LoginProvider = ({ children }: Prop) => {
  const [user, setUser] = useState<IUser>({ id: "", name: "", email: "" });
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const signIn = async ({ email, password }: ILogin) => {
    setError("");
    setIsLoading(true);

    try {
      const response = await AuthLogin({ email, password });

      if (response.status === 400) {
        console.log("aqui", response);
        setError(response.response.data.error);
        setIsLoading(false);
        return;
      }

      setUser({
        id: response?.id,
        name: response.name,
        email: response.email,
      });

      localStorage.setItem("token", response.token);
      setToken(response.token);
      setIsLoading(false);
      //   setTimeout(() => {}, 1000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <LoginContext.Provider
      value={{
        signIn,
        user,
        setUser,
        token,
        setToken,
        error,
        setError,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
