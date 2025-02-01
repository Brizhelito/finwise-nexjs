import {
  List,
  ListItem,
  Box,
  Typography,
  Grid,
  IconButton,
  Tooltip,
  useMediaQuery,
  Theme,
} from "@mui/material";
import { Delete, Edit, Visibility, MoreVert } from "@mui/icons-material";
import { SavingTransaction, SavingType, SavingGoal } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";
import ConfirmationModal from "@components/ui/ConfirmationModal";

type SavingTransactionListProps = {
  savingTransactions: SavingTransaction[];
  savingGoals: SavingGoal[];
  onEdit: (transaction: SavingTransaction) => void;
  onDelete: (transactionId: number) => void;
  onView: (transaction: SavingTransaction) => void;
};

const SavingTransactionList: React.FC<SavingTransactionListProps> = ({
  savingTransactions,
  savingGoals,
  onEdit,
  onDelete,
  onView,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<
    number | null
  >(null);
  const getTransactionToDelete = () => {
    return savingTransactions.find((t) => t.id === selectedTransactionId);
  };
  const transactionToDelete = getTransactionToDelete();

  const isMobile = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(
    null
  );

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setAnchorEl(event.currentTarget);
    setSelectedTransaction(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTransaction(null);
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd/MM/yyyy", { locale: es });
  };

  const getSavingGoalName = (saving_goal_id: number) => {
    const savingGoal = savingGoals.find((goal) => goal.id === saving_goal_id);
    return savingGoal ? savingGoal.name : "General";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  return (
    <Box sx={{ marginTop: 4, paddingBottom: 4, width: "100%" }}>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "#1F2937", mb: 2 }}
      >
        Historial de transacciones
      </Typography>

      {/* Encabezado - Solo desktop */}
      {!isMobile && (
        <Grid
          container
          sx={{
            p: 2,
            borderBottom: "1px solid #E5E7EB",
            display: { xs: "none", sm: "flex" },
          }}
        >
          <Grid item sm={3} md={4}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Fecha
            </Typography>
          </Grid>
          <Grid item sm={3} md={2}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, textAlign: "center" }}
            >
              Monto
            </Typography>
          </Grid>
          <Grid item sm={3} md={3}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, textAlign: "center" }}
            >
              Meta
            </Typography>
          </Grid>
          <Grid item sm={3} md={3}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, textAlign: "center" }}
            >
              Acciones
            </Typography>
          </Grid>
        </Grid>
      )}

      <List>
        {savingTransactions.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ textAlign: "center", color: "#6B7280", p: 2 }}
          >
            No hay transacciones registradas
          </Typography>
        ) : (
          savingTransactions.map((transaction) => (
            <Box
              key={transaction.id}
              sx={{
                mb: 2,
                borderRadius: 2,
                boxShadow: 1,
                backgroundColor:
                  transaction.type === "deposit" ? "#f0fdf4" : "#fff7ed",
              }}
            >
              <ListItem sx={{ p: { xs: 1, sm: 2 } }}>
                {isMobile ? (
                  <Grid container spacing={1} sx={{ width: "100%" }}>
                    <Grid item xs={8}>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {formatDate(transaction.createdAt)}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color:
                              transaction.type === "deposit"
                                ? "#16a34a"
                                : "#dc2626",
                            fontWeight: 600,
                          }}
                        >
                          {`${
                            transaction.type === SavingType.withdrawal
                              ? "-"
                              : ""
                          }${formatCurrency(Number(transaction.amount))}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#4b5563", fontSize: "0.875rem" }}
                        >
                          {getSavingGoalName(transaction.saving_goal_id)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid
                      item
                      xs={4}
                      sx={{ display: "flex", justifyContent: "flex-end" }}
                    >
                      <IconButton
                        aria-label="more"
                        onClick={(e) => handleMenuOpen(e, transaction.id)}
                        sx={{ color: "#6b7280" }}
                      >
                        <MoreVert />
                      </IconButton>
                    </Grid>
                  </Grid>
                ) : (
                  <Grid
                    container
                    alignItems="center"
                    spacing={2}
                    sx={{ width: "100%" }}
                  >
                    <Grid item sm={3} md={4}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {formatDate(transaction.createdAt)}
                      </Typography>
                    </Grid>
                    <Grid item sm={3} md={2} sx={{ textAlign: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{
                          fontWeight: 600,
                          color:
                            transaction.type === "deposit"
                              ? "#16a34a"
                              : "#dc2626",
                        }}
                      >
                        {`${
                          transaction.type === SavingType.withdrawal ? "-" : ""
                        }${formatCurrency(Number(transaction.amount))}`}
                      </Typography>
                    </Grid>
                    <Grid item sm={3} md={3} sx={{ textAlign: "center" }}>
                      <Typography variant="body2" sx={{ color: "#4b5563" }}>
                        {getSavingGoalName(transaction.saving_goal_id)}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      sm={3}
                      md={3}
                      sx={{ display: "flex", justifyContent: "center", gap: 1 }}
                    >
                      <Tooltip title="Ver detalles">
                        <IconButton
                          onClick={() => onView(transaction)}
                          sx={{ color: "#3b82f6" }}
                          size="small"
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Editar">
                        <IconButton
                          onClick={() => onEdit(transaction)}
                          sx={{ color: "#f59e0b" }}
                          size="small"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          onClick={() => {
                            setSelectedTransactionId(transaction.id);
                            setDeleteModalOpen(true);
                          }}
                          sx={{ color: "#ef4444" }}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                  </Grid>
                )}
              </ListItem>
            </Box>
          ))
        )}
      </List>

      {/* Menú mobile */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          onClick={() => {
            const transaction = savingTransactions.find(
              (t) => t.id === selectedTransaction
            );
            if (transaction) onView(transaction);
            handleMenuClose();
          }}
        >
          <Visibility fontSize="small" sx={{ mr: 1, color: "#3b82f6" }} />
          Ver
        </MenuItem>
        <MenuItem
          onClick={() => {
            const transaction = savingTransactions.find(
              (t) => t.id === selectedTransaction
            );
            if (transaction) onEdit(transaction);
            handleMenuClose();
          }}
        >
          <Edit fontSize="small" sx={{ mr: 1, color: "#f59e0b" }} />
          Editar
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (selectedTransaction) {
              setSelectedTransactionId(selectedTransaction);
              setDeleteModalOpen(true);
            }
            handleMenuClose();
          }}
        >
          <Delete fontSize="small" sx={{ mr: 1, color: "#ef4444" }} />
          Eliminar
        </MenuItem>
      </Menu>
      <ConfirmationModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedTransactionId(null);
        }}
        onConfirm={() => {
          if (selectedTransactionId) {
            onDelete(selectedTransactionId);
          }
          setDeleteModalOpen(false);
          setSelectedTransactionId(null);
        }}
        title="Eliminar transacción"
        content={
          transactionToDelete
            ? `¿Estás seguro de eliminar la transacción del ${formatDate(
                transactionToDelete.createdAt
              )} por ${formatCurrency(Number(transactionToDelete.amount))}?`
            : "¿Eliminar transacción?"
        }
        confirmButtonText="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
};

export default SavingTransactionList;
