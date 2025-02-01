"use client";
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  typography: {
    fontFamily: '"Open Sans", "Arial", sans-serif', // Especifica Open Sans como fuente
    h1: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    h2: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    h3: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    h4: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    h5: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    h6: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    body1: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    body2: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    button: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    caption: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
    overline: {
      fontFamily: '"Open Sans", "Arial", sans-serif',
    },
  },
  palette: {
    primary: {
      main: "#1B263B", // Midnight Blue
      light: "#415A77", // Steel Gray
      dark: "#0D1B2A", // Jet Black
      contrastText: "#ffffff", // Texto claro para el color primary
    },
    secondary: {
      main: "#415A77", // Steel Gray
      contrastText: "#ffffff", // Texto claro para el color secondary
    },

    success: {
      main: "#2D6A4F", // Emerald Green
      contrastText: "#ffffff", // Texto claro para el color success
    },
    warning: {
      main: "#F4A261", // Goldenrod
      contrastText: "#000000", // Texto oscuro para el color warning
    },
    error: {
      main: "#D72638", // Crimson
      contrastText: "#ffffff", // Texto claro para el color error
    },
    contrastThreshold: 3, // Ajusta el contraste de los elementos
    tonalOffset: 0.2, // Ajusta la tonalidad de los colores
  },
});

export default theme;
