// theme.d.ts o dentro de tu archivo de configuración del tema

declare module "@mui/material/styles" {
  // Extiende la interfaz Palette para incluir 'neutral'
  interface Palette {
    neutral: {
      main: string; // El color principal del 'neutral'
      contrastText: string; // El color del texto sobre el fondo 'neutral'
    };
  }

  // Extiende la interfaz PaletteOptions para incluir 'neutral' en las opciones de paleta
  interface PaletteOptions {
    neutral?: {
      main: string;
      contrastText: string;
    };
  }
}
