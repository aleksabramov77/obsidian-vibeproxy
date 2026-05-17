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

    // Add a command to send selected text to VibeProxy
    this.addCommand({
      id: "generate-via-vibeproxy",
      name: "Send selected text to VibeProxy",
      editorCallback: async (
        editor: Editor,
        view: MarkdownView | MarkdownFileInfo,
      ) => {
        const selection = editor.getSelection();

        if (!selection) {
          new Notice("Please select text to send.");
          return;
        }

        new Notice("Sending request to VibeProxy...");

        try {
          const response = await this.callVibeProxy(selection);
          // Append the AI response below the selected text
          editor.replaceSelection(`${selection}\n\n**AI:** ${response}\n`);
        } catch (error) {
          console.error("VibeProxy Error:", error);
          new Notice("Error when contacting VibeProxy. Check the console.");
        }
      },
    });

    // Register the settings tab
    this.addSettingTab(new VibeProxySettingTab(this.app, this));
  }

  async callVibeProxy(prompt: string, maxTokens?: number): Promise<string> {
    const endpoint = `${this.settings.proxyUrl}/chat/completions`;

    const payload: any = {
      model: this.settings.model,
      messages: [{ role: "user", content: prompt }],
    };

    // Add max_tokens if provided (useful for quick connection tests)
    if (maxTokens) {
      payload.max_tokens = maxTokens;
    }

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

  async testConnection(): Promise<void> {
    // Send a tiny request to verify that the server is reachable and processing correctly
    await this.callVibeProxy("test", 5);
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

    new Setting(containerEl)
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

    new Setting(containerEl)
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

    // Test Connection Button Setting
    new Setting(containerEl)
      .setName("Test Connection")
      .setDesc("Send a test request to verify network and model settings.")
      .addButton((button) =>
        button.setButtonText("Test Connection").onClick(async () => {
          button.setButtonText("Testing...");
          button.setDisabled(true);

          try {
            await this.plugin.testConnection();
            new Notice("✅ Success! VibeProxy is reachable.");
          } catch (error) {
            console.error("Test Connection Error:", error);
            new Notice("❌ Connection Error! Check the console for details.");
          } finally {
            // Reset button state regardless of success or failure
            button.setButtonText("Test Connection");
            button.setDisabled(false);
          }
        }),
      );
  }
}
