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

## 9. 分支保护与单人开发

`main` 已配置分支保护，实测生效：

| 设置 | 值 | 作用 |
|---|---|---|
| 必须走 PR | ✅ | **推不进 main**，包括管理员 |
| 必需状态检查 | 3 项，strict | Verify / Secret scan / SAST 全绿才可合并 |
| 管理员同受约束 | ✅ `enforce_admins` | 没有给自己开的例外 |
| 线性历史 | ✅ | 禁止 merge commit |
| 禁止强推 / 禁止删除 | ✅ | |
| **必需批准数** | **0** | 见下 |

### 为什么批准数是 0

GitHub 不允许自己批准自己的 PR。单人项目下把批准数设为 1，等于**没有任何 PR 可以合并**。

因此"**不依赖作者诚实**"这条约束在这里由**自动化**承担：不能直接推 main，
必须开 PR，且 6 项检查（Verify / Secret scan / SAST / CodeQL / dependency-review / Analyze）全绿。
自动化不会因为作者今天累了或赶时间就放行——它比一个不存在的审批人更接近这条约束的本意。

**如果将来有真实的第二位维护者**，应把批准数调回 1。**不要用同一个人的第二个账号充当审批人**——
那是纸面合规，会让人误以为存在独立复审。

### 历史：为什么仓库是 public

免费个人计划的**私有**仓库不支持分支保护、rulesets、secret scanning 与 code scanning（API 实测 403）。
转 public 后全部免费可用。代价是发布前必须完成文档脱敏与历史清理——已完成。

`codeql.yml` 带可见性守卫：private 时跳过，public 时自动生效。
