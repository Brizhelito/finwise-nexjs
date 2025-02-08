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

// Definir el contexto de autenticación
export interface AuthContextProps {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Crear el contexto
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Proveedor de autenticación
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem("isAuthenticated") === "true"
  );

  const { login: userLogin, logout: userLogout } = useUser();

  // Verificar si el usuario ya está autenticado al cargar la página
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get("/api/auth/status", {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.isAuthenticated);
        localStorage.setItem(
          "isAuthenticated",
          String(response.data.isAuthenticated)
        );
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        setIsAuthenticated(false);
        localStorage.removeItem("isAuthenticated");
      }
    };

    checkAuthStatus();
  }, []);

  // Login
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(
        "/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      setIsAuthenticated(true);
      localStorage.setItem("isAuthenticated", "true");
      userLogin(response.data.user);

      toast.success("¡Inicio de sesión exitoso!");
    } catch (error: unknown) {
      // Explicitly type error as unknown initially
      let errorMessage = "Error al iniciar sesión";

      if (error instanceof AxiosError) {
        // Use instanceof type guard
        if (!error.response) {
          errorMessage =
            "No se pudo conectar al servidor. Por favor, verifica tu conexión a internet.";
        } else {
          const statusCode = error.response.status;
          switch (statusCode) {
            case 400: // Bad Request - Puede incluir errores de validación o formato incorrecto
              errorMessage =
                error.response.data?.error ||
                "Error en la solicitud. Verifica tus datos.";
              break;
            case 401: // Unauthorized - Credenciales incorrectas
              errorMessage =
                "Credenciales inválidas. Por favor, verifica tu email y contraseña.";
              break;
            case 429: // Too Many Requests - Rate limit
              errorMessage =
                error.response.data?.error ||
                "Has realizado demasiados intentos. Por favor, inténtalo de nuevo más tarde.";
              break;
            case 500: // Internal Server Error
              errorMessage =
                "Error del servidor al iniciar sesión. Por favor, inténtalo de nuevo más tarde.";
              break;
            default: // Otros errores de axios con respuesta
              errorMessage =
                error.response.data?.error ||
                `Error al iniciar sesión (Código de estado: ${statusCode})`;
          }
        }
      } else {
        errorMessage = "Ocurrió un error inesperado al iniciar sesión.";
      }

      console.error("Error al iniciar sesión:", errorMessage, error);
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      toast.error(errorMessage);
      throw new Error(errorMessage); // Lanzar el error para que el componente superior pueda manejarlo si es necesario
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      setIsAuthenticated(false);
      localStorage.removeItem("isAuthenticated");
      userLogout();
      toast.success("¡Sesión cerrada correctamente!");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error(
        ((error as AxiosError).response?.data as { message: string })
          ?.message || "Error al cerrar sesión"
      );
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
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
