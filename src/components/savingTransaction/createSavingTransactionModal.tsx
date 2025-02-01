import React, { useState } from "react";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";
import { CreateSavingTransactionData } from "@/models/SavingTransaction";
import { SavingType } from "@prisma/client";
interface CreateSavingTransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (savingTransaction: CreateSavingTransactionData) => void;
  transactionType: SavingType;
  savingGoalId: number;
}

const CreateSavingTransactionModal: React.FC<
  CreateSavingTransactionModalProps
> = ({ open, onClose, onSave, savingGoalId, transactionType }) => {
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" component="h2">
          Haciendo un {transactionType}
        </Typography>
        <TextField
          label="Amount"
          type="number"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <TextField
          label="Description"
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} color="secondary" sx={{ mr: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onSave({
                amount,
                description,
                type: transactionType,
                saving_goal_id: savingGoalId,
              })
            }
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CreateSavingTransactionModal;
