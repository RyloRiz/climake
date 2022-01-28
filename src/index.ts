import * as fs from 'fs';
import * as path from 'path';

/**
 * We are *not* doing 'get help'... - Loki, 2017
 */
let getHelp = (self: Command, exeName: string) => {
	let helpText = `Usage:\n $ `;

	helpText += exeName + ' ';

	// Getting subcommands
	let subcommands: any[] | string = [];

	self.commands.forEach((command) => {
		(subcommands as string[]).push(command.name);
	});

	subcommands = subcommands.length > 0 ? '[' + (subcommands as unknown as string[]).join('|') + ']' : '';

	helpText += subcommands + '\n\n Arguments:\n';

	// Getting arguments
	let bothArgs: string[] = [], longArgs: string[] = [] = [];

	self.arguments.forEach((arg) => {
		let desc = arg.description ? `\t\t${arg.description}` : '';
		if (arg.name && arg.short && arg.name !== '' && arg.short !== '') {
			bothArgs.push(`   --${arg.name}, -${arg.short}${desc}`);
		} else if (arg.name && arg.name !== '') {
			longArgs.push(`   --${arg.name}${desc}`);
		}
	});

	[bothArgs, longArgs].forEach((tbl) => {
		tbl.forEach((arg) => {
			helpText += arg + '\n';
		});
	});

	// Printing the help menu
	return helpText;
};

let output = (input: any, log: boolean = true) => {
	if (log) {
		console.log(input);
	} else {
		return input;
	}
};

class Command {
	public arguments: any[] = [];
	public commands: Command[] = [];
	public description: string;
	public execute: Function;
	public name: string;
	public settings: any[] = [];

	constructor(name: string | boolean, description?: string) {
		if (name) {
			this.name = name as string;
		}
		if (description) {
			this.description = description;
		}
	};

	/**
	 * Add an argument/flag/switch to the command (--arg OR -a)
	 * @param name Name of argument
	 * @param short Short name of argument (char flag)
	 * @param description Description of argument
	 * @returns {Command} this
	 */
	argument(name: string, short?: string, description?: string/*, aliases?: string[]*/) {
		this.arguments.push({
			// aliases: aliases,
			description: description,
			name: name,
			short: short
		});
		return this;
	};

	/**
	 * Add a subcommand to the current command
	 * @param name Name of subcommand
	 * @param onExecute Function to call when the command is executed
	 * @param description Description of subcommand
	 * @returns {Command} subcommand
	 */
	command(name: string, description: string, onExecute: Function): Command {
		let subcmd = new Command(name);
		subcmd.description = description;
		subcmd.execute = onExecute || new Function();
		this.commands.push(subcmd);
		return subcmd;
	};

	/**
	 * Add a setting to the current command (--name=value)
	 * @param name Name of setting
	 * @param description Description of setting
	 * @returns {Command} this
	 */
	setting(name: string, description?: string) {
		this.settings.push(
			{
				description: description,
				name: name
			}
		);
		return this;
	};
}

class CLIMake extends Command {
	private _help: number = 0;
	private _version: any = false;

	constructor() {
		super(false);
	};

	handle(fn: Function): Command {
		this.execute = fn;
		return this;
	}

	help(extraCommands: boolean = false): Command {
		this._help = extraCommands ? 2 : 1;
		this.argument('help', 'h', 'Display the help menu');
		return this;
	};

