# AGENTS.md — 本仓库的工程约定

**优先级**：系统/开发者指令 > 本文件 > `~/.codex/conventions/`

---

## 1. 项目是什么

一个**可验证的**空投领取系统：X 登录确认身份 → SIWE 签名证明钱包 → 链上真实发放 BEP-20 代币。
运营方承担全部 gas。**不向用户收一分钱。**

自用 + 开源为模板，**同源不开分支**。工程文档在 `docs/`。

---

## 2. ⛔ 架构不变量（最高优先级，任何改动不得破坏）

这五条是**硬约束**，不是建议。破坏任何一条的 PR 一律拒绝。
理由见 `docs/ADR/0003-开源与私有边界.md`。

| # | 不变量 |
|---|---|
| **I1** | **系统不含任何收款功能**——无预售、无支付、无资金归集。代码里**不得出现**托管地址常量 |
| **I2** | **不含任何可配置的虚假展示组件**——没有假进度条、没有假买单滚动条 |
| **I3** | 对外统计**必须**来自数据库实时查询，**不得有任何写死的数字** |
| **I4** | 发放 `txHash` **强制入库**，且提供公开导出 |
| **I5** | **SIWE 签名校验不可通过配置关闭** |

**I1 从根上排除"卷款跑路"**——不能收钱，就无法构成非法集资。这是对作者最有效的法律保护。

---

## 3. 技术栈

| 层 | 选型 |
|---|---|
| Web | Next.js 16 App Router + React 19，TypeScript strict |
| 包管理 | pnpm（workspace：`apps/web`、`contracts`） |
| 数据库 | PostgreSQL + Prisma 7 |
| 链 | **BSC**（EVM），viem + wagmi |
| 鉴权 | X OAuth 2.0 PKCE（身份）+ **SIWE**（钱包） |
| 测试 | Vitest |
| 部署 | Cloudflare Workers/Pages；**签发进程在本机跑，不放云端** |

选型依据见 `docs/ADR/0001`、`docs/ADR/0002`。

---

## 4. 命令

```bash
pnpm install
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build   # 门禁

docker compose up -d postgres     # 本地数据库
pnpm --filter @airdrop-claim/web dev
```

---

## 5. 代码约定

- **源码注释用英文**；文档可用中文
- 每个源码文件带版权头：
  ```ts
  /**
   * Copyright 2026 Davey <wgwcko@gmail.com>
   * SPDX-License-Identifier: Apache-2.0
   */
  ```
- **EVM 地址一律小写规范化后入库与比较**（用 `src/lib/address.ts`）。
  不做规范化会让同一个钱包算成多个，直接击穿"1 钱包 = 1 次"
- 提交遵循 **Conventional Commits**，原子提交
- 格式化由 Prettier 决定（`printWidth: 100`），不要手工调格式

---

## 6. 🔐 安全规则（违反即阻断）

- **热钱包私钥绝不出现在 web 进程**。只有 `apps/web/scripts/payout.ts` 读 `OPERATOR_KEYPAIR_PATH`
- **私钥、keystore、`.env` 一律不入库**；`.env.example` 只有键名
- 新增任何可能被误提交为密钥的形态时，**同步更新 `.gitleaks.toml` 并验证规则会触发**
- 金额在**领取时冻结**写入 `Claim.totalAmountWei`，**不得**在发放时读当前配置
- 管理员地址与热钱包地址**必须是两个不同的钱包**，管理员钱包不放资金

---

## 7. 测试要求

- 新增或修改的逻辑必须有测试
- **不变量测试必须存在**：断言 I1–I5 无法被绕过
- **链上测试（BSC 测试网 Chain ID 97）不进 CI**，且 setup 里硬断言 `chainId !== 56`
- 测试路径**永不签名**

---

## 8. 提交前

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
gitleaks dir . --config .gitleaks.toml
```

全部通过才算完成。**禁止未运行就声称通过。**

### 首次克隆必须启用 pre-push 钩子

```bash
git config core.hooksPath .githooks
```

它会在**推送前**扫描待推送的提交，发现密钥就拒绝推送。**启用一次，每个克隆都要做。**

> 为什么用本地钩子而不是 GitHub push protection：
> **私有仓库的 secret scanning 与 push protection 需要 GitHub Advanced Security（Pro 不含，Team 约 $49/人/月）。**
> 本地钩子其实更早——密钥**根本没离开本机**，而不是推上去之后才告警。

## 9. 本仓库的 GitHub 计划限制（已知且已补偿）

免费个人计划的**私有**仓库不支持以下功能，均已用等效手段补偿：

| GitHub 功能 | 状态 | 补偿手段 |
|---|---|---|
| 分支保护 / rulesets | ❌ 需 GitHub Pro | **待升级**（§15 红线，见 docs/01 §14 技术债） |
| secret scanning / push protection | ❌ 需 GHAS | ✅ CI 里的 gitleaks + **本地 pre-push 钩子** |
| CodeQL / code scanning | ❌ 需 GHAS | ✅ CI 里的 Semgrep；`codeql.yml` 带守卫，**仓库转 public 后自动生效** |
| Dependabot 告警与安全更新 | ✅ 免费 | 已启用 |

**仓库转为 public 后**，上表除分支保护外全部免费自动可用。
