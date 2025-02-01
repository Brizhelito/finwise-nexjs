import { ReactNode } from "react";
import "./globals.css"; // Asegúrate de importar el archivo CSS global
type LayoutProps = {
  children: ReactNode;
};
import { AppRouterCacheProvider } from "@mui/material-nextjs/v15-appRouter";
import Footer from "@components/Footer";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { AuthProvider } from "@/providers/AuthProvider";
import { Toaster } from "sonner";
const Layout = ({ children }: LayoutProps) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>FinWise</title>
      </head>
      <body>
        <AuthProvider>
          <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
            <Toaster richColors position="bottom-right" />
            {/* Asegúrate de agregar este componente aquí */}
          </AppRouterCacheProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default Layout;
