/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	validateId,
	buildAddress,
	parseArrayInput,
	snakeToCamel,
	camelToSnake,
	transformResponse,
	transformRequest,
} from '../../nodes/HousecallPro/utils/helpers';

describe('Helpers', () => {
	describe('validateId', () => {
		it('should return trimmed ID for valid input', () => {
			expect(validateId('  abc123  ', 'Customer')).toBe('abc123');
		});

		it('should throw error for empty string', () => {
			expect(() => validateId('', 'Customer')).toThrow('Customer ID is required');
		});

		it('should throw error for whitespace-only string', () => {
			expect(() => validateId('   ', 'Job')).toThrow('Job ID is required');
		});
	});

	describe('buildAddress', () => {
		it('should build complete address object', () => {
			const result = buildAddress({
				street: '123 Main St',
				street2: 'Apt 4',
				city: 'Austin',
				state: 'TX',
				zip: '78701',
				country: 'US',
			});

			expect(result).toEqual({
				street: '123 Main St',
				street_line_2: 'Apt 4',
				city: 'Austin',
				state: 'TX',
				zip: '78701',
				country: 'US',
			});
		});

		it('should only include provided fields', () => {
			const result = buildAddress({
				street: '123 Main St',
				city: 'Austin',
			});

			expect(result).toEqual({
				street: '123 Main St',
				city: 'Austin',
			});
			expect(result).not.toHaveProperty('street_line_2');
		});

		it('should return empty object for no input', () => {
			expect(buildAddress({})).toEqual({});
		});
	});

	describe('parseArrayInput', () => {
		it('should parse comma-separated string', () => {
			expect(parseArrayInput('a, b, c')).toEqual(['a', 'b', 'c']);
		});

		it('should return array as-is', () => {
			expect(parseArrayInput(['x', 'y', 'z'])).toEqual(['x', 'y', 'z']);
		});

		it('should filter empty values', () => {
			expect(parseArrayInput('a, , b, , c')).toEqual(['a', 'b', 'c']);
		});

		it('should handle single value', () => {
			expect(parseArrayInput('single')).toEqual(['single']);
		});

		it('should handle empty string', () => {
			expect(parseArrayInput('')).toEqual([]);
		});
	});

	describe('snakeToCamel', () => {
		it('should convert snake_case to camelCase', () => {
			expect(snakeToCamel('hello_world')).toBe('helloWorld');
		});

		it('should handle multiple underscores', () => {
			expect(snakeToCamel('this_is_a_test')).toBe('thisIsATest');
		});

		it('should handle already camelCase', () => {
			expect(snakeToCamel('alreadyCamel')).toBe('alreadyCamel');
		});

		it('should handle single word', () => {
			expect(snakeToCamel('word')).toBe('word');
		});
	});

	describe('camelToSnake', () => {
		it('should convert camelCase to snake_case', () => {
			expect(camelToSnake('helloWorld')).toBe('hello_world');
		});

		it('should handle multiple capitals', () => {
			expect(camelToSnake('thisIsATest')).toBe('this_is_a_test');
		});

		it('should handle already snake_case', () => {
			expect(camelToSnake('already_snake')).toBe('already_snake');
		});
	});

	describe('transformResponse', () => {
		it('should convert snake_case keys to camelCase', () => {
			const input = {
				first_name: 'John',
				last_name: 'Doe',
				phone_number: '555-1234',
			};

			const result = transformResponse(input);

			expect(result).toEqual({
				firstName: 'John',
				lastName: 'Doe',
				phoneNumber: '555-1234',
			});
		});

		it('should handle nested objects', () => {
			const input = {
				user_name: 'test',
				home_address: {
					street_name: 'Main St',
					zip_code: '12345',
				},
			};

			const result = transformResponse(input);

			expect(result).toEqual({
				userName: 'test',
				homeAddress: {
					streetName: 'Main St',
					zipCode: '12345',
				},
			});
		});

		it('should handle arrays', () => {
			const input = {
				items: [
					{ item_name: 'Item 1' },
					{ item_name: 'Item 2' },
				],
			};

			const result = transformResponse(input);

			expect(result).toEqual({
				items: [
					{ itemName: 'Item 1' },
					{ itemName: 'Item 2' },
				],
			});
		});
	});

	describe('transformRequest', () => {
		it('should convert camelCase keys to snake_case', () => {
			const input = {
				firstName: 'John',
				lastName: 'Doe',
				phoneNumber: '555-1234',
			};

			const result = transformRequest(input);

			expect(result).toEqual({
				first_name: 'John',
				last_name: 'Doe',
				phone_number: '555-1234',
			});
		});
	});
});
