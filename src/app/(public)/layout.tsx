"use client";
import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  styled,
  alpha,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import Link from "next/link";

const MENU_ITEMS = [
  { name: "Inicio", path: "/" },
  { name: "Acerca de", path: "/about" },
  { name: "Registrarse", path: "/signup" },
  { name: "Iniciar Sesión", path: "/login" },
];

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.common.white,
  transition: "all 0.2s ease",
  position: "relative",
  padding: theme.spacing(1),
  fontSize: "0.875rem",
  display: "block",
  "&:hover": {
    color: theme.palette.secondary.light,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -2,
    left: 0,
    right: 0,
    height: "2px",
    backgroundColor: theme.palette.secondary.light,
    transform: "scaleX(0)",
    transition: "transform 0.2s ease",
  },
  "&:hover::after, &.active::after": {
    transform: "scaleX(1)",
  },
  [theme.breakpoints.up("md")]: {
    fontSize: "1rem",
    padding: theme.spacing(1, 1.5),
    // Eliminar transformación que causa movimiento
    "&:hover": {
      transform: "none",
    },
  },
}));

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${alpha(
    theme.palette.primary.main,
    0.9
  )} 100%)`,
  boxShadow: "none",
  backdropFilter: "blur(8px)",
  borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
}));

interface NavbarProps {
  children: ReactNode;
}

const Navbar = ({ children }: NavbarProps) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const pathname = usePathname();
  const currentPath = pathname || "/";

  const toggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const closeMenu = () => {
    setAnchorEl(null);
  };

  const isActivePath = (path: string) => currentPath === path;

  return (
    <>
      <GradientAppBar position="sticky">
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: { xs: 1.5, sm: 3 },
            py: 0.5,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <StyledLink href="/">
            <Image
              src="/images/FinWise.webp"
              alt="Logo FinWise"
              width={110}
              height={28}
              priority
              style={{
                transition: "opacity 0.5s ease",
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
              }}
            />
          </StyledLink>

          {/* Menú desktop */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 0.5,
              alignItems: "center",
            }}
          >
            {MENU_ITEMS.map((item) => (
              <StyledLink
                key={item.path}
                href={item.path}
                className={isActivePath(item.path) ? "active" : ""}
                sx={{
                  fontWeight: isActivePath(item.path) ? 600 : 600,
                  fontSize: { md: "0.95rem", lg: "1rem" },
                  // Prevenir movimiento en hover
                  "&:hover": {
                    transform: "none",
                  },
                }}
              >
                {item.name}
              </StyledLink>
            ))}
          </Box>

          {/* Menú móvil */}
          <IconButton
            edge="end"
            color="inherit"
            aria-label="Menú de navegación"
            onClick={toggleMenu}
            sx={{
              display: { md: "none" },
              p: 1,
              "&:hover": {
                backgroundColor: alpha(theme.palette.common.white, 0.1),
              },
            }}
          >
            <MenuIcon sx={{ fontSize: "1.6rem" }} />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={closeMenu}
            MenuListProps={{
              "aria-labelledby": "navigation-menu",
            }}
            PaperProps={{
              sx: {
                backgroundColor: alpha(theme.palette.primary.dark, 0.98),
                minWidth: "160px",
                borderRadius: "8px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
                // Prevenir overflow en móvil
                maxWidth: "calc(100vw - 24px)",
                marginRight: "12px",
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transitionDuration={200}
          >
            {MENU_ITEMS.map((item) => (
              <MenuItem
                key={item.path}
                onClick={closeMenu}
                component={Link}
                href={item.path}
                selected={isActivePath(item.path)}
                sx={{
                  py: 1.2,
                  px: 2,
                  "&.Mui-selected": {
                    backgroundColor: alpha(theme.palette.common.white, 0.12),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.common.white, 0.15),
                    },
                  },
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.white, 0.08),
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: isActivePath(item.path) ? 600 : 400,
                    color: isActivePath(item.path)
                      ? theme.palette.secondary.light
                      : theme.palette.common.white,
                    fontSize: "0.95rem",
                    width: "100%",
                  }}
                >
                  {item.name}
                </Typography>
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
      </GradientAppBar>

      <Box component="main" sx={{ overflowX: "hidden", minHeight: "81vh" }}>
        {children}
      </Box>

      <Footer />
    </>
  );
};

export default Navbar;
