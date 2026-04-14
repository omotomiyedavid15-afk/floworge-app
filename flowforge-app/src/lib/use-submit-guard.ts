"use client";

import { useRef, useCallback } from "react";

/**
 * Prevents a form handler from being called more than once per `cooldownMs`.
 * Wraps the handler and returns a guarded version.
 *
 * Usage:
 *   const guardedSubmit = useSubmitGuard(handleSubmit, 2000);
 *   <form onSubmit={guardedSubmit}>
 */
export function useSubmitGuard<T extends (...args: never[]) => unknown>(
  fn: T,
  cooldownMs = 2000
): T {
  const lastCall = useRef(0);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current < cooldownMs) return;
      lastCall.current = now;
      return fn(...args);
    },
    [fn, cooldownMs]
  ) as T;
}
