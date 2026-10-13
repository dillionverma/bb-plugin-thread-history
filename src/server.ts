// bb-plugin-thread-history — headless backend entry.
//
// Everything this plugin does lives in the frontend bundle (app.tsx): it
// tracks the threads opened in each window and binds Mod+[ / Mod+] to move
// back and forward through them. The server entry is required by the manifest
// contract but has nothing to register.
import type { BbPluginApi } from "@get-bb/plugin-sdk";

export default async function plugin(bb: BbPluginApi) {
  bb.log.info("thread history loaded — Mod+[ and Mod+] move through recently opened threads");
}
