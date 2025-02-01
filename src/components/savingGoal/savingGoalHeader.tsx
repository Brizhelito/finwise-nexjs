import { AppBar, Toolbar, Typography, Button, Box, Chip } from "@mui/material";
import SavingsIcon from "@mui/icons-material/Savings";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";

interface HeaderProps {
  onAddGoal: () => void;
  totalSaving: number;
}

const Header: React.FC<HeaderProps> = ({ onAddGoal, totalSaving }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: "#00796b",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        backgroundImage: "linear-gradient(45deg, #00796b 0%, #004d40 100%)",
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          py: { xs: 1, sm: 2 },
          px: { xs: 1, sm: 3 },
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Sección izquierda */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexGrow: 1,
            overflow: "hidden",
          }}
        >
          <SavingsIcon
            sx={{
              fontSize: { xs: 28, sm: 32 },
              minWidth: "40px",
            }}
          />

          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 800,
              display: { xs: "none", sm: "block" },
              letterSpacing: "0.05em",
              color: "#e0f2f1",
            }}
          >
            Ahorros Inteligentes
          </Typography>

          <Chip
            icon={
              <AccountBalanceWalletIcon
                sx={{ fontSize: { xs: "18px", sm: "20px" } }}
              />
            }
            label={`Total: ${formatCurrency(totalSaving)}`}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              color: "white",
              fontWeight: 600,
              px: 1,
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              maxWidth: { xs: "160px", sm: "none" },
              overflow: "hidden",
              ".MuiChip-label": {
                overflow: "hidden",
                textOverflow: "ellipsis",
              },
              ".MuiChip-icon": {
                color: "white",
                fontSize: "inherit",
              },
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          />
        </Box>

        {/* Botón responsive */}
        <Button
          variant="contained"
          color="secondary"
          onClick={onAddGoal}
          sx={{
            fontWeight: 700,
            minWidth: "auto",
            padding: { xs: "8px 12px", sm: "10px 20px" },
            fontSize: { xs: "0.75rem", sm: "0.875rem" },
            "& .MuiButton-startIcon": {
              marginRight: { xs: 0, sm: 1 },
            },
          }}
          startIcon={<SavingsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
        >
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Nueva Meta
          </Box>
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
