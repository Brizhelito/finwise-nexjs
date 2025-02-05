"use client";
import { useState, FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  TextField,
  Button,
  Box,
  Typography,
  Container,
  Alert,
  CircularProgress,
} from "@mui/material";
import { toast } from "sonner";
import axios from "axios";

type FormState = {
  email: string;
  password: string;
};

type FormStatus = {
  loading: boolean;
  error: string | null;
  needsVerification: boolean;
};
const Login = () => {
  const { login } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<FormState>({
    email: "",
    password: "",
  });

  const [status, setStatus] = useState<FormStatus>({
    loading: false,
    error: null,
    needsVerification: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: null, needsVerification: false });
    try {
      await login(formData.email, formData.password);
      setStatus({ loading: false, error: null, needsVerification: false });
            router.push("/dashboard");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      const needsVerification = errorMessage.includes("activa");
      setStatus({
        loading: false,
        error: errorMessage,
        needsVerification,
      });
    }
  };
  const resendVerificationEmail = async () => {
    try {
      setStatus((prev) => ({ ...prev, loading: true }));
      await axios.post("/api/auth/resend-verification", {
        email: formData.email,
      });
      toast.success("Correo de verificación reenviado exitosamente");
    } catch {
      toast.error("Error al reenviar el correo de verificación");
    } finally {
      setStatus((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <Container
      maxWidth="xs"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          backgroundColor: "background.paper",
          borderRadius: 2,
          boxShadow: 3,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          textAlign="center"
          color="primary.main"
        >
          Bienvenido de nuevo
        </Typography>

        <Typography
          variant="body1"
          textAlign="center"
          mb={4}
          color="text.secondary"
        >
          Ingresa a tu cuenta y retoma el control de tus finanzas
        </Typography>
        {status.error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              padding: 2,
              fontSize: "1rem",
            }}
            action={
              status.needsVerification && (
                <Button
                  color="inherit"
                  size="small"
                  onClick={resendVerificationEmail}
                  disabled={status.loading}
                  sx={{
                    marginLeft: 2,
                    fontWeight: "bold",
                  }}
                >
                  {status.loading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    "Reenviar correo"
                  )}
                </Button>
              )
            }
          >
            <Box>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Cuenta sin activar.
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                ¿Reenviar correo de activación?
              </Typography>
            </Box>
          </Alert>
        )}

        <Box display="flex" flexDirection="column" gap={3}>
          <TextField
            label="Correo Electrónico"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="email"
          />

          <TextField
            label="Contraseña"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            fullWidth
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={status.loading}
            fullWidth
            sx={{ mt: 2 }}
          >
            {status.loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Iniciar Sesión"
            )}
          </Button>
        </Box>

        <Box textAlign="center" mt={4}>
          <Button
            component={Link}
            href="/recover"
            variant="text"
            size="small"
            sx={{ textTransform: "none" }}
          >
            ¿Olvidaste tu contraseña?
          </Button>

          <Typography variant="body2" mt={2} color="text.secondary">
            ¿No tienes cuenta?{" "}
            <Button
              component={Link}
              href="/signup"
              variant="text"
              size="small"
              sx={{ textTransform: "none", display: "inline" }}
            >
              Regístrate ahora
            </Button>
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

Login.layout = "public";

export default Login;
