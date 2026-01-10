/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, INodeExecutionData } from 'n8n-workflow';

/**
 * Simplify the output data
 */
export function simplifyOutput(data: IDataObject): IDataObject {
	return data;
}

/**
 * Convert execution data to return format
 */
export function returnData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({ json: item }));
	}
	return [{ json: data }];
}

/**
 * Get additional fields from node parameters
 */
export function getAdditionalFields(fields: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(fields)) {
		if (value !== undefined && value !== null && value !== '') {
			result[key] = value;
		}
	}

	return result;
}

/**
 * Build address object from parameters
 */
export function buildAddress(addressData: IDataObject): IDataObject {
	const address: IDataObject = {};

	if (addressData.street) address.street = addressData.street;
	if (addressData.street2) address.street_line_2 = addressData.street2;
	if (addressData.street_line_2) address.street_line_2 = addressData.street_line_2;
	if (addressData.city) address.city = addressData.city;
	if (addressData.state) address.state = addressData.state;
	if (addressData.zip) address.zip = addressData.zip;
	if (addressData.country) address.country = addressData.country;

	return address;
}

/**
 * Build line item object
 */
export function buildLineItem(itemData: IDataObject): IDataObject {
	const item: IDataObject = {};

	if (itemData.name) item.name = itemData.name;
	if (itemData.description) item.description = itemData.description;
	if (itemData.quantity !== undefined) item.quantity = itemData.quantity;
	if (itemData.unit_price !== undefined) item.unit_price = itemData.unit_price;
	if (itemData.taxable !== undefined) item.taxable = itemData.taxable;

	return item;
}

/**
 * Validate required ID parameter
 */
export function validateId(id: string | undefined, resourceName: string): string {
	if (!id || id.trim() === '') {
		throw new Error(`${resourceName} ID is required`);
	}
	return id.trim();
}

/**
 * Parse array input (handles both array and comma-separated string)
 */
export function parseArrayInput(input: string | string[] | undefined): string[] {
	if (!input) return [];
	if (Array.isArray(input)) return input;
	return input.split(',').map((item) => item.trim()).filter(Boolean);
}

/**
 * Convert snake_case to camelCase
 */
export function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase to snake_case
 */
export function camelToSnake(str: string): string {
	return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Deep convert object keys from camelCase to snake_case
 */
export function objectToSnakeCase(obj: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = camelToSnake(key);

		if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[snakeKey] = objectToSnakeCase(value as IDataObject);
		} else {
			result[snakeKey] = value;
		}
	}

	return result;
}

/**
 * Format error message
 */
export function formatErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	return 'An unknown error occurred';
}

/**
 * Transform response object keys from snake_case to camelCase
 */
export function transformResponse(obj: IDataObject | IDataObject[]): IDataObject | IDataObject[] {
	if (Array.isArray(obj)) {
		return obj.map((item) => transformResponse(item) as IDataObject);
	}

	const result: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		const camelKey = snakeToCamel(key);

		if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[camelKey] = transformResponse(value as IDataObject);
		} else if (Array.isArray(value)) {
			result[camelKey] = value.map((item) => {
				if (typeof item === 'object' && item !== null) {
					return transformResponse(item as IDataObject);
				}
				return item;
			});
		} else {
			result[camelKey] = value;
		}
	}

	return result;
}

/**
 * Transform request object keys from camelCase to snake_case
 */
export function transformRequest(obj: IDataObject): IDataObject {
	const result: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		const snakeKey = camelToSnake(key);

		if (value && typeof value === 'object' && !Array.isArray(value)) {
			result[snakeKey] = transformRequest(value as IDataObject);
		} else if (Array.isArray(value)) {
			result[snakeKey] = value.map((item) => {
				if (typeof item === 'object' && item !== null) {
					return transformRequest(item as IDataObject);
				}
				return item;
			});
		} else {
			result[snakeKey] = value;
		}
	}

	return result;
}
