/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	housecallProApiRequest,
	housecallProApiRequestAllItems,
	housecallProApiRequestPaginated,
	cleanObject,
	parseMoneyAmount,
} from '../../transport';
import { validateId } from '../../utils/helpers';

export const priceBookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['priceBook'],
			},
		},
		options: [
			{
				name: 'Create Item',
				value: 'createItem',
				description: 'Add a new price book item',
				action: 'Create a price book item',
			},
			{
				name: 'Delete Item',
				value: 'deleteItem',
				description: 'Remove a price book item',
				action: 'Delete a price book item',
			},
			{
				name: 'Get Categories',
				value: 'getCategories',
				description: 'List all price book categories',
				action: 'Get price book categories',
			},
			{
				name: 'Get Item',
				value: 'getItem',
				description: 'Get a price book item by ID',
				action: 'Get a price book item',
			},
			{
				name: 'Get Items',
				value: 'getItems',
				description: 'List all price book items',
				action: 'Get price book items',
			},
			{
				name: 'Update Item',
				value: 'updateItem',
				description: 'Update a price book item',
				action: 'Update a price book item',
			},
		],
		default: 'getItems',
	},
];

export const priceBookFields: INodeProperties[] = [
	// ----------------------------------
	//         priceBook: getItems
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['getItems'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['getItems'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['getItems'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Category ID',
				name: 'category_id',
				type: 'string',
				default: '',
				description: 'Filter by category ID',
			},
			{
				displayName: 'Search',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Search by item name or SKU',
			},
			{
				displayName: 'Taxable',
				name: 'taxable',
				type: 'boolean',
				default: true,
				description: 'Whether to filter for taxable items only',
			},
		],
	},

	// ----------------------------------
	//         priceBook: getItem
	// ----------------------------------
	{
		displayName: 'Item ID',
		name: 'itemId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['getItem', 'updateItem', 'deleteItem'],
			},
		},
		default: '',
		description: 'The ID of the price book item',
	},

	// ----------------------------------
	//         priceBook: createItem
	// ----------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['createItem'],
			},
		},
		default: '',
		description: 'Item name',
	},
	{
		displayName: 'Unit Price',
		name: 'unitPrice',
		type: 'number',
		typeOptions: {
			numberPrecision: 2,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['createItem'],
			},
		},
		default: 0,
		description: 'Price per unit',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['createItem'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Category ID',
				name: 'category_id',
				type: 'string',
				default: '',
				description: 'Category ID for the item',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Item description',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Stock Keeping Unit code',
			},
			{
				displayName: 'Taxable',
				name: 'taxable',
				type: 'boolean',
				default: true,
				description: 'Whether the item is taxable',
			},
			{
				displayName: 'Unit Cost',
				name: 'unit_cost',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Cost per unit',
			},
		],
	},

	// ----------------------------------
	//         priceBook: updateItem
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['updateItem'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Category ID',
				name: 'category_id',
				type: 'string',
				default: '',
				description: 'Category ID for the item',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Item description',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Item name',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Stock Keeping Unit code',
			},
			{
				displayName: 'Taxable',
				name: 'taxable',
				type: 'boolean',
				default: true,
				description: 'Whether the item is taxable',
			},
			{
				displayName: 'Unit Cost',
				name: 'unit_cost',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Cost per unit',
			},
			{
				displayName: 'Unit Price',
				name: 'unit_price',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Price per unit',
			},
		],
	},

	// ----------------------------------
	//         priceBook: getCategories
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['getCategories'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['priceBook'],
				operation: ['getCategories'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
];

export async function executePriceBookOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'getItems': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;
			const query: IDataObject = {};

			if (filters.category_id) query['filter[category_id]'] = filters.category_id;
			if (filters.q) query['filter[q]'] = filters.q;
			if (filters.taxable !== undefined) query['filter[taxable]'] = filters.taxable;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/price_book/items',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/price_book/items',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'getItem': {
			const itemId = validateId(this.getNodeParameter('itemId', i) as string, 'Item');
			const response = await housecallProApiRequest.call(this, 'GET', `/price_book/items/${itemId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'createItem': {
			const name = this.getNodeParameter('name', i) as string;
			const unitPrice = this.getNodeParameter('unitPrice', i) as number;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				name,
				unit_price: parseMoneyAmount(unitPrice),
			};

			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.sku) body.sku = additionalFields.sku;
			if (additionalFields.category_id) body.category_id = additionalFields.category_id;
			if (additionalFields.taxable !== undefined) body.taxable = additionalFields.taxable;
			if (additionalFields.unit_cost !== undefined) {
				body.unit_cost = parseMoneyAmount(additionalFields.unit_cost as number);
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/price_book/items',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'updateItem': {
			const itemId = validateId(this.getNodeParameter('itemId', i) as string, 'Item');
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.name) body.name = updateFields.name;
			if (updateFields.description) body.description = updateFields.description;
			if (updateFields.sku) body.sku = updateFields.sku;
			if (updateFields.category_id) body.category_id = updateFields.category_id;
			if (updateFields.taxable !== undefined) body.taxable = updateFields.taxable;
			if (updateFields.unit_price !== undefined) {
				body.unit_price = parseMoneyAmount(updateFields.unit_price as number);
			}
			if (updateFields.unit_cost !== undefined) {
				body.unit_cost = parseMoneyAmount(updateFields.unit_cost as number);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/price_book/items/${itemId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'deleteItem': {
			const itemId = validateId(this.getNodeParameter('itemId', i) as string, 'Item');
			await housecallProApiRequest.call(this, 'DELETE', `/price_book/items/${itemId}`);
			responseData = { success: true, id: itemId };
			break;
		}

		case 'getCategories': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/price_book/categories',
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/price_book/categories',
					{},
					{},
					limit,
				);
			}
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
