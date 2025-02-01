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

type FormState = {
  email: string;
  password: string;
};

type FormStatus = {
  loading: boolean;
  error: string | null;
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
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus({ loading: true, error: null });

    try {
      await login(formData.email, formData.password);
      router.push("/dashboard");
    } catch (error) {
      setStatus({
        loading: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      });
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
          <Alert severity="error" sx={{ mb: 3 }}>
            {status.error}
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
