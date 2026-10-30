import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

import { createNodeResolver } from 'eslint-plugin-import-x'

import { ruleTester } from '../rule-tester.js'

import { noCycleRule } from './no-cycle.js'

// The rule reads imported modules from disk, so the cycles have to exist there.
// Real path: the resolver returns one, and macOS's tmp dir is a symlink.
const dir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'no-cycle-')))
const FILES = {
	'list.js': "import { format } from './format.js'\nexport const LIMIT = 20",
	'format.js': "import { LIMIT } from './list.js'\nexport const format = LIMIT",
	'a.js': "import { b } from './b.js'\nexport const a = b",
	'b.js': "import { c } from './c.js'\nexport const b = c",
	'c.js': "import { a } from './a.js'\nexport const c = a",
	'types.js': "import type { LIMIT } from './list.js'\nexport const t = 1",
	'leaf.js': 'export const leaf = 1',
	'uses-leaf.js': "import { leaf } from './leaf.js'\nexport const x = leaf",
}

for (const [name, code] of Object.entries(FILES)) {
	fs.writeFileSync(path.join(dir, name), code)
}

const settings = {
	'import-x/extensions': ['.js'],
	'import-x/resolver-next': [createNodeResolver()],
}

function fixture(name, rest = {}) {
	return {
		code: FILES[name],
		filename: path.join(dir, name),
		settings,
		...rest,
	}
}

const WHY =
	"In a cycle one module runs before the other finishes initializing, which shows up as `Cannot access 'X' before initialization` or a silent `undefined` depending on load order."

ruleTester.run('no-cycle', noCycleRule, {
	valid: [
		fixture('uses-leaf.js'),
		// Type-only imports are erased, so they can't form a runtime cycle
		fixture('types.js'),
		// Upstream's options still apply: the a → b → c → a cycle is deeper than 1
		fixture('a.js', { options: [{ maxDepth: 1 }] }),
	],
	invalid: [
		fixture('list.js', {
			errors: [
				{
					message: `\`./format.js\` imports this file back, so the two form a cycle. ${WHY} Move what both need into a third module they can both import (a \`utils/\`, \`types/\` or \`lib/\` file), make the import type-only if only types cross, or merge the two files if they are one concern.`,
				},
			],
		}),
		fixture('a.js', {
			errors: [
				{
					message: `\`./b.js\` leads back to this file through \`./c.js\`, so these modules form a cycle. ${WHY} Find the import in that chain that points the wrong way, from lower-level code (utils, lib, types) up to code that uses it, and move what it needs into a module neither side imports. Make it type-only if only types cross.`,
				},
			],
		}),
	],
})
