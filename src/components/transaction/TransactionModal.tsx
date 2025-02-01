import { useEffect, useMemo, useState } from "react";
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
  InputAdornment,
  Box,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import { Category, Transaction } from "@prisma/client";
import { CreateTransactionData } from "@/models/Transaction";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

interface TransactionModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (transaction: CreateTransactionData | Transaction) => void;
  categories: Category[];
  transactionToEdit?: Transaction; // Nuevo prop para edición
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  handleClose,
  onSubmit,
  categories,
  transactionToEdit,
}) => {
  const theme = useTheme();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState<number | "">("");
  useEffect(() => {
    if (transactionToEdit && transactionToEdit.id) {
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category_id || "");
    } else {
      resetForm();
    }
  }, [transactionToEdit, open]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const transactionData = {
      ...(transactionToEdit && { id: transactionToEdit.id }), // Incluir ID si existe
      amount: parseFloat(amount),
      description,
      type,
      category_id: type === "expense" ? (category as number) : undefined,
    };
    console.log("Transaccion del modal", transactionData);
    onSubmit(transactionData);
    resetForm();
    handleClose();
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType("income");
    setCategory("");
  };

  const handleCloseModal = () => {
    resetForm();
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
        maxWidth: "calc(35% - 64px)",
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
        gap: "12px",
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
          "& .MuiFormControl-root": {
            my: 1.5,
          },
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
      onClose={handleCloseModal}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: styles.dialogPaper }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        <AddCircleOutlineIcon fontSize="large" />
        {transactionToEdit ? "Editar Transacción" : "Crear Transacción"}
      </DialogTitle>

      <DialogContent dividers sx={styles.formContainer}>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Monto"
            variant="outlined"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            type="number"
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: { min: 0 },
            }}
            sx={styles.textField}
          />

          <TextField
            label="Descripción"
            variant="outlined"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            required
            sx={styles.textField}
            margin="normal"
          />

          <FormControl fullWidth sx={styles.textField} margin="normal">
            <InputLabel>Tipo</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
              label="Tipo"
              sx={styles.select}
            >
              <MenuItem value="income">Ingreso</MenuItem>
              <MenuItem value="expense">Gasto</MenuItem>
            </Select>
          </FormControl>

          {type === "expense" && (
            <FormControl fullWidth sx={styles.textField} margin="normal">
              <InputLabel>Categoría</InputLabel>
              <Select
                value={category}
                onChange={(e) => setCategory(Number(e.target.value))}
                label="Categoría"
                sx={styles.select}
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </form>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button
          variant="outlined"
          onClick={handleCloseModal}
          sx={styles.cancelButton}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={styles.submitButton}
        >
          {transactionToEdit ? "Guardar Transacción" : "Crear Transacción"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionModal;
