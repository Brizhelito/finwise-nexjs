import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  InputAdornment,
} from "@mui/material";
import { useState, ChangeEvent, useEffect } from "react";
import { CreateSavingGoalData } from "@/models/SavingGoal";
import { useTheme } from "@mui/material/styles";

interface GoalDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (goal: CreateSavingGoalData) => void;
  onEdit?: (goal: CreateSavingGoalData) => void;
  newGoal: CreateSavingGoalData;
  setNewGoal: (goal: CreateSavingGoalData) => void;
  isEditing?: boolean;
}

const GoalDialog: React.FC<GoalDialogProps> = ({
  open,
  onClose,
  onCreate,
  newGoal,
  onEdit,
  setNewGoal,
  isEditing,
}) => {
  const theme = useTheme();
  const [errors, setErrors] = useState({
    name: "",
    targetAmount: "",
    dueDate: "",
  });

  useEffect(() => {
    if (open && !isEditing) {
      setNewGoal({
        name: "",
        targetAmount: 0,
        currentAmount: 0,
        due_date: new Date(),
      });
      setErrors({ name: "", targetAmount: "", dueDate: "" });
    }
  }, [open, setNewGoal, isEditing]);

  const validateFields = () => {
    const newErrors: typeof errors = {
      name: "",
      targetAmount: "",
      dueDate: "",
    };
    let isValid = true;

    if (!newGoal.name.trim()) {
      newErrors.name = "Goal name is required";
      isValid = false;
    } else if (newGoal.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters";
      isValid = false;
    }

    if (newGoal.targetAmount <= 0) {
      newErrors.targetAmount = "Amount must be greater than 0";
      isValid = false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(newGoal.due_date);
    dueDate.setHours(0, 0, 0, 0);

    if (!newGoal.due_date) {
      newErrors.dueDate = "Due date is required";
      isValid = false;
    } else if (dueDate < today) {
      newErrors.dueDate = "Date must be today or future";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateFields()) {
      if (isEditing && onEdit) {
        onEdit(newGoal);
      } else {
        onCreate(newGoal);
      }
      onClose();
    }
  };

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const styles = {
    dialogPaper: {
      borderRadius: "16px",
      bgcolor: "background.paper",
      boxShadow: 24,
      backgroundImage: "none",
      overflow: "hidden",
      margin: "32px",
      maxWidth: `calc(35% - 64px)`, // Asegura margen en móviles
      [theme.breakpoints.down("sm")]: {
        margin: "20px",
        maxWidth: `calc(100% - 40px)`,
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
    createButton: {
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
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: styles.dialogPaper }}
    >
      <DialogTitle sx={styles.dialogTitle}>
        {isEditing ? "Editar Meta" : "Crear Meta"}
      </DialogTitle>

      <DialogContent>
        <Box sx={styles.formContainer}>
          <TextField
            autoFocus
            fullWidth
            label="Nombre de la Meta"
            margin="normal"
            value={newGoal.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewGoal({ ...newGoal, name: e.target.value })
            }
            error={!!errors.name}
            helperText={errors.name}
            sx={styles.textField}
            FormHelperTextProps={{ sx: styles.helperText }}
          />

          <TextField
            fullWidth
            label="Monto Meta"
            type="number"
            margin="normal"
            value={newGoal.targetAmount || ""}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewGoal({
                ...newGoal,
                targetAmount: Math.max(0, Number(e.target.value)),
              })
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
              inputProps: {
                min: "0.01",
                step: "0.01",
              },
            }}
            error={!!errors.targetAmount}
            helperText={errors.targetAmount}
            sx={styles.textField}
            FormHelperTextProps={{ sx: styles.helperText }}
          />

          <TextField
            fullWidth
            label="Fecha de Vencimiento"
            type="date"
            margin="normal"
            value={formatDateString(newGoal.due_date)}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewGoal({ ...newGoal, due_date: new Date(e.target.value) })
            }
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: formatDateString(new Date()),
            }}
            error={!!errors.dueDate}
            helperText={errors.dueDate}
            sx={styles.textField}
            FormHelperTextProps={{ sx: styles.helperText }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={styles.dialogActions}>
        <Button onClick={onClose} variant="outlined" sx={styles.cancelButton}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={styles.createButton}
        >
          {isEditing ? "Guardar Cambios" : "Crear Meta"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GoalDialog;
