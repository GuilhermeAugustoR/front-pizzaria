import Category from "@/pages/Category";
import Login from "@/pages/Login";
import PageNotFound from "@/pages/PageNotFound";
import { createBrowserRouter, Navigate } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import Home from "@/pages/Home";
import Products from "@/pages/Products";

const isAuthenticated = !!localStorage.getItem("token");

export const router = createBrowserRouter([
  // Rota Inicial Redirecionando para Login
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  // Rota Pública
  {
    path: "/login",
    element: isAuthenticated ? <Navigate to="/home" replace /> : <Login />,
  },
  // Rotas Protegidas
  {
    path: "/",
    element: <ProtectedRoute isAuthenticated={isAuthenticated} />,
    children: [
      { path: "/home", element: <Home /> },
      { path: "/categoria", element: <Category /> },
      { path: "/produtos", element: <Products /> },
    ],
  },
  // Rota para Página Não Encontrada
  {
    path: "*",
    element: <PageNotFound />,
  },
]);
