import React from "react";
import { Container, Grid, Paper, Typography, Box } from "@mui/material";

const mockData = [
  { id: 1, title: "Card 1", content: "This is the content for card 1." },
  { id: 2, title: "Card 2", content: "This is the content for card 2." },
  { id: 3, title: "Card 3", content: "This is the content for card 3." },
  { id: 4, title: "Card 4", content: "This is the content for card 4." },
];

const Dashboard = () => {
  return (
    <Container>
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Grid container spacing={3}>
          {mockData.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.id}>
              <Paper elevation={3} style={{ padding: "16px" }}>
                <Typography variant="h6" component="h2">
                  {item.title}
                </Typography>
                <Typography variant="body1">{item.content}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
