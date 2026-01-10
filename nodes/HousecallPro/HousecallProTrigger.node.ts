/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IHookFunctions,
	IWebhookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	IDataObject,
} from 'n8n-workflow';

import { WEBHOOK_EVENTS } from './constants/constants';
import { housecallProApiRequest } from './transport';

// Log licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingLogged = false;

export class HousecallProTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Housecall Pro Trigger',
		name: 'housecallProTrigger',
		icon: 'file:housecallpro.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Starts the workflow when Housecall Pro events occur',
		defaults: {
			name: 'Housecall Pro Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'housecallProApi',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				options: WEBHOOK_EVENTS.map((e) => ({ name: e.name, value: e.value })),
				required: true,
				default: [],
				description: 'The events to subscribe to',
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const webhookData = this.getWorkflowStaticData('node');

				// Check if webhook exists
				if (webhookData.webhookId) {
					try {
						await housecallProApiRequest.call(
							this,
							'GET',
							`/webhooks/${webhookData.webhookId}`,
						);
						return true;
					} catch {
						// Webhook doesn't exist anymore
						delete webhookData.webhookId;
						return false;
					}
				}

				// Check if there's a webhook with our URL
				try {
					const response = await housecallProApiRequest.call(
						this,
						'GET',
						'/webhooks',
					);

					const webhooks = (response.data || response) as IDataObject[];
					
					for (const webhook of webhooks) {
						if (webhook.url === webhookUrl) {
							webhookData.webhookId = webhook.id;
							return true;
						}
					}
				} catch {
					// If we can't check, assume it doesn't exist
				}

				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				// Log licensing notice once
				if (!licensingLogged) {
					console.warn(LICENSING_NOTICE);
					licensingLogged = true;
				}

				const webhookUrl = this.getNodeWebhookUrl('default') as string;
				const events = this.getNodeParameter('events') as string[];
				const webhookData = this.getWorkflowStaticData('node');

				const body: IDataObject = {
					url: webhookUrl,
					events,
				};

				try {
					const response = await housecallProApiRequest.call(
						this,
						'POST',
						'/webhooks',
						body,
					);

					const data = (response.data || response) as IDataObject;

					if (data.id) {
						webhookData.webhookId = data.id;
						return true;
					}
				} catch (error) {
					throw new Error(
						`Could not create Housecall Pro webhook: ${(error as Error).message}`,
					);
				}

				return false;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');

				if (webhookData.webhookId) {
					try {
						await housecallProApiRequest.call(
							this,
							'DELETE',
							`/webhooks/${webhookData.webhookId}`,
						);
					} catch (error) {
						// Log error but don't fail - webhook might already be deleted
						console.warn(
							`Failed to delete Housecall Pro webhook: ${(error as Error).message}`,
						);
					}

					delete webhookData.webhookId;
				}

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// Log licensing notice once
		if (!licensingLogged) {
			console.warn(LICENSING_NOTICE);
			licensingLogged = true;
		}

		const req = this.getRequestObject();
		const body = this.getBodyData() as IDataObject;

		// Get configured events
		const events = this.getNodeParameter('events') as string[];

		// Check if this event matches our configured events
		const eventType = body.event as string;
		if (eventType && events.length > 0 && !events.includes(eventType)) {
			// Event doesn't match, ignore
			return {
				noWebhookResponse: true,
			};
		}

		// Add metadata
		const returnData: IDataObject = {
			...body,
			_webhookReceivedAt: new Date().toISOString(),
			_headers: req.headers,
		};

		return {
			workflowData: [this.helpers.returnJsonArray([returnData])],
		};
	}
}
