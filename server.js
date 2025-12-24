// I'm importing my required libraries. I've added mongoose and dotenv.
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config(); // This loads my environment variables from the .env file.

const app = express();
const PORT = 5000;

app.use(cors());

// --- DATABASE CONNECTION ---
// I'm connecting to my MongoDB Atlas database.
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Successfully connected to MongoDB."))
  .catch(err => console.error("MongoDB connection error:", err));

// --- MONGOOSE SCHEMAS & MODELS ---
// I need to define the structure of my data so Mongoose knows how to interact with it.
const HoldingSchema = new mongoose.Schema({
    symbol: String, name: String, quantity: Number, avgPrice: Number, currentPrice: Number, sector: String, marketCap: String,
});
const PerformanceSchema = new mongoose.Schema({
    timeline: [{ date: String, portfolio: Number, nifty50: Number, gold: Number }],
    returns: {
        portfolio: { "1month": Number, "3months": Number, "1year": Number },
        nifty50: { "1month": Number, "3months": Number, "1year": Number },
        gold: { "1month": Number, "3months": Number, "1year": Number },
    }
});
// I'm adding a new schema and model for the recent activity data.
const ActivitySchema = new mongoose.Schema({
    type: String, // 'buy' or 'sell'
    symbol: String,
    quantity: Number,
    price: Number,
    date: Date,
});

// I'm creating models from my schemas. I'll use these to query the database.
const Holding = mongoose.model('Holding', HoldingSchema);
const Performance = mongoose.model('Performance', PerformanceSchema);
const Activity = mongoose.model('Activity', ActivitySchema);


// --- HELPER FUNCTIONS (FOR ON-THE-FLY CALCULATIONS) ---
// This calculation logic remains the same, but now it will operate on data fetched from the database.
const calculatePortfolioMetrics = (holdings) => {
    if (!holdings || !Array.isArray(holdings) || holdings.length === 0) {
        throw new Error("Invalid or empty holdings data provided.");
    }
    const sampleHolding = holdings[0];
    if (typeof sampleHolding.quantity !== 'number' || typeof sampleHolding.currentPrice !== 'number' || typeof sampleHolding.avgPrice !== 'number') {
        throw new Error("Holdings data is malformed. Essential properties are missing or of the wrong type.");
    }

    const enhancedHoldings = holdings.map(stock => {
        const value = stock.quantity * stock.currentPrice;
        const totalInvestment = stock.quantity * stock.avgPrice;
        const gainLoss = value - totalInvestment;
        const gainLossPercent = totalInvestment > 0 ? (gainLoss / totalInvestment) * 100 : 0;
        return { ...stock.toObject(), value, gainLoss, gainLossPercent }; // .toObject() converts the Mongoose document to a plain JS object.
    });

    const totalValue = enhancedHoldings.reduce((acc, stock) => acc + stock.value, 0);
    const totalInvested = enhancedHoldings.reduce((acc, stock) => acc + (stock.quantity * stock.avgPrice), 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const sortedByPerformance = [...enhancedHoldings].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    const topPerformer = sortedByPerformance[0];
    const worstPerformer = sortedByPerformance[sortedByPerformance.length - 1];

    const allocationBySector = enhancedHoldings.reduce((acc, stock) => {
        if (!acc[stock.sector]) acc[stock.sector] = { value: 0, percentage: 0 };
        acc[stock.sector].value += stock.value;
        return acc;
    }, {});
    Object.keys(allocationBySector).forEach(sector => {
        allocationBySector[sector].percentage = (allocationBySector[sector].value / totalValue) * 100;
    });

    return {
        summary: {
            totalValue, totalInvested, totalGainLoss, totalGainLossPercent,
            topPerformer: { symbol: topPerformer.symbol, name: topPerformer.name, gainPercent: topPerformer.gainLossPercent },
            worstPerformer: { symbol: worstPerformer.symbol, name: worstPerformer.name, gainPercent: worstPerformer.gainLossPercent },
            diversificationScore: 7.5, riskLevel: "Moderate"
        },
        holdings: enhancedHoldings,
        allocation: {
            bySector: allocationBySector,
            byMarketCap: { 'Large Cap': { value: totalValue, percentage: 100 } },
            byAssetClass: { 'Equity': { value: totalValue, percentage: 100 } }
        }
    };
};

// --- API ENDPOINTS ---
// I've updated my endpoints to be `async` and to use Mongoose to query the database.

app.get('/api/portfolio/summary', async (req, res, next) => {
  try {
    const holdings = await Holding.find({}); // Fetch all holdings from the database.
    const fullPortfolio = calculatePortfolioMetrics(holdings);
    res.json(fullPortfolio.summary);
  } catch (error) {
    next(error);
  }
});

app.get('/api/portfolio/holdings', async (req, res, next) => {
  try {
    const holdings = await Holding.find({});
    const fullPortfolio = calculatePortfolioMetrics(holdings);
    res.json(fullPortfolio.holdings);
  } catch (error) {
    next(error);
  }
});

app.get('/api/portfolio/allocation', async (req, res, next) => {
  try {
    const holdings = await Holding.find({});
    const fullPortfolio = calculatePortfolioMetrics(holdings);
    res.json(fullPortfolio.allocation);
  } catch (error) {
    next(error);
  }
});

app.get('/api/portfolio/performance', async (req, res, next) => {
  try {
    // I'm fetching the single performance document from the database.
    const performanceData = await Performance.findOne({});
    res.json(performanceData);
  } catch (error) {
    next(error);
  }
});

// I'm adding the new endpoint for recent activity.
app.get('/api/portfolio/activity', async (req, res, next) => {
    try {
      // I'm fetching the last 5 activities, sorted by the most recent date.
      const activity = await Activity.find({}).sort({ date: -1 }).limit(5);
      res.json(activity);
    } catch (error) {
      next(error);
    }
});


// --- GLOBAL ERROR HANDLING MIDDLEWARE ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "An internal server error occurred.", message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
