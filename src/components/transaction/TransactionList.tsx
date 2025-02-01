import {
  List,
  ListItem,
  Box,
  Typography,
  Grid,
  useTheme,
  Chip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import { Category, Transaction } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useMemo, useState } from "react";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import SavingsIcon from "@mui/icons-material/Savings";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationModal from "../ui/ConfirmationModal";

type TransactionListProps = {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const handleOpenDeleteModal = (transaction: Transaction) => {
    setTransactionToDelete(transaction);
    setOpenDeleteModal(true);
  };

  // Manejador para confirmar la eliminación
  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      onDelete(transactionToDelete);
      setOpenDeleteModal(false);
      setTransactionToDelete(null);
    }
  };

  // Manejador para cancelar la eliminación

  const formatDate = (date: Date) => {
    return format(new Date(date), "dd MMM yyyy", { locale: es });
  };

  const getCategoryName = (categoryId: number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Sin categoría";
  };

  const sortedTransactions = useMemo(
    () =>
      [...transactions].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [transactions]
  );

  const TransactionItem = ({ transaction }: { transaction: Transaction }) => (
    <Box
      sx={{
        marginBottom: 2,
        borderRadius: "8px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.paper,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <ListItem
        sx={{
          padding: { xs: "8px", sm: 2 },
          borderLeft: `5px solid ${
            transaction.type === "income"
              ? theme.palette.success.main
              : theme.palette.error.main
          }`,
        }}
      >
        <Grid container spacing={1} alignItems="center">
          {/* Descripción */}
          <Grid item xs={12} sm={4}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 1,
                fontSize: { xs: "0.95rem", sm: "1rem" },
              }}
            >
              {transaction.type === "income" ? (
                <SavingsIcon
                  fontSize={isMobile ? "small" : "medium"}
                  color="success"
                />
              ) : (
                <AttachMoneyIcon
                  fontSize={isMobile ? "small" : "medium"}
                  color="error"
                />
              )}
              {transaction.description}
            </Typography>
          </Grid>

          {/* Fecha (ocultar en móvil) */}
          <Grid item sm={2} sx={{ display: { xs: "none", sm: "block" } }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "0.8rem" }}
            >
              {formatDate(transaction.createdAt)}
            </Typography>
          </Grid>

          {/* Monto */}
          <Grid item xs={5} sm={2}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color:
                  transaction.type === "income"
                    ? theme.palette.success.main
                    : theme.palette.error.main,
                textAlign: { xs: "left", sm: "center" },
                fontSize: { xs: "0.95rem", sm: "1rem" },
              }}
            >
              {`${transaction.type === "expense" ? "-" : ""}$${Number(
                transaction.amount
              ).toFixed(2)}`}
            </Typography>
          </Grid>

          {/* Categoría */}
          <Grid item xs={5} sm={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-start", sm: "center" },
              }}
            >
              <Chip
                label={
                  transaction.category_id
                    ? getCategoryName(transaction.category_id)
                    : transaction.type === "income"
                    ? "Ingreso"
                    : "Gasto"
                }
                size="small"
                sx={{
                  backgroundColor:
                    transaction.type === "income"
                      ? theme.palette.success.light + "30"
                      : theme.palette.error.light + "30",
                  color:
                    transaction.type === "income"
                      ? theme.palette.success.dark
                      : theme.palette.error.dark,
                  borderRadius: "6px",
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  maxWidth: 120,
                }}
              />
            </Box>
          </Grid>

          {/* Acciones */}
          <Grid item xs={2} sm={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: { xs: "flex-end", sm: "center" },
                gap: { xs: 0, sm: 1 },
                paddingLeft: { xs: 1, sm: 0 },
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(transaction);
                }}
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: theme.palette.text.secondary,
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    color: theme.palette.primary.main,
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <EditIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDeleteModal(transaction);
                }}
                size={isMobile ? "small" : "medium"}
                sx={{
                  color: theme.palette.text.secondary,
                  padding: { xs: "6px", sm: "8px" },
                  "&:hover": {
                    color: theme.palette.error.main,
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
              </IconButton>
            </Box>
          </Grid>

          {/* Fecha para móvil */}
          <Grid item xs={12} sx={{ display: { xs: "block", sm: "none" } }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "0.75rem" }}
            >
              {formatDate(transaction.createdAt)}
            </Typography>
          </Grid>
        </Grid>
      </ListItem>
    </Box>
  );

  return (
    <Box sx={{ marginTop: 2 }}>
      {/* Encabezado (solo desktop) */}
      <Box sx={{ display: { xs: "none", sm: "block" }, mb: 2 }}>
        <Grid container spacing={2} sx={{ px: 2 }}>
          <Grid item sm={4}>
            <Typography variant="subtitle2" color="text.secondary">
              DESCRIPCIÓN
            </Typography>
          </Grid>
          <Grid item sm={2}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              align="center"
            >
              FECHA
            </Typography>
          </Grid>
          <Grid item sm={2}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              align="center"
            >
              MONTO
            </Typography>
          </Grid>
          <Grid item sm={2}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              align="center"
            >
              CATEGORÍA
            </Typography>
          </Grid>
          <Grid item sm={2}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              align="center"
            >
              ACCIONES
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <List sx={{ py: 0 }}>
        {sortedTransactions.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <SavingsIcon sx={{ fontSize: 40, color: "text.disabled" }} />
            <Typography variant="body2" color="text.secondary">
              No se encontraron transacciones
            </Typography>
          </Box>
        ) : (
          sortedTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))
        )}
      </List>
      <ConfirmationModal
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Transacción"
        content={`Estas seguro de eliminar la transacción realizada el ${
          transactionToDelete ? formatDate(transactionToDelete.createdAt) : ""
        } por un monto de ${
          transactionToDelete ? transactionToDelete.amount : ""
        }?`}
        confirmButtonText="Eliminar"
        confirmColor="error"
      />
    </Box>
  );
};

export default TransactionList;
