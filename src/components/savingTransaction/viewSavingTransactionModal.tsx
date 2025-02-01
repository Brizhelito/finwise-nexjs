import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { SavingTransaction, SavingType } from "@prisma/client";
import { ProcessedSavingGoal } from "./SavingGoalsPage";

interface ViewSavingTransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction: SavingTransaction | null;
  savingGoals: ProcessedSavingGoal[];
}

const ViewSavingTransactionModal: React.FC<ViewSavingTransactionModalProps> = ({
  open,
  onClose,
  transaction,
  savingGoals,
}) => {
  if (!transaction) return null;

  const goal = savingGoals.find((g) => g.id === transaction.saving_goal_id);
  const transactionDate = new Date(transaction.createdAt).toLocaleDateString();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transaction Details</DialogTitle>
      <DialogContent dividers>
        <TextField
          label="Amount"
          value={transaction.amount.toString()}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Type"
          value={transaction.type}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Date"
          value={transactionDate}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Description"
          value={transaction.description || "N/A"}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />

        <TextField
          label="Saving Goal"
          value={goal?.name || "N/A"}
          fullWidth
          margin="normal"
          InputProps={{ readOnly: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewSavingTransactionModal;
