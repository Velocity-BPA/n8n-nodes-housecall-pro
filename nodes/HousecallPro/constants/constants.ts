/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export const HOUSECALL_PRO_API_BASE_URL = 'https://api.housecallpro.com/v1';

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 100;

export const JOB_STATUSES = [
	{ name: 'Scheduled', value: 'scheduled' },
	{ name: 'In Progress', value: 'in_progress' },
	{ name: 'Complete', value: 'complete' },
	{ name: 'Canceled', value: 'canceled' },
] as const;

export const JOB_TYPES = [
	{ name: 'Service', value: 'service' },
	{ name: 'Maintenance', value: 'maintenance' },
	{ name: 'Installation', value: 'installation' },
] as const;

export const ESTIMATE_STATUSES = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Sent', value: 'sent' },
	{ name: 'Approved', value: 'approved' },
	{ name: 'Declined', value: 'declined' },
] as const;

export const INVOICE_STATUSES = [
	{ name: 'Draft', value: 'draft' },
	{ name: 'Sent', value: 'sent' },
	{ name: 'Paid', value: 'paid' },
	{ name: 'Void', value: 'void' },
] as const;

export const EMPLOYEE_ROLES = [
	{ name: 'Admin', value: 'admin' },
	{ name: 'Office', value: 'office' },
	{ name: 'Field', value: 'field' },
] as const;

export const LEAD_STATUSES = [
	{ name: 'New', value: 'new' },
	{ name: 'Contacted', value: 'contacted' },
	{ name: 'Qualified', value: 'qualified' },
	{ name: 'Converted', value: 'converted' },
] as const;

export const PAYMENT_METHODS = [
	{ name: 'Cash', value: 'cash' },
	{ name: 'Check', value: 'check' },
	{ name: 'Card', value: 'card' },
] as const;

export const WEBHOOK_EVENTS = [
	{ name: 'Job Created', value: 'job.created' },
	{ name: 'Job Scheduled', value: 'job.scheduled' },
	{ name: 'Job Completed', value: 'job.completed' },
	{ name: 'Job Canceled', value: 'job.canceled' },
	{ name: 'Estimate Created', value: 'estimate.created' },
	{ name: 'Estimate Sent', value: 'estimate.sent' },
	{ name: 'Estimate Approved', value: 'estimate.approved' },
	{ name: 'Invoice Created', value: 'invoice.created' },
	{ name: 'Invoice Sent', value: 'invoice.sent' },
	{ name: 'Invoice Paid', value: 'invoice.paid' },
	{ name: 'Customer Created', value: 'customer.created' },
	{ name: 'Customer Updated', value: 'customer.updated' },
	{ name: 'Payment Created', value: 'payment.created' },
] as const;

export const RESOURCES = [
	{ name: 'Customer', value: 'customer' },
	{ name: 'Job', value: 'job' },
	{ name: 'Estimate', value: 'estimate' },
	{ name: 'Invoice', value: 'invoice' },
	{ name: 'Employee', value: 'employee' },
	{ name: 'Schedule', value: 'schedule' },
	{ name: 'Payment', value: 'payment' },
	{ name: 'Lead', value: 'lead' },
	{ name: 'Price Book', value: 'priceBook' },
	{ name: 'Webhook', value: 'webhook' },
] as const;
