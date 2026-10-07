# airdrop-claim

一套**可验证**的空投领取系统：X 身份确认 + SIWE 钱包签名 + 链上真实发放。

[![CI](https://github.com/weinotes/airdrop-claim/actions/workflows/ci.yml/badge.svg)](https://github.com/weinotes/airdrop-claim/actions/workflows/ci.yml)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

> **这是一个模板，不是产品。** 预期用法是 fork 走改成你自己的——见 [SUPPORT.md](SUPPORT.md)。
> Issue 会被看到，但不保证回复。

> **状态：早期。** 目前只有仓库骨架。领取流程、代币合约与发放程序都还没实现。
> 里程碑计划见 [docs/05](docs/05-里程碑与验收.md)。

---

## 为什么做这个

大多数空投页面是为了"看起来有人气"而做的：写死的进度条、编出来的购买滚动条、
一个背后没有任何合约、只负责收款的地址，以及一个提交之后什么都不记录的"空投"。
这些做法在链上事后都极易被识破。

本项目取其中**真正有效的部分**——一个人们愿意参与的公开动作——然后用诚实的方式实现它。
发放是真的，每一条领取都有记录，每一笔发放都有任何人都能核对的事务哈希。

---

## 这个系统**不做**什么 —— 由架构强制保证

系统围绕五条不变量构建。它们不是建议，也不可配置。削弱任何一条的改动都不会被接受——
见 [docs/ADR/0003](docs/ADR/0003-开源与私有边界.md) 与 [AGENTS.md](AGENTS.md)。

| # | 不变量 | 后果 |
|---|---|---|
| **I1** | **系统不含任何收款功能。** 无预售、无充值、无资金归集。 | **它不可能被用来从任何人手里拿钱。** |
| **I2** | **没有任何可配置的虚假展示组件。** 没有伪造的进度条，没有编造的购买滚动条。 | 想伪造活跃度必须自己新写模块，而不是改一个开关。 |
| **I3** | **所有对外统计都从数据库实时查询。** | 没有任何地方可以写死一个数字。 |
| **I4** | **每笔发放都记录事务哈希，并提供公开导出。** | 声称发货就必须真的发货。 |
| **I5** | **SIWE 签名校验不可关闭。** | 不存在跳过钱包归属证明的省事路径。 |

**I1 是承重的那一条：一个收不了钱的系统，不可能变成卷款跑路。**
这既保护使用者，也同样保护部署它的人。

---

## 架构

```
浏览器
  ├─ X OAuth 2.0 PKCE ──→ 仅用于身份（1 账号 = 1 次领取）
  ├─ wagmi/viem + SIWE ──→ 证明钱包归属
  └─ POST /api/claim/submit
          │
          ▼
   Next.js on Cloudflare Workers/Pages   ← 永不持有私钥
     ├─ 校验 SIWE（一次性 nonce、域绑定、5 分钟 TTL）
     ├─ 去重（x_user_id 唯一、钱包唯一）
     ├─ 限额（总量 / 每 IP / 时间窗 / 停机开关）
     └─ 写 claim 为 PENDING                ← 这一步不发放任何东西
          │
          ▼  （延迟、批量；资金动之前留出反滥用窗口）
   payout runner —— 在本机运行，是唯一的持钥方
     ├─ 取已解锁、已到期的 tranche
     ├─ 组交易 → 策略校验 → 预算守卫 → 签名 → 广播
     └─ 按 nonce + receipt 对账，然后写 status = PAID
```

**部署依据**：[ADR-0002](docs/ADR/0002-托管与部署方案.md)。
**链选择依据**：[ADR-0001](docs/ADR/0001-为什么选-BSC-而非-Solana.md)。

两个值得先知道的设计决定：

- **领取不等于发放。** 领取只入库。发放延迟且批量执行，这既在资金动之前留出取消滥用的窗口，
  也让试点规模下不需要一个常驻的发放守护进程。
- **Web 进程永不持有私钥。** 签名发生在另一台机器上的独立 runner 里。

---

## 快速开始

需要：Node 22+、pnpm 11+、Docker（仅用于本地数据库）。

```bash
pnpm install

# 启用密钥扫描 pre-push 钩子（每个克隆做一次）
git config core.hooksPath .githooks

docker compose up -d postgres
cp .env.example .env      # 然后填写；ADMIN_ENABLED=false 是默认值

pnpm --filter @airdrop-claim/web db:migrate
pnpm --filter @airdrop-claim/web dev
```

应用默认启动在**惰性状态**：`ADMIN_ENABLED=false`、未配置代币合约、`PAYOUTS_PAUSED=true`。
不会有任何链上操作被误触发。

### 质量门禁

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
gitleaks dir . --config .gitleaks.toml
```

全部通过才算完成。

---

## 文档

| 文档 | 内容 |
|---|---|
| [01 · 技术方案](docs/01-技术方案.md) | 架构、不变量、数据模型、API、发放流程、安全控制 |
| [03 · 成本与预算](docs/03-成本与预算.md) | 一次空投的真实成本，按链对比 |
| [04 · 风险与合规](docs/04-风险与合规.md) | 法律边界、隐私、连续性、被滥用风险 |
| [05 · 里程碑与验收](docs/05-里程碑与验收.md) | M0–M11，每条都有可测试的验收标准 |
| [08 · 开源发布检查单](docs/08-开源发布检查单.md) | 公开之前必须满足什么 |
| [ADR-0001](docs/ADR/0001-为什么选-BSC-而非-Solana.md) | 链选择，附实测成本数据 |
| [ADR-0002](docs/ADR/0002-托管与部署方案.md) | 托管方案，以及签名私钥放在哪 |
| [ADR-0003](docs/ADR/0003-开源与私有边界.md) | 为什么开源，以及五条不变量 |

---

## 参与

**预期路径是 fork。** Pull request 欢迎用于修 bug、安全加固、文档更正与测试——
见 [CONTRIBUTING.md](CONTRIBUTING.md)。

请先读 [AGENTS.md](AGENTS.md)：里面列了不变量与安全规则，削弱任何一条的改动都会被拒绝。

## 安全

见 [SECURITY.md](SECURITY.md)。**不要在公开 issue 里披露安全漏洞。**

## 许可

Apache-2.0 —— 见 [LICENSE](LICENSE) 与 [NOTICE](NOTICE)。

Copyright 2026 Davey <wgwcko@gmail.com>
