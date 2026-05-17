# 🤖 VibeProxy AI Assistant for Obsidian

A lightweight and fast Obsidian plugin that integrates your local [VibeProxy](https://github.com/automazeio/vibeproxy) (or any other OpenAI-compatible local proxy) directly into your note-taking workflow.

Send prompts from your notes to your local AI model and get responses appended seamlessly within your document!

---

## ✨ Features

- **Select & Generate:** Highlight any text in your note, trigger the command, and the AI's response will be added directly below it.
- **Fully Local:** Designed to work perfectly with VibeProxy running on your local machine.
- **Highly Customizable:** Easily configure your Base URL, API Key, and target Model in the plugin settings.
- **One-Click Connection Test:** Built-in "Test Connection" button to verify your network configuration instantly.
- **Frictionless:** Zero complex logic. It acts as a standard OpenAI API client routed to your custom endpoint.

---

## 🛠 Prerequisites

Before using this plugin, ensure you have:

1. **Obsidian** installed on your machine.
2. **VibeProxy** (or a similar OpenAI API emulator) running locally or on a reachable network.

---

## 📦 Installation

Since this plugin is in early development, you can install it manually into your Obsidian vault:

1. Download the latest release files: `main.js` and `manifest.json`.
2. Open your Obsidian vault directory.
3. Navigate to the hidden plugins folder: `.obsidian/plugins/` (If it doesn't exist, create it).
4. Create a new folder inside named `obsidian-vibeproxy`.
5. Move the `main.js` and `manifest.json` files into this new folder.
6. Open Obsidian, go to **Settings > Community plugins**.
7. Disable **Safe mode** (if it's currently on).
8. Click the **Refresh** button next to "Installed plugins".
9. Find **VibeProxy AI Assistant** in the list and toggle it **ON**.

---

## ⚙️ Configuration

Once enabled, go to the Obsidian settings and click on **VibeProxy AI Assistant** in the left sidebar to configure the plugin:

- **VibeProxy Base URL:** The endpoint of your local server.
  - _Example:_ `http://127.0.0.1:8317/v1` (Note: It's highly recommended to use `127.0.0.1` instead of `localhost` to avoid Node.js IPv6 resolution issues).
- **API Key:** The authorization key. If your local VibeProxy doesn't require one, you can leave the default placeholder (`sk-vibeproxy`).
- **Model:** The specific model you want to query (e.g., `gpt-5.5`, `gpt-4o`).

**Verify Setup:** Click the **Test Connection** button at the bottom of the settings page. If you see a green "✅ Success" notification, you are ready to go!

---

## 🚀 How to Use

1. Open any note in Obsidian.
2. Write a prompt and **select/highlight** the text.
   _(Example: "Write a short summary about artificial intelligence")_
3. Open the Obsidian Command Palette (`Ctrl + P` on Windows/Linux, `Cmd + P` on macOS).
4. Search for and select: **`Send selected text to VibeProxy`**.
5. The plugin will send the text to your local server. Once generated, the AI's response will appear right below your selected text!

> **💡 Pro Tip:** Go to **Settings > Hotkeys**, search for "VibeProxy", and assign a custom keyboard shortcut (e.g., `Ctrl/Cmd + Enter`) for lightning-fast text generation!

---

## 🛑 Troubleshooting

### Connection Error (`ERR_CONNECTION_REFUSED`)

If the connection test fails or you get an error when generating text:

- **Check the URL:** Ensure you are using `127.0.0.1` instead of `localhost` in the Base URL setting. Modern Node.js often routes `localhost` to IPv6 (`::1`), which your proxy might ignore.
- **Check the Port:** Verify that VibeProxy is actually running and listening on the port specified in your settings (e.g., `8317`).
- **Check the Terminal:** Look at the terminal/console where VibeProxy is running to see if it's logging any incoming requests or crashing. You can also press `Ctrl+Shift+I` (`Cmd+Option+I` on Mac) in Obsidian to open the developer console and read the exact error message.

---

## 📄 License

This project is licensed under the MIT License. Feel free to modify and distribute it as you see fit!
