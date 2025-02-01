import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  useTheme,
  IconButton,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { ReactElement, Ref, forwardRef } from "react"; // Import ReactNode
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement; // Use ReactElement instead of any
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  content: string;
  confirmButtonText?: string;
  confirmColor?: "error" | "primary" | "secondary";
}

const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title,
  content,
  confirmButtonText = "Confirmar",
  confirmColor = "error",
}: ConfirmationModalProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 380,
          maxWidth: 480,
          backgroundColor: theme.palette.background.paper,
          boxShadow: 6,
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette[confirmColor].main,
          color: theme.palette[confirmColor].contrastText,
          py: 2,
          px: 3,
          borderBottom: `1px solid ${theme.palette[confirmColor].dark}`,
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <WarningAmberRoundedIcon fontSize="large" />
          <Typography variant="h6" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "inherit" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          py: 3,
          px: 3,
          mt: 4,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        <Typography variant="body1" textAlign="center" lineHeight={1.6}>
          {content}
        </Typography>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          display: "flex",
          justifyContent: "center",
          gap: 2,
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            py: 1,
            borderColor: theme.palette.grey[500],
            color: theme.palette.grey[700],
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: theme.palette.grey[200],
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          variant="contained"
          color={confirmColor}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            px: 3,
            py: 1,
            boxShadow: "none",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "none",
              backgroundColor: theme.palette[confirmColor].dark,
            },
          }}
        >
          {confirmButtonText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
