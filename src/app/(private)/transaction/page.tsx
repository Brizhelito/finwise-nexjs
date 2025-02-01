"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Container, Box, Typography, Paper, useTheme } from "@mui/material";
import TransactionModal from "@components/transaction/TransactionModal";
import FilterModal from "@components/transaction/FilterModal";
import TransactionList from "@components/transaction/TransactionList";
import {
  CreateTransactionData,
  TransactionFilters,
} from "@/models/Transaction";
import { Category, Transaction } from "@prisma/client";
import Decimal from "decimal.js";
import ActionControls from "@/components/ActionControls";
import ResponsiveChart, {
  TransactionMetrics,
} from "@/components/ResponsiveChart";

const TransactionPage: React.FC = () => {
  const theme = useTheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [montlyMetrics, setMontlyMetrics] = useState<TransactionMetrics[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({
    type: undefined,
    description: undefined,
    minAmount: undefined,
    maxAmount: undefined,
    sortBy: "createdAt",
    sortDirection: "desc",
    userId: 1, // Replace with actual user ID
  });
  const [balance, setBalance] = useState<Decimal>(new Decimal(0));
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const handleDeleteTransaction = async (transaction: Transaction) => {
    const id = transaction.id;
    try {
      if (transactions.find((t) => t.id === id)) {
        await axios.delete(`/api/transactions`);
        setTransactions(transactions.filter((t) => t.id !== id));
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };
  const handleOpenTransactionModal = () => setIsTransactionModalOpen(true);
  const handleCloseTransactionModal = () => setIsTransactionModalOpen(false);

  const handleOpenFilterModal = () => setIsFilterModalOpen(true);
  const handleCloseFilterModal = () => setIsFilterModalOpen(false);
  const handleSubmitTransaction = async (
    transaction: CreateTransactionData | Transaction
  ) => {
    try {
      if ("id" in transaction) {
        // Lógica para actualizar
        const response = await axios.put(`/api/transactions`, transaction);
        setTransactions(
          transactions.map((t) =>
            t.id === response.data.id ? response.data : t
          )
        );
      } else {
        // Lógica para crear
        const response = await axios.post("/api/transactions", transaction);
        setTransactions([response.data, ...transactions]);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };


  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get("/api/transactions", {
          params: filters,
        });
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await axios.get<Category[]>("/api/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };
    const fetchBalance = async () => {
      try {
        const response = await axios.get("/api/balance");
        setBalance(response.data.balance);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    };
    fetchBalance();
    fetchCategories();
    fetchTransactions();
  }, [filters]);
  useEffect(() => {
    const fetchTransactionMetrics = async () => {
      try {
        const response = await axios.get("/api/transactions/metrics");
        const result: TransactionMetrics[] = response.data;

        // Verifica el formato de los datos
        const isValid = result.every(
          (item) =>
            typeof item.date === "string" &&
            typeof item.income === "string" &&
            typeof item.expense === "string"
        );

        if (isValid) {
          setMontlyMetrics(result);
        }
      } catch (error) {
        console.error("Error fetching metrics:", error);
      }
    };

    fetchTransactionMetrics();
  }, [transactions]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        marginTop: { xs: "56px", sm: "64px" },
        [theme.breakpoints.up("md")]: {
          marginTop: "80px",
        },
        backgroundColor: "#F9FAFB",
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 2, md: 4 },
            borderRadius: "16px",
            backgroundColor: "#FFFFFF",
            color: "#1E293B",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            marginBottom: 4,
            overflow: "hidden", // Evitar overflow
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "700",
                textAlign: "center",
                color: "#111827",
                fontSize: { xs: "1.75rem", md: "2.125rem" },
                letterSpacing: "-0.025em",
              }}
            >
              Gestión de Transacciones
            </Typography>

            <Box
              sx={{
                width: "100%",
                height: {
                  xs: "400px", // Móvil
                  sm: "500px", // Tablet
                  md: "600px", // Desktop pequeño
                  lg: "70vh", // Desktop grande con altura dinámica
                },
                minHeight: "300px",
                maxHeight: "80vh", // Limitar la altura máxima
                position: "relative",
                p: 2,
                backgroundColor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
                overflow: "hidden", // Evitar que el gráfico se salga
              }}
            >
              {/* Descripción del gráfico */}
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: "text.primary",
                  fontSize: {
                    xs: "1rem",
                    sm: "1.1rem",
                    md: "1.25rem",
                  },
                }}
              >
                Flujo de Transacciones Mensuales
                <Typography
                  component="span"
                  variant="body2"
                  sx={{
                    ml: 2,
                    color: "text.secondary",
                    fontSize: {
                      xs: "0.75rem",
                      sm: "0.85rem",
                    },
                  }}
                >
                  (Datos en USD)
                </Typography>
              </Typography>

              {/* Leyenda interactiva */}
              <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#4CAF50",
                      mr: 1,
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="caption">Ingresos</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: "#F44336",
                      mr: 1,
                      borderRadius: "50%",
                    }}
                  />
                  <Typography variant="caption">Gastos</Typography>
                </Box>
              </Box>

              {/* Contenedor del gráfico */}
              <Box
                sx={{
                  width: "100%",
                  height: "calc(100% - 72px)", // Ajuste para la descripción
                  position: "relative",
                  overflow: "hidden", // Evitar que el gráfico se salga
                }}
              >
                <ResponsiveChart data={montlyMetrics} />
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                width: { xs: "100%", md: "auto" },
                justifyContent: { xs: "space-between", md: "flex-end" },
              }}
            >
              <ActionControls
                onAdd={handleOpenTransactionModal}
                onFilter={handleOpenFilterModal}
              />
            </Box>
            <Box
              sx={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: 3,
                boxShadow: theme.shadows[1],
                border: "1px solid #E5E7EB",
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "600",
                  color: "#1F2937",
                  marginBottom: 2,
                  fontSize: "1.25rem",
                }}
              >
                Balance actual:{" "}
                <span style={{ color: "#10B981" }}>${balance.toString()}</span>
              </Typography>

              <TransactionList
                transactions={transactions}
                onEdit={(transaction) => {
                  setSelectedTransaction(transaction);
                  setIsTransactionModalOpen(true);
                }}
                onDelete={handleDeleteTransaction}
                categories={categories}
              />
            </Box>

            <TransactionModal
              open={isTransactionModalOpen}
              handleClose={handleCloseTransactionModal}
              onSubmit={handleSubmitTransaction}
              categories={categories}
              transactionToEdit={selectedTransaction ?? undefined}
            />

            <FilterModal
              open={isFilterModalOpen}
              handleClose={handleCloseFilterModal}
              filters={filters}
              setFilters={setFilters}
              categories={categories}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TransactionPage;
