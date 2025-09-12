import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import bitcoinLogo from "@assets/file_00000000221c61fab63936953b889556_1756633909848.png";

export default function GlobalInfoPage() {
  // Mock data - replace with real API
  const totalMinted = 50; // Initial GBTC in circulation
  const totalSupply = 2100000; // 2.1M GBTC total supply
  const percentMined = (totalMinted / totalSupply) * 100;
  const targetPercent = 25; // 25% target for exchange listing
  
  // Dynamic hashrate with network growth
  const baseHashrate = 584732.50;
  const networkGrowthRate = 1.0012;
  const currentHour = new Date().getHours();
  const globalHashrate = baseHashrate * Math.pow(networkGrowthRate, currentHour);
  
  // Fixed block reward
  const currentBlockReward = 50; // 50 GBTC per block
  const currentBlockHeight = 1 + Math.floor((Date.now() - new Date().setHours(0,0,0,0)) / 3600000); // Increment every hour
  
  const getHashrateDisplay = (hashrate: number) => {
    if (hashrate >= 1000000) return `${(hashrate / 1000000).toFixed(3)} PH/s`;
    if (hashrate >= 1000) return `${(hashrate / 1000).toFixed(2)} TH/s`;
    return `${hashrate.toFixed(2)} GH/s`;
  };

  const stats = {
    totalDeposits: 584732.50,
    totalWithdrawals: 127341.20,
    activeMiners: 1847,
    registeredUsers: 5432,
    networkHashrate: globalHashrate,
    blockHeight: currentBlockHeight,
    blocksToday: currentHour, // 1 block per hour, so blocks = hours passed today
    blockReward: currentBlockReward,
    difficulty: 47.8 + (globalHashrate / 100000) // Dynamic difficulty
  };

  return (
    <div className="mobile-page">
      {/* Header */}
      <div className="mobile-header">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 cyber-border rounded-xl flex items-center justify-center glow-bitcoin">
            <img src={bitcoinLogo} alt="GBTC" className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-display font-bold text-primary">GLOBAL INFO</h1>
            <p className="text-xs text-muted-foreground font-mono">
              Network Statistics
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mobile-content">
        {/* FOMO Ticker - Progress to 25% */}
        <div className="fomo-ticker">
          <div className="mb-3">
            <p className="text-xs font-mono text-muted-foreground mb-1">PROGRESS TO EXCHANGE LISTING</p>
            <p className="text-2xl font-display font-black text-primary">
              {percentMined.toFixed(2)}% / {targetPercent}%
            </p>
          </div>
          
          <div className="fomo-progress mb-3">
            <div 
              className="fomo-progress-bar"
              style={{ width: `${(percentMined / targetPercent) * 100}%` }}
            />
          </div>
          
          <p className="text-xs text-muted-foreground">
            When {targetPercent}% mined, GBTC will list on exchanges → external withdrawals enabled
          </p>
        </div>

        {/* Mining Stats */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">MINING STATISTICS</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">CIRCULATING</p>
              <p className="text-lg font-display font-bold text-primary">
                {totalMinted.toFixed(0)} GBTC
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">TOTAL SUPPLY</p>
              <p className="text-lg font-display font-bold">
                {(totalSupply / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">NETWORK HASHRATE</p>
              <p className="text-lg font-display font-bold text-chart-4">
                {getHashrateDisplay(stats.networkHashrate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">BLOCK REWARD</p>
              <p className="text-lg font-display font-bold text-accent">
                {stats.blockReward} GBTC
              </p>
            </div>
          </div>
        </Card>

        {/* Network Activity */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">NETWORK ACTIVITY</p>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Active Miners</span>
              <span className="text-sm font-display font-bold text-primary">
                {stats.activeMiners.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Registered Users</span>
              <span className="text-sm font-display font-bold">
                {stats.registeredUsers.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Blocks Today</span>
              <span className="text-sm font-display font-bold text-chart-4">
                {stats.blocksToday}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Block Height</span>
              <span className="text-sm font-display font-bold text-accent">
                #{stats.blockHeight.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Financial Stats */}
        <Card className="mobile-card bg-gradient-to-br from-accent/10 to-chart-3/10">
          <p className="text-sm font-mono text-muted-foreground mb-3">FINANCIAL OVERVIEW</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">TOTAL DEPOSITS</p>
              <p className="text-lg font-display font-bold text-accent">
                ${(stats.totalDeposits / 1000).toFixed(1)}K
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">WITHDRAWALS</p>
              <p className="text-lg font-display font-bold text-chart-3">
                ${(stats.totalWithdrawals / 1000).toFixed(1)}K
              </p>
            </div>
          </div>
        </Card>

        {/* Recent Blocks with Dynamic Rewards */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">RECENT BLOCKS</p>
          <div className="space-y-2">
            {[0, 1, 2, 3, 4].map(offset => {
              const blockNum = currentBlockHeight - offset;
              const blockReward = currentBlockReward; // Fixed 50 GBTC per block
              return (
                <div key={blockNum} className="flex justify-between items-center p-2 bg-background rounded">
                  <span className="text-xs font-mono">Block #{blockNum.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">{blockReward} GBTC</span>
                  <span className="text-xs text-primary">✓ Mined</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="mobile-card">
          <p className="text-sm font-mono text-muted-foreground mb-3">LIVE ACTIVITY</p>
          <div className="space-y-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mining-pulse"></div>
              <span className="text-muted-foreground">User mined 0.0234 GBTC</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full"></div>
              <span className="text-muted-foreground">New deposit: 50 USDT</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
              <span className="text-muted-foreground">100 GH/s purchased</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full mining-pulse"></div>
              <span className="text-muted-foreground">Block #{currentBlockHeight} mined</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}