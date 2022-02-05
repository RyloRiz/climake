import CLIMake from '../dist/index.js';
import path from 'path';
import assert from 'assert';

// const pathToFile = path.resolve(import.meta.url.split('').slice(5).join(''), "../../dist/index.js");

describe('CLIMake Testing', () => {
	describe('1.0.0', () => {
		it('One', () => {
			let cli = new CLIMake()

			cli.handle((opts) => {
				if (opts.force) {
					console.log("Forced execution of command!");
				}
			});

			cli.argument('force', 'f', 'Force execution of command')

			let subcmd = cli.command('init', 'Initialize a blank climake', (opts) => {
				if (opts.force) {
					console.log("Forced execution of init!");
				} else {
					console.log("Executing init!");
				}
			});

			subcmd.argument('force', 'f', 'Force execution of init')

			cli.help(true);
			cli.version('1.0.0');

			cli.parse('node index.js help init'.split(' '), false);
		});
	});

	describe('1.1.0', () => {
		it('One', () => {
			let cli = new CLIMake();

			cli.command('print', 'Print stuff', (opts) => {
				if (opts.data) {
					console.log(opts.data);
				}
			})

			cli.help(true);

			cli.parse('node index.js help print'.split(' '), false);
		});

		it('Two', () => {
			let cli = new CLIMake();

			cli.help();

			cli.parse('node index.js help print'.split(' '), false);
		});

		it('Three', () => {
			let cli = new CLIMake();

			cli.parse('node index.js -h'.split(' '), false);
			cli.parse('node index.js help print'.split(' '), false);
		});
	});

	describe('1.2.0', () => {
		it('One', () => {
			let cli = new CLIMake();

			cli.handle((opts) => {
				console.log(opts._[0]);
			});

			cli.parse('node index.js ./dist/index.js'.split(' '), false);
		});
	});

	describe('1.2.3', () => {
		it('One', () => {
			let cli = new CLIMake();

			let subcmd = cli.command('print', 'Desc', (opts) => {
				if (opts['force']) {
					console.log("Forced" + opts._[0]);
				} else {
					console.log(opts._[0]);
				}
			});

			subcmd.argument('force', 'f', 'Force the thingy idk')

			cli.parse('node index.js print ./dist/index.js -f'.split(' '), false);
		});
	});

	describe('1.3.0', () => {
		it('One', () => {
			let cli = new CLIMake('testCLI');

			cli.help(true);

			let subcmd = cli.command('thing', 'Some description', (opts) => { });
			let subsubcmd = subcmd.command('second', 'This is some description', (opts) => { });

			cli.parse('node index.js thing second next --help'.split(' '), true);
		});
	});
});