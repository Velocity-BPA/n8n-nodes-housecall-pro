/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	cleanObject,
	formatDate,
	parseMoneyAmount,
	parseTags,
} from '../../nodes/HousecallPro/transport';

describe('Transport Utilities', () => {
	describe('cleanObject', () => {
		it('should remove undefined values', () => {
			const input = {
				a: 'value',
				b: undefined,
				c: 'another',
			};

			expect(cleanObject(input)).toEqual({
				a: 'value',
				c: 'another',
			});
		});

		it('should remove null values', () => {
			const input = {
				a: 'value',
				b: null,
				c: 'another',
			};

			expect(cleanObject(input)).toEqual({
				a: 'value',
				c: 'another',
			});
		});

		it('should remove empty string values', () => {
			const input = {
				a: 'value',
				b: '',
				c: 'another',
			};

			expect(cleanObject(input)).toEqual({
				a: 'value',
				c: 'another',
			});
		});

		it('should keep zero and false values', () => {
			const input = {
				a: 0,
				b: false,
				c: 'value',
			};

			expect(cleanObject(input)).toEqual({
				a: 0,
				b: false,
				c: 'value',
			});
		});

		it('should keep empty arrays', () => {
			const input = {
				a: [],
				b: 'value',
			};

			expect(cleanObject(input)).toEqual({
				a: [],
				b: 'value',
			});
		});
	});

	describe('formatDate', () => {
		it('should format Date object to ISO string', () => {
			const date = new Date('2024-01-15T10:30:00.000Z');
			expect(formatDate(date)).toBe('2024-01-15T10:30:00.000Z');
		});

		it('should pass through ISO string unchanged', () => {
			const isoString = '2024-01-15T10:30:00.000Z';
			expect(formatDate(isoString)).toBe(isoString);
		});

		it('should handle date string and convert to ISO', () => {
			const dateString = '2024-01-15';
			const result = formatDate(dateString);
			expect(result).toContain('2024-01-15');
		});
	});

	describe('parseMoneyAmount', () => {
		it('should convert number to string with 2 decimal places', () => {
			expect(parseMoneyAmount(99.99)).toBe('99.99');
		});

		it('should handle whole numbers', () => {
			expect(parseMoneyAmount(100)).toBe('100.00');
		});

		it('should handle zero', () => {
			expect(parseMoneyAmount(0)).toBe('0.00');
		});

		it('should handle negative numbers', () => {
			expect(parseMoneyAmount(-50.5)).toBe('-50.50');
		});

		it('should round to 2 decimal places', () => {
			expect(parseMoneyAmount(99.999)).toBe('100.00');
			expect(parseMoneyAmount(99.994)).toBe('99.99');
		});

		it('should pass through string unchanged', () => {
			expect(parseMoneyAmount('150.00')).toBe('150.00');
		});
	});

	describe('parseTags', () => {
		it('should parse comma-separated string', () => {
			expect(parseTags('tag1, tag2, tag3')).toEqual(['tag1', 'tag2', 'tag3']);
		});

		it('should return array as-is', () => {
			expect(parseTags(['tag1', 'tag2'])).toEqual(['tag1', 'tag2']);
		});

		it('should trim whitespace', () => {
			expect(parseTags('  tag1  ,  tag2  ')).toEqual(['tag1', 'tag2']);
		});

		it('should filter empty tags', () => {
			expect(parseTags('tag1, , tag2, , tag3')).toEqual(['tag1', 'tag2', 'tag3']);
		});

		it('should handle empty string', () => {
			expect(parseTags('')).toEqual([]);
		});

		it('should handle undefined', () => {
			expect(parseTags(undefined)).toEqual([]);
		});
	});
});
