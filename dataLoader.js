const xlsx = require('xlsx');

function loadPortfolioData() {
    // Load the Excel file
    const workbook = xlsx.readFile('Sample Portfolio Dataset for Assignment.xlsx');
    
    // Helper function to convert sheet to JSON
    const sheetToJson = (sheetName) => {
        const sheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(sheet);
    };

    // Extract data from each sheet
    const holdings = sheetToJson('Holdings').map(item => ({
        symbol: item.Symbol,
        name: item['Company Name'],
        quantity: item.Quantity,
        avgPrice: item['Avg Price ₹'],
        currentPrice: item['Current Price (₹)'],
        sector: item.Sector,
        marketCap: item['Market Cap'],
        exchange: item.Exchange,
        value: item['Value ₹'],
        gainLoss: item['Gain/Loss (₹)'],
        gainLossPercent: item['Gain/Loss %']
    }));

    const historicalPerformance = sheetToJson('Historical_Performance').map(item => ({
        date: item.Date,
        portfolio: item['Portfolio Value (₹)'],
        nifty50: item['Nifty 50'],
        gold: item['Gold (₹/10g)'],
        portfolioReturn: item['Portfolio Return %'],
        nifty50Return: item['Nifty 50 Return %'],
        goldReturn: item['Gold Return %']
    }));

    const summaryData = sheetToJson('Summary').reduce((acc, item) => {
        acc[item.Metric.replace(/\s+/g, '')] = item.Value;
        return acc;
    }, {});

    const sectorAllocation = sheetToJson('Sector_Allocation').reduce((acc, item) => {
        acc[item.Sector] = {
            value: item['Value (₹)'],
            percentage: item.Percentage,
            holdingsCount: item['Holdings Count']
        };
        return acc;
    }, {});

    const marketCapAllocation = sheetToJson('Market_Cap').reduce((acc, item) => {
        acc[item['Market Cap']] = {
            value: item['Value (₹)'],
            percentage: item.Percentage,
            holdingsCount: item['Holdings Count']
        };
        return acc;
    }, {});

    const topPerformers = sheetToJson('Top_Performers').reduce((acc, item) => {
        if (item.Metric === 'Best Performer') {
            acc.topPerformer = {
                symbol: item.Symbol,
                name: item['Company Name'],
                performance: item.Performance
            };
        } else if (item.Metric === 'Worst Performer') {
            acc.worstPerformer = {
                symbol: item.Symbol,
                name: item['Company Name'],
                performance: item.Performance
            };
        }
        return acc;
    }, {});

    return {
        holdings,
        allocation: {
            bySector: sectorAllocation,
            byMarketCap: marketCapAllocation
        },
        performance: {
            timeline: historicalPerformance,
            returns: {
                portfolio: {
                    '1month': historicalPerformance[historicalPerformance.length - 1].portfolioReturn - historicalPerformance[historicalPerformance.length - 2].portfolioReturn,
                    '3months': historicalPerformance[historicalPerformance.length - 1].portfolioReturn - historicalPerformance[historicalPerformance.length - 4].portfolioReturn,
                    '1year': historicalPerformance[historicalPerformance.length - 1].portfolioReturn
                },
                nifty50: {
                    '1month': historicalPerformance[historicalPerformance.length - 1].nifty50Return - historicalPerformance[historicalPerformance.length - 2].nifty50Return,
                    '3months': historicalPerformance[historicalPerformance.length - 1].nifty50Return - historicalPerformance[historicalPerformance.length - 4].nifty50Return,
                    '1year': historicalPerformance[historicalPerformance.length - 1].nifty50Return
                },
                gold: {
                    '1month': historicalPerformance[historicalPerformance.length - 1].goldReturn - historicalPerformance[historicalPerformance.length - 2].goldReturn,
                    '3months': historicalPerformance[historicalPerformance.length - 1].goldReturn - historicalPerformance[historicalPerformance.length - 4].goldReturn,
                    '1year': historicalPerformance[historicalPerformance.length - 1].goldReturn
                }
            }
        },
        summary: {
            totalValue: summaryData.TotalPortfolioValue,
            totalInvested: summaryData.TotalInvestedAmount,
            totalGainLoss: summaryData.TotalGainLoss,
            totalGainLossPercent: summaryData.TotalGainLoss,
            numberOfHoldings: summaryData.NumberofHoldings,
            diversificationScore: summaryData.DiversificationScore,
            riskLevel: summaryData.RiskLevel,
            ...topPerformers
        }
    };
}

module.exports = loadPortfolioData;