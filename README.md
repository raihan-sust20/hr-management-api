# HR Management API

A RESTful API for HR Management System built with TypeScript, Express.js, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Query Builder**: Knex.js
- **Dependency Injection**: TSyringe
- **Validation**: Joi
- **Authentication**: JWT
- **File Upload**: Multer
- **Logging**: Winston
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI 3.0
- **Code Quality**: ESLint + Prettier

## Project Structure

```
hr-api/
├── src/
│   ├── config/              # Configuration files
│   ├── common/              # Shared utilities
│   │   ├── types/          # TypeScript types
│   │   ├── middlewares/    # Global middlewares
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Application constants
│   ├── modules/            # Feature modules
│   ├── database/           # Database migrations and seeds
│   ├── uploads/            # File uploads storage
│   ├── app.ts             # Express app setup
│   └── server.ts          # Server entry point
├── tests/                  # Test files
├── docker-compose.yml      # Docker configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 18
- npm >= 9.0.0

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration

5. Run database migrations:
   ```bash
   npm run migrate:latest
   ```

### Running the Application

#### Development Mode
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

#### Using Docker
```bash
docker-compose up -d
```

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting errors
- `npm run format` - Format code with Prettier
- `npm run migrate:make` - Create new migration
- `npm run migrate:latest` - Run migrations
- `npm run migrate:rollback` - Rollback last migration
- `npm run seed:make` - Create new seed
- `npm run seed:run` - Run seeds

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check server health status

## Environment Variables

See `.env.example` for all available environment variables.

## Architecture

This project follows a modular architecture with clear separation of concerns:

### SOLID Principles
- **Single Responsibility**: Each class has one responsibility
- **Open/Closed**: Open for extension, closed for modification
- **Liskov Substitution**: Subtypes are substitutable
- **Interface Segregation**: Specific interfaces over general ones
- **Dependency Inversion**: Depend on abstractions, not concretions

### Layers
1. **Controller**: Handles HTTP requests/responses
2. **Service**: Contains business logic
3. **Repository**: Handles data access
4. **Middleware**: Request/response processing
5. **Validation**: Input validation with Joi

## Testing

Run tests with:
```bash
npm test
```

## License

MIT
