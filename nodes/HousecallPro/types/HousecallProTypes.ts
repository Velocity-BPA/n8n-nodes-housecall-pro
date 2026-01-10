/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

// Resource types
export type HousecallProResource =
	| 'customer'
	| 'job'
	| 'estimate'
	| 'invoice'
	| 'employee'
	| 'schedule'
	| 'payment'
	| 'lead'
	| 'priceBook'
	| 'webhook';

// Customer types
export interface ICustomer {
	id?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	phone_number?: string;
	company?: string;
	address?: IAddress;
	notes?: string;
	tags?: string[];
	properties?: IProperty[];
	created_at?: string;
	updated_at?: string;
}

export interface IProperty {
	id?: string;
	customer_id?: string;
	street?: string;
	street_line_2?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	notes?: string;
}

export interface IAddress {
	street?: string;
	street_line_2?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
}

// Job types
export type JobStatus = 'scheduled' | 'in_progress' | 'complete' | 'canceled';
export type JobType = 'service' | 'maintenance' | 'installation';

export interface IJob {
	id?: string;
	customer_id?: string;
	scheduled_start?: string;
	scheduled_end?: string;
	assigned_employee_ids?: string[];
	work_status?: JobStatus;
	job_type?: JobType;
	description?: string;
	address_id?: string;
	tags?: string[];
	line_items?: ILineItem[];
	total?: string;
	created_at?: string;
	updated_at?: string;
}

export interface ILineItem {
	id?: string;
	name?: string;
	description?: string;
	quantity?: number;
	unit_price?: string;
	total?: string;
	taxable?: boolean;
}

// Estimate types
export type EstimateStatus = 'draft' | 'sent' | 'approved' | 'declined';

export interface IEstimate {
	id?: string;
	customer_id?: string;
	sent_at?: string;
	viewed_at?: string;
	status?: EstimateStatus;
	total?: string;
	expiration_date?: string;
	line_items?: ILineItem[];
	created_at?: string;
	updated_at?: string;
}

// Invoice types
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'void';

export interface IInvoice {
	id?: string;
	customer_id?: string;
	job_id?: string;
	due_date?: string;
	status?: InvoiceStatus;
	total?: string;
	balance_due?: string;
	sent_at?: string;
	line_items?: ILineItem[];
	created_at?: string;
	updated_at?: string;
}

// Employee types
export type EmployeeRole = 'admin' | 'office' | 'field';

export interface IEmployee {
	id?: string;
	first_name?: string;
	last_name?: string;
	email?: string;
	mobile_phone?: string;
	role?: EmployeeRole;
	color?: string;
	hourly_rate?: string;
	active?: boolean;
	created_at?: string;
	updated_at?: string;
}

// Schedule types
export interface IAppointment {
	id?: string;
	job_id?: string;
	employee_ids?: string[];
	start_time?: string;
	end_time?: string;
	duration?: number;
	notes?: string;
}

export interface ITimeOff {
	id?: string;
	employee_id?: string;
	start_date?: string;
	end_date?: string;
	reason?: string;
	approved?: boolean;
}

export interface IAvailabilitySlot {
	start_time?: string;
	end_time?: string;
	employee_ids?: string[];
}

// Payment types
export type PaymentMethod = 'cash' | 'check' | 'card';

export interface IPayment {
	id?: string;
	invoice_id?: string;
	amount?: string;
	payment_method?: PaymentMethod;
	received_at?: string;
	note?: string;
	created_at?: string;
}

// Lead types
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted';

export interface ILead {
	id?: string;
	first_name?: string;
	last_name?: string;
	phone_number?: string;
	email?: string;
	source?: string;
	status?: LeadStatus;
	notes?: string;
	created_at?: string;
	updated_at?: string;
}

// Price Book types
export interface IPriceBookItem {
	id?: string;
	name?: string;
	description?: string;
	unit_price?: string;
	unit_cost?: string;
	category_id?: string;
	taxable?: boolean;
	sku?: string;
	active?: boolean;
}

export interface IPriceBookCategory {
	id?: string;
	name?: string;
	description?: string;
}

// Webhook types
export type WebhookEvent =
	| 'job.created'
	| 'job.scheduled'
	| 'job.completed'
	| 'job.canceled'
	| 'estimate.created'
	| 'estimate.sent'
	| 'estimate.approved'
	| 'invoice.created'
	| 'invoice.sent'
	| 'invoice.paid'
	| 'customer.created'
	| 'customer.updated'
	| 'payment.created';

export interface IWebhook {
	id?: string;
	url?: string;
	events?: WebhookEvent[];
	active?: boolean;
	created_at?: string;
}

// API Response types
export interface IHousecallProResponse<T> {
	data: T;
	meta?: {
		next_cursor?: string;
		has_more?: boolean;
		total_count?: number;
	};
}

export interface IHousecallProError {
	errors: Array<{
		code: string;
		message: string;
		field?: string;
	}>;
}

// Operation types
export interface IPaginationOptions {
	cursor?: string;
	pageSize?: number;
	returnAll?: boolean;
}

export interface IDateRangeOptions {
	startDate?: string;
	endDate?: string;
}
