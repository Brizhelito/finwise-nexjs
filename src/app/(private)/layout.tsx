"use client";
import { useState, JSX, ReactNode, useEffect } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  CssBaseline,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import SavingsIcon from "@mui/icons-material/Savings";
import ChevronLeft from "@mui/icons-material/ChevronLeft";
import ChevronRight from "@mui/icons-material/ChevronRight";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@providers/AuthProvider";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
interface MenuItem {
  name: string;
  path: string;
  icon: JSX.Element;
  isLogout?: boolean;
}

const menuItems: MenuItem[] = [
  { name: "Inicio", path: "/", icon: <HomeIcon /> },
  { name: "Perfil", path: "/profile", icon: <PersonIcon /> },
  { name: "Transacciones", path: "/transaction", icon: <AccountBalanceIcon /> },
  { name: "Metas de Ahorro", path: "/savinggoals", icon: <SavingsIcon /> },
  { name: "Cerrar sesión", path: "", icon: <LogoutIcon />, isLogout: true },
];

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const router = useRouter();
  const { logout } = useAuth();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const drawerWidth = isCollapsed ? 7.5 : 30;

  useEffect(() => {
    if (!isMobile) setIsDrawerOpen(true);
    if (isMobile) setIsCollapsed(false);
  }, [isMobile]);
  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };
  const handleNavigation = async (item: MenuItem) => {
    if (item.isLogout) {
      setIsLogoutModalOpen(true);
    } else {
      router.push(item.path);
    }
    if (isMobile) setIsDrawerOpen(false);
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          sx={{
            flexShrink: 0,
            width: theme.spacing(drawerWidth),
            "& .MuiDrawer-paper": {
              width: theme.spacing(drawerWidth),
              boxSizing: "border-box",
              backgroundColor: theme.palette.primary.main,
              borderRight: "none",
              boxShadow: theme.shadows[3],
              transition: theme.transitions.create("width", {
                easing: theme.transitions.easing.easeInOut,
                duration: 0.3,
              }),
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              ...(!isCollapsed &&
                !isMobile && {
                  position: "fixed",
                  left: 0,
                  zIndex: theme.zIndex.drawer + 1,
                }),
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              opacity: isCollapsed ? 0 : 1,
              transition: theme.transitions.create("opacity", {
                easing: theme.transitions.easing.easeInOut,
                duration: 0.3,
              }),
            }}
          >
            <Image
              src="/images/FinWise.webp"
              alt="Logo FinWise"
              width={160}
              height={40}
              style={{ objectFit: "contain" }}
            />
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {menuItems.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => handleNavigation(item)}
                sx={{
                  "&:hover": {
                    backgroundColor: theme.palette.primary.light + "80",
                  },
                  borderRadius: theme.shape.borderRadius,
                  mx: isCollapsed ? 0.5 : 2,
                  my: 0.5,
                  px: isCollapsed ? "10px" : 2,
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  transition: theme.transitions.create(
                    ["background-color", "margin", "padding"],
                    {
                      easing: theme.transitions.easing.easeInOut,
                      duration: 0.3,
                    }
                  ),
                }}
              >
                <ListItemIcon
                  sx={{
                    color: theme.palette.primary.contrastText,
                    minWidth: "auto",
                    mr: isCollapsed ? 0 : 2,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.name}
                  primaryTypographyProps={{
                    variant: "body2",
                    fontWeight: 500,
                    color: theme.palette.primary.contrastText,
                  }}
                  sx={{ display: isCollapsed ? "none" : "block" }}
                />
              </ListItemButton>
            ))}
          </List>

          {!isMobile && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                p: 1,
                borderTop: `1px solid ${theme.palette.primary.light}30`,
              }}
            >
              <IconButton
                onClick={() => setIsCollapsed(!isCollapsed)}
                sx={{ color: theme.palette.primary.contrastText }}
              >
                {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
              </IconButton>
            </Box>
          )}
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 0,
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.easeInOut,
              duration: 0.3,
            }),
            marginLeft: 0,
            width: isMobile ? "100%" : `calc(100% - ${theme.spacing(7.5)})`,
          }}
        >
          {isMobile && (
            <IconButton
              onClick={() => setIsDrawerOpen(true)}
              sx={{
                position: "fixed",
                top: theme.spacing(2),
                left: theme.spacing(2),
                zIndex: theme.zIndex.appBar + 1,
                color: theme.palette.primary.main,
                backgroundColor: theme.palette.background.default,
                "&:hover": {
                  backgroundColor: theme.palette.action.hover,
                },
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {children}
        </Box>
      </Box>
      <ConfirmationModal
        open={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Cerrar sesión"
        content="¿Estás seguro que deseas salir de tu cuenta?"
        confirmButtonText="Cerrar sesión"
        confirmColor="primary"
      />
    </>
  );
};

export default Sidebar;
