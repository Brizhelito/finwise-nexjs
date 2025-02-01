import {
  Grid2 as Grid,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

const Features = () => {
  const features = [
    {
      image: "/images/feature1.svg",
      title: "Seguimiento de Gastos",
      description:
        "Realiza un seguimiento de tus gastos diarios fácilmente con nuestra interfaz amigable.",
    },
    {
      image: "/images/feature2.svg",
      title: "Metas Financieras",
      description:
        "Establece y monitorea tus metas financieras para mantenerte en el camino correcto.",
    },
    {
      image: "/images/feature3.svg",
      title: "Ideas Inteligentes",
      description:
        "Obtén ideas impulsadas por IA para tomar decisiones financieras más inteligentes.",
    },
  ];

  return (
    <Box
      component="section"
      id="features"
      sx={{
        backgroundColor: "#ffffff",
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1280, margin: "0 auto" }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: { xs: 6, md: 10 },
            color: "rgba(0, 0, 0, 0.87)",
          }}
        >
          Características que Amarás
        </Typography>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {features.map((feature, index) => (
            <Grid
              key={index}
              size={{ xs: 12, sm: 6, md: 4 }}
              sx={{ display: "flex" }}
            >
              <Card
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={feature.image}
                  alt={feature.title}
                  sx={{
                    width: "100%",
                    height: { xs: 200, md: 240 },
                    objectFit: "contain",
                    p: 4,
                  }}
                />
                <CardContent
                  sx={{
                    flexGrow: 1,
                    textAlign: "center",
                    px: 4,
                    pb: "40px !important",
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{
                      fontWeight: 600,
                      color: "#1976d2",
                      mb: 3,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "rgba(0, 0, 0, 0.6)",
                      lineHeight: 1.6,
                      fontSize: "1.1rem",
                    }}
                  >
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Features;
