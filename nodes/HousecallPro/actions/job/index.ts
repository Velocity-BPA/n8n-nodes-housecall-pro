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
	parseTags,
	formatDate,
} from '../../transport';
import { validateId, parseArrayInput } from '../../utils/helpers';
import { JOB_STATUSES, JOB_TYPES } from '../../constants/constants';

export const jobOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['job'],
			},
		},
		options: [
			{
				name: 'Add Line Item',
				value: 'addLineItem',
				description: 'Add a line item to a job',
				action: 'Add line item to a job',
			},
			{
				name: 'Cancel',
				value: 'cancel',
				description: 'Cancel a job',
				action: 'Cancel a job',
			},
			{
				name: 'Complete',
				value: 'complete',
				description: 'Mark a job as complete',
				action: 'Complete a job',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new job',
				action: 'Create a job',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a job',
				action: 'Delete a job',
			},
			{
				name: 'Dispatch',
				value: 'dispatch',
				description: 'Dispatch a job to a technician',
				action: 'Dispatch a job',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a job by ID',
				action: 'Get a job',
			},
			{
				name: 'Get Line Items',
				value: 'getLineItems',
				description: 'Get line items for a job',
				action: 'Get job line items',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many jobs',
				action: 'Get many jobs',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a job',
				action: 'Update a job',
			},
		],
		default: 'getAll',
	},
];

export const jobFields: INodeProperties[] = [
	// ----------------------------------
	//         job: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['job'],
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
				resource: ['job'],
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
				resource: ['job'],
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
				displayName: 'Employee IDs',
				name: 'employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of employee IDs to filter by',
			},
			{
				displayName: 'Scheduled After',
				name: 'scheduled_start_min',
				type: 'dateTime',
				default: '',
				description: 'Filter jobs scheduled after this date',
			},
			{
				displayName: 'Scheduled Before',
				name: 'scheduled_start_max',
				type: 'dateTime',
				default: '',
				description: 'Filter jobs scheduled before this date',
			},
			{
				displayName: 'Work Status',
				name: 'work_status',
				type: 'options',
				options: JOB_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Filter by job status',
			},
		],
	},

	// ----------------------------------
	//         job: get, update, delete, etc.
	// ----------------------------------
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['get', 'update', 'delete', 'getLineItems', 'addLineItem', 'complete', 'cancel', 'dispatch'],
			},
		},
		default: '',
		description: 'The ID of the job',
	},

	// ----------------------------------
	//         job: create
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the customer for this job',
	},
	{
		displayName: 'Scheduled Start',
		name: 'scheduledStart',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'When the job is scheduled to start',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['job'],
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
				description: 'Service location property ID',
			},
			{
				displayName: 'Assigned Employee IDs',
				name: 'assigned_employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of technician IDs to assign',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Job description',
			},
			{
				displayName: 'Job Type',
				name: 'job_type',
				type: 'options',
				options: JOB_TYPES.map((t) => ({ name: t.name, value: t.value })),
				default: 'service',
				description: 'Type of job',
			},
			{
				displayName: 'Scheduled End',
				name: 'scheduled_end',
				type: 'dateTime',
				default: '',
				description: 'When the job is scheduled to end',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
		],
	},

	// ----------------------------------
	//         job: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['job'],
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
				description: 'Service location property ID',
			},
			{
				displayName: 'Assigned Employee IDs',
				name: 'assigned_employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of technician IDs to assign',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Job description',
			},
			{
				displayName: 'Job Type',
				name: 'job_type',
				type: 'options',
				options: JOB_TYPES.map((t) => ({ name: t.name, value: t.value })),
				default: 'service',
				description: 'Type of job',
			},
			{
				displayName: 'Scheduled End',
				name: 'scheduled_end',
				type: 'dateTime',
				default: '',
				description: 'When the job is scheduled to end',
			},
			{
				displayName: 'Scheduled Start',
				name: 'scheduled_start',
				type: 'dateTime',
				default: '',
				description: 'When the job is scheduled to start',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Work Status',
				name: 'work_status',
				type: 'options',
				options: JOB_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Job status',
			},
		],
	},

	// ----------------------------------
	//         job: addLineItem
	// ----------------------------------
	{
		displayName: 'Item Name',
		name: 'itemName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
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
				resource: ['job'],
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
				resource: ['job'],
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
	//         job: dispatch
	// ----------------------------------
	{
		displayName: 'Employee ID',
		name: 'employeeId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['job'],
				operation: ['dispatch'],
			},
		},
		default: '',
		description: 'The ID of the employee to dispatch the job to',
	},
];

