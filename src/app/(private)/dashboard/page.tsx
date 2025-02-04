  "use client";
  import React, { useEffect, useState } from "react";
  import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    LinearProgress,
    useTheme,
    useMediaQuery,
    Button,
    alpha,
    keyframes,
  } from "@mui/material";
  import { DashboardMetrics } from "@/types/index";
  import {
    Savings,
    TrendingUp,
    Warning,
    AttachMoney,
    PieChart,
    CalendarToday,
    Add,
    MonetizationOn,
    ArrowUpward,
    ArrowDownward,
    Remove,
    EmojiEvents,
  } from "@mui/icons-material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";
import Link from "next/link";
  const pulse = keyframes`
    0% { transform: scale(0.95); opacity: 0.8; }
    50% { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.95); opacity: 0.8; }
  `;

  const Dashboard: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const [data, setData] = useState<DashboardMetrics>({} as DashboardMetrics);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isEmpty, setIsEmpty] = useState<boolean>(false);

    const bentoCardStyle = {
      borderRadius: 3,
      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.dark, 0.08)}`,
      transition: "transform 0.2s, box-shadow 0.2s",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.dark, 0.15)}`,
      },
    };

    const cardHeaderStyle = (color: string = theme.palette.primary.main) => ({
      bgcolor: alpha(color, 0.1),
      color: color,
      p: 1.5,
      borderRadius: 2,
      display: "flex",
      alignItems: "center",
    });

    const iconStyle = (color: string = theme.palette.primary.main) => ({
      fontSize: isMobile ? 20 : 26,
      mr: 1.5,
      p: 0.8,
      bgcolor: alpha(color, 0.1),
      borderRadius: "50%",
    });

    const metricValueStyle = {
      fontSize: isMobile ? "1.2rem" : "1.5rem",
      fontWeight: 800,
      lineHeight: 1,
    };

    useEffect(() => {
      axios
        .get<DashboardMetrics>("/api/metrics/dashboard")
        .then((response) => {
          if (!response.data) {
            setIsEmpty(true); // Activar estado vacío
            setLoading(false);
            return;
          }
          setData(response.data);
          setLoading(false);
        })
        .catch((err) => {
          if (err.response?.status === 404) {
            setIsEmpty(true);
          } else {
            setError("Error al cargar los datos");
            console.error(err);

          }
          setLoading(false);
        });
    }, []);

    const getDaysColor = (days: number) => {
      if (days > 15) return theme.palette.success.main;
      if (days > 7) return theme.palette.warning.main;
      return theme.palette.error.main;
    };

    if (loading) {
      return (
        <Box display="flex" justifyContent="center" mt={4} minHeight="60vh">
          <CircularProgress
            size={50}
            thickness={3.5}
            sx={{
              color: theme.palette.primary.main,
              animation: `${pulse} 1.5s infinite ease-in-out`,
            }}
          />
        </Box>
      );
    }

    if (error) {
      return (
        <Box textAlign="center" mt={4} p={2}>
          <Card
            sx={{
              ...bentoCardStyle,
              bgcolor: alpha(theme.palette.error.light, 0.1),
            }}
          >
            <CardContent>
              <Warning
                sx={{ fontSize: 48, color: theme.palette.error.main, mb: 1 }}
              />
              <Typography variant="h6" color="text.primary" gutterBottom>
                ¡Ups! Algo salió mal
              </Typography>
              <Button
                variant="contained"
                color="error"
                onClick={() => window.location.reload()}
                startIcon={<Warning />}
                sx={{ mt: 1 }}
                size="small"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </Box>
      );
    }

    if (!loading && (isEmpty || (!Object.keys(data).length && !error))) {
      return (
        <Box textAlign="center" mt={4} p={2}>
          <Card sx={{ ...bentoCardStyle, maxWidth: 500, mx: "auto" }}>
            <CardContent>
              <MonetizationOn
                sx={{
                  fontSize: 72,
                  color: alpha(theme.palette.primary.main, 0.3),
                  mb: 2,
                  animation: `${pulse} 2s infinite ease-in-out`,
                }}
              />
              <Typography variant="h5" color="text.primary" gutterBottom>
                ¡Bienvenido a tu Centro Financiero!
              </Typography>
              <Link
                href="/transactions"
                style={{ textDecoration: "none", color: "inherit" }}
              >
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={<Add />}
                sx={{ mt: 1 }}
              >
                Agregar Primera Transacción
                </Button>
              </Link>
            </CardContent>
          </Card>
        </Box>
      );
    }
    return (
      <Box p={isMobile ? 1 : 2} sx={{ maxWidth: 1200, mx: "auto" }}>
        <Grid container spacing={2}>
          {/* Ingreso vs Gastos */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.success.main)}>
                <AttachMoney sx={iconStyle(theme.palette.success.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Ingreso vs Gastos
                </Typography>
              </Box>
              <CardContent sx={{ pt: 1 }}>
                {data.incomeVsExpenses ?
                  <Grid container spacing={1}>
                    {[
                      {
                        label: "Ingresos",
                        value: data.incomeVsExpenses?.income,
                        color: theme.palette.success.main,
                      },
                      {
                        label: "Gastos",
                        value: data.incomeVsExpenses?.expenses,
                        color: theme.palette.error.main,
                      },
                      {
                        label: "Balance",
                        value: data.incomeVsExpenses?.balance,
                        color:
                          (data.incomeVsExpenses?.balance ?? 0) >= 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                      },
                    ].map((item, index) => (
                      <Grid item xs={4} key={index} textAlign="center">
                        <Typography variant="caption" color="text.secondary">
                          {item.label}
                        </Typography>
                        <Typography
                          sx={{ ...metricValueStyle, color: item.color }}
                        >
                          ${item.value}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                  : (
            <Box textAlign="center" py={2}>
              <Typography variant="caption" color="text.secondary">
                No hay datos disponibles
              </Typography>
            </Box>
          )}
              </CardContent>
            </Card>
          </Grid>

          {/* Tasa de Ahorro */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.secondary.main)}>
                <Savings sx={iconStyle(theme.palette.secondary.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tasa de Ahorro
                </Typography>
              </Box>
              <CardContent sx={{ pt: 1 }}>
                {data.savingsRate ?
                <Box display="flex" alignItems="center">
                  <CircularProgress
                    variant="determinate"
                    value={data.savingsRate?.monthlySavingsRate}
                    size={50}
                    thickness={4}
                    sx={{
                      color:
                        (data.savingsRate?.monthlySavingsRate ?? 0) >= 20
                          ? theme.palette.success.main
                          : theme.palette.warning.main,
                      mr: 2,
                    }}
                  />
                  <Box>
                    <Typography sx={{ ...metricValueStyle }}>
                      {data.savingsRate?.monthlySavingsRate.toFixed(2)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Proyección: ${data.savingsRate?.projectedYearlySavings}
                    </Typography>
                  </Box>
                  </Box>
                  : (
            <Box textAlign="center" py={2}>
              <Typography variant="caption" color="text.secondary">
                No hay datos de ahorros
              </Typography>
            </Box>
          )}
              </CardContent>
            </Card>
          </Grid>

          {/* Días Restantes */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.warning.main)}>
                <CalendarToday sx={iconStyle(theme.palette.warning.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Días Restantes
                </Typography>
              </Box>
              <CardContent sx={{ pt: 1, textAlign: "center" }}>
                <Typography
                  variant="h3"
                  sx={{
                    color: getDaysColor(data.budgetRemainingDays ?? 0),
                    fontWeight: 900,
                    fontSize: isMobile ? "2.5rem" : "3rem",
                    lineHeight: 1,
                  }}
                >
                  {data.budgetRemainingDays}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  días en presupuesto
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Categorías de Gasto */}
          <Grid item xs={12} md={6}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.info.main)}>
                <PieChart sx={iconStyle(theme.palette.info.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Gastos por Categoría
                </Typography>
              </Box>
              <CardContent sx={{ pt: 1 }}>
                {data.topExpenseCategories?.map((category, index) => (
                  <Box key={index} mb={1.5}>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                      <Typography variant="caption">
                        {category.categoryName}
                      </Typography>
                      <Typography variant="caption">
                        ${category.totalAmount}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={
                        (category.totalAmount /
                          (data.incomeVsExpenses?.expenses || 1)) *
                        100
                      }
                      sx={{
                        height: 6,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        "& .MuiLinearProgress-bar": {
                          bgcolor: theme.palette.info.main,
                          borderRadius: 2,
                        },
                      }}
                    />
                  </Box>
                )) || (
                  <Box textAlign="center" py={2}>
                    <Typography variant="caption" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Transacción más alta */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.error.main)}>
                <TrendingUp sx={iconStyle(theme.palette.error.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Máxima Transacción
                </Typography>
              </Box>
              <CardContent sx={{ pt: 1 }}>
                {data.highestTransaction ? (
                  <>
                    <Typography
                      sx={{
                        ...metricValueStyle,
                        color: theme.palette.error.main,
                      }}
                    >
                      ${data.highestTransaction.amount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.highestTransaction.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      display="block"
                      color="text.secondary"
                    >
                      {new Date(
                        data.highestTransaction.date
                      ).toLocaleDateString()}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Sin transacciones
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Metas de Ahorro */}
          <Grid item xs={12} md={3}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.success.main)}>
                <Savings sx={iconStyle(theme.palette.success.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Metas de Ahorro
                </Typography>
              </Box>
              <CardContent sx={{ pt: 1 }}>
                {data.savingsGoalProgress?.map((goal, index) => (
                  <Box key={index} mb={2}>
                    <Typography variant="caption">{goal.goalName}</Typography>
                    <LinearProgress
                      variant="determinate"
                      value={goal.percentage}
                      sx={{
                        height: 6,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        "& .MuiLinearProgress-bar": {
                          bgcolor: theme.palette.success.main,
                          borderRadius: 2,
                        },
                      }}
                    />
                    <Box display="flex" justifyContent="space-between" mt={0.5}>
                      <Typography variant="caption">
                        ${goal.currentAmount}
                      </Typography>
                      <Typography variant="caption">
                        ${goal.targetAmount}
                      </Typography>
                    </Box>
                  </Box>
                )) || (
                  <Box textAlign="center" py={2}>
                    <Typography variant="caption" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Tendencias de Gastos */}
          <Grid item xs={12} md={6}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.info.main)}>
                <TrendingUp sx={iconStyle(theme.palette.info.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tendencia de Gastos Mensuales
                </Typography>
              </Box>
              <CardContent sx={{ height: 300 }}>
                {(data.expenseTrend?.length ?? 0 > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.expenseTrend}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          boxShadow: theme.shadows[3],
                          backgroundColor: theme.palette.background.default,
                        }}
                        formatter={(value: number) => [
                          `${value}`,
                          "Gastos totales",
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="totalExpenses"
                        stroke={theme.palette.info.main}
                        strokeWidth={2}
                        dot={{ fill: theme.palette.info.main }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Typography variant="body2" color="text.secondary">
                      No hay datos históricos disponibles
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Categoría con Mayor Crecimiento */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={bentoCardStyle}>
                <Box sx={cardHeaderStyle(theme.palette.success.main)}>
                  <EmojiEvents sx={iconStyle(theme.palette.success.main)} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Categoría Destacada
                  </Typography>
                </Box>
              <CardContent>
                {data.highestGrowthCategory ? (
                  <>
                    <Typography
                    sx={{
                      ...metricValueStyle,
                      color: theme.palette.success.main,
                      mb: 1,
                    }}
                  >
                    {data.highestGrowthCategory.categoryName}
                  </Typography><Box
                    bgcolor={alpha(theme.palette.success.main, 0.1)}
                    p={1}
                    borderRadius={2}
                  >
                      <Typography
                        variant="caption"
                        display="block"
                        color="success.main"
                      >
                        ▲ {data.highestGrowthCategory.percentageIncrease}% de
                        crecimiento
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        Mes anterior: $
                        {data.highestGrowthCategory.previousMonthTotal}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        color="text.secondary"
                      >
                        Mes actual: $
                        {data.highestGrowthCategory.currentMonthTotal}
                      </Typography>
                    </Box></>
                ) : (
                    <Box textAlign="center" py={2}>
                      <Typography variant="caption" color="text.secondary">
                        No hay datos disponibles
                      </Typography>
                  </Box>
                )}
                </CardContent>
              </Card>
            </Grid>
          

          {/* Tendencias por Categoría */}
          <Grid item xs={12} md={3}>
            <Card sx={bentoCardStyle}>
              <Box sx={cardHeaderStyle(theme.palette.warning.main)}>
                <PieChart sx={iconStyle(theme.palette.warning.main)} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Tendencias por Categoría
                </Typography>
              </Box>
              <CardContent>
                {data.categoryTrends ? data.categoryTrends.length > 0 ? data.categoryTrends.map((trend, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: alpha(
                        trend.trend === "upward"
                          ? theme.palette.success.main
                          : trend.trend === "downward"
                            ? theme.palette.error.main
                            : theme.palette.grey[500],
                        0.1
                      ),
                    }}
                  >
                    {trend.trend === "upward" ? (
                      <ArrowUpward
                        sx={{
                          color: theme.palette.success.main,
                          mr: 1.5,
                        }}
                      />
                    ) : trend.trend === "downward" ? (
                      <ArrowDownward
                        sx={{
                          color: theme.palette.error.main,
                          mr: 1.5,
                        }}
                      />
                    ) : (
                      <Remove
                        sx={{
                          color: theme.palette.grey[500],
                          mr: 1.5,
                        }}
                      />
                    )}

                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2">
                        {trend.categoryName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {trend.trend === "stable"
                          ? "Sin cambios"
                          : `${Math.abs(trend.percentageChange)}%`}
                      </Typography>
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color:
                          trend.trend === "upward"
                            ? theme.palette.success.main
                            : trend.trend === "downward"
                              ? theme.palette.error.main
                              : theme.palette.grey[500],
                      }}
                    >
                      {trend.trend === "upward"
                        ? "+"
                        : trend.trend === "downward"
                          ? "-"
                          : ""}
                      {trend.percentageChange}%
                    </Typography>
                  </Box>
                )) : (
                  <Box textAlign="center" py={2}>
                    <Typography variant="caption" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  </Box>
                ) : (
                  <Box textAlign="center" py={2}>
                    <Typography variant="caption" color="text.secondary">
                      No hay datos disponibles
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Récord de Días sin Gastos */}
          {data.longestExpenseFreeStreak && (
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={bentoCardStyle}>
                <Box sx={cardHeaderStyle(theme.palette.secondary.main)}>
                  <CalendarToday sx={iconStyle(theme.palette.secondary.main)} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Récord sin Gastos
                  </Typography>
                </Box>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography
                    variant="h3"
                    sx={{
                      color: theme.palette.secondary.main,
                      fontWeight: 900,
                      fontSize: isMobile ? "2.5rem" : "3rem",
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {data.longestExpenseFreeStreak.daysWithoutExpenses}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {new Date(
                      data.longestExpenseFreeStreak.startDate
                    ).toLocaleDateString()}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    hasta
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {new Date(
                      data.longestExpenseFreeStreak.endDate
                    ).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
          {/* Alertas del Presupuesto */}
          {data.budgetAlerts && data.budgetAlerts.length > 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  ...bentoCardStyle,
                  bgcolor: alpha(theme.palette.error.light, 0.1),
                }}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Box display="flex" alignItems="center">
                    <Warning
                      sx={{
                        color: theme.palette.error.main,
                        mr: 1.5,
                        fontSize: 24,
                      }}
                    />
                    <Box>
                      <Typography variant="subtitle2" color="error.main">
                        Alertas del Presupuesto
                      </Typography>
                      {data.budgetAlerts.map((alert, index) => (
                        <Typography
                          key={index}
                          variant="caption"
                          color="error.main"
                          display="block"
                        >
                          • {alert.message.slice(0, 50)}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  };

  export default Dashboard;
