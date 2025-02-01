import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { SavingType, SavingTransaction } from "@prisma/client";
import {
  CreateSavingTransactionData,
  UpdateSavingTransactionData,
} from "@/models/SavingTransaction";
import { Decimal } from "decimal.js";

interface EditSavingTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (
    transactionId: number,
    updatedTransaction: UpdateSavingTransactionData
  ) => void;
  transaction: SavingTransaction | null;
}

const EditSavingTransactionModal: React.FC<EditSavingTransactionModalProps> = ({
  open,
  onClose,
  onSave,
  transaction,
}) => {
  const [formData, setFormData] = useState<UpdateSavingTransactionData>({
    amount: 0,
    description: "",
    type: SavingType.deposit,
    saving_goal_id: 0,
    id: 0,
  });

  useEffect(() => {
    if (transaction) {
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        saving_goal_id: transaction.saving_goal_id,
        id: transaction.id,
      });
    }
  }, [transaction]);

  const handleChange = (
    event: React.ChangeEvent<{ name?: string; value: unknown }>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = () => {
    if (transaction) {
      onSave(transaction.id, formData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar Transacción</DialogTitle>
      <DialogContent>
        <TextField
          label="Monto"
          name="amount"
          type="number"
          fullWidth
          value={formData.amount}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          label="Descripción"
          name="description"
          fullWidth
          value={formData.description}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          select
          label="Tipo"
          name="type"
          fullWidth
          value={formData.type}
          onChange={handleChange}
          margin="normal"
        >
          <MenuItem value={SavingType.deposit}>Depósito</MenuItem>
          <MenuItem value={SavingType.withdrawal}>Retiro</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancelar
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSavingTransactionModal;
