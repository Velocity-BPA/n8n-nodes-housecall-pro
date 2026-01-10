# n8n-nodes-housecall-pro

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for **Housecall Pro**, the #1 rated field service management software for home service businesses. This node enables workflow automation for job management, scheduling, invoicing, customer management, and payment processing.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## Features

- **10 Resource Categories** with comprehensive operations
- **60+ Operations** covering all major Housecall Pro functions
- **Cursor-based Pagination** for handling large datasets
- **Webhook Trigger Node** for real-time event handling
- **Multi-property Customer Support** for complex customer management
- **Complete Job Lifecycle Management** from creation to completion
- **Invoice & Payment Processing** with refund support
- **Employee Scheduling** with availability management

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings > Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-housecall-pro`
5. Click **Install**
6. Restart n8n

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Install the package
npm install n8n-nodes-housecall-pro

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-housecall-pro.git
cd n8n-nodes-housecall-pro

# Install dependencies
npm install

# Build the project
npm run build

# Link to n8n custom directory
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-housecall-pro

# Restart n8n
```

## Credentials Setup

| Field | Description |
|-------|-------------|
| API Key | Your Housecall Pro API key from the dashboard |

### Getting Your API Key

1. Log in to your Housecall Pro account
2. Navigate to **App Store → API app**
3. Click **Generate API Key**
4. Copy the generated key

> **Note:** API access requires a Housecall Pro MAX plan subscription.

## Resources & Operations

### Customers

| Operation | Description |
|-----------|-------------|
| Create | Create a new customer |
| Get | Get customer by ID |
| Get Many | List all customers with pagination |
| Update | Update customer details |
| Delete | Remove a customer |
| Search | Search by name, email, or phone |
| Get Properties | List customer's properties |
| Create Property | Add a property to customer |

### Jobs

| Operation | Description |
|-----------|-------------|
| Create | Create a new job |
| Get | Get job by ID |
| Get Many | List all jobs with filters |
| Update | Update job details |
| Delete | Remove a job |
| Get Line Items | List job line items |
| Add Line Item | Add item to job |
| Complete | Mark job as complete |
| Cancel | Cancel a job |
| Dispatch | Dispatch to technician |

### Estimates

| Operation | Description |
|-----------|-------------|
| Create | Create a new estimate |
| Get | Get estimate by ID |
| Get Many | List all estimates |
| Update | Update estimate details |
| Delete | Remove an estimate |
| Get Line Items | List estimate items |
| Add Line Item | Add item to estimate |
| Convert to Job | Convert estimate to job |
| Send | Email estimate to customer |

### Invoices

| Operation | Description |
|-----------|-------------|
| Create | Create a new invoice |
| Get | Get invoice by ID |
| Get Many | List all invoices |
| Update | Update invoice details |
| Delete | Remove an invoice |
| Send | Email invoice to customer |
| Record Payment | Record payment received |
| Void | Void an invoice |

### Employees

| Operation | Description |
|-----------|-------------|
| Create | Add a new employee |
| Get | Get employee by ID |
| Get Many | List all employees |
| Update | Update employee details |
| Deactivate | Deactivate an employee |
| Get Schedule | Get employee schedule |
| Get Jobs | Get assigned jobs |

### Schedule

| Operation | Description |
|-----------|-------------|
| Get | Get schedule for date range |
| Create Appointment | Schedule an appointment |
| Update Appointment | Modify an appointment |
| Delete Appointment | Remove an appointment |
| Get Availability | Check available slots |
| Get Time Off | Get time off entries |
| Create Time Off | Schedule time off |

### Payments

| Operation | Description |
|-----------|-------------|
| Create | Record a new payment |
| Get | Get payment by ID |
| Get Many | List all payments |
| Get by Invoice | Get payments for an invoice |
| Refund | Process a refund |

### Leads

