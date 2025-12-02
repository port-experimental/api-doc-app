# Port API Documentation App

A secure, embeddable iFrame-based application that displays interactive API documentation for Port. Built with Next.js and Redoc.

## Features

- **Interactive API Documentation** - Powered by Redoc for a clean, developer-friendly experience
- **Organized by API Kind** - Browse APIs by category (Entities, Blueprints, Scorecards, etc.)
- **Search Functionality** - Quickly find endpoints across all APIs
- **iFrame Ready** - Designed to be embedded inside Port
- **Secure Authentication** - Token management with automatic rotation
- **Dark Theme** - Modern dark UI that integrates seamlessly with Port

## Architecture

```
/api-doc-app/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main docs page with Redoc
│   │   ├── layout.tsx          # Root layout with iFrame compatibility
│   │   └── api/                # API Routes
│   │       ├── auth/           # Authentication endpoints
│   │       ├── port/           # Port API proxy endpoints
│   │       └── health/         # Health check endpoint
│   ├── services/               # Business logic
│   │   ├── tokenManager.ts     # Token rotation & management
│   │   └── portService.ts      # Port API integration
│   ├── components/             # React components
│   │   ├── ApiDocViewer.tsx    # Redoc wrapper
│   │   ├── Sidebar.tsx         # Navigation
│   │   └── LoadingState.tsx    # Loading/error states
│   └── lib/                    # Utilities
│       ├── config.ts           # Environment configuration
│       └── schemaParser.ts     # OpenAPI schema utilities
├── Dockerfile                  # Production container
├── docker-compose.yml          # Container orchestration
└── .env.example                # Environment template
```

## Quick Start

### Prerequisites

- Node.js 18+ or Docker
- Port API credentials (Client ID & Secret)

### Local Development

1. **Clone and install dependencies:**

```bash
git clone <repository-url>
cd api-doc-app
npm install
```

2. **Configure environment:**

```bash
cp .env.example .env.local
# Edit .env.local with your Port credentials
```

3. **Start development server:**

```bash
npm run dev
```

4. **Open browser:**

Navigate to [http://localhost:3000](http://localhost:3000)

### Docker Deployment

1. **Build the image:**

```bash
docker build -t port-api-docs .
```

2. **Run with Docker Compose:**

```bash
# Set environment variables
export PORT_CLIENT_ID=your_client_id
export PORT_CLIENT_SECRET=your_client_secret

docker-compose up -d
```

## Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT_CLIENT_ID` | Yes* | - | Port API client ID |
| `PORT_CLIENT_SECRET` | Yes* | - | Port API client secret |
| `PORT_API_TOKEN` | Yes* | - | Alternative: Direct API token |
| `PORT_API_REGION` | No | `us` | Port region: `us`, `eu`, `us-api`, `eu-api` |
| `ALLOWED_IFRAME_ORIGINS` | No | `https://app.getport.io` | Comma-separated allowed iframe origins |
| `OPENAPI_SOURCES` | No | - | JSON array of blueprint sources (see below) |
| `OPENAPI_BLUEPRINT_ID` | No | `service` | Legacy: Single blueprint ID to fetch specs from |
| `OPENAPI_SPEC_URL_PROPERTY` | No | `openapi_spec_url` | Legacy: Property name containing OpenAPI spec URL |

*Either Client ID/Secret OR API Token is required.

### Multi-Blueprint Configuration

You can fetch OpenAPI specs from multiple blueprints by setting the `OPENAPI_SOURCES` environment variable with a JSON array:

```bash
OPENAPI_SOURCES='[
  {"blueprintId": "service", "property": "openapi_spec_url", "label": "Services"},
  {"blueprintId": "microservice", "property": "swagger_url", "label": "Microservices"},
  {"blueprintId": "api", "property": "spec_url", "label": "External APIs"}
]'
```

Each source object requires:
- `blueprintId` - The Port blueprint identifier
- `property` - The property name on entities that contains the OpenAPI spec URL
- `label` (optional) - Display name in the sidebar (defaults to blueprintId)

The sidebar will display APIs grouped by their source label with collapsible sections.

**Backwards Compatibility:** If `OPENAPI_SOURCES` is not set, the app falls back to the legacy single-blueprint configuration using `OPENAPI_BLUEPRINT_ID` and `OPENAPI_SPEC_URL_PROPERTY`.

### Getting Port Credentials

1. Log in to Port (https://app.getport.io)
2. Go to Settings → Credentials
3. Copy your Client ID and Client Secret

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/auth/status` | GET | Token status |
| `/api/auth/validate` | POST | Validate token |
| `/api/port/schemas` | GET | Fetch OpenAPI schema |

### Schema Endpoint Query Parameters

- `?navigation=true` - Include parsed navigation data
- `?stats=true` - Include endpoint statistics
- `?kinds=Entities,Blueprints` - Filter by API kinds
- `?refresh=true` - Force cache refresh

## Embedding in Port

### iFrame Widget Configuration

1. In Port, create a new page or widget
2. Add an iFrame widget with URL pointing to your deployed app
3. The app will automatically resize to fit the container

### Security Considerations

- The app validates iframe origins using CSP `frame-ancestors`
- Configure `ALLOWED_IFRAME_ORIGINS` to match your Port domain
- All API communication is authenticated
- No sensitive data is stored client-side

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Project Structure

- **Services** - Business logic following [port-pr-chart](https://github.com/port-experimental/port-pr-chart) patterns
- **Components** - React components with TypeScript
- **API Routes** - Next.js API routes for backend functionality
- **Lib** - Shared utilities and configuration

## Troubleshooting

### Token Errors

If you see authentication errors:
1. Verify your credentials in `.env.local`
2. Check token status at `/api/auth/status`
3. Ensure your Port credentials have API access

### iFrame Issues

If the app doesn't load in Port's iFrame:
1. Check browser console for CSP errors
2. Verify `ALLOWED_IFRAME_ORIGINS` includes your Port domain
3. Ensure the app URL uses HTTPS in production

### Schema Not Loading

If the OpenAPI schema fails to load:
1. Check network connectivity to Port API
2. Verify the health endpoint: `/api/health`
3. Try refreshing with `/api/port/schemas?refresh=true`

## License

MIT License - See LICENSE file for details.

## Support

For issues related to:
- **This app**: Open a GitHub issue
- **Port platform**: Contact Port support at support@getport.io
- **Redoc rendering**: See [Redoc documentation](https://redocly.com/docs/redoc/)
