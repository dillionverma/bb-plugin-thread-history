// @vitest-environment jsdom

import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup } from "@testing-library/react";
import {
  loadPluginApp,
  mountPluginContentScripts,
  renderSlot,
} from "@get-bb/plugin-sdk/testing/app";

beforeEach(() => {
  window.sessionStorage.clear();
  Object.defineProperty(window.navigator, "platform", {
    configurable: true,
    value: "MacIntel",
  });
});

afterEach(() => {
  cleanup();
});

function pressMod(key: string): KeyboardEvent {
  const event = new KeyboardEvent("keydown", {
    key,
    metaKey: true,
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event;
}

it("registers the bridge overlay, the shortcut script, and no other surfaces", async () => {
  const app = await loadPluginApp(() => import("./app"));
  expect(app.appOverlays.map((overlay) => overlay.id)).toEqual(["bridge"]);
  expect(app.contentScripts.map((script) => script.id)).toEqual(["shortcuts"]);
  expect(app.navPanels).toHaveLength(0);
  expect(app.settingsSections).toHaveLength(0);
});

it("moves back and forward through opened threads with Mod+[ and Mod+]", async () => {
  const app = await loadPluginApp(() => import("./app"));
  const overlay = app.appOverlays[0]!;

  const first = renderSlot(overlay, {}, { context: { threadId: "thr_a" } });
  first.lifecycle.unmount();
  const second = renderSlot(overlay, {}, { context: { threadId: "thr_b" } });
  const scripts = await mountPluginContentScripts(app, {
    pluginId: "thread-history",
  });

  expect(pressMod("[").defaultPrevented).toBe(true);
  expect(second.inspection.navigateCalls).toEqual([
    { method: "toThread", threadId: "thr_a" },
  ]);

  expect(pressMod("[").defaultPrevented).toBe(false);
  expect(second.inspection.navigateCalls).toHaveLength(1);

  expect(pressMod("]").defaultPrevented).toBe(true);
  expect(second.inspection.navigateCalls).toEqual([
    { method: "toThread", threadId: "thr_a" },
    { method: "toThread", threadId: "thr_b" },
  ]);
  expect(pressMod("]").defaultPrevented).toBe(false);

  await scripts.lifecycle.dispose();
  expect(pressMod("[").defaultPrevented).toBe(false);
  expect(second.inspection.navigateCalls).toHaveLength(2);
});

it("does nothing before the overlay has mounted", async () => {
  const app = await loadPluginApp(() => import("./app"));
  window.sessionStorage.setItem(
    "bb-plugin-thread-history:history",
    JSON.stringify({ entries: ["thr_a", "thr_b"], index: 1 }),
  );
  const scripts = await mountPluginContentScripts(app, {
    pluginId: "thread-history",
  });

  expect(pressMod("[").defaultPrevented).toBe(false);
  expect(
    JSON.parse(window.sessionStorage.getItem("bb-plugin-thread-history:history")!),
  ).toEqual({ entries: ["thr_a", "thr_b"], index: 1 });

  await scripts.lifecycle.dispose();
});
