// ===============================
// IMPORTS & SETUP
// ===============================
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

// ✅ REQUIRED FOR RENDER (VERY IMPORTANT)
const PORT = process.env.PORT || 5000;

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// DATABASE CONNECTION
// ===============================
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ===============================
// MONGOOSE SCHEMAS & MODELS
// ===============================
const HoldingSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  quantity: Number,
  avgPrice: Number,
  currentPrice: Number,
  sector: String,
  marketCap: String,
});

const PerformanceSchema = new mongoose.Schema({
  timeline: [
    {
      date: String,
      portfolio: Number,
      nifty50: Number,
      gold: Number,
    },
  ],
  returns: {
    portfolio: { "1month": Number, "3months": Number, "1year": Number },
    nifty50: { "1month": Number, "3months": Number, "1year": Number },
    gold: { "1month": Number, "3months": Number, "1year": Number },
  },
});

const ActivitySchema = new mongoose.Schema({
  type: String,
  symbol: String,
  quantity: Number,
  price: Number,
  date: Date,
});

const Holding = mongoose.model("Holding", HoldingSchema);
const Performance = mongoose.model("Performance", PerformanceSchema);
const Activity = mongoose.model("Activity", ActivitySchema);

// ===============================
// HELPER FUNCTION
// ===============================
const calculatePortfolioMetrics = (holdings) => {
  if (!holdings || holdings.length === 0) {
    return {
      summary: {},
      holdings: [],
      allocation: {},
    };
  }

  const enhancedHoldings = holdings.map((stock) => {
    const value = stock.quantity * stock.currentPrice;
    const invested = stock.quantity * stock.avgPrice;
    const gainLoss = value - invested;
    const gainLossPercent = invested ? (gainLoss / invested) * 100 : 0;

    return {
      ...stock.toObject(),
      value,
      gainLoss,
      gainLossPercent,
    };
  });

  const totalValue = enhancedHoldings.reduce((a, b) => a + b.value, 0);
  const totalInvested = enhancedHoldings.reduce(
    (a, b) => a + b.quantity * b.avgPrice,
    0
  );
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested
    ? (totalGainLoss / totalInvested) * 100
    : 0;

  const allocationBySector = {};
  enhancedHoldings.forEach((stock) => {
    if (!allocationBySector[stock.sector]) {
      allocationBySector[stock.sector] = { value: 0, percentage: 0 };
    }
    allocationBySector[stock.sector].value += stock.value;
  });

  Object.keys(allocationBySector).forEach((sector) => {
    allocationBySector[sector].percentage =
      (allocationBySector[sector].value / totalValue) * 100;
  });

  return {
    summary: {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercent,
    },
    holdings: enhancedHoldings,
    allocation: {
      bySector: allocationBySector,
    },
  };
};

// ===============================
// API ROUTES
// ===============================

// Health check (VERY IMPORTANT for Render)
app.get("/", (req, res) => {
  res.send("🚀 Portfolio Backend is running");
});

app.get("/api/portfolio/summary", async (req, res, next) => {
  try {
    const holdings = await Holding.find({});
    const data = calculatePortfolioMetrics(holdings);
    res.json(data.summary);
  } catch (err) {
    next(err);
  }
});

app.get("/api/portfolio/holdings", async (req, res, next) => {
  try {
    const holdings = await Holding.find({});
    const data = calculatePortfolioMetrics(holdings);
    res.json(data.holdings);
  } catch (err) {
    next(err);
  }
});

app.get("/api/portfolio/allocation", async (req, res, next) => {
  try {
    const holdings = await Holding.find({});
    const data = calculatePortfolioMetrics(holdings);
    res.json(data.allocation);
  } catch (err) {
    next(err);
  }
});

app.get("/api/portfolio/performance", async (req, res, next) => {
  try {
    const performance = await Performance.findOne({});
    res.json(performance);
  } catch (err) {
    next(err);
  }
});

app.get("/api/portfolio/activity", async (req, res, next) => {
  try {
    const activity = await Activity.find({})
      .sort({ date: -1 })
      .limit(5);
    res.json(activity);
  } catch (err) {
    next(err);
  }
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({
    error: "Internal Server Error",
    message: err.message,
  });
});

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
