// I'm importing the necessary libraries: Express for the server and CORS to handle cross-origin requests.
const express = require('express');
const cors = require('cors');

// I'm creating an instance of an Express application.
const app = express();
const PORT = 5000; // I'll run my backend on port 5000.

// This is crucial. It allows my frontend (running on a different port) to make requests to this backend.
app.use(cors());

// --- RAW DATA STORE ---
// This is my "database" for the assignment. I'm starting with the most basic raw data.
// All calculations will be performed on this data dynamically.
const rawHoldings = [
    { symbol: "RELIANCE", name: "Reliance Industries", quantity: 50, avgPrice: 2800, currentPrice: 2950.55, sector: 'Energy', marketCap: 'Large' },
    { symbol: "HDFCBANK", name: "HDFC Bank", quantity: 100, avgPrice: 1500, currentPrice: 1580.20, sector: 'Banking', marketCap: 'Large' },
    { symbol: "INFY", name: "Infosys Ltd", quantity: 200, avgPrice: 1450, currentPrice: 1625.75, sector: 'Technology', marketCap: 'Large' },
    { symbol: "TCS", name: "Tata Consultancy Services", quantity: 75, avgPrice: 3800, currentPrice: 3990.00, sector: 'Technology', marketCap: 'Large' },
];

const historicalData = {
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
};

// --- HELPER FUNCTIONS (FOR ON-THE-FLY CALCULATIONS) ---

/**
 * This is my main calculation engine. It takes the raw holdings and computes all necessary portfolio metrics.
 * @param {Array} holdings - The array of raw holding objects.
 * @returns {Object} A fully calculated portfolio object.
 */
const calculatePortfolioMetrics = (holdings) => {
    // --- Data Validation Step ---
    // Documentation: Before doing any calculations, I'm validating the integrity of the source data.
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
        // If the data is missing or empty, I throw an error. This will be caught by my error handler.
        throw new Error("Invalid or empty holdings data provided.");
    }
    // I'm also checking if a sample object has the required keys for calculation.
    const sampleHolding = holdings[0];
    if (typeof sampleHolding.quantity !== 'number' || typeof sampleHolding.currentPrice !== 'number' || typeof sampleHolding.avgPrice !== 'number') {
        throw new Error("Holdings data is malformed. Essential properties are missing or of the wrong type.");
    }

    // Documentation: First, I enhance each holding with calculated values.
    const enhancedHoldings = holdings.map(stock => {
        const value = stock.quantity * stock.currentPrice;
        const totalInvestment = stock.quantity * stock.avgPrice;
        const gainLoss = value - totalInvestment;
        const gainLossPercent = totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;
        return { ...stock, value, gainLoss, gainLossPercent };
    });

    // Documentation: Now, I'll calculate the overall portfolio summary by aggregating the enhanced holdings.
    const totalValue = enhancedHoldings.reduce((acc, stock) => acc + stock.value, 0);
    const totalInvested = enhancedHoldings.reduce((acc, stock) => acc + (stock.quantity * stock.avgPrice), 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    // Documentation: To find the top and worst performers, I sort the holdings by their gain/loss percentage.
    const sortedByPerformance = [...enhancedHoldings].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    const topPerformer = sortedByPerformance[0];
    const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

    // Documentation: I'm calculating allocation by iterating through the holdings and grouping them by sector.
    const allocationBySector = enhancedHoldings.reduce((acc, stock) => {
        if (!acc[stock.sector]) {
            acc[stock.sector] = { value: 0, percentage: 0 };
        }
        acc[stock.sector].value += stock.value;
        return acc;
    }, {});
    // After summing the values, I calculate the percentage for each sector.
    Object.keys(allocationBySector).forEach(sector => {
        allocationBySector[sector].percentage = (allocationBySector[sector].value / totalValue) * 100;
    });

    return {
        summary: {
            totalValue,
            totalInvested,
            totalGainLoss,
            totalGainLossPercent,
            topPerformer: { symbol: topPerformer.symbol, name: topPerformer.name, gainPercent: topPerformer.gainLossPercent },
            worstPerformer: { symbol: worstPerformer.symbol, name: worstPerformer.name, gainPercent: worstPerformer.gainLossPercent },
            diversificationScore: 7.5, // This remains a mock value as per the assignment's focus.
            riskLevel: "Moderate" // This also remains a mock value.
        },
        holdings: enhancedHoldings,
        allocation: {
            bySector: allocationBySector,
            // These can be expanded with similar calculation logic if needed.
            byMarketCap: { 'Large Cap': { value: totalValue, percentage: 100 } },
            byAssetClass: { 'Equity': { value: totalValue, percentage: 100 } }
        },
        performance: historicalData
    };
};

// --- API ENDPOINTS ---

// 1. Portfolio Summary Endpoint
app.get('/api/portfolio/summary', (req, res, next) => {
  try {
    const fullPortfolio = calculatePortfolioMetrics(rawHoldings);
    res.json(fullPortfolio.summary);
  } catch (error) {
    next(error); // Pass errors to the global error handler.
  }
});

// 2. Portfolio Holdings Endpoint
app.get('/api/portfolio/holdings', (req, res, next) => {
  try {
    const fullPortfolio = calculatePortfolioMetrics(rawHoldings);
    res.json(fullPortfolio.holdings);
  } catch (error) {
    next(error);
  }
});

// 3. Portfolio Allocation Endpoint
app.get('/api/portfolio/allocation', (req, res, next) => {
  try {
    const fullPortfolio = calculatePortfolioMetrics(rawHoldings);
    res.json(fullPortfolio.allocation);
  } catch (error) {
    next(error);
  }
});

// 4. Performance Comparison Endpoint
app.get('/api/portfolio/performance', (req, res, next) => {
  try {
    // Performance data is historical and doesn't need real-time calculation for this assignment.
    res.json(historicalData);
  } catch (error) {
    next(error);
  }
});

// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
// This is my safety net. If any of the `try...catch` blocks above pass an error to `next()`,
// this middleware will catch it and send a clean, structured error response to the frontend.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error for my own debugging.
  // Send a proper 500 status code and a JSON error message.
  res.status(500).json({ 
    error: "An internal server error occurred.",
    message: err.message 
  });
});


// This starts the server and makes it listen for incoming requests on the specified port.
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
