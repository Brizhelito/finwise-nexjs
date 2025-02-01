import {
  Container,
  Typography,
  Box,
  Grid2 as Grid,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Image from "next/image"; // Importar Image de Next.js para optimizar las imágenes

const imageDetails = [
  {
    name: "mission-image",
    src: "/images/mission-image.webp",
    alt: "Nuestra Misión",
  },
  {
    name: "technology-image",
    src: "/images/technology-image.webp",
    alt: "Nuestra Tecnología",
  },
  {
    name: "why-choose-us-image",
    src: "/images/why-choose-us-image.webp",
    alt: "¿Por Qué Elegir FinWise?",
  },
  {
    name: "journey-image",
    src: "/images/journey-image.webp",
    alt: "Únete a Nuestro Viaje",
  },
];

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 8, backgroundColor: "#f8f8f8" }}>
      <Typography
        variant="h2"
        component="h1"
        textAlign="center"
        color="primary"
        gutterBottom
      >
        Acerca de FinWise
      </Typography>
      <Typography
        variant="body1"
        textAlign="center"
        color="text.secondary"
        gutterBottom
      >
        ¡Bienvenido a{" "}
        <Typography
          component="span"
          variant="body1"
          fontWeight="bold"
          color="secondary"
        >
          FinWise
        </Typography>
        , tu destino definitivo para el empoderamiento financiero! En FinWise,
        estamos dedicados a proporcionarte las herramientas y conocimientos más
        avanzados para que tomes decisiones financieras informadas.
      </Typography>

      {/* Sección: Nuestra Misión */}
      <Box mt={10}>
        <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
          Nuestra Misión
        </Typography>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body1" color="text.secondary">
              Nuestra misión es democratizar la sabiduría financiera y crear una
              plataforma donde los usuarios puedan gestionar sus finanzas
              fácilmente, obtener análisis reveladores y alcanzar sus objetivos
              financieros con confianza. Creemos que todos merecen acceso a las
              mejores herramientas y recursos de gestión financiera.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Image
              src={imageDetails[0].src}
              alt={imageDetails[0].alt}
              width={600}
              height={400}
              style={{ borderRadius: "16px" }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Sección: Nuestra Tecnología */}
      <Box mt={10}>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Image
              src={imageDetails[1].src}
              alt={imageDetails[1].alt}
              width={600}
              height={400}
              style={{ borderRadius: "16px" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography
              variant="h4"
              color="primary"
              gutterBottom
              fontWeight="bold"
            >
              Nuestra Tecnología
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Aprovechamos el poder de las tecnologías modernas para brindarte
              una experiencia fluida y eficiente:
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Frontend:"
                  secondary="Nuestra interfaz fácil de usar está construida con React, lo que garantiza una experiencia responsiva y dinámica en todos los dispositivos."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Backend:"
                  secondary="Impulsado por Spring Boot, nuestra robusta infraestructura de backend garantiza un rendimiento seguro y confiable para manejar tus datos financieros con cuidado."
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Box>

      {/* Sección: ¿Por Qué Elegir FinWise? */}
      <Box my={8}>
        <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
          ¿Por Qué Elegir FinWise?
        </Typography>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <List>
              <ListItem>
                <ListItemText
                  primary="Diseño Centrado en el Usuario:"
                  secondary="Priorizamos tu experiencia, asegurándonos de que nuestra plataforma sea intuitiva y fácil de navegar."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Herramientas Completas:"
                  secondary="Desde presupuestos hasta seguimiento de inversiones, ofrecemos una amplia gama de funciones para cubrir todos los aspectos de la gestión financiera."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Seguridad de Datos:"
                  secondary="La seguridad de tus datos es nuestra máxima prioridad. Utilizamos medidas de seguridad de última generación para proteger tu información."
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Ideas Expertas:"
                  secondary="Accede a consejos financieros de expertos y tendencias del mercado para mantenerte a la vanguardia."
                />
              </ListItem>
            </List>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Image
              src={imageDetails[2].src}
              alt={imageDetails[2].alt}
              width={600}
              height={400}
              style={{ borderRadius: "16px" }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Sección: Únete a Nuestro Viaje */}
      <Box my={8}>
        <Typography variant="h4" color="primary" gutterBottom fontWeight="bold">
          Únete a Nuestro Viaje
        </Typography>
        <Grid container spacing={8} alignItems="center">
          <Grid size={{ xs: 12, md: 6 }}>
            <Image
              src={imageDetails[3].src}
              alt={imageDetails[3].alt}
              width={600}
              height={400}
              style={{ borderRadius: "16px" }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body1" color="text.secondary">
              En FinWise, estamos en constante evolución y mejora para servirte
              mejor. Únete a nosotros en este emocionante viaje hacia la
              libertad financiera y toma el control de tu futuro financiero hoy
              mismo.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default About;
