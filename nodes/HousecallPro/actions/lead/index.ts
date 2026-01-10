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
} from '../../transport';
import { validateId } from '../../utils/helpers';
import { LEAD_STATUSES } from '../../constants/constants';

export const leadOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['lead'],
			},
		},
		options: [
			{
				name: 'Convert',
				value: 'convert',
				description: 'Convert a lead to a customer',
				action: 'Convert a lead to customer',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new lead',
				action: 'Create a lead',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a lead',
				action: 'Delete a lead',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a lead by ID',
				action: 'Get a lead',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many leads',
				action: 'Get many leads',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a lead',
				action: 'Update a lead',
			},
		],
		default: 'getAll',
	},
];

export const leadFields: INodeProperties[] = [
	// ----------------------------------
	//         lead: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['lead'],
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
				resource: ['lead'],
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
				resource: ['lead'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'Filter by lead source',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: LEAD_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Filter by lead status',
			},
		],
	},

	// ----------------------------------
	//         lead: get, update, delete, etc.
	// ----------------------------------
	{
		displayName: 'Lead ID',
		name: 'leadId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['get', 'update', 'delete', 'convert'],
			},
		},
		default: '',
		description: 'The ID of the lead',
	},

	// ----------------------------------
	//         lead: create
	// ----------------------------------
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'First name of the lead',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Last name of the lead',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the lead',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'How the lead was acquired',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: LEAD_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: 'new',
				description: 'Lead status',
			},
		],
	},

	// ----------------------------------
	//         lead: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['lead'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Email address',
			},
			{
				displayName: 'First Name',
				name: 'first_name',
				type: 'string',
				default: '',
				description: 'First name',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Last name',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes about the lead',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: '',
				description: 'How the lead was acquired',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: LEAD_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Lead status',
			},
		],
	},
];

export async function executeLeadOperation(
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

			if (filters.status) query['filter[status]'] = filters.status;
			if (filters.source) query['filter[source]'] = filters.source;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/leads',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/leads',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'get': {
			const leadId = validateId(this.getNodeParameter('leadId', i) as string, 'Lead');
			const response = await housecallProApiRequest.call(this, 'GET', `/leads/${leadId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'create': {
			const firstName = this.getNodeParameter('firstName', i) as string;
			const lastName = this.getNodeParameter('lastName', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				first_name: firstName,
				last_name: lastName,
			};

			if (additionalFields.email) body.email = additionalFields.email;
			if (additionalFields.phone_number) body.phone_number = additionalFields.phone_number;
			if (additionalFields.source) body.source = additionalFields.source;
			if (additionalFields.status) body.status = additionalFields.status;
			if (additionalFields.notes) body.notes = additionalFields.notes;

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/leads',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'update': {
			const leadId = validateId(this.getNodeParameter('leadId', i) as string, 'Lead');
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.first_name) body.first_name = updateFields.first_name;
			if (updateFields.last_name) body.last_name = updateFields.last_name;
			if (updateFields.email) body.email = updateFields.email;
			if (updateFields.phone_number) body.phone_number = updateFields.phone_number;
			if (updateFields.source) body.source = updateFields.source;
			if (updateFields.status) body.status = updateFields.status;
			if (updateFields.notes) body.notes = updateFields.notes;

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/leads/${leadId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'delete': {
			const leadId = validateId(this.getNodeParameter('leadId', i) as string, 'Lead');
			await housecallProApiRequest.call(this, 'DELETE', `/leads/${leadId}`);
			responseData = { success: true, id: leadId };
			break;
		}

		case 'convert': {
			const leadId = validateId(this.getNodeParameter('leadId', i) as string, 'Lead');
			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/leads/${leadId}/convert`,
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
