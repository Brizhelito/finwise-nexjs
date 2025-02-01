import { useMemo, useState, useEffect } from "react";
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
  SelectChangeEvent,
  useTheme,
  InputAdornment,
} from "@mui/material";
import { SavingTransaction, SavingType } from "@prisma/client";
import { Decimal } from "decimal.js";

// Tipos
interface ProcessedSavingGoal {
  id: number;
  name: string;
  currentAmount: Decimal;
  targetAmount: Decimal;
  due_date: Date;
}

type TransactionModalMode = "view" | "edit" | "create";

type TransactionFormData = {
  amount: string;
  type: SavingType;
  saving_goal_id: number;
};

interface SavingTransactionModalProps {
  open: boolean;
  onClose: () => void;
  mode: TransactionModalMode;
  transaction?: SavingTransaction | null;
  savingGoals: ProcessedSavingGoal[];
  onSave: (
    data:
      | SavingTransaction
      | CreateSavingTransactionData
      | UpdateSavingTransactionData
  ) => Promise<void>;
  savingGoalId?: number;
  transactionType?: SavingType;
}

// Tipos para crear/actualizar transacciones
interface CreateSavingTransactionData {
  amount: number;
  type: SavingType;
  saving_goal_id: number;
}

interface UpdateSavingTransactionData extends CreateSavingTransactionData {
  id: number;
}

// Hook personalizado para manejo del formulario
const useTransactionForm = (
  mode: TransactionModalMode,
  transaction: SavingTransaction | null | undefined,
  savingGoalId?: number,
  transactionType?: SavingType
) => {
  const initialFormData = useMemo(
    (): TransactionFormData => ({
      amount: "",
      type: transactionType || SavingType.withdrawal,
      saving_goal_id: savingGoalId || 0,
    }),
    [savingGoalId, transactionType]
  );

  const [formData, setFormData] =
    useState<TransactionFormData>(initialFormData);

  useEffect(() => {
    if (mode === "edit" || mode === "view") {
      setFormData({
        amount: transaction?.amount.toString() || "",
        type: transaction?.type || SavingType.deposit,
        saving_goal_id: transaction?.saving_goal_id || 0,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [mode, transaction, initialFormData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleTypeChange = (e: SelectChangeEvent<SavingType>) => {
    setFormData((prev) => ({ ...prev, type: e.target.value as SavingType }));
  };

  const handleGoalChange = (e: SelectChangeEvent<number>) => {
    setFormData((prev) => ({
      ...prev,
      saving_goal_id: Number(e.target.value),
    }));
  };

  return {
    formData,
    handleChange,
    handleTypeChange,
    handleGoalChange,
  };
};

const SavingTransactionModal: React.FC<SavingTransactionModalProps> = ({
  open,
  onClose,
  mode,
  transaction,
  savingGoals,
  onSave,
  savingGoalId,
  transactionType,
}) => {
  const { formData, handleChange, handleTypeChange, handleGoalChange } =
    useTransactionForm(mode, transaction, savingGoalId, transactionType);
  const theme = useTheme();

  const handleSubmit = async () => {
    try {
      const numericAmount = parseFloat(formData.amount);

      if (isNaN(numericAmount)) {
        throw new Error("Monto inválido");
      }

      const transactionData = {
        ...(mode === "edit" && transaction?.id ? { id: transaction.id } : {}),
        amount: numericAmount,
        type: formData.type,
        saving_goal_id: formData.saving_goal_id,
      };

      await onSave(transactionData);
      onClose();
    } catch (error) {
      console.error("Error al guardar transacción:", error);
    }
  };

  const isViewMode = mode === "view";
  const modeTitles = {
    create: "Crear Transacción",
    edit: "Editar Transacción",
    view: "Ver Transacción",
  };
  const title = modeTitles[mode];

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
        textAlign: "left",
        fontFamily: "inherit",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
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
          fontFamily: "inherit",
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
      helperText: {
        fontSize: "0.75rem",
        mx: 0,
        color: "error.main",
        fontWeight: 500,
        fontStyle: "italic",
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
          flexDirection: "row",
          justifyContent: "flex-end",
        },
      },
      cancelButton: {
        color: theme.palette.text.secondary,
        borderColor: theme.palette.divider,
        borderRadius: "8px",
        px: 3,
        py: 1,
        fontWeight: 700,
        letterSpacing: "0.5px",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          borderColor: theme.palette.primary.light,
        },
        [theme.breakpoints.down("sm")]: {
          width: "auto",
        },
      },
      submitButton: {
        bgcolor: "primary.main",
        borderRadius: "8px",
        px: 3,
        py: 1,
        fontWeight: 700,
        letterSpacing: "0.5px",
        color: "primary.contrastText",
        boxShadow: theme.shadows[2],
        "&:hover": {
          bgcolor: "primary.dark",
          boxShadow: theme.shadows[4],
        },
        [theme.breakpoints.down("sm")]: {
          width: "auto",
        },
      },
      disabledField: {
        "& .MuiInputBase-input": {
          color: theme.palette.text.secondary,
          WebkitTextFillColor: theme.palette.text.secondary,
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: `${theme.palette.divider} !important`,
        },
      },
    }),
    [theme]
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: styles.dialogPaper }}
    >
      <DialogTitle sx={styles.dialogTitle}>{title}</DialogTitle>

      <DialogContent dividers sx={styles.formContainer}>
        <FormControl
          fullWidth
          margin="normal"
          sx={styles.textField}
          disabled={
            isViewMode || (mode === "create" && transactionType !== undefined)
          }
        >
          <InputLabel>Tipo de Transacción</InputLabel>
          <Select
            name="type"
            value={formData.type}
            onChange={handleTypeChange}
            label="Tipo de Transacción"
            sx={isViewMode ? styles.disabledField : undefined}
          >
            <MenuItem value={SavingType.deposit}>Depósito</MenuItem>
            <MenuItem value={SavingType.withdrawal}>Retiro</MenuItem>
          </Select>
        </FormControl>

        <TextField
          name="amount"
          label="Monto"
          value={formData.amount}
          onChange={handleChange}
          fullWidth
          margin="normal"
          type="number"
          InputProps={{
            readOnly: isViewMode,
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={styles.textField}
          disabled={isViewMode}
        />

        {mode === "create" && (
          <FormControl
            fullWidth
            margin="normal"
            sx={styles.textField}
            disabled={isViewMode}
          >
            <InputLabel>Meta de Ahorro</InputLabel>
            <Select
              name="saving_goal_id"
              value={formData.saving_goal_id}
              onChange={handleGoalChange}
              label="Meta de Ahorro"
            >
              {savingGoals.map((goal) => (
                <MenuItem key={goal.id} value={goal.id}>
                  {goal.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
          Cancelar
        </Button>
        {!isViewMode && (
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={styles.submitButton}
          >
            {mode === "create" ? "Crear" : "Guardar"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SavingTransactionModal;
