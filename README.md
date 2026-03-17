# Webex Helper

A lightweight Obsidian plugin that automatically converts Webex URI links into formatted markdown hyperlinks. When you paste a `webexteams://im?space=...` URI, the plugin replaces it with a clickable `[Webex space](...)` or `[Webex message](...)` link. You can also run the "Convert URIs to markdown links" command to convert existing URIs in a document. Link text labels are customizable in the plugin settings.

## Installation

1. Download `main.js` and `manifest.json` from the [latest release](../../releases/latest).
2. Create a folder called `webex-helper` inside your vault at `.obsidian/plugins/`.
3. Copy the downloaded files into that folder.
4. In Obsidian, go to **Settings > Community plugins** and enable **Webex Helper**.

## Building from Source

1. Run `npm install` then `npm run build` to produce `main.js`.
2. Follow steps 2–4 above.