/**
 * Copyright 2026 Davey <wgwcko@gmail.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { NextResponse } from "next/server";

// Health endpoint is intentionally dependency-free: it must answer even when
// the database or RPC is unreachable, so it can be used as a liveness probe.
export function GET(): NextResponse {
  return NextResponse.json({ status: "ok", service: "airdrop-claim" });
}
