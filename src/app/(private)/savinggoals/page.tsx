"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { Container, Alert, CircularProgress, Box } from "@mui/material";
import { SavingGoal, SavingTransaction, SavingType } from "@prisma/client";
import axios from "axios";
import { Decimal } from "decimal.js";
import GoalDialog from "@/components/savingGoal/goalDialog";
import SavingTransactionList from "@/components/savingTransaction/savingTransactionList";
import SavingGoalHeader from "@/components/savingGoal/savingGoalHeader";
import { CreateSavingGoalData } from "@/models/SavingGoal";
import {
  CreateSavingTransactionData,
  UpdateSavingTransactionData,
} from "@/models/SavingTransaction";
import SavingTransactionModal from "@/components/savingTransaction/savingTransactionModal";
import SavingGoalList from "@/components/savingGoal/savingGoalsList";

// Types
type TransactionModalMode = "view" | "edit" | "create";

interface ProcessedSavingGoal
  extends Omit<SavingGoal, "currentAmount" | "targetAmount"> {
  currentAmount: Decimal;
  targetAmount: Decimal;
}

interface ProcessedSavingTransaction extends Omit<SavingTransaction, "amount"> {
  amount: Decimal;
  createdAt: Date;
}

// Custom hook for data fetching and state management
const useSavingsData = () => {
  const [totalSaving, setTotalSaving] = useState<Decimal>(new Decimal(0));
  const [goals, setGoals] = useState<ProcessedSavingGoal[]>([]);
  const [savingTransactions, setSavingTransactions] = useState<
    ProcessedSavingTransaction[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const processGoalData = useCallback(
    (goal: SavingGoal): ProcessedSavingGoal => ({
      ...goal,
      currentAmount: new Decimal(goal.currentAmount.toString()),
      targetAmount: new Decimal(goal.targetAmount.toString()),
      due_date: new Date(goal.due_date),
    }),
    []
  );

  const processTransactionData = useCallback(
    (transaction: SavingTransaction): ProcessedSavingTransaction => ({
      ...transaction,
      amount: new Decimal(transaction.amount.toString()),
      createdAt: new Date(transaction.createdAt),
    }),
    []
  );

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [goalsRes, totalRes, transactionsRes] = await Promise.all([
        axios.get<SavingGoal[]>("/api/savingGoals", {
          params: { isCompleted: false },
        }),
        axios.get<{ total_saved: string }>("/api/savings"),
        axios.get<SavingTransaction[]>("/api/savingTransactions"),
      ]);

      setGoals(goalsRes.data.map(processGoalData));
      setTotalSaving(new Decimal(totalRes.data.total_saved));
      setSavingTransactions(transactionsRes.data.map(processTransactionData));
    } catch (err) {
      setError("Failed to fetch data. Please try again later.");
      console.error("Error fetching data", err);
    } finally {
      setIsLoading(false);
    }
  }, [processGoalData, processTransactionData]);

  return {
    totalSaving,
    setTotalSaving,
    goals,
    setGoals,
    savingTransactions,
    setSavingTransactions,
    isLoading,
    error,
    setError,
    fetchData,
    processGoalData,
    processTransactionData,
  };
};

// Custom hook for transaction modal state
const useTransactionModal = () => {
  const [modalMode, setModalMode] = useState<TransactionModalMode>("view");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number>();
  const [selectedTransaction, setSelectedTransaction] =
    useState<ProcessedSavingTransaction | null>(null);
  const [savingType, setSavingType] = useState<SavingType | undefined>(); // Cambia a undefined

  const handleOpen = useCallback(
    (
      mode: TransactionModalMode,
      goalId?: number,
      transaction?: ProcessedSavingTransaction,
      type?: SavingType
    ) => {
      setModalMode(mode);
      setSelectedTransaction(transaction || null);
      setSelectedGoalId(goalId);
      setSavingType(type); // Actualiza directamente el tipo
      setIsOpen(true);
    },
    []
  );

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setSavingType(undefined); // Limpia el tipo al cerrar
  }, []);

  return {
    modalMode,
    isOpen,
    setIsOpen,
    selectedGoalId,
    selectedTransaction,
    savingType,
    handleOpen,
    handleClose, // Añade este método
  };
};

