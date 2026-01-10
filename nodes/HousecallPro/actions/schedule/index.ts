/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { INodeProperties, IExecuteFunctions, IDataObject } from 'n8n-workflow';
import {
	housecallProApiRequest,
	cleanObject,
	formatDate,
} from '../../transport';
import { validateId, parseArrayInput } from '../../utils/helpers';

export const scheduleOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
			},
		},
		options: [
			{
				name: 'Create Appointment',
				value: 'createAppointment',
				description: 'Schedule a new appointment',
				action: 'Create an appointment',
			},
			{
				name: 'Create Time Off',
				value: 'createTimeOff',
				description: 'Schedule time off for an employee',
				action: 'Create time off',
			},
			{
				name: 'Delete Appointment',
				value: 'deleteAppointment',
				description: 'Remove an appointment',
				action: 'Delete an appointment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get schedule for a date range',
				action: 'Get schedule',
			},
			{
				name: 'Get Availability',
				value: 'getAvailability',
				description: 'Check available time slots',
				action: 'Get availability',
			},
			{
				name: 'Get Time Off',
				value: 'getTimeOff',
				description: 'Get time off entries',
				action: 'Get time off',
			},
			{
				name: 'Update Appointment',
				value: 'updateAppointment',
				description: 'Modify an existing appointment',
				action: 'Update an appointment',
			},
		],
		default: 'get',
	},
];

export const scheduleFields: INodeProperties[] = [
	// ----------------------------------
	//         schedule: get
	// ----------------------------------
	{
		displayName: 'Start Date',
		name: 'startDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['get', 'getAvailability', 'getTimeOff'],
			},
		},
		default: '',
		description: 'Start of the date range',
	},
	{
		displayName: 'End Date',
		name: 'endDate',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['get', 'getAvailability', 'getTimeOff'],
			},
		},
		default: '',
		description: 'End of the date range',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['get'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Employee IDs',
				name: 'employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of employee IDs to filter by',
			},
		],
	},

	// ----------------------------------
	//         schedule: getAvailability
	// ----------------------------------
	{
		displayName: 'Slot Duration (Minutes)',
		name: 'slotDuration',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['getAvailability'],
			},
		},
		default: 60,
		description: 'Duration of appointment slots in minutes',
	},
	{
		displayName: 'Availability Options',
		name: 'availabilityOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['getAvailability'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Employee IDs',
				name: 'employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of employee IDs to check availability for',
			},
		],
	},

	// ----------------------------------
	//         schedule: createAppointment
	// ----------------------------------
	{
		displayName: 'Job ID',
		name: 'jobId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createAppointment'],
			},
		},
		default: '',
		description: 'ID of the job to schedule',
	},
	{
		displayName: 'Start Time',
		name: 'startTime',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createAppointment'],
			},
		},
		default: '',
		description: 'When the appointment starts',
	},
	{
		displayName: 'End Time',
		name: 'endTime',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createAppointment'],
			},
		},
		default: '',
		description: 'When the appointment ends',
	},
	{
		displayName: 'Appointment Options',
		name: 'appointmentOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createAppointment'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Employee IDs',
				name: 'employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of employee IDs to assign',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the appointment',
			},
		],
	},

	// ----------------------------------
	//         schedule: updateAppointment
	// ----------------------------------
	{
		displayName: 'Appointment ID',
		name: 'appointmentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateAppointment', 'deleteAppointment'],
			},
		},
		default: '',
		description: 'ID of the appointment',
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['updateAppointment'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Employee IDs',
				name: 'employee_ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of employee IDs to assign',
			},
			{
				displayName: 'End Time',
				name: 'end_time',
				type: 'dateTime',
				default: '',
				description: 'When the appointment ends',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Notes for the appointment',
			},
			{
				displayName: 'Start Time',
				name: 'start_time',
				type: 'dateTime',
				default: '',
				description: 'When the appointment starts',
			},
		],
	},

	// ----------------------------------
	//         schedule: createTimeOff
	// ----------------------------------
	{
		displayName: 'Employee ID',
		name: 'employeeId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createTimeOff'],
			},
		},
		default: '',
		description: 'ID of the employee',
	},
	{
		displayName: 'Time Off Start',
		name: 'timeOffStart',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createTimeOff'],
			},
		},
		default: '',
		description: 'Start of time off',
	},
	{
		displayName: 'Time Off End',
		name: 'timeOffEnd',
		type: 'dateTime',
		required: true,
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createTimeOff'],
			},
		},
		default: '',
		description: 'End of time off',
	},
	{
		displayName: 'Time Off Options',
		name: 'timeOffOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['schedule'],
				operation: ['createTimeOff'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				default: '',
				description: 'Reason for time off',
			},
		],
	},
];