	parse(argv: string[], log: boolean = true) {
		argv = argv.slice(2);
		let commands = [], args = {}, flags = [], settings = {};
		let currentArg, isArg = false;
		let onlyCmds = true;
		for (let index = 0; index < argv.length; index++) {
			const arg = argv[index];
			if (arg.startsWith('--') && !arg.includes('=')) {
				onlyCmds = false;
				isArg = true;
				currentArg = arg.slice(2);
				args[currentArg] = true;
			} else if (arg.startsWith('-') && !arg.includes('=')) {
				onlyCmds = false;
				if (isArg) {
					isArg = false;
					currentArg = true;
				}
				flags.push(arg.slice(1));
			} else if (arg.includes('=')) {
				onlyCmds = false;
				if (isArg) {
					isArg = false;
					currentArg = true;
				}
				let split = arg.split('=');
				settings[split[0]] = split[1];
			} else {
				if (isArg) {
					onlyCmds = false;
					isArg = false;
					args[currentArg] = arg;
					currentArg = true;
				} else if (onlyCmds) {
					commands.push(arg);
				}
			}
		}

		let getLength = (item) => item.length ? item.length : Object.keys(item).length;
		let program = {
			command: {
				full: commands,
				last: commands[commands.length - 1]
			},
			args: args,
			flags: flags,
			settings: settings
		};

		// console.log(commands);
		// console.log(args);
		// console.log(flags);
		// console.log(settings);
		// console.log('\n');

		if (getLength(commands) === 0) {
			// Default handler for ROOT COMMAND
			let opts = {}

			program.flags.forEach((flag) => {
				if (this.arguments.find(arg => arg.short === flag)) {
					let obj = this.arguments.find(arg => arg.short === flag);
					opts[obj.name] = true;
				}
			})

			for (const [k, v] of Object.entries(program.args)) {
				opts[k] = v;
			}

			for (const [k, v] of Object.entries(program.settings)) {
				opts[k] = v;
			}

			if (this._help > 0 && opts['help']) {
				// Getting exeName
				let exeName = 'program';
				let exists = fs.existsSync(path.join(process.cwd(), 'package.json'));
				if (exists) {
					let data = fs.readFileSync(path.join(process.cwd(), 'package.json')).toString();
					data = JSON.parse(data);
					if (data['bin'] && typeof data['bin'] === 'string') {
						exeName = data['bin'];
					} else if (data['bin'] && Object.keys(data['bin'])) {
						exeName = data['bin'][Object.keys(data['bin'])[0]];
					} else if (data['name']) {
						exeName = data['name'];
					}
				}

				// Let's do 'get help'
				let help = getHelp(this, exeName);

				// Printing the help menu
				return output(help, log);
			} else if (this._version && opts['version']) {
				return output('v' + this._version, log)
			} else {
				if (this.execute) {
					this.execute(opts);
				} else {
					if (opts['help']) {
						return output(`You must call 'CLIMake.help(advanced: boolean)' to use 'help'!`);
					} else if (opts['version']) {
						return output(`You must call 'CLIMake.version(v: string)' to use 'version'!`);
					} else {
						return output(`You must call 'CLIMake.handle(fn: Function)' before usage!`);
					}
				}
			}
		} else {
			// Handler for SUBCOMMANDS
			let opts = {};
			let subcmd: Command = this;

			if (this._help === 2 && program.command.full[program.command.full.length - 2] === 'help') {
				let obj = this.commands.find(c => c.name === program.command.full[program.command.full.length - 1]);
				if (obj) {
					let desc = obj.description || '';

					// Getting exeName
					let exeName = 'program';
					let exists = fs.existsSync(path.join(process.cwd(), 'package.json'));
					if (exists) {
						let data = fs.readFileSync(path.join(process.cwd(), 'package.json')).toString();
						data = JSON.parse(data);
						if (data['bin'] && typeof data['bin'] === 'string') {
							exeName = data['bin'];
						} else if (data['bin'] && Object.keys(data['bin'])) {
							exeName = data['bin'][Object.keys(data['bin'])[0]];
						} else if (data['name']) {
							exeName = data['name'];
						}
					}

					exeName += ' ' + program.command.last + '\t\t' + desc;

					// Let's do 'get help'
					let help = getHelp(obj, exeName);

					// Printing the help menu
					return output(help, log);
				}
			} else {
				for (let index = 0; index < program.command.full.length; index++) {
					const cmd: string = program.command.full[index];
					if (subcmd.commands.find(c => c.name === cmd)) {
						subcmd = subcmd.commands.find(c => c.name === cmd);
					}
				}
			}

			program.flags.forEach((flag) => {
				if (subcmd.arguments.find(arg => arg.short === flag)) {
					let obj = subcmd.arguments.find(arg => arg.short === flag);
					opts[obj.name] = undefined;
				}
			})

			for (const [k, v] of Object.entries(program.args)) {
				opts[k] = v;
			}

			for (const [k, v] of Object.entries(program.settings)) {
				opts[k] = v;
			}

			if (subcmd.execute) {
				subcmd.execute(opts);
			} else {
				output(`'${program.command.last}' is not a command!`, log);
			}
		}
	}

	version(num: string) {
		this._version = num;
		this.argument('version', 'v', 'Display the version number');
		return this;
	}
}

export default CLIMake;