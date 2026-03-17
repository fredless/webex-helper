import { Editor, Plugin, PluginSettingTab, Setting, App } from "obsidian";
import { UriHandlerRegistry, WebexUriHandler } from "./uri-handlers";

interface WebexHelperSettings {
	labels: Record<string, string>;
}

const DEFAULT_SETTINGS: WebexHelperSettings = {
	labels: {
		"Webex message": "Webex message",
		"Webex space": "Webex space",
	},
};

export default class WebexHelperPlugin extends Plugin {
	settings: WebexHelperSettings = DEFAULT_SETTINGS;
	registry = new UriHandlerRegistry();

	async onload() {
		await this.loadSettings();

		this.registry.register(new WebexUriHandler());

		// Convert on paste
		this.registerEvent(
			this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor) => {
				const text = evt.clipboardData?.getData("text/plain");
				if (!text) return;

				const converted = this.registry.convert(text, this.settings.labels);
				if (converted !== text) {
					evt.preventDefault();
					editor.replaceSelection(converted);
				}
			})
		);

		// Command to convert URIs in current selection or full document
		this.addCommand({
			id: "convert-uris",
			name: "Convert URIs to markdown links",
			editorCallback: (editor: Editor) => {
				const selection = editor.getSelection();
				if (selection) {
					editor.replaceSelection(
						this.registry.convert(selection, this.settings.labels)
					);
				} else {
					const full = editor.getValue();
					const converted = this.registry.convert(full, this.settings.labels);
					if (converted !== full) {
						editor.setValue(converted);
					}
				}
			},
		});

		this.addSettingTab(new WebexHelperSettingTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class WebexHelperSettingTab extends PluginSettingTab {
	plugin: WebexHelperPlugin;

	constructor(app: App, plugin: WebexHelperPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		new Setting(containerEl)
			.setName("Webex message link text")
			.setDesc("Label used when a URI links to a specific message")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.labels["Webex message"] ?? "Webex message")
					.onChange(async (value) => {
						this.plugin.settings.labels["Webex message"] = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Webex space link text")
			.setDesc("Label used when a URI links to a space")
			.addText((text) =>
				text
					.setValue(this.plugin.settings.labels["Webex space"] ?? "Webex space")
					.onChange(async (value) => {
						this.plugin.settings.labels["Webex space"] = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
