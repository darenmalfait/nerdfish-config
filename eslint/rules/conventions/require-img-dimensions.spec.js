import { ruleTester } from '../rule-tester.js'

import { requireImgDimensionsRule } from './require-img-dimensions.js'

ruleTester.run('require-img-dimensions', requireImgDimensionsRule, {
	valid: [
		'<img src="/a.png" alt="" width={24} height={24} />',
		'<img {...props} />',
		'<Image src="/a.png" fill />',
	],
	invalid: [
		{
			code: '<img src="/a.png" alt="" />',
			errors: [{ messageId: 'requireDimensions' }],
		},
		{
			code: '<img src="/a.png" alt="" width={24} />',
			errors: [{ messageId: 'requireDimensions' }],
		},
	],
})
