"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Container,
  Box,
  TextField,
  Button,
  Grid,
  Typography,
  useTheme,
  Card,
  CardContent,
  CardActions,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { useUser } from "@/context/UserContext";
import ConfirmationModal from "@/components/ui/ConfirmationModal"; // Asegúrate de importar el modal

const UserSettings = () => {
  const theme = useTheme();
  const { user, setUser } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    currentPassword: "",
    newPassword: "",
  });
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [openConfirmModal, setOpenConfirmModal] = useState(false); // Estado para controlar el modal de confirmación

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.first_name,
        lastName: user.last_name,
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Limpiar errores al escribir
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const handlePasswordToggle = () => {
    setChangePassword((prev) => !prev);
    setFormData((prev) => ({
      ...prev,
      newPassword: "",
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "La contraseña actual es obligatoria.";
    }

    if (changePassword && !formData.newPassword) {
      newErrors.newPassword = "Debes ingresar una nueva contraseña.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setOpenConfirmModal(true); // Abrir el modal de confirmación
  };

  const handleConfirm = async () => {
    setLoading(true);

    try {
      await axios.put("/api/user/update", {
        currentPassword: formData.currentPassword,
        newPassword: changePassword ? formData.newPassword : undefined,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });

      // Actualizar el contexto con los nuevos datos
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          first_name: formData.firstName,
          last_name: formData.lastName,
        };
      });

      toast.success("Usuario actualizado con éxito");
    } catch (error: unknown) {
      console.error("Error al actualizar usuario:", error);

      if (error instanceof Error) {
        toast.error(error.message || "Error al actualizar usuario");
      } else {
        toast.error("Error desconocido");
      }
    } finally {
      setLoading(false);
      setOpenConfirmModal(false); // Cerrar el modal
    }
  };

  const handleCloseModal = () => {
    setOpenConfirmModal(false); // Cerrar el modal si el usuario cancela
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h6">Cargando perfil...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Card sx={{ borderRadius: 3, boxShadow: 3, p: 2 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ color: theme.palette.primary.main, fontWeight: 600 }}
          >
            Configuración de Usuario
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nombre de usuario"
                  value={user.username}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  value={user.email}
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Campo obligatorio para confirmar cambios */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  type="password"
                  label="Contraseña actual"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Checkbox para habilitar cambio de contraseña */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={changePassword}
                      onChange={handlePasswordToggle}
                    />
                  }
                  label="Modificar contraseña"
                />
              </Grid>

              {/* Campo para la nueva contraseña si se habilita */}
              {changePassword && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    type="password"
                    label="Nueva Contraseña"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "flex-end", px: 3, pb: 2 }}>
          <Button
            type="submit"
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              bgcolor: theme.palette.primary.main,
              "&:hover": { bgcolor: theme.palette.primary.dark },
              px: 4,
              py: 1.5,
              borderRadius: 2,
              textTransform: "none",
            }}
          >
            {loading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </CardActions>
      </Card>

      {/* Modal de confirmación */}
      <ConfirmationModal
        open={openConfirmModal}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        title="¿Estás seguro?"
        content="Los cambios que realices serán permanentes. ¿Quieres continuar?"
        confirmButtonText="Sí, guardar"
      />
    </Container>
  );
};

export default UserSettings;