| Operation | Description |
|-----------|-------------|
| Create | Create a new lead |
| Get | Get lead by ID |
| Get Many | List all leads |
| Update | Update lead details |
| Delete | Remove a lead |
| Convert | Convert lead to customer |

### Price Book

| Operation | Description |
|-----------|-------------|
| Get Items | List price book items |
| Get Item | Get item by ID |
| Create Item | Add a new item |
| Update Item | Update an item |
| Delete Item | Remove an item |
| Get Categories | List categories |

### Webhooks

| Operation | Description |
|-----------|-------------|
| Create | Register a new webhook |
| Get Many | List all webhooks |
| Delete | Remove a webhook |
| Test | Test webhook delivery |

## Trigger Node

The **Housecall Pro Trigger** node starts workflows when events occur in Housecall Pro.

### Available Events

- `job.created` - New job created
- `job.scheduled` - Job scheduled
- `job.completed` - Job completed
- `job.canceled` - Job canceled
- `estimate.created` - New estimate created
- `estimate.sent` - Estimate sent
- `estimate.approved` - Estimate approved
- `invoice.created` - New invoice created
- `invoice.sent` - Invoice sent
- `invoice.paid` - Invoice paid
- `customer.created` - New customer created
- `customer.updated` - Customer updated
- `payment.created` - Payment received

## Usage Examples

### Create a Customer

```javascript
// Node: Housecall Pro
// Resource: Customer
// Operation: Create

{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "phoneNumber": "+15551234567",
  "address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip": "78701"
  }
}
```

### Schedule a Job

```javascript
// Node: Housecall Pro
// Resource: Job
// Operation: Create

{
  "customerId": "cus_abc123",
  "scheduledStart": "2024-01-15T09:00:00Z",
  "scheduledEnd": "2024-01-15T11:00:00Z",
  "jobType": "service",
  "description": "HVAC annual maintenance"
}
```

### Create and Send an Invoice

```javascript
// Workflow:
// 1. Create Invoice
// 2. Add Line Items
// 3. Send Invoice

// Step 1: Create Invoice
// Resource: Invoice, Operation: Create
{
  "customerId": "cus_abc123",
  "jobId": "job_xyz789"
}

// Step 2: Add Line Item
// Resource: Invoice, Operation: Add Line Item
{
  "invoiceId": "inv_123",
  "name": "Labor",
  "quantity": 2,
  "unitPrice": 75.00
}

// Step 3: Send Invoice
// Resource: Invoice, Operation: Send
{
  "invoiceId": "inv_123"
}
```

## API Information

- **Base URL:** `https://api.housecallpro.com/v1`
- **Authentication:** Bearer Token with "Token" prefix
- **Pagination:** Cursor-based with max 100 items per page
- **Date Format:** ISO 8601
- **Money Format:** Decimal strings (e.g., "99.99")

## Error Handling

The node handles common Housecall Pro API errors:

| Status | Description |
|--------|-------------|
| 400 | Bad request - Invalid parameters |
| 401 | Unauthorized - Invalid API key |
| 403 | Forbidden - Requires MAX plan |
| 404 | Not found - Resource doesn't exist |
| 422 | Validation error - Check input data |
| 429 | Rate limited - Too many requests |

## Security Best Practices

1. **Store API keys securely** using n8n credentials
2. **Use HTTPS** for all webhook endpoints
3. **Validate webhook signatures** when processing events
4. **Limit API key permissions** to required operations only
5. **Rotate API keys** periodically

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use

Permitted for personal, educational, research, and internal business use.

### Commercial Use

Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## Support

- **Documentation:** [Housecall Pro API Docs](https://developer.housecallpro.com)
- **Issues:** [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-housecall-pro/issues)
- **Email:** support@velobpa.com

## Acknowledgments

- [Housecall Pro](https://www.housecallpro.com) for their comprehensive API
- [n8n](https://n8n.io) for the workflow automation platform
- The n8n community for their excellent node development resources
