/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	IHookFunctions,
	ILoadOptionsFunctions,
	IWebhookFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	IDataObject,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

import { HOUSECALL_PRO_API_BASE_URL, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../constants/constants';

type HousecallProContext =
	| IExecuteFunctions
	| ILoadOptionsFunctions
	| IHookFunctions
	| IWebhookFunctions;

/**
 * Make an authenticated request to the Housecall Pro API
 */
export async function housecallProApiRequest(
	this: HousecallProContext,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject> {
	const credentials = await this.getCredentials('housecallProApi');

	const options: IRequestOptions = {
		method,
		uri: `${HOUSECALL_PRO_API_BASE_URL}${endpoint}`,
		headers: {
			Authorization: `Token ${credentials.apiKey}`,
			'Content-Type': 'application/json',
			Accept: 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		return await this.helpers.request(options);
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}

/**
 * Make an API request and return all results with automatic pagination
 */
export async function housecallProApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let cursor: string | undefined;

	query['page[size]'] = MAX_PAGE_SIZE;

	do {
		if (cursor) {
			query['page[cursor]'] = cursor;
		}

		const response = await housecallProApiRequest.call(this, method, endpoint, body, query);

		const responseData = response.data ?? response;
		const data = Array.isArray(responseData) ? responseData as IDataObject[] : [responseData as IDataObject];
		returnData.push(...data);

		const meta = response.meta as IDataObject | undefined;
		cursor = meta?.next_cursor as string | undefined;
		const hasMore = meta?.has_more as boolean | undefined;

		if (!hasMore) {
			break;
		}
	} while (cursor);

	return returnData;
}

/**
 * Make a paginated API request
 */
export async function housecallProApiRequestPaginated(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	limit?: number,
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let cursor: string | undefined;

	const pageSize = Math.min(limit || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
	query['page[size]'] = pageSize;

	do {
		if (cursor) {
			query['page[cursor]'] = cursor;
		}

		const response = await housecallProApiRequest.call(this, method, endpoint, body, query);

		const responseData = response.data ?? response;
		const data = Array.isArray(responseData) ? responseData as IDataObject[] : [responseData as IDataObject];
		returnData.push(...data);

		if (limit && returnData.length >= limit) {
			return returnData.slice(0, limit);
		}

		const meta = response.meta as IDataObject | undefined;
		cursor = meta?.next_cursor as string | undefined;
		const hasMore = meta?.has_more as boolean | undefined;

		if (!hasMore) {
			break;
		}
	} while (cursor);

	return returnData;
}

/**
 * Build query parameters for filtering
 */
export function buildFilterQuery(filters: IDataObject): IDataObject {
	const query: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			if (Array.isArray(value)) {
				query[`filter[${key}]`] = value.join(',');
			} else {
				query[`filter[${key}]`] = value;
			}
		}
	}

	return query;
}

/**
 * Clean object by removing undefined/null/empty string values
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};

	for (const [key, value] of Object.entries(obj)) {
		// Keep 0, false, and empty arrays; remove undefined, null, and empty strings
		if (value === undefined || value === null || value === '') {
			continue;
		}

		if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
			const cleanedNested = cleanObject(value as IDataObject);
			if (Object.keys(cleanedNested).length > 0) {
				cleaned[key] = cleanedNested;
			}
		} else {
			cleaned[key] = value;
		}
	}

	return cleaned;
}

/**
 * Parse tags from string or array
 */
export function parseTags(tags: string | string[] | undefined): string[] {
	if (!tags) return [];
	if (Array.isArray(tags)) return tags;
	return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
}

/**
 * Format date to ISO 8601
 */
export function formatDate(date: string | Date | undefined): string | undefined {
	if (!date) return undefined;
	if (date instanceof Date) {
		return date.toISOString();
	}
	return new Date(date).toISOString();
}

/**
 * Parse money amount (ensure decimal string format)
 */
export function parseMoneyAmount(amount: string | number): string {
	if (typeof amount === 'number') {
		return amount.toFixed(2);
	}
	return amount;
}
