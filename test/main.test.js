import CLIMake from '../dist/index.js';
import path from 'path';

const pathToFile = path.resolve(import.meta.url.split('').slice(5).join(''), "../../dist/index.js");

describe('CLIMake Testing', () => {
	describe('Switches', () => {
		it('Arguments', () => {
			const cli = new CLIMake();

			cli.argument('force', 'f');

			let args = cli.parse(process.argv);
			if (args.force) {
				return true;
			} else {
				return false;
			}
		});
		

	});
});