const SavingGoalsPage: React.FC = () => {
  const {
    totalSaving,
    setTotalSaving,
    goals,
    setGoals,
    savingTransactions,
    setSavingTransactions,
    isLoading,
    error,
    setError,
    fetchData,
    processGoalData,
    processTransactionData,
  } = useSavingsData();


  const modal = useTransactionModal();
  const [openDialog, setOpenDialog] = useState(false);
  const [newGoal, setNewGoal] = useState<CreateSavingGoalData>({
    name: "",
    targetAmount: 0,
    currentAmount: 0,
    due_date: new Date(),
  });

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveTransaction = async (
    data:
      | CreateSavingTransactionData
      | UpdateSavingTransactionData
      | SavingTransaction
  ) => {
    try {
      if (modal.modalMode === "create") {
        await handleCreateSavingTransaction(
          data as CreateSavingTransactionData
        );
      } else if (modal.modalMode === "edit" && modal.selectedTransaction) {
        await handleUpdateSavingTransaction(
          modal.selectedTransaction.id,
          data as UpdateSavingTransactionData
        );
      }
    } catch {
      setError(`Failed to ${modal.modalMode} transaction`);
    }
  };

  const handleCreateSavingTransaction = async (
    transaction: CreateSavingTransactionData
  ) => {
    try {
      const response = await axios.post<SavingTransaction>(
        "/api/savingTransactions",
        transaction
      );
      const data = processTransactionData(response.data);

      setSavingTransactions((prev) => [data, ...prev]);
      setTotalSaving((prev) =>
        transaction.type === SavingType.deposit
          ? prev.plus(data.amount)
          : prev.minus(data.amount)
      );

      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === data.saving_goal_id
            ? {
                ...goal,
                currentAmount:
                  transaction.type === SavingType.deposit
                    ? goal.currentAmount.plus(data.amount)
                    : goal.currentAmount.minus(data.amount),
              }
            : goal
        )
      );
    } catch (err) {
      setError(`Failed to create ${transaction.type} transaction`);
      console.error("Error creating transaction", err);
    }
  };

  const handleUpdateSavingTransaction = async (
    transactionId: number,
    updatedTransaction: UpdateSavingTransactionData
  ) => {
    try {
      const response = await axios.put<SavingTransaction>(
        `/api/savingTransactions`,
        updatedTransaction
      );
      const data = processTransactionData(response.data);

      setSavingTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? data : t))
      );

      setGoals((prev) =>
        prev.map((goal) => {
          if (goal.id === data.saving_goal_id) {
            const prevTransaction = savingTransactions.find(
              (t) => t.id === transactionId
            );
            if (!prevTransaction) return goal;

            let adjustedAmount = goal.currentAmount.minus(
              prevTransaction.amount
            );
            adjustedAmount =
              updatedTransaction.type === SavingType.deposit
                ? adjustedAmount.plus(data.amount)
                : adjustedAmount.minus(data.amount);

            return { ...goal, currentAmount: adjustedAmount };
          }
          return goal;
        })
      );
    } catch (err) {
      setError("Failed to update transaction");
      console.error("Error updating transaction", err);
    }
  };

  const handleCreateGoal = async (goal: CreateSavingGoalData) => {
    try {
      const response = await axios.post<SavingGoal>("/api/savingGoals", goal);
      setGoals((prev) => [processGoalData(response.data), ...prev]);
    } catch (err) {
      setError("Failed to create goal");
      console.error("Error creating goal", err);
    }
  };

  const handleDeleteGoal = useCallback(async (goalId: number) => {
    try {
      await axios.delete(`/api/savingGoals?id=${goalId}`);
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } catch (err) {
      setError("Failed to delete goal");
      console.error("Error deleting goal", err);
    }
  }, []);



  const handleDeleteSavingTransaction = async (transactionId: number) => {
    try {
      const transactionToDelete = savingTransactions.find(
        (t) => t.id === transactionId
      );
      if (!transactionToDelete) return;

      await axios.delete(`/api/savingTransactions?id=${transactionId}`);

      setSavingTransactions((prev) =>
        prev.filter((t) => t.id !== transactionId)
      );

      setTotalSaving((prev) =>
        transactionToDelete.type === SavingType.deposit
          ? prev.minus(transactionToDelete.amount)
          : prev.plus(transactionToDelete.amount)
      );

      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === transactionToDelete.saving_goal_id
            ? {
                ...goal,
                currentAmount:
                  transactionToDelete.type === SavingType.deposit
                    ? goal.currentAmount.minus(transactionToDelete.amount)
                    : goal.currentAmount.plus(transactionToDelete.amount),
              }
            : goal
        )
      );
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Error deleting transaction", err);
    }
  };

  const containerStyles = useMemo(
    () => ({
      minHeight: "100vh",
      p: { xs: 2, sm: 4 },
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }),
    []
  );

  return (
    <Container
      maxWidth="lg"
      disableGutters
      sx={{
        ...containerStyles,
        maxWidth: "lg !important",
        px: { xs: 0, sm: 2 }, // Eliminar padding horizontal en móvil
        p: { xs: 0, sm: 4 }, // Ajustar padding general
        gap: { xs: 2, sm: 4 }, // Reducir espacio entre elementos en móvil

      }}
    >
      <SavingGoalHeader
        onAddGoal={() => setOpenDialog(true)}
        totalSaving={totalSaving.toNumber()}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isLoading ? (
        <CircularProgress sx={{ alignSelf: "center" }} />
      ) : (
        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", px: { xs: 2, sm: 0 } }}>
          <GoalDialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            onCreate={handleCreateGoal}
            newGoal={newGoal}
            setNewGoal={setNewGoal}
          />

          <SavingGoalList
            goals={goals}
            onAddTransaction={(mode, goalId, type) =>
              modal.handleOpen(mode, goalId, undefined, type)
            }
            onDeleteGoal={handleDeleteGoal}
          />

          <SavingTransactionList
            savingTransactions={savingTransactions}
            savingGoals={goals}
            onDelete={handleDeleteSavingTransaction}
            onEdit={(transaction) =>
              modal.handleOpen("edit", undefined, transaction)
            }
            onView={(transaction) =>
              modal.handleOpen("view", undefined, transaction)
            }
          />

          <SavingTransactionModal
            open={modal.isOpen}
            onClose={() => modal.setIsOpen(false)}
            mode={modal.modalMode}
            transaction={modal.selectedTransaction}
            savingGoals={goals}
            onSave={handleSaveTransaction}
            savingGoalId={modal.selectedGoalId}
            transactionType={modal.savingType || undefined} // Añade esta línea
          />
        </Box>
      )}
    </Container>
  );
};

export default SavingGoalsPage;
