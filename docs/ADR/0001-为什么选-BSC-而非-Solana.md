# ADR-0001 · 为什么选 BSC（EVM）而非 Solana

**状态**：已接受　**日期**：2026-10-08　**决策人**：Davey

---

## 背景

空投领取系统需要选一条链发放代币。运营方承担全部 gas，试点 ≤ 1000 人。
两个候选：Solana（用户已有 `pump-launch-cli`、`chronos/frontend` 钱包适配器）
与 BSC/EVM（用户已有 `ZeroDiamond` 生产级 wagmi+viem+SIWE+Hardhat 栈）。

---

## 决策

**采用 BSC（EVM）。**

---

## 理由

### 1. 成本差 89 倍（实测，2026-10-08）

| 链 | 单价/人 | 1000 人 | gas 单价 |
|---|---|---|---|
| **BSC** | **$0.00196** | **$1.96** | 0.05 gwei |
| Base | $0.00078 | $0.78 | 0.006 gwei |
| Ethereum L1 | $0.16106 | $161.06 | 1.235 gwei |
| Solana (SPL) | $0.17384 | $173.84 | 固定租金 |

**根因**：Solana 每个收款人首次收 SPL 代币都要新建 token 账户，
固定租金 **1,488,440 lamports（$0.173）**，占总成本 99.7%。
**EVM 没有账户租金概念**，ERC-20 转账只是 SSTORE。

> 敏感度：即使把 ERC-20 gas 取到 100,000（实际约 51,000），BSC 仍只要 $3.85/1000。

### 2. "替用户付 gas"这件事用户已在 EVM 上做过

`ZeroDiamond` 已有生产中的 **gas rebate relayer**
（`RELAYER_ADDRESS`、`gas-rebate-sweep` cron、`WITHDRAWAL_PRIVATE_KEY`）。
本项目要解决的正是**同一个问题**。Solana 侧没有对应实现。

### 3. 签名登录标准成熟度

- EVM：**SIWE（EIP-4361）**，成熟、广泛实现。用户已在 `ZeroDiamond` 跑通
  （`src/hooks/useAuth.ts`、`src/components/auth/WalletAuthButton.tsx`）
- Solana：SIWS 较新，唯一可用库 `@siws/core` 版本 **0.1.1**

### 4. 消掉三块最难的工程复杂度

Solana 方案里最麻烦、也是故障注入测试最重的三块，在 EVM 上**不存在**：

1. ATA 创建（`createIdempotent`）
2. 租金预留与"账户已存在则退回预留"的记账
3. 1232 字节交易上限带来的批量约束

### 5. 透明度更好（与项目定位吻合）

EVM 可把 ERC-20 合约源码**在 BscScan 上验证公开**，
"无 mint 函数、无 owner、无黑名单"是**可被任何人独立核验**的。
这比 "已撤销 mint authority" 是更强的信任信号——而本项目的整个定位就是"可验证的诚实版本"。

---

## 被否决的方案

**Solana** —— 否决原因见上。唯一曾经的反向理由是"meme 币玩家多在 Solana"，
但**本轮不发 LP、不做市场**，用户拿到的是不可交易代币，该理由不成立。

**Base** —— 成本更低（$0.78 vs $1.96）、声誉更干净（BSC 与骗局代币关联度高）。
**未采纳是因为运维熟悉度**：用户已有 BSC 热钱包、relayer、RPC、BscScan API key 全套就绪，
换 Base 需要新建全部基建，而 89 倍的成本差在 1000 人规模下只值 **$1.2**。
若未来扩到 10 万人以上（成本差约 $170），应重新评估。

**Ethereum L1** —— 成本 $161/1000，与 Solana 相当，无任何优势。

---

## 后果

### 正面
- 发放成本从 $174 降到 $2
- 直接复用 `ZeroDiamond` 的 SIWE、wagmi/viem、Hardhat、relayer 模式
- 工程复杂度显著下降（无租金、无 ATA、无交易体积限制）

### 负面 / 代价
- **BSC 与"土狗 / 预售骗局"关联度高**，对本项目的"诚实"定位是软性减分。
  缓解：合约开源验证 + 全程公开可查的发放记录。
- `pump-launch-cli`、`chronos/frontend` 的 Solana 代码在本项目中不再复用。

### 需要改动的文档
01（架构与选型）、03（成本模型）、04（技术风险）、05（里程碑验收标准）。
