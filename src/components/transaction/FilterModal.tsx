import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useTheme,
  IconButton,
  Grid,
  Typography,
  Box,
} from "@mui/material";
import { TransactionFilters } from "@/models/Transaction";
import { Category } from "@prisma/client";
import FilterListIcon from "@mui/icons-material/FilterList";
import CloseIcon from "@mui/icons-material/Close";

interface FilterModalProps {
  open: boolean;
  handleClose: () => void;
  filters: TransactionFilters;
  setFilters: (filters: TransactionFilters) => void;
  categories: Category[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  open,
  handleClose,
  filters,
  setFilters,
  categories,
}) => {
  const theme = useTheme();

  const handleFilterChange = (
    field: keyof TransactionFilters,
    value: string | number | undefined
  ) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      userId: filters.userId,
      type: undefined,
      description: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      categoryId: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    handleClose();
  };

  const styles = useMemo(
    () => ({
      dialogPaper: {
        borderRadius: "16px",
        bgcolor: "background.paper",
        boxShadow: 24,
        backgroundImage: "none",
        overflow: "hidden",
        margin: "32px",
        maxWidth: "calc(50% - 64px)",
        [theme.breakpoints.down("sm")]: {
          margin: "20px",
          maxWidth: "calc(100% - 40px)",
        },
      },
      dialogTitle: {
        background: `
          linear-gradient(
            135deg,
            ${theme.palette.primary.main} 0%,
            ${theme.palette.primary.dark} 100%
          )
        `,
        fontSize: "1.5rem",
        fontWeight: 700,
        py: 3,
        px: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        color: "primary.contrastText",
        [theme.breakpoints.down("sm")]: {
          fontSize: "1.2rem",
          py: 2,
          px: 3,
        },
      },
      formContainer: {
        py: 2,
        px: 4,
        "& .MuiFormControl-root": {
          my: 2,
        },
        [theme.breakpoints.down("sm")]: {
          py: 1,
          px: 2,
        },
      },
      textField: {
        "& .MuiOutlinedInput-root": {
          borderRadius: "8px",
          transition: theme.transitions.create(["border-color", "box-shadow"]),
          "& fieldset": {
            borderColor: theme.palette.divider,
            borderWidth: "1.5px",
          },
          "& input": {
            fontSize: "1rem",
            padding: "14px 16px",
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.light}40`,
          },
        },
        "& .MuiInputLabel-root": {
          fontWeight: 600,
          color: theme.palette.text.secondary,
          fontSize: "1rem",
        },
        [theme.breakpoints.down("sm")]: {
          "& input": {
            fontSize: "0.9rem",
            padding: "12px 14px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.9rem",
          },
        },
      },
      select: {
        "& .MuiSelect-select": {
          padding: "14px 16px!important",
          fontSize: "1rem",
          [theme.breakpoints.down("sm")]: {
            padding: "12px 14px!important",
            fontSize: "0.9rem",
          },
        },
      },
      dialogActions: {
        px: 4,
        py: 3,
        gap: 2,
        bgcolor: "background.default",
        borderTop: `1px solid ${theme.palette.divider}`,
        [theme.breakpoints.down("sm")]: {
          px: 2,
          py: 2,
        },
      },
      cancelButton: {
        color: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderRadius: "8px",
        px: 3,
        py: 1,
        fontWeight: 700,
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.primary.light,
        },
      },
      submitButton: {
        bgcolor: "primary.main",
        borderRadius: "8px",
        px: 3,
        py: 1,
        fontWeight: 700,
        color: "primary.contrastText",
        "&:hover": {
          bgcolor: "primary.dark",
        },
      },
    }),
    [theme]
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: styles.dialogPaper }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FilterListIcon fontSize="large" />
          <Typography variant="h6">Filtros y Ordenación</Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{ color: "primary.contrastText" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={styles.formContainer}>
        <Grid container spacing={2}>
          {/* Sección de Filtros */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Filtros
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={styles.textField}>
              <InputLabel>Tipo de transacción</InputLabel>
              <Select
                value={filters.type || ""}
                onChange={(e) =>
                  handleFilterChange("type", e.target.value || undefined)
                }
                label="Tipo de transacción"
                sx={styles.select}
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="income">Ingresos</MenuItem>
                <MenuItem value="expense">Gastos</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={styles.textField}>
              <InputLabel>Categoría</InputLabel>
              <Select
                value={filters.categoryId || ""}
                onChange={(e) =>
                  handleFilterChange(
                    "categoryId",
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                label="Categoría"
                sx={styles.select}
              >
                <MenuItem value="">Todas</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Buscar en descripción"
              value={filters.description || ""}
              onChange={(e) =>
                handleFilterChange("description", e.target.value || undefined)
              }
              sx={styles.textField}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto mínimo"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              value={filters.minAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "minAmount",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              sx={styles.textField}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Monto máximo"
              type="number"
              InputProps={{ inputProps: { min: 0 } }}
              value={filters.maxAmount || ""}
              onChange={(e) =>
                handleFilterChange(
                  "maxAmount",
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              sx={styles.textField}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate || ""}
              onChange={(e) =>
                handleFilterChange("startDate", e.target.value || undefined)
              }
              sx={styles.textField}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Hasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate || ""}
              onChange={(e) =>
                handleFilterChange("endDate", e.target.value || undefined)
              }
              sx={styles.textField}
            />
          </Grid>

          {/* Sección de Ordenación */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle2" color="text.secondary" mb={1}>
              Ordenación
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={styles.textField}>
              <InputLabel>Ordenar por</InputLabel>
              <Select
                value={filters.sortBy || "createdAt"}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                label="Ordenar por"
                sx={styles.select}
              >
                <MenuItem value="createdAt">Fecha</MenuItem>
                <MenuItem value="amount">Monto</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth sx={styles.textField}>
              <InputLabel>Dirección</InputLabel>
              <Select
                value={filters.sortDirection || "desc"}
                onChange={(e) =>
                  handleFilterChange("sortDirection", e.target.value)
                }
                label="Dirección"
                sx={styles.select}
              >
                <MenuItem value="asc">Ascendente</MenuItem>
                <MenuItem value="desc">Descendente</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button
          variant="outlined"
          onClick={handleResetFilters}
          sx={styles.cancelButton}
        >
          Limpiar Filtros
        </Button>
        <Button
          variant="contained"
          onClick={handleClose}
          sx={styles.submitButton}
        >
          Aplicar Filtros
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FilterModal;
