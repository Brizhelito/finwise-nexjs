"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Link,
  Paper,
  Grid,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";

const ResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setErrorMessage("Enlace de recuperación inválido");
        return;
      }
      try {
        await axios.post("/api/auth/verify-token", { token });
        setTokenValid(true);
      } catch (error) {
        setTokenValid(false);
        setErrorMessage(
          (error as Error).message || "El enlace ha expirado o es inválido"
        );
      }
    };

    verifyToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/reset-password", {
        token,
        newPassword,
      });
      toast.success("Contraseña actualizada correctamente");
      router.push("/login");
    } catch (error) {
      toast.error(
        (error as Error).message || "Error al actualizar la contraseña"
      );
    } finally {
      setLoading(false);
    }
  };

  if (tokenValid === null) {
    return (
      <Container maxWidth="xs" sx={{ mt: 10, mb: 4, textAlign: "center" }}>
        <CircularProgress size={50} thickness={4} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Verificando seguridad del enlace...
        </Typography>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Container maxWidth="xs" sx={{ mt: 10, mb: 4, textAlign: "center" }}>
        <LockResetIcon color="error" sx={{ fontSize: 50, mb: 1 }} />
        <Typography variant="h5" gutterBottom color="error">
          Enlace no válido
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          {errorMessage}. Por favor solicita un nuevo enlace de recuperación.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/recover")}>
          Obtener nuevo enlace
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xs" sx={{ mt: 10, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <LockResetIcon color="primary" sx={{ fontSize: 50 }} />
          <Typography variant="h5" gutterBottom sx={{ mt: 1 }}>
            Nueva Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea una nueva contraseña segura.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            • Mínimo 8 caracteres
            <br />
            • Incluir números y caracteres especiales
            <br />• Diferente de contraseñas anteriores
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Nueva Contraseña"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
                required
                disabled={loading}
                helperText="Mínimo 8 caracteres"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Confirmar Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading}
                sx={{ height: 45 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Establecer Nueva Contraseña"
                )}
              </Button>
            </Grid>

            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Link
                href="/login"
                variant="body2"
                underline="hover"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/login");
                }}
              >
                Volver al inicio de sesión
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
