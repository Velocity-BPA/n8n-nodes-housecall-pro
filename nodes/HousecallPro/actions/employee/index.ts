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
	parseMoneyAmount,
} from '../../transport';
import { validateId } from '../../utils/helpers';
import { EMPLOYEE_ROLES } from '../../constants/constants';

export const employeeOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['employee'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Add a new employee',
				action: 'Create an employee',
			},
			{
				name: 'Deactivate',
				value: 'deactivate',
				description: 'Deactivate an employee',
				action: 'Deactivate an employee',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an employee by ID',
				action: 'Get an employee',
			},
			{
				name: 'Get Jobs',
				value: 'getJobs',
				description: 'Get jobs assigned to an employee',
				action: 'Get employee jobs',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many employees',
				action: 'Get many employees',
			},
			{
				name: 'Get Schedule',
				value: 'getSchedule',
				description: 'Get schedule for an employee',
				action: 'Get employee schedule',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an employee',
				action: 'Update an employee',
			},
		],
		default: 'getAll',
	},
];

export const employeeFields: INodeProperties[] = [
	// ----------------------------------
	//         employee: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['employee'],
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
				resource: ['employee'],
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
				resource: ['employee'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Active Only',
				name: 'active',
				type: 'boolean',
				default: true,
				description: 'Whether to return only active employees',
			},
			{
				displayName: 'Role',
				name: 'role',
				type: 'options',
				options: EMPLOYEE_ROLES.map((r) => ({ name: r.name, value: r.value })),
				default: '',
				description: 'Filter by employee role',
			},
		],
	},

	// ----------------------------------
	//         employee: get, update, etc.
	// ----------------------------------
	{
		displayName: 'Employee ID',
		name: 'employeeId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['get', 'update', 'deactivate', 'getSchedule', 'getJobs'],
			},
		},
		default: '',
		description: 'The ID of the employee',
	},

	// ----------------------------------
	//         employee: create
	// ----------------------------------
	{
		displayName: 'First Name',
		name: 'firstName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'First name of the employee',
	},
	{
		displayName: 'Last Name',
		name: 'lastName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Last name of the employee',
	},
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		placeholder: 'name@email.com',
		required: true,
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Email address of the employee',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3498db',
				description: 'Calendar color for the employee',
			},
			{
				displayName: 'Hourly Rate',
				name: 'hourly_rate',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Pay rate per hour',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobile_phone',
				type: 'string',
				default: '',
				description: 'Mobile phone number',
			},
			{
				displayName: 'Role',
				name: 'role',
				type: 'options',
				options: EMPLOYEE_ROLES.map((r) => ({ name: r.name, value: r.value })),
				default: 'field',
				description: 'Employee role',
			},
		],
	},

	// ----------------------------------
	//         employee: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Color',
				name: 'color',
				type: 'color',
				default: '#3498db',
				description: 'Calendar color for the employee',
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
				displayName: 'Hourly Rate',
				name: 'hourly_rate',
				type: 'number',
				typeOptions: {
					numberPrecision: 2,
				},
				default: 0,
				description: 'Pay rate per hour',
			},
			{
				displayName: 'Last Name',
				name: 'last_name',
				type: 'string',
				default: '',
				description: 'Last name',
			},
			{
				displayName: 'Mobile Phone',
				name: 'mobile_phone',
				type: 'string',
				default: '',
				description: 'Mobile phone number',
			},
			{
				displayName: 'Role',
				name: 'role',
				type: 'options',
				options: EMPLOYEE_ROLES.map((r) => ({ name: r.name, value: r.value })),
				default: '',
				description: 'Employee role',
			},
		],
	},

	// ----------------------------------
	//         employee: getSchedule / getJobs
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['getSchedule', 'getJobs'],
			},
		},
		default: '',
		description: 'Start of date range',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		displayOptions: {
			show: {
				resource: ['employee'],
				operation: ['getSchedule', 'getJobs'],
			},
		},
		default: '',
		description: 'End of date range',
	},
];

export async function executeEmployeeOperation(
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

			if (filters.role) query['filter[role]'] = filters.role;
			if (filters.active !== undefined) query['filter[active]'] = filters.active;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/employees',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/employees',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'get': {
			const employeeId = validateId(this.getNodeParameter('employeeId', i) as string, 'Employee');
			const response = await housecallProApiRequest.call(this, 'GET', `/employees/${employeeId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'create': {
			const firstName = this.getNodeParameter('firstName', i) as string;
			const lastName = this.getNodeParameter('lastName', i) as string;
			const email = this.getNodeParameter('email', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				first_name: firstName,
				last_name: lastName,
				email,
			};

			if (additionalFields.mobile_phone) body.mobile_phone = additionalFields.mobile_phone;
			if (additionalFields.role) body.role = additionalFields.role;
			if (additionalFields.color) body.color = additionalFields.color;
			if (additionalFields.hourly_rate !== undefined) {
				body.hourly_rate = parseMoneyAmount(additionalFields.hourly_rate as number);
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/employees',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'update': {
			const employeeId = validateId(this.getNodeParameter('employeeId', i) as string, 'Employee');
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.first_name) body.first_name = updateFields.first_name;
			if (updateFields.last_name) body.last_name = updateFields.last_name;
			if (updateFields.email) body.email = updateFields.email;
			if (updateFields.mobile_phone) body.mobile_phone = updateFields.mobile_phone;
			if (updateFields.role) body.role = updateFields.role;
			if (updateFields.color) body.color = updateFields.color;
			if (updateFields.hourly_rate !== undefined) {
				body.hourly_rate = parseMoneyAmount(updateFields.hourly_rate as number);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/employees/${employeeId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'deactivate': {
			const employeeId = validateId(this.getNodeParameter('employeeId', i) as string, 'Employee');
			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/employees/${employeeId}`,
				{ active: false },
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'getSchedule': {
			const employeeId = validateId(this.getNodeParameter('employeeId', i) as string, 'Employee');
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;

			const query: IDataObject = {
				'filter[employee_ids]': employeeId,
			};

			if (startDate) query['filter[start_date]'] = formatDate(startDate);
			if (endDate) query['filter[end_date]'] = formatDate(endDate);

			const response = await housecallProApiRequest.call(
				this,
				'GET',
				'/schedule',
				{},
				query,
			);
			responseData = (response.data as IDataObject[]) || [response];
			break;
		}

		case 'getJobs': {
			const employeeId = validateId(this.getNodeParameter('employeeId', i) as string, 'Employee');
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;

			const query: IDataObject = {
				'filter[employee_ids]': employeeId,
			};

			if (startDate) query['filter[scheduled_start_min]'] = formatDate(startDate);
			if (endDate) query['filter[scheduled_start_max]'] = formatDate(endDate);

			responseData = await housecallProApiRequestAllItems.call(
				this,
				'GET',
				'/jobs',
				{},
				query,
			);
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
