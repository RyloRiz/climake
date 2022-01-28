import CLIMake from '../dist/index.js';
import path from 'path';
import assert from 'assert';

// const pathToFile = path.resolve(import.meta.url.split('').slice(5).join(''), "../../dist/index.js");

describe('CLIMake Testing', () => {
	it('Example Usage', () => {
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