export async function executeScheduleOperation(
	this: IExecuteFunctions,
	operation: string,
	i: number,
): Promise<IDataObject | IDataObject[]> {
	let responseData: IDataObject | IDataObject[];

	switch (operation) {
		case 'get': {
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const options = this.getNodeParameter('options', i) as IDataObject;

			const query: IDataObject = {
				'filter[start_date]': formatDate(startDate),
				'filter[end_date]': formatDate(endDate),
			};

			if (options.employee_ids) {
				query['filter[employee_ids]'] = options.employee_ids;
			}

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

		case 'getAvailability': {
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;
			const slotDuration = this.getNodeParameter('slotDuration', i) as number;
			const availabilityOptions = this.getNodeParameter('availabilityOptions', i) as IDataObject;

			const query: IDataObject = {
				start_date: formatDate(startDate),
				end_date: formatDate(endDate),
				slot_duration: slotDuration,
			};

			if (availabilityOptions.employee_ids) {
				query.employee_ids = availabilityOptions.employee_ids;
			}

			const response = await housecallProApiRequest.call(
				this,
				'GET',
				'/schedule/availability',
				{},
				query,
			);
			responseData = (response.data as IDataObject[]) || [response];
			break;
		}

		case 'getTimeOff': {
			const startDate = this.getNodeParameter('startDate', i) as string;
			const endDate = this.getNodeParameter('endDate', i) as string;

			const query: IDataObject = {
				'filter[start_date]': formatDate(startDate),
				'filter[end_date]': formatDate(endDate),
			};

			const response = await housecallProApiRequest.call(
				this,
				'GET',
				'/time_off',
				{},
				query,
			);
			responseData = (response.data as IDataObject[]) || [response];
			break;
		}

		case 'createAppointment': {
			const jobId = this.getNodeParameter('jobId', i) as string;
			const startTime = this.getNodeParameter('startTime', i) as string;
			const endTime = this.getNodeParameter('endTime', i) as string;
			const appointmentOptions = this.getNodeParameter('appointmentOptions', i) as IDataObject;

			const body: IDataObject = {
				job_id: jobId,
				start_time: formatDate(startTime),
				end_time: formatDate(endTime),
			};

			if (appointmentOptions.employee_ids) {
				body.employee_ids = parseArrayInput(appointmentOptions.employee_ids as string);
			}
			if (appointmentOptions.notes) body.notes = appointmentOptions.notes;

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/schedule/appointments',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'updateAppointment': {
			const appointmentId = validateId(
				this.getNodeParameter('appointmentId', i) as string,
				'Appointment',
			);
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.start_time) body.start_time = formatDate(updateFields.start_time as string);
			if (updateFields.end_time) body.end_time = formatDate(updateFields.end_time as string);
			if (updateFields.notes) body.notes = updateFields.notes;
			if (updateFields.employee_ids) {
				body.employee_ids = parseArrayInput(updateFields.employee_ids as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/schedule/appointments/${appointmentId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'deleteAppointment': {
			const appointmentId = validateId(
				this.getNodeParameter('appointmentId', i) as string,
				'Appointment',
			);
			await housecallProApiRequest.call(this, 'DELETE', `/schedule/appointments/${appointmentId}`);
			responseData = { success: true, id: appointmentId };
			break;
		}

		case 'createTimeOff': {
			const employeeId = this.getNodeParameter('employeeId', i) as string;
			const timeOffStart = this.getNodeParameter('timeOffStart', i) as string;
			const timeOffEnd = this.getNodeParameter('timeOffEnd', i) as string;
			const timeOffOptions = this.getNodeParameter('timeOffOptions', i) as IDataObject;

			const body: IDataObject = {
				employee_id: employeeId,
				start_date: formatDate(timeOffStart),
				end_date: formatDate(timeOffEnd),
			};

			if (timeOffOptions.reason) body.reason = timeOffOptions.reason;

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/time_off',
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
