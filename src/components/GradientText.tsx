import { Typography, TypographyProps, Box } from "@mui/material";
import { forwardRef } from "react";

interface GradientTextProps extends TypographyProps {
  gradient: string;
}

const GradientText = forwardRef<HTMLSpanElement, GradientTextProps>(
  ({ gradient, children, sx, ...props }, ref) => {
    return (
      <Box
        component="span"
        sx={{
          display: "inline-block",
          backgroundImage: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          ...sx,
        }}
      >
        <Typography ref={ref} component="span" {...props}>
          {children}
        </Typography>
      </Box>
    );
  }
);

GradientText.displayName = "GradientText";

export default GradientText;
