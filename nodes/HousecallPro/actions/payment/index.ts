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
import { PAYMENT_METHODS } from '../../constants/constants';

export const paymentOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['payment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Record a new payment',
				action: 'Create a payment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a payment by ID',
				action: 'Get a payment',
			},
			{
				name: 'Get by Invoice',
				value: 'getByInvoice',
				description: 'Get payments for an invoice',
				action: 'Get payments by invoice',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many payments',
				action: 'Get many payments',
			},
			{
				name: 'Refund',
				value: 'refund',
				description: 'Process a refund',
				action: 'Refund a payment',
			},
		],
		default: 'getAll',
	},
];

export const paymentFields: INodeProperties[] = [
	// ----------------------------------
	//         payment: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['payment'],
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
				resource: ['payment'],
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
	//         payment: get
	// ----------------------------------
	{
		displayName: 'Payment ID',
		name: 'paymentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['get', 'refund'],
			},
		},
		default: '',
		description: 'The ID of the payment',
	},

	// ----------------------------------
	//         payment: getByInvoice
	// ----------------------------------
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['getByInvoice'],
			},
		},
		default: '',
		description: 'The ID of the invoice',
	},

	// ----------------------------------
	//         payment: create
	// ----------------------------------
	{
		displayName: 'Invoice ID',
		name: 'invoiceId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the invoice to apply the payment to',
	},
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
				resource: ['payment'],
				operation: ['create'],
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
				resource: ['payment'],
				operation: ['create'],
			},
		},
		default: 'cash',
		description: 'Method of payment',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['create'],
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

	// ----------------------------------
	//         payment: refund
	// ----------------------------------
	{
		displayName: 'Refund Amount',
		name: 'refundAmount',
		type: 'number',
		typeOptions: {
			numberPrecision: 2,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['refund'],
			},
		},
		default: 0,
		description: 'Amount to refund',
	},
	{
		displayName: 'Refund Options',
		name: 'refundOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['payment'],
				operation: ['refund'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Reason',
				name: 'reason',
				type: 'string',
				default: '',
				description: 'Reason for the refund',
			},
		],
	},
];

export async function executePaymentOperation(
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
					'/payments',
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/payments',
					{},
					{},
					limit,
				);
			}
			break;
		}

		case 'get': {
			const paymentId = validateId(this.getNodeParameter('paymentId', i) as string, 'Payment');
			const response = await housecallProApiRequest.call(this, 'GET', `/payments/${paymentId}`);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'getByInvoice': {
			const invoiceId = validateId(this.getNodeParameter('invoiceId', i) as string, 'Invoice');
			const query: IDataObject = {
				'filter[invoice_id]': invoiceId,
			};
			responseData = await housecallProApiRequestAllItems.call(
				this,
				'GET',
				'/payments',
				{},
				query,
			);
			break;
		}

		case 'create': {
			const invoiceId = this.getNodeParameter('invoiceId', i) as string;
			const amount = this.getNodeParameter('amount', i) as number;
			const paymentMethod = this.getNodeParameter('paymentMethod', i) as string;
			const additionalFields = this.getNodeParameter('additionalFields', i) as IDataObject;

			const body: IDataObject = {
				invoice_id: invoiceId,
				amount: parseMoneyAmount(amount),
				payment_method: paymentMethod,
			};

			if (additionalFields.note) body.note = additionalFields.note;
			if (additionalFields.received_at) {
				body.received_at = formatDate(additionalFields.received_at as string);
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

		case 'refund': {
			const paymentId = validateId(this.getNodeParameter('paymentId', i) as string, 'Payment');
			const refundAmount = this.getNodeParameter('refundAmount', i) as number;
			const refundOptions = this.getNodeParameter('refundOptions', i) as IDataObject;

			const body: IDataObject = {
				amount: parseMoneyAmount(refundAmount),
			};

			if (refundOptions.reason) body.reason = refundOptions.reason;

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/payments/${paymentId}/refund`,
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
