// I'm importing the necessary libraries: Express for the server and CORS to handle cross-origin requests.
const express = require('express');
const cors = require('cors');

// I'm creating an instance of an Express application.
const app = express();
const PORT = 5000; // I'll run my backend on port 5000.

// This is crucial. It allows my frontend (running on a different port) to make requests to this backend.
app.use(cors());

// --- MY PORTFOLIO DATA ---
// In a real application, this data would come from a database or an external API.
// For this assignment, I'm defining it directly in the server as requested.

const portfolioData = {
  summary: {
    totalValue: 700000,
    totalInvested: 600000,
    totalGainLoss: 100000,
    totalGainLossPercent: 16.67,
    topPerformer: { symbol: "INFY", name: "Infosys Ltd", gainPercent: 11.7 },
    worstPerformer: { symbol: "HDFCBANK", name: "HDFC Bank", gainPercent: 5.3 },
    diversificationScore: 7.5,
    riskLevel: "Moderate"
  },
  holdings: [
    { symbol: "RELIANCE", name: "Reliance Industries", quantity: 50, avgPrice: 2800, currentValue: 2950.55, gainLoss: 7527.5, sector: 'Energy', marketCap: 'Large' },
    { symbol: "HDFCBANK", name: "HDFC Bank", quantity: 100, avgPrice: 1500, currentValue: 1580.20, gainLoss: 8020, sector: 'Banking', marketCap: 'Large' },
    { symbol: "INFY", name: "Infosys Ltd", quantity: 200, avgPrice: 1450, currentValue: 1625.75, gainLoss: 35150, sector: 'Technology', marketCap: 'Large' },
    { symbol: "TCS", name: "Tata Consultancy Services", quantity: 75, avgPrice: 3800, currentValue: 3990.00, gainLoss: 14250, sector: 'Technology', marketCap: 'Large' },
  ],
  allocation: {
    bySector: { Technology: { value: 435000, percentage: 62.1 }, Banking: { value: 158000, percentage: 22.6 }, Energy: { value: 107000, percentage: 15.3 } },
    byMarketCap: { 'Large Cap': { value: 700000, percentage: 100 } },
    byAssetClass: { 'Equity': { value: 630000, percentage: 90 }, 'Gold': { value: 70000, percentage: 10 } }
  },
  performance: {
    timeline: [
      { date: "2024-01-01", portfolio: 650000, nifty50: 21000, gold: 62000 },
      { date: "2024-03-01", portfolio: 680000, nifty50: 22100, gold: 64500 },
      { date: "2024-06-01", portfolio: 700000, nifty50: 23500, gold: 68000 }
    ],
    returns: {
      portfolio: { "1month": 2.3, "3months": 8.1, "1year": 15.7},
      nifty50: { "1month": 1.8, "3months": 6.2, "1year": 12.4},
      gold: { "1month": -0.5, "3months": 4.1, "1year": 8.9}
    }
  }
};

// --- API ENDPOINTS ---
// Here, I'm defining the four API routes required by the assignment.

// 1. Portfolio Summary Endpoint
app.get('/api/portfolio/summary', (req, res) => {
  console.log("Request received for /api/portfolio/summary");
  // I'm sending the summary part of my data as a JSON response.
  res.json(portfolioData.summary);
});

// 2. Portfolio Holdings Endpoint
app.get('/api/portfolio/holdings', (req, res) => {
  console.log("Request received for /api/portfolio/holdings");
  res.json(portfolioData.holdings);
});

// 3. Portfolio Allocation Endpoint
app.get('/api/portfolio/allocation', (req, res) => {
  console.log("Request received for /api/portfolio/allocation");
  res.json(portfolioData.allocation);
});

// 4. Performance Comparison Endpoint
app.get('/api/portfolio/performance', (req, res) => {
  console.log("Request received for /api/portfolio/performance");
  res.json(portfolioData.performance);
});

// This starts the server and makes it listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
