/**
 * Break down portfolio return by sector and tier.
 * @param {Object} stockHistory - { symbol: candle[] }
 * @param {Object} allocations - { symbol: pct }
 * @param {number} investmentAmount
 * @param {Array} stocks - portfolio stock definitions
 */
export function computeSectorAttribution(stockHistory, allocations, investmentAmount, stocks = []) {
  const sectorMap = {};
  const tierMap = { 1: { label: 'Tier 1', return: 0, allocation: 0 }, 2: { label: 'Tier 2', return: 0, allocation: 0 }, 3: { label: 'Tier 3', return: 0, allocation: 0 } };

  for (const stock of stocks) {
    const hist = stockHistory[stock.symbol];
    const alloc = (allocations[stock.symbol] || 0) / 100;
    if (!hist?.length || alloc === 0) continue;

    const first = hist[0].close;
    const last = hist[hist.length - 1].close;
    const stockReturn = (last - first) / first;
    const contribution = stockReturn * alloc * 100;

    // Sector
    if (!sectorMap[stock.sector]) {
      sectorMap[stock.sector] = { sector: stock.sector, contribution: 0, allocation: 0, stocks: [] };
    }
    sectorMap[stock.sector].contribution += contribution;
    sectorMap[stock.sector].allocation += alloc * 100;
    sectorMap[stock.sector].stocks.push({
      symbol: stock.symbol,
      return: stockReturn * 100,
      contribution,
      allocation: alloc * 100,
    });

    // Tier
    if (!tierMap[stock.tier]) {
      tierMap[stock.tier] = { label: `Tier ${stock.tier}`, return: 0, allocation: 0 };
    }
    tierMap[stock.tier].return += contribution;
    tierMap[stock.tier].allocation += alloc * 100;
  }

  const sectors = Object.values(sectorMap).sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
  const tiers = Object.entries(tierMap).map(([tier, data]) => ({
    tier: parseInt(tier),
    ...data,
  }));

  return { sectors, tiers };
}
