import {
  Grid2 as Grid,
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";

const Testimonials = () => {
  const testimonials = [
    {
      name: "Jane Doe",
      role: "Emprendedora",
      feedback:
        "¡FinWise transformó completamente cómo gestiono mis finanzas! La interfaz intuitiva y los reportes detallados me ayudaron a reducir mis gastos en un 30%.",
      avatar: "/images/avatar1.jpg",
    },
    {
      name: "John Smith",
      role: "Freelancer",
      feedback:
        "¡Alcancé mis objetivos de ahorro más rápido gracias a FinWise! Las metas personalizadas y los recordatorios automáticos fueron clave para mi éxito.",
      avatar: "/images/avatar2.jpg",
    },
  ];

  return (
    <Box
      component="section"
      id="testimonials"
      sx={{
        backgroundColor: "#f8fafc",
        py: { xs: 8, md: 12 },
        px: { xs: 2, sm: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          sx={{
            fontWeight: 700,
            color: "rgba(0, 0, 0, 0.87)",
            mb: { xs: 6, md: 8 },
            "&::after": {
              content: '""',
              display: "block",
              width: 60,
              height: 4,
              backgroundColor: "#1976d2",
              mx: "auto",
              mt: 3,
              borderRadius: 2,
            },
          }}
        >
          Lo Que Dicen Nuestros Usuarios
        </Typography>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {testimonials.map((testimonial, index) => (
            <Grid key={index} size={{ xs: 12, md: 6 }}>
              <Card
                sx={{
                  height: "100%",
                  p: 4,
                  borderRadius: 4,
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.08)",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Avatar
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    sx={{
                      width: 80,
                      height: 80,
                      mb: 3,
                      mx: "auto",
                      border: "3px solid #1976d2",
                    }}
                  />
                  <Typography
                    variant="body1"
                    component="blockquote"
                    sx={{
                      fontSize: "1.1rem",
                      lineHeight: 1.6,
                      color: "rgba(0, 0, 0, 0.6)",
                      mb: 3,
                      fontStyle: "italic",
                      position: "relative",
                      "&::before, &::after": {
                        color: "#1976d2",
                        fontSize: "2rem",
                        lineHeight: 1,
                      },
                      "&::before": {
                        content: '"\\201C"',
                        position: "absolute",
                        left: -30,
                        top: -10,
                      },
                      "&::after": {
                        content: '"\\201D"',
                        position: "absolute",
                        right: -30,
                        bottom: -20,
                      },
                    }}
                  >
                    {testimonial.feedback}
                  </Typography>
                  <Typography
                    variant="h6"
                    component="cite"
                    sx={{
                      display: "block",
                      fontWeight: 600,
                      color: "rgba(0, 0, 0, 0.87)",
                      fontStyle: "normal",
                    }}
                  >
                    {testimonial.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="div"
                    sx={{ color: "#1976d2", mt: 1 }}
                  >
                    {testimonial.role}
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

export default Testimonials;
