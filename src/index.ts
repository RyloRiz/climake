import * as fs from 'fs';
import * as path from 'path';

class Command {
	public arguments: any[] = [];
	public commands: Command[] = [];
	public description: string;
	public name: string;
	public settings: any[] = [];

	constructor(name: string|boolean, description?: string) {
		if (name) {
			this.name = name as string;
		}
		if (description) {
			this.description = description;
		}
	};

	/**
	 * Add an argument/flag/switch to the command
	 * @param name Name of argument
	 * @param short Short name of argument (char flag)
	 * @param description Description of argument
	 * @param aliases Any aliases of the argument (no char flags)
	 * @returns {Command} this
	 */
	argument(name: string, short?: string, description?: string, aliases?: string[]) {
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
	 * @param description Description of subcommand
	 * @returns {Command} subcommand
	 */
	command(name: string, description?: string): Command {
		let subcmd = new Command(name);
		this.commands.push(subcmd);
		return subcmd;
	};

	/**
	 * Add a setting to the current command
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
	private _help: boolean = false;
	private _version: boolean = false;

	constructor() {
		super(false);
	};


	help() {
		this._help = true;
		this.argument('help', 'h', 'Display the help menu');
		return this;
	};

	parse(argv: string[]) {
		argv = argv.slice(2);
		let commands = [], args = {}, flags = [], settings = {};
		let currentArg, isArg = false;
		let onlyCmds = true;
		for (let index = 0; index < argv.length; index++) {
			const arg = argv[index];
			if (arg.startsWith('--')) {
				onlyCmds = false;
				isArg = true;
				currentArg = arg.slice(2);
				args[currentArg] = undefined;
			} else if (arg.startsWith('-')) {
				onlyCmds = false;
				if (isArg) {
					isArg = false;
					currentArg = null;
				}
				flags.push(arg.slice(1));
			} else if (arg.includes('=')) {
				onlyCmds = false;
				if (isArg) {
					isArg = false;
					currentArg = null;
				}
				let split = arg.split('=');
				settings[split[0]] = split[1];
			} else {
				if (isArg) {
					onlyCmds = false;
					isArg = false;
					args[currentArg] = arg;
					currentArg = null;
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
		
		if (getLength(commands) === 0) {
			if (getLength(args) === 1 || getLength(flags) === 1) {
				// if (args['help'] || flags.indexOf('h') > -1) {
					
				// } else if (args['version'] || flags.indexOf('v') > -1) {

				// }
				if (this._help) {
					// Getting exeName
					let exeName;
					let exists = fs.existsSync(path.join(process.cwd(), 'package.json'));
					if (exists) {
						let data = fs.readFileSync(path.join(process.cwd(), 'package.json')).toString();
						data = JSON.parse(data);
						if (data['bin'] && typeof data['bin'] === 'string') {
							exeName = data['bin'];
						} else if (data['bin'] && Object.keys(data['bin'])) {
							exeName = data['bin'][Object.keys(data['bin'])[0]];
						}
					} else {
						exeName = "program"
					}

					// Getting subcommands
					console.log(`Usage:\n $ ${exeName} `);
				}
			}
		}
		console.log(commands);
		console.log(args);
		console.log(flags);
		console.log(settings);
	}

	version(num: string) {
		this._version = true;
		this.argument('version', 'v', 'Display the version number');
		return this;
	}
}

export default CLIMake;