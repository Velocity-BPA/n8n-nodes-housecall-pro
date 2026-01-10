/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class HousecallProApi implements ICredentialType {
	name = 'housecallProApi';
	displayName = 'Housecall Pro API';
	documentationUrl = 'https://docs.housecallpro.com/docs/api-overview';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'API Key from Housecall Pro dashboard (App Store → API app → Generate API Key). Requires MAX plan.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Token {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.housecallpro.com/v1',
			url: '/customers',
			qs: {
				'page[size]': 1,
			},
		},
	};
}
