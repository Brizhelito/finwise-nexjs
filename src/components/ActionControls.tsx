import { Button, useTheme, Box, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FilterListIcon from "@mui/icons-material/FilterList";
import { styled } from "@mui/material/styles";

type ActionControlsProps = {
  onAdd: () => void;
  onFilter: () => void;
};

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: "10px",
  padding: theme.spacing(1.5, 3),
  fontSize: "0.875rem",
  fontWeight: 600,
  transition: "all 0.2s ease",
  minWidth: "160px",
  "& .MuiButton-startIcon": {
    marginRight: theme.spacing(1),
    "& svg": {
      fontSize: "1.25rem",
    },
  },
  "&:hover": {
    transform: "translateY(-1px)",
  },
}));

const ActionControls: React.FC<ActionControlsProps> = ({ onAdd, onFilter }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: { xs: "column", sm: "row" }, // Cambiar dirección en móviles
        gap: 2,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "stretch", // Asegurar que los botones ocupen todo el espacio disponible en móviles
      }}
    >
      <Tooltip title="Abrir filtros avanzados" arrow>
        <ActionButton
          variant="outlined"
          color="secondary"
          startIcon={<FilterListIcon />}
          onClick={onFilter}
          sx={{
            borderWidth: "2px",
            width: { xs: "100%", sm: "auto" }, // Hacer que el botón ocupe el 100% en móviles
            "&:hover": {
              borderWidth: "2px",
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          Filtros
        </ActionButton>
      </Tooltip>

      <Tooltip title="Crear nueva transacción" arrow>
        <ActionButton
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{
            boxShadow: theme.shadows[3],
            width: { xs: "100%", sm: "auto" }, // Hacer que el botón ocupe el 100% en móviles
            "&:hover": {
              boxShadow: theme.shadows[5],
            },
          }}
        >
          Nueva Transacción
        </ActionButton>
      </Tooltip>
    </Box>
  );
};

export default ActionControls;
