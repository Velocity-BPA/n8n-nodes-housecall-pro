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
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../../constants/constants';

export const invoiceOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new invoice',
				action: 'Create an invoice',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an invoice',
				action: 'Delete an invoice',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get an invoice by ID',
				action: 'Get an invoice',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many invoices',
				action: 'Get many invoices',
			},
			{
				name: 'Record Payment',
				value: 'recordPayment',
				description: 'Record a payment on an invoice',
				action: 'Record payment on invoice',
			},
			{
				name: 'Send',
				value: 'send',
				description: 'Send an invoice to customer',
				action: 'Send an invoice',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an invoice',
				action: 'Update an invoice',
			},
			{
				name: 'Void',
				value: 'void',
				description: 'Void an invoice',
				action: 'Void an invoice',
			},
		],
		default: 'getAll',
	},
];

export const invoiceFields: INodeProperties[] = [
	// ----------------------------------
	//         invoice: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['invoice'],
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
				resource: ['invoice'],
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
				resource: ['invoice'],
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
				displayName: 'Job ID',
				name: 'job_id',
				type: 'string',
				default: '',
				description: 'Filter by job ID',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				options: INVOICE_STATUSES.map((s) => ({ name: s.name, value: s.value })),
				default: '',
				description: 'Filter by invoice status',
			},
		],
	},

	// ----------------------------------
	//         invoice: get, update, delete, etc.
	// ----------------------------------
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['get', 'update', 'delete', 'send', 'void', 'recordPayment'],
			},
		},
		default: '',
		description: 'The ID of the invoice',
	},

	// ----------------------------------
	//         invoice: create
	// ----------------------------------
	{
		displayName: 'Customer ID',
		name: 'customerId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the customer for this invoice',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'When payment is due',
			},
			{
				displayName: 'Job ID',
				name: 'job_id',
				type: 'string',
				default: '',
				description: 'Associated job ID',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Message to include with the invoice',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Internal notes for the invoice',
			},
		],
	},

	// ----------------------------------
	//         invoice: update
	// ----------------------------------
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Due Date',
				name: 'due_date',
				type: 'dateTime',
				default: '',
				description: 'When payment is due',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Message to include with the invoice',
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Internal notes for the invoice',
			},
		],
	},

	// ----------------------------------
	//         invoice: recordPayment
	// ----------------------------------
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'number',
		typeOptions: {
			numberPrecision: 2,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['recordPayment'],
			},
		},
		default: 0,
		description: 'Payment amount',
	},
	{
		displayName: 'Payment Method',
		name: 'paymentMethod',
		type: 'options',
		options: PAYMENT_METHODS.map((m) => ({ name: m.name, value: m.value })),
		required: true,
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['recordPayment'],
			},
		},
		default: 'cash',
		description: 'Method of payment',
	},
	{
		displayName: 'Payment Fields',
		name: 'paymentFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['invoice'],
				operation: ['recordPayment'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Note',
				name: 'note',
				type: 'string',
				default: '',
				description: 'Note about the payment',
			},
			{
				displayName: 'Received At',
				name: 'received_at',
				type: 'dateTime',
				default: '',
				description: 'When the payment was received',
			},
		],
	},
];

export async function executeInvoiceOperation(
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
			if (filters.job_id) query['filter[job_id]'] = filters.job_id;
			if (filters.status) query['filter[status]'] = filters.status;

			if (returnAll) {
				responseData = await housecallProApiRequestAllItems.call(
					this,
					'GET',
					'/invoices',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/invoices',
					{},
					query,
					limit,
				);
			}
			break;
		}

		case 'get': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			const response = await housecallProApiRequest.call(this, 'GET', `/invoices/${invoiceId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'create': {
			const customerId = this.getNodeParameter('customerId', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				customer_id: customerId,
			};

			if (additionalFields.job_id) body.job_id = additionalFields.job_id;
			if (additionalFields.message) body.message = additionalFields.message;
			if (additionalFields.notes) body.notes = additionalFields.notes;
			if (additionalFields.due_date) {
				body.due_date = formatDate(additionalFields.due_date as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/invoices',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'update': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			const updateFields = this.getNodeParameter('updateFields', i) as IDataObject;

			const body: IDataObject = {};

			if (updateFields.message) body.message = updateFields.message;
			if (updateFields.notes) body.notes = updateFields.notes;
			if (updateFields.due_date) {
				body.due_date = formatDate(updateFields.due_date as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'PUT',
				`/invoices/${invoiceId}`,
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'delete': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			await housecallProApiRequest.call(this, 'DELETE', `/invoices/${invoiceId}`);
			responseData = { success: true, id: invoiceId };
			break;
		}

		case 'send': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/invoices/${invoiceId}/send`,
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'void': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/invoices/${invoiceId}/void`,
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'recordPayment': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			const amount = this.getNodeParameter('amount', i) as number;
			const paymentMethod = this.getNodeParameter('paymentMethod', i) as string;
			const paymentFields = this.getNodeParameter('paymentFields', i) as IDataObject;

			const body: IDataObject = {
				invoice_id: invoiceId,
				amount: parseMoneyAmount(amount),
				payment_method: paymentMethod,
			};

			if (paymentFields.note) body.note = paymentFields.note;
			if (paymentFields.received_at) {
				body.received_at = formatDate(paymentFields.received_at as string);
			}

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/payments',
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
