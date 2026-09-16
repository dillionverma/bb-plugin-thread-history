import { useEffect } from "react";
import {
  definePluginApp,
  useBbContext,
  useBbNavigate,
} from "@get-bb/plugin-sdk/app";
import { createThreadHistoryStore } from "./lib/history";
import { isMacPlatform, threadHistoryShortcutOffset } from "./lib/shortcut";

const store = createThreadHistoryStore(
  typeof window === "undefined" ? null : window.sessionStorage,
);

let navigateToThread: ((threadId: string) => void) | null = null;

function step(offset: -1 | 1): boolean {
  if (navigateToThread === null || !store.canStep(offset)) return false;
  const threadId = store.step(offset);
  if (threadId === null) return false;
  navigateToThread(threadId);
  return true;
}

function ThreadHistoryBridge() {
  const { threadId } = useBbContext();
  const navigate = useBbNavigate();

  useEffect(() => {
    const toThread = (id: string) => navigate.toThread(id);
    navigateToThread = toThread;
    return () => {
      if (navigateToThread === toThread) navigateToThread = null;
    };
  }, [navigate]);

  useEffect(() => {
    if (threadId) store.record(threadId);
  }, [threadId]);

  return null;
}

export default definePluginApp((app) => {
  app.slots.experimental_appOverlay({
    id: "bridge",
    component: ThreadHistoryBridge,
  });

  app.contentScripts.register({
    id: "shortcuts",
    mount({ signal }) {
      const isMac = isMacPlatform();
      const onKeyDown = (event: KeyboardEvent) => {
        const offset = threadHistoryShortcutOffset(event, isMac);
        if (offset === null || !step(offset)) return;
        event.preventDefault();
        event.stopPropagation();
      };
      window.addEventListener("keydown", onKeyDown, { capture: true, signal });
    },
  });

  app.slots.commandPaletteAction({
    id: "back",
    title: "Back to previous thread",
    isAvailable: () => store.canStep(-1),
    run: () => {
      step(-1);
    },
  });

  app.slots.commandPaletteAction({
    id: "forward",
    title: "Forward to next thread",
    isAvailable: () => store.canStep(1),
    run: () => {
      step(1);
    },
  });
});
