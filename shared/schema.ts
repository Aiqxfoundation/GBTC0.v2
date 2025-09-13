import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  accessKey: text("access_key").notNull().unique(),
  referralCode: text("referral_code").unique(),
  referredBy: text("referred_by"), // Referral code of the user who referred them
  registrationIp: text("registration_ip"), // IP address that created this account
  usdtBalance: decimal("usdt_balance", { precision: 10, scale: 2 }).default("0.00"),
  btcBalance: decimal("btc_balance", { precision: 18, scale: 8 }).default("0.00000000"), // BTC balance
  hashPower: decimal("hash_power", { precision: 10, scale: 2 }).default("0.00"),
  baseHashPower: decimal("base_hash_power", { precision: 10, scale: 2 }).default("0.00"), // User's own hash power
  referralHashBonus: decimal("referral_hash_bonus", { precision: 10, scale: 2 }).default("0.00"), // 5% from active referrals
  gbtcBalance: decimal("gbtc_balance", { precision: 18, scale: 8 }).default("0.00000000"),
  unclaimedBalance: decimal("unclaimed_balance", { precision: 18, scale: 8 }).default("0.00000000"),
  totalReferralEarnings: decimal("total_referral_earnings", { precision: 10, scale: 2 }).default("0.00"),
  lastActiveBlock: integer("last_active_block"), // Last block user was active in
  isAdmin: boolean("is_admin").default(false),
  isFrozen: boolean("is_frozen").default(false),
  isBanned: boolean("is_banned").default(false),
  hasStartedMining: boolean("has_started_mining").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deposits = pgTable("deposits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  network: text("network").notNull(), // "BSC", "ETH", "TRC20", "APTOS"
  txHash: text("tx_hash").notNull().unique(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  currency: text("currency").notNull().default("USDT"), // "USDT" or "ETH"
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const withdrawals = pgTable("withdrawals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  address: text("address").notNull(),
  network: text("network").notNull(), // "ERC20", "BSC", "TRC20" for USDT, "GBTC" for GBTC, "ETH" for ETH
  currency: text("currency").notNull().default("USDT"), // "USDT", "ETH", or "GBTC"
  status: text("status").notNull().default("pending"), // "pending", "completed", "rejected"
  txHash: text("tx_hash"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const unclaimedBlocks = pgTable("unclaimed_blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  blockNumber: integer("block_number").notNull(),
  txHash: text("tx_hash").notNull(),
  reward: decimal("reward", { precision: 18, scale: 8 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  claimed: boolean("claimed").default(false),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const minerActivity = pgTable("miner_activity", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull().unique(),
  lastClaimTime: timestamp("last_claim_time"),
  totalClaims: integer("total_claims").default(0),
  missedClaims: integer("missed_claims").default(0),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: uuid("from_user_id").references(() => users.id).notNull(),
  toUserId: uuid("to_user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 18, scale: 8 }).notNull(),
  txHash: text("tx_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const miningBlocks = pgTable("mining_blocks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  blockNumber: integer("block_number").notNull(),
  reward: decimal("reward", { precision: 18, scale: 8 }).notNull(),
  totalHashPower: decimal("total_hash_power", { precision: 10, scale: 2 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const miningStats = pgTable("mining_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  totalHashPower: decimal("total_hash_power", { precision: 15, scale: 2 }).default("0.00"),
  activeMiners: integer("active_miners").default(0),
  totalBlocksMined: integer("total_blocks_mined").default(0),
  currentDifficulty: decimal("current_difficulty", { precision: 10, scale: 2 }).default("1.00"),
  networkStatus: text("network_status").default("active"), // "active", "maintenance", "paused"
  lastBlockTime: timestamp("last_block_time").defaultNow(),
  avgBlockTime: integer("avg_block_time").default(600), // seconds
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userMiningStats = pgTable("user_mining_stats", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  totalHashPower: decimal("total_hash_power", { precision: 10, scale: 2 }).default("0.00"),
  totalMined: decimal("total_mined", { precision: 18, scale: 8 }).default("0.00000000"),
  totalClaimed: decimal("total_claimed", { precision: 18, scale: 8 }).default("0.00000000"),
  blocksParticipated: integer("blocks_participated").default(0),
  lastMiningActivity: timestamp("last_mining_activity").defaultNow(),
  miningEfficiency: decimal("mining_efficiency", { precision: 5, scale: 2 }).default("100.00"), // percentage
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// BTC Staking Tables
export const btcStakes = pgTable("btc_stakes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  btcAmount: decimal("btc_amount", { precision: 18, scale: 8 }).notNull(), // Amount of BTC staked
  gbtcHashrate: decimal("gbtc_hashrate", { precision: 10, scale: 2 }).notNull(), // Equivalent GBTC hashrate locked
  btcPriceAtStake: decimal("btc_price_at_stake", { precision: 10, scale: 2 }).notNull(), // BTC price when staked
  aprRate: decimal("apr_rate", { precision: 5, scale: 2 }).default("20.00"), // 20% APR
  dailyReward: decimal("daily_reward", { precision: 18, scale: 8 }).notNull(), // Daily BTC reward
  totalRewardsPaid: decimal("total_rewards_paid", { precision: 18, scale: 8 }).default("0.00000000"),
  stakedAt: timestamp("staked_at").defaultNow(),
  unlockAt: timestamp("unlock_at").notNull(), // 1 year from stake date
  status: text("status").notNull().default("active"), // "active", "completed", "cancelled"
  lastRewardAt: timestamp("last_reward_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const btcStakingRewards = pgTable("btc_staking_rewards", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  stakeId: uuid("stake_id").references(() => btcStakes.id).notNull(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).notNull(),
  btcPrice: decimal("btc_price", { precision: 10, scale: 2 }).notNull(),
  paidAt: timestamp("paid_at").defaultNow(),
});

export const btcPriceHistory = pgTable("btc_price_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  source: text("source").default("system"), // "system", "manual", "api"
  timestamp: timestamp("timestamp").defaultNow(),
});

// Device Fingerprinting Tables
export const devices = pgTable("devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  serverDeviceId: text("server_device_id").notNull().unique(),
  firstSeen: timestamp("first_seen").defaultNow(),
  lastSeen: timestamp("last_seen").defaultNow(),
  lastIp: text("last_ip"),
  asn: text("asn"),
  registrations: integer("registrations").default(0),
  riskScore: integer("risk_score").default(0),
  blocked: boolean("blocked").default(false),
  signalsVersion: text("signals_version").default("1.0"),
});

export const deviceFingerprints = pgTable("device_fingerprints", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  deviceId: uuid("device_id").references(() => devices.id).notNull(),
  stableHash: text("stable_hash").notNull(),
  volatileHash: text("volatile_hash").notNull(),
  chUaHash: text("ch_ua_hash"),
  webglHash: text("webgl_hash"),
  canvasHash: text("canvas_hash"),
  fontsHash: text("fonts_hash"),
  storageFlags: text("storage_flags"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userDevices = pgTable("user_devices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").references(() => users.id).notNull(),
  deviceId: uuid("device_id").references(() => devices.id).notNull(),
  firstLinked: timestamp("first_linked").defaultNow(),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  deposits: many(deposits),
  withdrawals: many(withdrawals),
  unclaimedBlocks: many(unclaimedBlocks),
  sentTransfers: many(transfers, {
    relationName: "sentTransfers",
  }),
  receivedTransfers: many(transfers, {
    relationName: "receivedTransfers",
  }),
  minerActivity: one(minerActivity),
  miningStats: one(userMiningStats),
  btcStakes: many(btcStakes),
  btcStakingRewards: many(btcStakingRewards),
  userDevices: many(userDevices),
}));

export const depositsRelations = relations(deposits, ({ one }) => ({
  user: one(users, {
    fields: [deposits.userId],
    references: [users.id],
  }),
}));

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, {
    fields: [withdrawals.userId],
    references: [users.id],
  }),
}));

export const unclaimedBlocksRelations = relations(unclaimedBlocks, ({ one }) => ({
  user: one(users, {
    fields: [unclaimedBlocks.userId],
    references: [users.id],
  }),
}));

export const minerActivityRelations = relations(minerActivity, ({ one }) => ({
  user: one(users, {
    fields: [minerActivity.userId],
    references: [users.id],
  }),
}));

export const transfersRelations = relations(transfers, ({ one }) => ({
  fromUser: one(users, {
    fields: [transfers.fromUserId],
    references: [users.id],
    relationName: "sentTransfers",
  }),
  toUser: one(users, {
    fields: [transfers.toUserId],
    references: [users.id],
    relationName: "receivedTransfers",
  }),
}));

export const userMiningStatsRelations = relations(userMiningStats, ({ one }) => ({
  user: one(users, {
    fields: [userMiningStats.userId],
    references: [users.id],
  }),
}));

export const btcStakesRelations = relations(btcStakes, ({ one, many }) => ({
  user: one(users, {
    fields: [btcStakes.userId],
    references: [users.id],
  }),
  rewards: many(btcStakingRewards),
}));

export const btcStakingRewardsRelations = relations(btcStakingRewards, ({ one }) => ({
  user: one(users, {
    fields: [btcStakingRewards.userId],
    references: [users.id],
  }),
  stake: one(btcStakes, {
    fields: [btcStakingRewards.stakeId],
    references: [btcStakes.id],
  }),
}));

export const devicesRelations = relations(devices, ({ many }) => ({
  fingerprints: many(deviceFingerprints),
  userDevices: many(userDevices),
}));

export const deviceFingerprintsRelations = relations(deviceFingerprints, ({ one }) => ({
  device: one(devices, {
    fields: [deviceFingerprints.deviceId],
    references: [devices.id],
  }),
}));

export const userDevicesRelations = relations(userDevices, ({ one }) => ({
  user: one(users, {
    fields: [userDevices.userId],
    references: [users.id],
  }),
  device: one(devices, {
    fields: [userDevices.deviceId],
    references: [devices.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  registrationIp: true,
  usdtBalance: true,
  btcBalance: true,
  hashPower: true,
  baseHashPower: true,
  referralHashBonus: true,
  gbtcBalance: true,
  unclaimedBalance: true,
  totalReferralEarnings: true,
  lastActiveBlock: true,
  isAdmin: true,
  isFrozen: true,
  isBanned: true,
  hasStartedMining: true,
}).extend({
  accessKey: z.string().regex(/^GBTC-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/, "Access key must be in format GBTC-XXXXX-XXXXX-XXXXX-XXXXX"),
});

export const insertDepositSchema = createInsertSchema(deposits).omit({
  id: true,
  userId: true,
  status: true,
  adminNote: true,
  currency: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
  id: true,
  userId: true,
  status: true,
  txHash: true,
  currency: true,
  createdAt: true,
});

export const insertTransferSchema = createInsertSchema(transfers).omit({
  id: true,
  fromUserId: true,
  txHash: true,
  createdAt: true,
});

export const insertUnclaimedBlockSchema = createInsertSchema(unclaimedBlocks).omit({
  id: true,
  userId: true,
  claimed: true,
  claimedAt: true,
  createdAt: true,
});

export const insertBtcStakeSchema = createInsertSchema(btcStakes).omit({
  id: true,
  userId: true,
  totalRewardsPaid: true,
  status: true,
  lastRewardAt: true,
  createdAt: true,
  stakedAt: true,
});

export const insertBtcStakingRewardSchema = createInsertSchema(btcStakingRewards).omit({
  id: true,
  userId: true,
  paidAt: true,
});

export const insertBtcPriceHistorySchema = createInsertSchema(btcPriceHistory).omit({
  id: true,
  source: true,
  timestamp: true,
});

export const insertDeviceSchema = createInsertSchema(devices).omit({
  id: true,
  firstSeen: true,
  lastSeen: true,
  registrations: true,
  riskScore: true,
  blocked: true,
  signalsVersion: true,
});

export const insertDeviceFingerprintSchema = createInsertSchema(deviceFingerprints).omit({
  id: true,
  createdAt: true,
});

export const insertUserDeviceSchema = createInsertSchema(userDevices).omit({
  id: true,
  firstLinked: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Deposit = typeof deposits.$inferSelect;
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;
export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type MiningBlock = typeof miningBlocks.$inferSelect;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type MiningStats = typeof miningStats.$inferSelect;
export type Transfer = typeof transfers.$inferSelect;
export type MinerActivity = typeof minerActivity.$inferSelect;
export type UserMiningStats = typeof userMiningStats.$inferSelect;
export type UnclaimedBlock = typeof unclaimedBlocks.$inferSelect;
export type InsertUnclaimedBlock = z.infer<typeof insertUnclaimedBlockSchema>;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;
export type BtcStake = typeof btcStakes.$inferSelect;
export type InsertBtcStake = z.infer<typeof insertBtcStakeSchema>;
export type BtcStakingReward = typeof btcStakingRewards.$inferSelect;
export type InsertBtcStakingReward = z.infer<typeof insertBtcStakingRewardSchema>;
export type BtcPriceHistory = typeof btcPriceHistory.$inferSelect;
export type InsertBtcPriceHistory = z.infer<typeof insertBtcPriceHistorySchema>;
export type Device = typeof devices.$inferSelect;
export type InsertDevice = z.infer<typeof insertDeviceSchema>;
export type DeviceFingerprint = typeof deviceFingerprints.$inferSelect;
export type InsertDeviceFingerprint = z.infer<typeof insertDeviceFingerprintSchema>;
export type UserDevice = typeof userDevices.$inferSelect;
export type InsertUserDevice = z.infer<typeof insertUserDeviceSchema>;
