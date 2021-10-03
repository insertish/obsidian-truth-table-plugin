import { App, ButtonComponent, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TextComponent } from 'obsidian';
import { Grammars } from 'ebnf';

interface TruthTablePluginSettings {
	fill: 'TF' | '10' | 'YN' | 'custom';
	custom: string;
	chars: string;
	index: 'disabled' | 'index' | 'interpretation';
}

const DEFAULT_SETTINGS: TruthTablePluginSettings = {
	fill: 'TF',
	custom: '',
	chars: 'pqrstuvwxyzabcdefghijklmno',
	index: 'disabled',
}

const GRAMMAR = `
	Formula ::= Operation

	Term ::= Operation | Group | Variable
	Operand ::= Variable | Group

	Group ::= "(" Term ")"
	Symbol ::= "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
	Variable ::= Symbol

	Operation ::= OneOp | TwoOp
	OneOp ::= EscapedString WHITESPACE? Operand
	TwoOp ::= Operand WHITESPACE? EscapedString WHITESPACE? Operand

	String ::= Symbol String | Symbol
	EscapedString ::= BACKSLASH String

	BACKSLASH ::= #x5C
	WHITESPACEOP ::= (#x20 | #x9 | #xD | #xA)+
	WHITESPACE ::= WHITESPACEOP WHITESPACE | WHITESPACEOP
`;

const parser = new Grammars.W3C.Parser(GRAMMAR);

export default class TruthTablePlugin extends Plugin {
	settings: TruthTablePluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'create-table',
			name: 'Create Table',
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new CreateModal(this.app, this).open();
					}

					return true;
				}

				return false;
			}
		});

		this.addCommand({
			id: 'create-table-formula',
			name: 'Create Table From Formula',
			checkCallback: (checking: boolean) => {
				let leaf = this.app.workspace.activeLeaf;
				if (leaf) {
					if (!checking) {
						new CreateFromFormulaModal(this.app, this).open();
					}

					return true;
				}

				return false;
			}
		});

		this.addSettingTab(new TruthTableSettingsTab(this.app, this));
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	generateTableFromChars(chars: string[], columns?: string[]): [ string, string, string[] ] {
		const [T, F] = this.settings.fill === 'custom' ? this.settings.custom : this.settings.fill;

		let header = `|${chars.map(char => `$${char}$`).join('|')}|`;
		let divider = `|${chars.map(() => `:-:`).join('|')}|`;
		let content = new Array(2 ** chars.length)
			.fill(0)
			.map((_, y) =>
				`|${
					new Array(chars.length)
						.fill(0)
						.map((_, x) =>
							Math.floor(y / (2 ** (chars.length - x - 1))) % 2
								? ` ${T} ` : ` ${F} `
						)
						.join('|')
				}|`
			);

		if (this.settings.index !== 'disabled') {
			header = '|*' + (this.settings.index) + '*' + header;
			divider = '|:-:' + divider;
			content = content.map((v, i) => `|$${ this.settings.index === 'interpretation' ? `v_{${i}}` : i }$${v}`);
		}

		if (columns && columns.length > 0) {
			header += columns.map(v => '$' + v + '$|').join('');
			divider += columns.map(() => ':-:|').join('');
			content = content.map(line => line + columns.map(() => '   |').join(''));
		}

		return [ header, divider, content ];
	}

	insertTable(chars: string[], columns?: string[]) {
		const currentView = this.app.workspace.activeLeaf.view as MarkdownView;
        const editor = currentView.editor;

		let [ header, divider, content ] = this.generateTableFromChars(chars, columns);
		editor.replaceSelection(
			[header, divider, ...content]
				.join('\n')
		);
	}
}

class ColumnView {
	v: string[] = [];
	el: HTMLDivElement;
	cb: (v: string[]) => void;

	constructor(parent: HTMLElement) {
		this.el = parent.createDiv();
		this.el.style.padding = '6px';
		this.el.style.marginBottom = '16px';
	}

	onChange(cb: (v: string[]) => void): this {
		this.cb = cb;
		return this;
	}

	render(): this {
		this.el.empty();

		for (let i=0;i<this.v.length;i++) {
			const entry = this.el.createDiv();
			entry.style.margin = '4px 0';
			entry.style.display = 'flex';
			entry.style.gap = '4px';

			const input = new TextComponent(entry)
				.setPlaceholder(`Enter value for column ${i}`)
				.setValue(this.v[i])
				.onChange(v => {
					this.v[i] = v;
					this.cb(this.v);
				})
				.inputEl;
			
			input.style.width = '100%';
			input.style.flexGrow = '1';
			input.focus();

			new ButtonComponent(entry)
				.setButtonText('Remove')
				.onClick(() => {
					this.v.splice(i, 1);
					this.cb(this.v);
					this.render();
				})
		}

		new ButtonComponent(this.el)
			.setButtonText('Add Column')
			.onClick(() => {
				this.v.push('');
				this.cb(this.v);
				this.render();
			})

		return this;
	}
}

class CreateModal extends Modal {
	plugin: TruthTablePlugin;
	value: string = '';
	columns: string[] = [];

	constructor(app: App, plugin: TruthTablePlugin) {
		super(app);
		this.plugin = plugin;
		this.submit = this.submit.bind(this);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.style.maxWidth = '480px';

		const currentView = this.app.workspace.activeLeaf.view;
		if (!(currentView instanceof MarkdownView)) {
			new Notice('Must be a Markdown view.');
			return this.close();
		}

		const input = new TextComponent(contentEl)
			.setPlaceholder("Enter number of variables or list of variables")
			.setValue(this.value)
			.onChange(v => this.value = v)
			.inputEl;

		input.onkeydown = e => { e.key === 'Enter' && this.submit() };
		input.style.width = '100%';
		input.focus();

		contentEl.createEl('p', {text: 'Optionally provide columns:'});
		new ColumnView(contentEl)
			.onChange(v => this.columns = v)
			.render();

		new ButtonComponent(contentEl)
			.setButtonText('Create')
			.onClick(this.submit);
	}

