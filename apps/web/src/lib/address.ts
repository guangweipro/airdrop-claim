/**
 * Copyright 2026 Davey <wgwcko@gmail.com>
 * SPDX-License-Identifier: Apache-2.0
 *
 * EVM address handling.
 *
 * Every address MUST be normalized before it is stored or compared. An EVM
 * address has mixed-case "checksum" forms that are all the same account, so
 * comparing raw strings would let one wallet register as several distinct
 * wallets and defeat the "1 wallet = 1 claim" rule (see docs/01-技术方案.md §6).
 */

import { getAddress, isAddress } from "viem";

/** Thrown when a caller passes something that is not a valid EVM address. */
export class InvalidAddressError extends Error {
  public constructor(value: string) {
    super(`Not a valid EVM address: ${value}`);
    this.name = "InvalidAddressError";
  }
}

/**
 * Validate an address and return its canonical lowercase form.
 * Use this for every storage write and every uniqueness comparison.
 *
 * @throws {InvalidAddressError} when the input is not a valid EVM address.
 */
export function normalizeAddress(value: string): string {
  const trimmed = value.trim();
  if (!isAddress(trimmed, { strict: false })) {
    throw new InvalidAddressError(value);
  }
  return getAddress(trimmed).toLowerCase();
}

/**
 * Non-throwing variant for request parsing, where an invalid address is
 * expected user input rather than a programming error.
 */
export function tryNormalizeAddress(value: string): string | null {
  try {
    return normalizeAddress(value);
  } catch {
    return null;
  }
}
