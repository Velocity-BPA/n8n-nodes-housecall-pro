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
import { WEBHOOK_EVENTS } from '../../constants/constants';

export const webhookOperations: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Register a new webhook',
				action: 'Create a webhook',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Remove a webhook',
				action: 'Delete a webhook',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'List all webhooks',
				action: 'Get many webhooks',
			},
			{
				name: 'Test',
				value: 'test',
				description: 'Test webhook delivery',
				action: 'Test a webhook',
			},
		],
		default: 'getAll',
	},
];

export const webhookFields: INodeProperties[] = [
	// ----------------------------------
	//         webhook: getAll
	// ----------------------------------
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['webhook'],
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
				resource: ['webhook'],
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
	//         webhook: create
	// ----------------------------------
	{
		displayName: 'URL',
		name: 'url',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: '',
		placeholder: 'https://example.com/webhook',
		description: 'The URL to send webhook events to',
	},
	{
		displayName: 'Events',
		name: 'events',
		type: 'multiOptions',
		options: WEBHOOK_EVENTS.map((e) => ({ name: e.name, value: e.value })),
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: [],
		description: 'The events to subscribe to',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Secret',
				name: 'secret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Secret for webhook signature verification',
			},
		],
	},

	// ----------------------------------
	//         webhook: delete, test
	// ----------------------------------
	{
		displayName: 'Webhook ID',
		name: 'webhookId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['webhook'],
				operation: ['delete', 'test'],
			},
		},
		default: '',
		description: 'The ID of the webhook',
	},
];

export async function executeWebhookOperation(
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
					'/webhooks',
				);
			} else {
				const limit = this.getNodeParameter('limit', i) as number;
				responseData = await housecallProApiRequestPaginated.call(
					this,
					'GET',
					'/webhooks',
					{},
					{},
					limit,
				);
			}
			break;
		}

		case 'create': {
			const url = this.getNodeParameter('url', i) as string;
			const events = this.getNodeParameter('events', i) as string[];
			const additionalOptions = this.getNodeParameter('additionalOptions', i) as IDataObject;

			const body: IDataObject = {
				url,
				events,
			};

			if (additionalOptions.secret) body.secret = additionalOptions.secret;

			const response = await housecallProApiRequest.call(
				this,
				'POST',
				'/webhooks',
				cleanObject(body),
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		case 'delete': {
			const webhookId = validateId(this.getNodeParameter('webhookId', i) as string, 'Webhook');
			await housecallProApiRequest.call(this, 'DELETE', `/webhooks/${webhookId}`);
			responseData = { success: true, id: webhookId };
			break;
		}

		case 'test': {
			const webhookId = validateId(this.getNodeParameter('webhookId', i) as string, 'Webhook');
			const response = await housecallProApiRequest.call(
				this,
				'POST',
				`/webhooks/${webhookId}/test`,
			);
			responseData = (response.data as IDataObject) || response;
			break;
		}

		default:
			throw new Error(`Unknown operation: ${operation}`);
	}

	return responseData;
}