	generate(chars: string[]) {
		this.plugin.insertTable(chars, this.columns);
	}

	submit() {
		const count = parseInt(this.value);
		if (isNaN(count)) {
			this.generate(this.value.split(''));
		} else {
			this.generate(
				new Array(count)
					.fill(0)
					.map((_, i) => this.plugin.settings.chars[i])
			);
		}

		this.close();
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

function formulaToColumns(input: string): [ string[], string[] ] {
	const output = parser.getAST(input);
	if (output === null) throw "Could not parse string.";

	const fields: string[] = [],
		  symbols: Set<string> = new Set();

	function recurse(p: any) {
		if (p === null) return;
		if (p.type === 'Operation') {
			fields.push(p.text);
		} else if (p.type === 'Variable') {
			symbols.add(p.text);
		}

		for (const child of p.children) {
			recurse(child);
		}
	}

	recurse(output);
	return [
		fields.reverse(),
		[...symbols.values()]
	];
}

class CreateFromFormulaModal extends Modal {
	plugin: TruthTablePlugin;
	value: string = '';
	preview: HTMLDivElement;

	constructor(app: App, plugin: TruthTablePlugin) {
		super(app);
		this.plugin = plugin;
		this.submit = this.submit.bind(this);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.style.maxWidth = '480px';

		const currentView = this.app.workspace.activeLeaf.view;
		if (!(currentView instanceof MarkdownView)) {
			new Notice('Must be a Markdown view.');
			return this.close();
		}

		const input = new TextComponent(contentEl)
			.setPlaceholder("Enter formula")
			.setValue(this.value)
			.onChange(v => {
				this.value = v;
				this.render();
			})
			.inputEl;

		input.onkeydown = e => { e.key === 'Enter' && this.submit() };
		input.style.width = '100%';
		input.focus();

		this.preview = contentEl.createDiv();

		new ButtonComponent(contentEl)
			.setButtonText('Create')
			.onClick(this.submit);
	}

	submit() {
		const [fields, symbols] = formulaToColumns(this.value);
		this.plugin.insertTable(symbols, fields);
		this.close();
	}

	render() {
		this.preview.empty();
		this.preview.style.color = '';

		try {
			let [ fields, symbols ] = formulaToColumns(this.value);
			
			this.preview.createEl('h3').setText(`Symbols: ${symbols.join(', ')}`);
			this.preview.createEl('h3').setText('Columns');

			const list = this.preview.createEl('ul');
			for (const field of fields) {
				list.createEl('li').setText(field);
			}
		} catch (err) {
			this.preview.setText(err);
			this.preview.style.color = 'red';
		}
	}

	onClose() {
		let {contentEl} = this;
		contentEl.empty();
	}
}

class TruthTableSettingsTab extends PluginSettingTab {
	plugin: TruthTablePlugin;

	constructor(app: App, plugin: TruthTablePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		let {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', {text: 'Truth Table Plugin'});

		new Setting(containerEl)
			.setName('Fill Value')
			.setDesc('What symbol should the plugin fill?')
			.addDropdown(dropdown =>
				dropdown
					.addOption('TF', 'True / False')
					.addOption('10', '1 / 0')
					.addOption('YN', 'Yes / No')
					.addOption('custom', 'Custom')
					.setValue(this.plugin.settings.fill)
					.onChange(async (value) => {
						this.plugin.settings.fill = value as any;
						await this.plugin.saveSettings();
					})
			)

		new Setting(containerEl)
			.setName('Custom Fill Value')
			.setDesc('Use any custom two characters for the true / false values.')
			.addText(text => text
				.setPlaceholder('Enter two characters')
				.setValue(this.plugin.settings.custom)
				.onChange(async (value) => {
					this.plugin.settings.custom = value;
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Character List')
			.setDesc('Adjust default alphabet for number input.')
			.addText(text => text
				.setPlaceholder('Enter at least 1 character')
				.setValue(this.plugin.settings.chars)
				.onChange(async (value) => {
					this.plugin.settings.chars = value || 'pqrstuvwxyzabcdefghijklmno';
					await this.plugin.saveSettings();
				})
			);

		new Setting(containerEl)
			.setName('Index Column')
			.setDesc('Include an index column at the start of the table.')
			.addDropdown(dropdown =>
				dropdown
					.addOption('disabled', 'Disabled')
					.addOption('index', 'Index')
					.addOption('interpretation', 'Interpretation')
					.setValue(this.plugin.settings.index)
					.onChange(async (value) => {
						this.plugin.settings.index = value as any;
						await this.plugin.saveSettings();
					})
			);

		let source = containerEl.createEl('a');
		source.setText('Source Code');
		source.href = 'https://github.com/insertish/obsidian-truth-table-plugin';
		source.style.marginTop = '52px';
		source.style.textAlign = 'center';
		source.style.display = 'block';
		source.style.color = 'inherit';

		let anchor = containerEl.createEl('a');
		anchor.target = '_blank';
		anchor.href = 'https://insrt.uk/donate';

		let img = anchor.createEl('img');
		img.src = 'https://cdn.ko-fi.com/cdn/kofi3.png?v=2';
		img.style.marginTop = '12px';
		img.style.height = '32px';
	}
}