export async function executeJobOperation(
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
			if (filters.work_status) query['filter[work_status]'] = filters.work_status;
			if (filters.scheduled_start_min) {
				query['filter[scheduled_start_min]'] = formatDate(filters.scheduled_start_min as string);
			}
			if (filters.scheduled_start_max) {
				query['filter[scheduled_start_max]'] = formatDate(filters.scheduled_start_max as string);
			}
			if (filters.employee_ids) {
				query['filter[employee_ids]'] = filters.employee_ids;
			}

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/jobs',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/jobs',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'get': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			const response = await housecallProApiRequest.call(this, 'GET', `/jobs/${jobId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'create': {
			const customerId = this.getNodeParameter('customerId', i) as string;
			const scheduledStart = this.getNodeParameter('scheduledStart', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				customer_id: customerId,
				scheduled_start: formatDate(scheduledStart),
			};

			if (additionalFields.scheduled_end) {
				body.scheduled_end = formatDate(additionalFields.scheduled_end as string);
			}
			if (additionalFields.description) body.description = additionalFields.description;
			if (additionalFields.job_type) body.job_type = additionalFields.job_type;
			if (additionalFields.address_id) body.address_id = additionalFields.address_id;

			if (additionalFields.assigned_employee_ids) {
				body.assigned_employee_ids = parseArrayInput(additionalFields.assigned_employee_ids as string);
			}

			if (additionalFields.tags) {
				body.tags = parseTags(additionalFields.tags as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/jobs',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'update': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.scheduled_start) {
				body.scheduled_start = formatDate(updateFields.scheduled_start as string);
			}
			if (updateFields.scheduled_end) {
				body.scheduled_end = formatDate(updateFields.scheduled_end as string);
			}
			if (updateFields.description) body.description = updateFields.description;
			if (updateFields.job_type) body.job_type = updateFields.job_type;
			if (updateFields.address_id) body.address_id = updateFields.address_id;
			if (updateFields.work_status) body.work_status = updateFields.work_status;

			if (updateFields.assigned_employee_ids) {
				body.assigned_employee_ids = parseArrayInput(updateFields.assigned_employee_ids as string);
			}

			if (updateFields.tags) {
				body.tags = parseTags(updateFields.tags as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/jobs/${jobId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'delete': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			await housecallProApiRequest.call(this, 'DELETE', `/jobs/${jobId}`);
			responseData = { success: true, id: jobId };
			break;
		}

		case 'getLineItems': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			const response = await housecallProApiRequest.call(
				this,
				'GET',
				`/jobs/${jobId}/line_items`,
			);
			responseData = (response.data as IDataObject[]) || [response];
			break;
		}

		case 'addLineItem': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
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
				`/jobs/${jobId}/line_items`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'complete': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/jobs/${jobId}`,
				{ work_status: 'complete' },
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'cancel': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/jobs/${jobId}`,
				{ work_status: 'canceled' },
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'dispatch': {
			const jobId = validateId(this.getNodeParameter('jobId', i) as string, 'Job');
			const employeeId = this.getNodeParameter('employeeId', i) as string;

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/jobs/${jobId}/dispatch`,
				{ employee_id: employeeId },
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
