"use client";
import { useSyncExternalStore } from "react";
function subscribe(update: () => void) {
  const timer = setInterval(update, 60000);
  return () => clearInterval(timer);
}
function snapshot() {
  return Math.floor(Date.now() / 60000) * 60000;
}
export function useNow() {
  return useSyncExternalStore(subscribe, snapshot, () => 0);
}
