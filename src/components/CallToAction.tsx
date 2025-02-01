import { Box, Typography, Button, Stack } from "@mui/material";
import Link from "next/link";

const CallToAction = () => {
  return (
    <Box
      component="section"
      id="cta"
      sx={{
        background: "linear-gradient(135deg, #2563eb 0%, #1e40af 100%)",
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Elementos decorativos */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.08)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -100,
          left: -50,
          width: 250,
          height: 250,
          borderRadius: "50%",
          bgcolor: "rgba(255, 255, 255, 0.05)",
        }}
      />

      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          position: "relative",
          zIndex: 1,
          textAlign: "center",
        }}
      >
        <Typography
          variant="h3"
          component="h2"
          sx={{
            fontWeight: 700,
            color: "white",
            lineHeight: 1.2,
            mb: 3,
            fontSize: { xs: "2rem", md: "2.5rem" },
          }}
        >
          ¿Listo para Tomar el Control de tus Finanzas?
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "rgba(255, 255, 255, 0.9)",
            fontSize: { xs: "1rem", md: "1.1rem" },
            maxWidth: 600,
            mx: "auto",
            mb: 4,
          }}
        >
          Únete a miles de usuarios que confían en FinWise para alcanzar sus
          objetivos financieros. Comienza tu prueba gratuita hoy mismo.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
        >
          <Link href="/signup" passHref>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "white",
                color: "#1e40af",
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#e0f2fe",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
              }}
            >
              Comenzar Gratis
            </Button>
          </Link>

          <Link href="/demo" passHref>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "white",
                color: "white",
                py: 1.5,
                px: 4,
                fontSize: "1.1rem",
                "&:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderColor: "white",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Ver Demo
            </Button>
          </Link>
        </Stack>
      </Box>
    </Box>
  );
};

export default CallToAction;
