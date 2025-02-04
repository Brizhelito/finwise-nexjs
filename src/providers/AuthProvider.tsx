"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios, { AxiosError } from "axios";
import { toast } from "sonner"; // Importar Sonner
import { useUser } from "@/context/UserContext";
export interface AuthContextProps {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Proveedor de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado para manejar la carga
  const { login: userLogin, logout : userLogout } = useUser();
  // Verificar si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    const checkAuthStatus = async () => {
      setIsLoading(true); // Inicia el estado de carga
      try {
        const response = await axios.get("/api/auth/status", {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false); // Termina el estado de carga
      }
    };

    checkAuthStatus();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true); // Inicia el estado de carga
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true } // Habilita el uso de cookies
      );
      setIsAuthenticated(true);
      userLogin(response.data.user);
      toast.success("¡Inicio de sesión exitoso!"); // Muestra notificación de éxito
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setIsAuthenticated(false);
      toast.error(
        ((error as AxiosError).response?.data as { message: string })
          ?.message || "Error al iniciar sesión"
      ); // Muestra notificación de error
    } finally {
      setIsLoading(false); // Termina el estado de carga
    }
  };

  // Logout
  const logout = async () => {
    try {
      setIsLoading(true); // Inicia el estado de carga
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      userLogout();
      toast.success("¡Sesión cerrada correctamente!"); // Muestra notificación de éxito
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error(
        ((error as AxiosError).response?.data as { message: string })
          ?.message || "Error al cerrar sesión"
      ); // Muestra notificación de error
    } finally {
      setIsLoading(false); // Termina el estado de carga
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
