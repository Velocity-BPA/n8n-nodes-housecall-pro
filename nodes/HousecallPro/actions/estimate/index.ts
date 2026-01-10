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
	formatDate,
} from '../../transport';
import { validateId } from '../../utils/helpers';
import { ESTIMATE_STATUSES } from '../../constants/constants';

export const estimateOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['estimate'],
			},
		},
		options: [
			{
				name: 'Add Line Item',
				value: 'addLineItem',
				description: 'Add a line item to an estimate',
				action: 'Add line item to an estimate',
			},
			{
				name: 'Convert to Job',
				value: 'convertToJob',
				description: 'Convert an estimate to a job',
				action: 'Convert estimate to job',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new estimate',
				action: 'Create an estimate',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an estimate',
				action: 'Delete an estimate',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an estimate by ID',
				action: 'Get an estimate',
			},
			{
				name: 'Get Line Items',
				value: 'getLineItems',
				description: 'Get line items for an estimate',
				action: 'Get estimate line items',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many estimates',
				action: 'Get many estimates',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send an estimate to customer',
				action: 'Send an estimate',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an estimate',
				action: 'Update an estimate',
			},
		],
		default: 'getAll',
	},
];

export const estimateFields: INodeProperties[] = [
	// ----------------------------------
	//         estimate: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['getAll'],
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
				resource: ['estimate'],
				operation: ['getAll'],
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
				resource: ['estimate'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Customer ID',
				name: 'customer_id',
				type: 'string',
				default: '',
				description: 'Filter by customer ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: ESTIMATE_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Filter by estimate status',
			},
		],
	},

	// ----------------------------------
	//         estimate: get, update, delete, etc.
	// ----------------------------------
	{
		displayName: 'Estimate ID',
		name: 'estimateId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['get', 'update', 'delete', 'getLineItems', 'addLineItem', 'convertToJob', 'send'],
			},
		},
		default: '',
		description: 'The ID of the estimate',
	},

	// ----------------------------------
	//         estimate: create
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the customer for this estimate',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Address ID',
				name: 'address_id',
				type: 'string',
				default: '',
				description: 'Property ID for the estimate',
			},
			{
				displayName: 'Expiration Date',
				name: 'expiration_date',
				type: 'dateTime',
				default: '',
				description: 'When the estimate expires',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Message to include with the estimate',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Internal notes for the estimate',
			},
		],
	},

	// ----------------------------------
	//         estimate: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Address ID',
				name: 'address_id',
				type: 'string',
				default: '',
				description: 'Property ID for the estimate',
			},
			{
				displayName: 'Expiration Date',
				name: 'expiration_date',
				type: 'dateTime',
				default: '',
				description: 'When the estimate expires',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Message to include with the estimate',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Internal notes for the estimate',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: ESTIMATE_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Estimate status',
			},
		],
	},

	// ----------------------------------
	//         estimate: addLineItem
	// ----------------------------------
	{
		displayName: 'Item Name',
		name: 'itemName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['addLineItem'],
			},
		},
		default: '',
		description: 'Name of the line item',
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
				resource: ['estimate'],
				operation: ['addLineItem'],
			},
		},
		default: 0,
		description: 'Price per unit',
	},
	{
		displayName: 'Line Item Fields',
		name: 'lineItemFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['addLineItem'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: 1,
			},
			{
				displayName: 'Taxable',
				name: 'taxable',
				type: 'boolean',
				default: true,
			},
		],
	},

	// ----------------------------------
	//         estimate: convertToJob
	// ----------------------------------
	{
		displayName: 'Job Options',
		name: 'jobOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['estimate'],
				operation: ['convertToJob'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Assigned Employee IDs',
				name: 'assigned_employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of employee IDs to assign',
			},
			{
				displayName: 'Scheduled Start',
				name: 'scheduled_start',
				type: 'dateTime',
				default: '',
				description: 'When to schedule the job',
			},
		],
	},
];

export async function executeEstimateOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;
			const filters = this.getNodeParameter('filters', i) as IDataObject;

			const query: IDataObject = {};

			if (filters.customer_id) query['filter[customer_id]'] = filters.customer_id;
			if (filters.status) query['filter[status]'] = filters.status;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/estimates',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/estimates',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'get': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			const response = await housecallProApiRequest.call(this, 'GET', `/estimates/${estimateId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'create': {
			const customerId = this.getNodeParameter('customerId', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				customer_id: customerId,
			};

			if (additionalFields.address_id) body.address_id = additionalFields.address_id;
			if (additionalFields.message) body.message = additionalFields.message;
			if (additionalFields.notes) body.notes = additionalFields.notes;
			if (additionalFields.expiration_date) {
				body.expiration_date = formatDate(additionalFields.expiration_date as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/estimates',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'update': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.address_id) body.address_id = updateFields.address_id;
			if (updateFields.message) body.message = updateFields.message;
			if (updateFields.notes) body.notes = updateFields.notes;
			if (updateFields.status) body.status = updateFields.status;
			if (updateFields.expiration_date) {
				body.expiration_date = formatDate(updateFields.expiration_date as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/estimates/${estimateId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'delete': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			await housecallProApiRequest.call(this, 'DELETE', `/estimates/${estimateId}`);
			responseData = { success: true, id: estimateId };
			break;
		}

		case 'getLineItems': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			const response = await housecallProApiRequest.call(
				this,
				'GET',
				`/estimates/${estimateId}/line_items`,
			);
			responseData = (response.data as IDataObject[]) || [response];
			break;
		}

		case 'addLineItem': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			const itemName = this.getNodeParameter('itemName', i) as string;
			const unitPrice = this.getNodeParameter('unitPrice', i) as number;
			const lineItemFields = this.getNodeParameter('lineItemFields', i) as IDataObject;

			const body: IDataObject = {
				name: itemName,
				unit_price: unitPrice.toFixed(2),
				quantity: lineItemFields.quantity || 1,
				...lineItemFields,
			};

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/estimates/${estimateId}/line_items`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'convertToJob': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			const jobOptions = this.getNodeParameter('jobOptions', i) as IDataObject;

			const body: IDataObject = {};

			if (jobOptions.scheduled_start) {
				body.scheduled_start = formatDate(jobOptions.scheduled_start as string);
			}
			if (jobOptions.assigned_employee_ids) {
				body.assigned_employee_ids = (jobOptions.assigned_employee_ids as string)
					.split(',')
					.map((id) => id.trim());
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/estimates/${estimateId}/convert`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'send': {
			const estimateId = validateId(this.getNodeParameter('estimateId', i) as string, 'Estimate');
			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/estimates/${estimateId}/send`,
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
