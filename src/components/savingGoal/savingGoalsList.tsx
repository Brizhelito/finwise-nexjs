import {
  Card,
  Typography,
  LinearProgress,
  Button,
  Collapse,
  Grow,
  Stack,
} from "@mui/material";
import { TransitionGroup } from "react-transition-group";
import { SavingGoal, SavingType } from "@prisma/client";
import Decimal from "decimal.js";

interface SavingGoalListProps {
  goals: SavingGoal[];
  onAddTransaction: (mode: "create", goalId: number, type: SavingType) => void;
  onDeleteGoal: (goalId: number) => void;
}

const SavingGoalCard = ({
  goal,
  onAddTransaction,
}: {
  goal: SavingGoal;
  onAddTransaction: (mode: "create", goalId: number, type: SavingType) => void;
}) => {
  const currentAmount = new Decimal(goal.currentAmount.toString());
  const targetAmount = new Decimal(goal.targetAmount.toString());
  const progress = currentAmount.div(targetAmount).times(100).toNumber();

  const handleTransaction = (type: SavingType) => {
    onAddTransaction("create", goal.id, type);
  };

  return (
    <Card
      sx={{
        mb: 2,
        p: 3,
        borderRadius: 4,
        boxShadow: 3,
        position: "relative",
      }}
    >
      <Typography variant="h6" gutterBottom>
        {goal.name}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, progress))}
        sx={{ height: 12, borderRadius: 6, mb: 2 }}
      />

      <Typography variant="body2" color="text.secondary">
        {`${currentAmount.toFixed(2)} of ${targetAmount.toFixed(2)}`}
      </Typography>

      <Stack direction="row" spacing={2} mt={2}>
        <Grow in={true}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleTransaction(SavingType.deposit)}
          >
            Depositar
          </Button>
        </Grow>
        <Grow in={true}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleTransaction(SavingType.withdrawal)}
          >
            Retirar
          </Button>
        </Grow>
      </Stack>
    </Card>
  );
};

const SavingGoalList = ({
  goals,
  onAddTransaction,
}: SavingGoalListProps) => {
  return (
    <TransitionGroup component={null}>
      {goals.map((goal) => (
        <Collapse key={goal.id}>
          <SavingGoalCard goal={goal} onAddTransaction={onAddTransaction} />
        </Collapse>
      ))}
    </TransitionGroup>
  );
};

export default SavingGoalList;
