"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const DEFAULT_SETTINGS = {
  proxyUrl: "http://localhost:8080/v1",
  apiKey: "sk-vibeproxy",
  model: "gpt-4o",
};
class VibeProxyPlugin extends obsidian_1.Plugin {
  async onload() {
    await this.loadSettings();
    this.addCommand({
      id: "generate-via-vibeproxy",
      name: "Send selected text to VibeProxy",
      editorCallback: async (editor, view) => {
        const selection = editor.getSelection();
        if (!selection) {
          new obsidian_1.Notice("Please select text to send.");
          return;
        }
        new obsidian_1.Notice("Sending request to VibeProxy...");
        try {
          const response = await this.callVibeProxy(selection);
          editor.replaceSelection(`${selection}\n\n**AI:** ${response}\n`);
        } catch (error) {
          console.error("VibeProxy Error:", error);
          new obsidian_1.Notice(
            "Error when contacting VibeProxy. Check the console.",
          );
        }
      },
    });
    this.addSettingTab(new VibeProxySettingTab(this.app, this));
  }
  async callVibeProxy(prompt) {
    const endpoint = `${this.settings.proxyUrl}/chat/completions`;
    const payload = {
      model: this.settings.model,
      messages: [{ role: "user", content: prompt }],
    };
    const response = await (0, obsidian_1.requestUrl)({
      url: endpoint,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.settings.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
    if (response.status !== 200) {
      throw new Error(`API Error: ${response.status} - ${response.text}`);
    }
    const data = response.json;
    return data.choices[0].message.content;
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
}
exports.default = VibeProxyPlugin;
class VibeProxySettingTab extends obsidian_1.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new obsidian_1.Setting(containerEl)
      .setName("VibeProxy Base URL")
      .setDesc(
        "Specify the URL of your local proxy (e.g., http://localhost:8317/v1)",
      )
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:8317/v1")
          .setValue(this.plugin.settings.proxyUrl)
          .onChange(async (value) => {
            this.plugin.settings.proxyUrl = value;
            await this.plugin.saveSettings();
          }),
      );
    new obsidian_1.Setting(containerEl)
      .setName("API Key")
      .setDesc(
        "Leave the placeholder if VibeProxy does not require authentication",
      )
      .addText((text) =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          }),
      );
    new obsidian_1.Setting(containerEl)
      .setName("Model")
      .setDesc(
        "The name of the model expected by the OpenAI API (e.g., gpt-4o or gpt-4)",
      )
      .addText((text) =>
        text
          .setPlaceholder("gpt-4o")
          .setValue(this.plugin.settings.model)
          .onChange(async (value) => {
            this.plugin.settings.model = value;
            await this.plugin.saveSettings();
          }),
      );
  }
}
