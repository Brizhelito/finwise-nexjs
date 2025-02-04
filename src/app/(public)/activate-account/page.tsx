"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Paper,
  Link,
  useTheme,
  Fade,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { styled, keyframes } from "@mui/system";

const pulseAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
`;

const AnimatedCheckIcon = styled(CheckCircleOutlineIcon)(({ theme }) => ({
  animation: `${pulseAnimation} 1s ease-in-out`,
  fontSize: 80,
  color: theme.palette.success.main,
}));

const ValidateEmail = () => {
  const theme = useTheme();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setTokenValid(false);
        setErrorMessage("Falta el token de validación");
        setLoading(false);
        return;
      }

      try {
        await axios.post("/api/auth/activate-account", { token });
        setTokenValid(true);
        toast.success("Cuenta activada correctamente");
      } catch (error: any) {
        setTokenValid(false);
        setErrorMessage(
          error.response?.data?.error || "El enlace ha expirado o es inválido"
        );
        toast.error(error.response?.data?.error || "Error de validación");
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token]);

  const handleResendVerification = async () => {
    try {
      await axios.post("/api/auth/resend-verification", { token });
      toast.success("Nuevo enlace de verificación enviado");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Error al reenviar el enlace");
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xs" sx={{ mt: 10, textAlign: "center" }}>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: theme.palette.primary.main, mb: 3 }}
        />
        <Typography variant="h6" color="text.secondary">
          Verificando tu cuenta...
        </Typography>
      </Container>
    );
  }

  if (!tokenValid) {
    return (
      <Fade in={true} timeout={500}>
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper
            elevation={3}
            sx={{ p: 4, borderRadius: 3, textAlign: "center" }}
          >
            <ErrorOutlineIcon
              sx={{ fontSize: 80, color: theme.palette.error.main, mb: 2 }}
            />
            <Typography variant="h4" gutterBottom color="error">
              Validación fallida
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {errorMessage}. Puedes:
            </Typography>

            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResendVerification}
              >
                Reenviar enlace
              </Button>
              <Button
                variant="outlined"
                component={Link}
                href="/contact"
                sx={{ textDecoration: "none" }}
              >
                Contactar soporte
              </Button>
            </Box>

            <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" color="primary" sx={{ fontWeight: 500 }}>
                Inicia sesión aquí
              </Link>
            </Typography>
          </Paper>
        </Container>
      </Fade>
    );
  }

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper
          elevation={3}
          sx={{ p: 4, borderRadius: 3, textAlign: "center" }}
        >
          <AnimatedCheckIcon />
          <Typography variant="h3" gutterBottom sx={{ mt: 2, fontWeight: 700 }}>
            ¡Validación exitosa!
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, fontSize: "1.1rem" }}>
            Tu dirección de correo electrónico ha sido confirmada correctamente.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Ahora puedes disfrutar de todas las funcionalidades de nuestra
            plataforma.
          </Typography>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => router.push("/login")}
            sx={{
              height: 50,
              fontSize: "1.1rem",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Comenzar ahora
          </Button>

          <Typography variant="body2" sx={{ mt: 3, color: "text.secondary" }}>
            ¿Necesitas ayuda?{" "}
            <Link href="/help" color="primary" sx={{ fontWeight: 500 }}>
              Visita nuestro centro de ayuda
            </Link>
          </Typography>
        </Paper>
      </Container>
    </Fade>
  );
};

export default ValidateEmail;
