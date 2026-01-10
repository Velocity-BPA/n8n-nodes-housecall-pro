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
} from '../../transport';
import { buildAddress, validateId } from '../../utils/helpers';

export const customerOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new customer',
				action: 'Create a customer',
			},
			{
				name: 'Create Property',
				value: 'createProperty',
				description: 'Add a property to a customer',
				action: 'Create a property for a customer',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a customer',
				action: 'Delete a customer',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a customer by ID',
				action: 'Get a customer',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many customers',
				action: 'Get many customers',
			},
			{
				name: 'Get Properties',
				value: 'getProperties',
				description: "Get a customer's properties",
				action: 'Get customer properties',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search customers by name, email, or phone',
				action: 'Search customers',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a customer',
				action: 'Update a customer',
			},
		],
		default: 'getAll',
	},
];

export const customerFields: INodeProperties[] = [
	// ----------------------------------
	//         customer: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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

	// ----------------------------------
	//         customer: get
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['get', 'update', 'delete', 'getProperties', 'createProperty'],
			},
		},
		default: '',
		description: 'The ID of the customer',
	},

	// ----------------------------------
	//         customer: create
	// ----------------------------------
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The first name of the customer',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The last name of the customer',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
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
				description: 'Notes about the customer',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'Phone number',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Address',
				name: 'address',
				type: 'fixedCollection',
				default: {},
				options: [
					{
						displayName: 'Address Fields',
						name: 'addressFields',
						values: [
							{
								displayName: 'Street',
								name: 'street',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Street Line 2',
								name: 'street_line_2',
								type: 'string',
								default: '',
							},
							{
								displayName: 'City',
								name: 'city',
								type: 'string',
								default: '',
							},
							{
								displayName: 'State',
								name: 'state',
								type: 'string',
								default: '',
							},
							{
								displayName: 'ZIP',
								name: 'zip',
								type: 'string',
								default: '',
							},
							{
								displayName: 'Country',
								name: 'country',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
		],
	},

	// ----------------------------------
	//         customer: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company name',
			},
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
				description: 'Notes about the customer',
			},
			{
				displayName: 'Phone Number',
				name: 'phone_number',
				type: 'string',
				default: '',
				description: 'Phone number',
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
	//         customer: search
	// ----------------------------------
	{
		displayName: 'Search Query',
		name: 'searchQuery',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
			},
		},
		default: '',
		description: 'Search by name, email, or phone number',
	},
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['search'],
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
				resource: ['customer'],
				operation: ['search'],
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

	// ----------------------------------
	//         customer: createProperty
	// ----------------------------------
	{
		displayName: 'Street',
		name: 'street',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createProperty'],
			},
		},
		default: '',
		description: 'Street address of the property',
	},
	{
		displayName: 'Property Fields',
		name: 'propertyFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['createProperty'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Country',
				name: 'country',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
			},
			{
				displayName: 'State',
				name: 'state',
				type: 'string',
				default: '',
			},
			{
				displayName: 'Street Line 2',
				name: 'street_line_2',
				type: 'string',
				default: '',
			},
			{
				displayName: 'ZIP',
				name: 'zip',
				type: 'string',
				default: '',
			},
		],
	},
];

export async function executeCustomerOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/customers',
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/customers',
					{},
					{},
					limit,
				);
			}
			break;
		}

		case 'get': {
			const customerId = validateId(
				this.getNodeParameter('customerId', i) as string,
				'Customer',
			);
			const response = await housecallProApiRequest.call(
				this,
				'GET',
				`/customers/${customerId}`,
			);
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
			if (additionalFields.company) body.company = additionalFields.company;
			if (additionalFields.notes) body.notes = additionalFields.notes;

			if (additionalFields.tags) {
				body.tags = parseTags(additionalFields.tags as string);
			}

			if (additionalFields.address) {
				const addressData = (additionalFields.address as IDataObject).addressFields as IDataObject;
				if (addressData) {
					body.address = buildAddress(addressData);
				}
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/customers',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'update': {
			const customerId = validateId(
				this.getNodeParameter('customerId', i) as string,
				'Customer',
			);
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.first_name) body.first_name = updateFields.first_name;
			if (updateFields.last_name) body.last_name = updateFields.last_name;
			if (updateFields.email) body.email = updateFields.email;
			if (updateFields.phone_number) body.phone_number = updateFields.phone_number;
			if (updateFields.company) body.company = updateFields.company;
			if (updateFields.notes) body.notes = updateFields.notes;

			if (updateFields.tags) {
				body.tags = parseTags(updateFields.tags as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/customers/${customerId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'delete': {
			const customerId = validateId(
				this.getNodeParameter('customerId', i) as string,
				'Customer',
			);
			await housecallProApiRequest.call(this, 'DELETE', `/customers/${customerId}`);
			responseData = { success: true, id: customerId };
			break;
		}

		case 'search': {
			const searchQuery = this.getNodeParameter('searchQuery', i) as string;
			const returnAll = this.getNodeParameter('returnAll', i) as boolean;

			const query: IDataObject = {
				q: searchQuery,
			};

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/customers',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/customers',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'getProperties': {
			const customerId = validateId(
				this.getNodeParameter('customerId', i) as string,
				'Customer',
			);
			const response = await housecallProApiRequest.call(
				this,
				'GET',
				`/customers/${customerId}/addresses`,
			);
			responseData = (response.data as IDataObject[]) || [response];
			break;
		}

		case 'createProperty': {
			const customerId = validateId(
				this.getNodeParameter('customerId', i) as string,
				'Customer',
			);
			const street = this.getNodeParameter('street', i) as string;
			const propertyFields = this.getNodeParameter('propertyFields', i) as IDataObject;

			const body: IDataObject = {
				street,
				...propertyFields,
			};

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/customers/${customerId}/addresses`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
