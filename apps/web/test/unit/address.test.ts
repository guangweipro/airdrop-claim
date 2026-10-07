/**
 * Copyright 2026 Davey <wgwcko@gmail.com>
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, expect, it } from "vitest";

import { InvalidAddressError, normalizeAddress, tryNormalizeAddress } from "@/lib/address";

const LOWERCASE = "0x71c7656ec7ab88b098defb751b7401b5f6d8976f";
const CHECKSUM = "0x71C7656EC7ab88b098defB751B7401B5f6d8976F";

describe("normalizeAddress", () => {
  it("lowercases a checksummed address", () => {
    expect(normalizeAddress(CHECKSUM)).toBe(LOWERCASE);
  });

  it("is idempotent", () => {
    expect(normalizeAddress(normalizeAddress(CHECKSUM))).toBe(LOWERCASE);
  });

  it("collapses mixed-case variants to one value (the key security property)", () => {
    const variants = [LOWERCASE, CHECKSUM, LOWERCASE.toUpperCase().replace("0X", "0x")];
    const normalized = new Set(variants.map((v) => normalizeAddress(v)));
    expect(normalized.size).toBe(1);
  });

  it("trims surrounding whitespace", () => {
    expect(normalizeAddress(`  ${LOWERCASE}\n`)).toBe(LOWERCASE);
  });

  it.each([
    ["empty", ""],
    ["missing 0x prefix", LOWERCASE.slice(2)],
    ["too short", "0x71c7656ec7ab88b098defb751b7401b5f6d8976"],
    ["too long", `${LOWERCASE}ff`],
    ["non-hex characters", "0xzzc7656ec7ab88b098defb751b7401b5f6d8976f"],
  ])("rejects %s", (_label, value) => {
    expect(() => normalizeAddress(value)).toThrow(InvalidAddressError);
  });
});

describe("tryNormalizeAddress", () => {
  it("returns the normalized address for valid input", () => {
    expect(tryNormalizeAddress(CHECKSUM)).toBe(LOWERCASE);
  });

  it("returns null instead of throwing for invalid input", () => {
    expect(tryNormalizeAddress("not-an-address")).toBeNull();
  });
});
