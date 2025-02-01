"use client";
import { Box, Button, Typography, useTheme, styled } from "@mui/material";
import Image from "next/image";
import Link from "next/link";
import { keyframes } from "@emotion/react";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const floating = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const StyledButton = styled(Button)(({ theme }) => ({
  padding: "1rem 2.5rem",
  borderRadius: "50px",
  fontWeight: 700,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-3px)",
    boxShadow: `${theme.shadows[6]}`,
  },
}));

const HeroSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[100]} 100%)`,
        py: { xs: 8, md: 12 },
        px: { xs: 2, md: 6 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: `radial-gradient(${theme.palette.primary.light} 5%, transparent 80%)`,
          opacity: 0.1,
        },
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          margin: "0 auto",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          gap: 6,
          position: "relative",
        }}
      >
        {/* Text Content */}
        <Box
          sx={{
            flex: 1,
            animation: `${fadeIn} 0.8s ease-out`,
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 800,
              lineHeight: 1.2,
              mb: 3,
              fontSize: { xs: "2.5rem", md: "3.5rem" },
            }}
          >
            Toma el control de tus{" "}
            <Box
              component="span"
              sx={{ color: theme.palette.primary.main, whiteSpace: "nowrap" }}
            >
              finanzas
            </Box>
          </Typography>

          <Typography
            variant="h5"
            sx={{
              color: theme.palette.text.secondary,
              mb: 4,
              maxWidth: 600,
              mx: { xs: "auto", md: "unset" },
              fontSize: { xs: "1.1rem", md: "1.25rem" },
              lineHeight: 1.6,
            }}
          >
            Transforma tu gestión financiera con inteligencia artificial y
            herramientas intuitivas para alcanzar tus metas económicas.
          </Typography>

          <Link href="/signup" passHref legacyBehavior>
            <StyledButton
              variant="contained"
              color="primary"
              size="large"
              sx={{
                mx: { xs: "auto", md: "unset" },
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              Empieza Gratis
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  transition: "transform 0.3s ease",
                  "&:hover": {
                    transform: "translateX(3px)",
                  },
                }}
              >
                →
              </Box>
            </StyledButton>
          </Link>
        </Box>

        {/* Image Section */}
        <Box
          sx={{
            flex: 1,
            position: "relative",
            animation: `${fadeIn} 0.8s ease-out 0.2s backwards`,
            maxWidth: 600,
          }}
        >
          <Box
            sx={{
              position: "relative",
              animation: `${floating} 6s ease-in-out infinite`,
            }}
          >
            <Image
              src="/images/hero-image.svg"
              alt="Control financiero intuitivo"
              width={600}
              height={500}
              style={{
                width: "100%",
                height: "auto",
                filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
              }}
              priority
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HeroSection;
