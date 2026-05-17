import {
  App,
  Editor,
  MarkdownView,
  MarkdownFileInfo,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  requestUrl,
} from "obsidian";

interface VibeProxySettings {
  proxyUrl: string;
  apiKey: string;
  model: string;
}

const DEFAULT_SETTINGS: VibeProxySettings = {
  proxyUrl: "http://localhost:8080/v1",
  apiKey: "sk-vibeproxy",
  model: "gpt-4o",
};

export default class VibeProxyPlugin extends Plugin {
  settings!: VibeProxySettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: "generate-via-vibeproxy",
      name: "Отправить выделенный текст в VibeProxy",
      editorCallback: async (
        editor: Editor,
        view: MarkdownView | MarkdownFileInfo,
      ) => {
        const selection = editor.getSelection();

        if (!selection) {
          new Notice("Пожалуйста, выделите текст для отправки.");
          return;
        }

        new Notice("Отправка запроса в VibeProxy...");

        try {
          const response = await this.callVibeProxy(selection);
          editor.replaceSelection(`${selection}\n\n**AI:** ${response}\n`);
        } catch (error) {
          console.error("VibeProxy Error:", error);
          new Notice("Ошибка при обращении к VibeProxy. Проверьте консоль.");
        }
      },
    });

    this.addSettingTab(new VibeProxySettingTab(this.app, this));
  }

  async callVibeProxy(prompt: string): Promise<string> {
    const endpoint = `${this.settings.proxyUrl}/chat/completions`;

    const payload = {
      model: this.settings.model,
      messages: [{ role: "user", content: prompt }],
    };

    const response = await requestUrl({
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

class VibeProxySettingTab extends PluginSettingTab {
  plugin: VibeProxyPlugin;

  constructor(app: App, plugin: VibeProxyPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName("VibeProxy Base URL")
      .setDesc(
        "Укажите URL вашего локального прокси (например, http://localhost:8080/v1)",
      )
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:8080/v1")
          .setValue(this.plugin.settings.proxyUrl)
          .onChange(async (value) => {
            this.plugin.settings.proxyUrl = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("API Key")
      .setDesc("Оставьте заглушку, если VibeProxy не требует аутентификации")
      .addText((text) =>
        text
          .setPlaceholder("sk-...")
          .setValue(this.plugin.settings.apiKey)
          .onChange(async (value) => {
            this.plugin.settings.apiKey = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName("Model")
      .setDesc(
        "Название модели, которую ожидает OpenAI API (например, gpt-4o или gpt-4)",
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
