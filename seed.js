// This script will populate our MongoDB database with the initial sample data.
const mongoose = require('mongoose');
require('dotenv').config(); // This loads the variables from our .env file.

// --- Define Mongoose Schemas ---
// A schema defines the structure of a document in a MongoDB collection.

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
    timeline: [{
        date: String,
        portfolio: Number,
        nifty50: Number,
        gold: Number,
    }],
    returns: {
        portfolio: { "1month": Number, "3months": Number, "1year": Number },
        nifty50: { "1month": Number, "3months": Number, "1year": Number },
        gold: { "1month": Number, "3months": Number, "1year": Number },
    }
});

// I'm adding the new schema for the recent activity data.
const ActivitySchema = new mongoose.Schema({
    type: String, // 'buy' or 'sell'
    symbol: String,
    quantity: Number,
    price: Number,
    date: Date,
});

// Create models from the schemas. A model is a class with which we construct documents.
const Holding = mongoose.model('Holding', HoldingSchema);
const Performance = mongoose.model('Performance', PerformanceSchema);
const Activity = mongoose.model('Activity', ActivitySchema);

// --- Sample Data ---
const sampleHoldings = [
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

// I'm adding the new sample data for the recent activity feed.
const sampleActivity = [
    { type: 'buy', symbol: 'INFY', quantity: 50, price: 1620.00, date: new Date('2024-07-28T10:00:00Z') },
    { type: 'sell', symbol: 'RELIANCE', quantity: 10, price: 2980.00, date: new Date('2024-07-25T14:30:00Z') },
    { type: 'buy', symbol: 'HDFCBANK', quantity: 30, price: 1575.50, date: new Date('2024-07-22T09:45:00Z') },
    { type: 'buy', symbol: 'TCS', quantity: 25, price: 3950.00, date: new Date('2024-07-20T11:00:00Z') },
    { type: 'sell', symbol: 'INFY', quantity: 20, price: 1650.00, date: new Date('2024-07-18T15:00:00Z') },
];

// --- Seeding Function ---
const seedDatabase = async () => {
    try {
        // Connect to the MongoDB database using the URI from our .env file.
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Successfully connected to MongoDB.");

        // Clear out any old data to prevent duplicates.
        await Holding.deleteMany({});
        await Performance.deleteMany({});
        await Activity.deleteMany({}); // I'm also clearing the old activity data.
        console.log("Cleared existing data.");

        // Insert the new sample data into the database.
        await Holding.insertMany(sampleHoldings);
        await Performance.create(historicalData);
        await Activity.insertMany(sampleActivity); // I'm inserting the new activity data.
        console.log("Successfully seeded the database with all collections!");

    } catch (error) {
        console.error("Error seeding the database:", error);
    } finally {
        // Make sure to close the database connection.
        mongoose.connection.close();
    }
};

// Run the seeding function.
seedDatabase();
