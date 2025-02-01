"use client";
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TextField,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
  Box,
  CircularProgress,
  styled,
} from "@mui/material";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";

interface FormValues {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

const validationSchema = Yup.object({
  first_name: Yup.string().required("Requerido"),
  last_name: Yup.string().required("Requerido"),
  username: Yup.string().required("Requerido").min(3, "Mínimo 3 caracteres"),
  email: Yup.string().email("Inválido").required("Requerido"),
  password: Yup.string()
    .min(8, "Mínimo 8 caracteres")
    .matches(/[A-Z]/, "Mayúscula")
    .matches(/[a-z]/, "Minúscula")
    .matches(/\d/, "Número")
    .matches(/[!@#$%^&*()]/, "Especial")
    .required("Requerida"),
});

const CompactPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  maxWidth: "500px",
  margin: "0 auto",
}));

const PasswordHint = () => (
  <Box sx={{ mt: 0.5, fontSize: "0.75rem", color: "text.secondary" }}>
    <Typography variant="caption">
      Requisitos: 8+ caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 especial
    </Typography>
  </Box>
);

const SignUp = () => {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [passwordFocused, setPasswordFocused] = React.useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      username: "",
      first_name: "",
      last_name: "",
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await axios.post("/api/auth/signup", values);
        toast.success("Registro exitoso. Redirigiendo...");
        setTimeout(() => router.push("/login"), 1500);
      } catch (error) {
        const err = error as AxiosError<{ error: string }>;
        toast.error(err.response?.data?.error || "Error en registro");
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container component="main" maxWidth="xs" sx={{ py: 6 }}>
      <CompactPaper>
        <Box textAlign="center" mb={3}>
          <Typography
            variant="h5"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
            Crear Cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comienza a gestionar tus finanzas
          </Typography>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Nombre"
                variant="outlined"
                disabled={loading}
                {...formik.getFieldProps("first_name")}
                error={formik.touched.first_name && !!formik.errors.first_name}
                helperText={
                  formik.touched.first_name && formik.errors.first_name
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Apellido"
                variant="outlined"
                disabled={loading}
                {...formik.getFieldProps("last_name")}
                error={formik.touched.last_name && !!formik.errors.last_name}
                helperText={formik.touched.last_name && formik.errors.last_name}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Usuario"
                variant="outlined"
                disabled={loading}
                {...formik.getFieldProps("username")}
                error={formik.touched.username && !!formik.errors.username}
                helperText={formik.touched.username && formik.errors.username}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Email"
                type="email"
                variant="outlined"
                disabled={loading}
                {...formik.getFieldProps("email")}
                error={formik.touched.email && !!formik.errors.email}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Contraseña"
                type="password"
                variant="outlined"
                disabled={loading}
                {...formik.getFieldProps("password")}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                error={formik.touched.password && !!formik.errors.password}
                helperText={formik.touched.password && formik.errors.password}
              />
              {passwordFocused && <PasswordHint />}
            </Grid>
          </Grid>

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="medium"
            disabled={loading}
            sx={{
              mt: 3,
              py: 1,
              fontSize: "0.875rem",
              textTransform: "none",
              borderRadius: 1,
            }}
          >
            {loading ? <CircularProgress size={20} /> : "Registrarse"}
          </Button>
        </form>

        <Box mt={2} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            ¿Tienes cuenta?{" "}
            <Link
              href="/login"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontWeight: 500,
                fontSize: "0.875rem",
              }}
            >
              Ingresar
            </Link>
          </Typography>
        </Box>
      </CompactPaper>
    </Container>
  );
};

export default SignUp;
