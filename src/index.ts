class Command {
	public arguments: any[] = [];
	public commands: Command[] = [];
	public name: string;
	public settings: string[] = [];

	constructor(name: string|boolean) {
		if (name) {
			this.name = name as string;
		}
	};

	get onExecute() {
		return this.onExecute;
	}

	set onExecute(f: Function) {
		this.onExecute = f;
	}

	argument(name: string, short: string, ...aliases: string[]) {
		this.arguments.push({
			aliases: aliases,
			name: name,
			short: short
		});
	};

	command(name: string, onExecute: Function) {
		let subcmd = new Command(name);
		subcmd.onExecute = onExecute;
		this.commands.push(subcmd);
		return subcmd;
	};

	setting(name: string) {
		this.settings.push(name);
	};
}

class CLIMake extends Command {
	constructor() {
		super(false);
	};

	help(...aliases: string[]) {
		this.argument('help', 'h', ...aliases);
	};

	parse(argv: string[]) {
		argv = argv.slice(2);

	}
}

export default CLIMake;