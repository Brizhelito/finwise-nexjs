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
} from "@mui/material";
import { Category, Transaction } from "@prisma/client";
import { CreateTransactionData } from "@/models/Transaction";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { toast } from "sonner";
import Decimal from "decimal.js";

interface TransactionModalProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (transaction: CreateTransactionData | Transaction) => void;
  categories: Category[];
  transactionToEdit?: Transaction;
  balance: Decimal;
}

const TransactionModal: React.FC<TransactionModalProps> = ({
  open,
  handleClose,
  onSubmit,
  categories,
  transactionToEdit,
  balance,
}) => {
  const theme = useTheme();
  const [amount, setAmount] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState<number | "">("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(transactionToEdit.amount.toString());
      setDescription(transactionToEdit.description);
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category_id || "");
    } else {
      resetForm();
    }
  }, [transactionToEdit, open]);

  const validateAmount = (
    value: string,
    balance: Decimal,
    transactionToEdit?: Transaction
  ): boolean => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      setAmountError("El monto no puede estar vacío");
      return false;
    }

    const numAmount = parseFloat(trimmedValue);

    if (isNaN(numAmount) || numAmount <= 0) {
      setAmountError("El monto debe ser un número válido mayor que cero");
      return false;
    }

    if (!/^\d+(\.\d{1,2})?$/.test(trimmedValue)) {
      setAmountError("El monto debe tener máximo 2 decimales");
      return false;
    }

    if (transactionToEdit?.type === "expense") {
      const adjustedBalance =
        balance.toNumber() + Number(transactionToEdit.amount);
      if (numAmount > adjustedBalance) {
        setAmountError("El monto excede el balance disponible");
        return false;
      }
    }
    if (type === "expense" && numAmount > balance.toNumber()) {
      setAmountError("El monto excede el balance disponible");
      return false;
    }
    setAmountError(null);
    return true;
  };

  const validateCategory = (): boolean => {
    if (type === "expense" && category === "") {
      setCategoryError("Debes seleccionar una categoría para gastos");
      return false;
    }

    setCategoryError(null);
    return true;
  };

  const validateForm = (): boolean => {
    const isValidAmount = validateAmount(amount, balance, transactionToEdit);
    const isValidCategory = validateCategory();
    return isValidAmount && isValidCategory;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    try {
      const transactionData = {
        ...(transactionToEdit && { id: transactionToEdit.id }),
        amount: parseFloat(amount),
        description: description.trim(),
        type,
        category_id: type === "expense" ? (category as number) : undefined,
      };

      toast.success(
        transactionToEdit ? "Transacción actualizada" : "Transacción creada"
      );

      onSubmit(transactionData);
      resetForm();
      handleClose();
    } catch (error) {
      console.error("Error al procesar la transacción:", error);
      toast.error("Ocurrió un error al procesar la transacción");
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType("income");
    setCategory("");
    setAmountError(null);
    setCategoryError(null);
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
            onChange={(e) => {
              setAmount(e.target.value);
              validateAmount(e.target.value, balance, transactionToEdit);
            }}
            fullWidth
            required
            error={!!amountError}
            helperText={amountError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: {
                step: "0.01",
                min: 0,
                pattern: "^\\d+(\\.\\d{1,2})?$",
              },
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
              onChange={(e) => {
                setType(e.target.value as "income" | "expense");
                setCategory("");
                validateCategory();
              }}
              label="Tipo"
              sx={styles.select}
            >
              <MenuItem value="income">Ingreso</MenuItem>
              <MenuItem value="expense">Gasto</MenuItem>
            </Select>
          </FormControl>

          {type === "expense" && (
            <FormControl
              fullWidth
              sx={styles.textField}
              margin="normal"
              error={!!categoryError}
            >
              <InputLabel>Categoría</InputLabel>
              <Select
                value={category}
                onChange={(e) => {
                  setCategory(Number(e.target.value));
                  validateCategory();
                }}
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
              {categoryError && (
                <div
                  style={{
                    color: theme.palette.error.main,
                    fontSize: "0.75rem",
                    marginLeft: "14px",
                    marginTop: "4px",
                  }}
                >
                  {categoryError}
                </div>
              )}
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
