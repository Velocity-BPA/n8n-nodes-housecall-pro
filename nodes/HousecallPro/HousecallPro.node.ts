/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';

import { RESOURCES } from './constants/constants';

// Customer
import {
	customerOperations,
	customerFields,
	executeCustomerOperation,
} from './actions/customer';

// Job
import {
	jobOperations,
	jobFields,
	executeJobOperation,
} from './actions/job';

// Estimate
import {
	estimateOperations,
	estimateFields,
	executeEstimateOperation,
} from './actions/estimate';

// Invoice
import {
	invoiceOperations,
	invoiceFields,
	executeInvoiceOperation,
} from './actions/invoice';

// Employee
import {
	employeeOperations,
	employeeFields,
	executeEmployeeOperation,
} from './actions/employee';

// Schedule
import {
	scheduleOperations,
	scheduleFields,
	executeScheduleOperation,
} from './actions/schedule';

// Payment
import {
	paymentOperations,
	paymentFields,
	executePaymentOperation,
} from './actions/payment';

// Lead
import {
	leadOperations,
	leadFields,
	executeLeadOperation,
} from './actions/lead';

// Price Book
import {
	priceBookOperations,
	priceBookFields,
	executePriceBookOperation,
} from './actions/priceBook';

// Webhook
import {
	webhookOperations,
	webhookFields,
	executeWebhookOperation,
} from './actions/webhook';

// Log licensing notice once on load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]
This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingLogged = false;

export class HousecallPro implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Housecall Pro',
		name: 'housecallPro',
		icon: 'file:housecallpro.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with Housecall Pro API for field service management',
		defaults: {
			name: 'Housecall Pro',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'housecallProApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: RESOURCES.map((r) => ({ name: r.name, value: r.value })),
				default: 'customer',
			},
			// Operations
			...customerOperations,
			...jobOperations,
			...estimateOperations,
			...invoiceOperations,
			...employeeOperations,
			...scheduleOperations,
			...paymentOperations,
			...leadOperations,
			...priceBookOperations,
			...webhookOperations,
			// Fields
			...customerFields,
			...jobFields,
			...estimateFields,
			...invoiceFields,
			...employeeFields,
			...scheduleFields,
			...paymentFields,
			...leadFields,
			...priceBookFields,
			...webhookFields,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Log licensing notice once per node load
		if (!licensingLogged) {
			console.warn(LICENSING_NOTICE);
			licensingLogged = true;
		}

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				switch (resource) {
					case 'customer':
						responseData = await executeCustomerOperation.call(this, operation, i);
						break;
					case 'job':
						responseData = await executeJobOperation.call(this, operation, i);
						break;
					case 'estimate':
						responseData = await executeEstimateOperation.call(this, operation, i);
						break;
					case 'invoice':
						responseData = await executeInvoiceOperation.call(this, operation, i);
						break;
					case 'employee':
						responseData = await executeEmployeeOperation.call(this, operation, i);
						break;
					case 'schedule':
						responseData = await executeScheduleOperation.call(this, operation, i);
						break;
					case 'payment':
						responseData = await executePaymentOperation.call(this, operation, i);
						break;
					case 'lead':
						responseData = await executeLeadOperation.call(this, operation, i);
						break;
					case 'priceBook':
						responseData = await executePriceBookOperation.call(this, operation, i);
						break;
					case 'webhook':
						responseData = await executeWebhookOperation.call(this, operation, i);
						break;
					default:
						throw new Error(`Unknown resource: ${resource}`);
				}

				const executionData = this.helpers.constructExecutionMetaData(
					this.helpers.returnJsonArray(responseData),
					{ itemData: { item: i } },
				);

				returnData.push(...executionData);
			} catch (error) {
				if (this.continueOnFail()) {
					const executionErrorData = this.helpers.constructExecutionMetaData(
						this.helpers.returnJsonArray({ error: (error as Error).message }),
						{ itemData: { item: i } },
					);
					returnData.push(...executionErrorData);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
