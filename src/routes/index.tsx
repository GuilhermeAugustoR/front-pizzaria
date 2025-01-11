import Category from "@/pages/Category";
import Login from "@/pages/Login";
import PageNotFound from "@/pages/PageNotFound";
import { createBrowserRouter, Navigate } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import Home from "@/pages/Home";
import Products from "@/pages/Products";

const isAuthenticated = true;

export const router = createBrowserRouter([
    // Rotas Públicas
    {
      path: "/login",
      element: isAuthenticated ? <Navigate to="/home" replace /> : <Login />,
    },
    {
      path: "/",
      element: isAuthenticated ? <Navigate to="/home" replace /> : <Login />,
    },
  
    // Rotas Protegidas
    {
      element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
      children: [
        {
          path: "/home",
          element: <Home />,
        },
      ],
    },
    {
      element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
      children: [
        {
          path: "/categoria",
          element: <Category />,
        },
      ],
    },
    {
      element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
      children: [
        {
          path: "/produtos",
          element: <Products />,
        },
      ],
    },
  
    // Rota para Página Não Encontrada
    {
      path: "*",
      element: <PageNotFound />,
    },
  ]);
  