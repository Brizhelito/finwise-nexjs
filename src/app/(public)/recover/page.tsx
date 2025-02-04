"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
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
  Alert,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const RecoverPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast.error("Por favor ingresa un correo electrónico válido");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/recover-password", { email });
      toast.success("Instrucciones enviadas correctamente");
      setSuccess(true);
    } catch (error) {
      toast.error(
        (error as Error).message || "Error al enviar las instrucciones"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 6, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2, mb: 4 }}>
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Link
            href="/login"
            onClick={(e) => {
              e.preventDefault();
              router.push("/login");
            }}
            sx={{ display: "inline-flex", alignItems: "center", mb: 1 }}
          >
            <ArrowBackIcon sx={{ mr: 1 }} /> Volver al login
          </Link>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <EmailIcon color="primary" sx={{ fontSize: 50 }} />
          </Box>

          <Typography variant="h5" gutterBottom>
            Recuperar Contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña.
          </Typography>
        </Box>

        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Hemos enviado un correo a <strong>{email}</strong>. Sigue las
            instrucciones para restablecer tu contraseña. Si no lo ves en tu
            bandeja principal, revisa la carpeta de spam.
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Correo Electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  disabled={loading}
                  helperText="Ingresa el correo asociado a tu cuenta"
                  autoComplete="email"
                  inputProps={{
                    "aria-label":
                      "Correo electrónico para recuperación de contraseña",
                  }}
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
                    "Enviar Instrucciones"
                  )}
                </Button>
              </Grid>

              <Grid item xs={12}>
                <Alert severity="info" sx={{ mt: 1 }}>
                  ¿No recibiste el correo? Revisa tu carpeta de spam o intenta
                  enviarlo nuevamente.
                </Alert>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default RecoverPassword;
