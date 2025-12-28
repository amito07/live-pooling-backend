# Live Polling Application

A high-performance, real-time polling system built with NestJS microservices architecture. This application handles thousands of concurrent votes efficiently using event-driven patterns, message queuing, and WebSocket broadcasting.

## 🏗️ Architecture Overview

This application follows a **microservices architecture** with three distinct services:

### Services

1. **Voting API** (`apps/voting-api`)
   - REST API endpoint for casting votes
   - Idempotency validation using Redis
   - Vote event emission to Kafka message queue
   - Prevents duplicate voting with TTL-based locks

2. **Poll Aggregator** (`apps/poll-aggregator`)
   - Kafka consumer that processes vote events
   - Vote buffering and batch processing (flushes every 2 seconds)
   - Atomic vote count updates in PostgreSQL
   - Emits aggregated poll updates to downstream services

3. **Realtime Service** (`apps/realtime-service`)
   - WebSocket gateway for real-time updates
   - Consumes poll update events from Kafka
   - Broadcasts live poll statistics to connected clients
   - CORS-enabled for frontend integration

### Data Flow

```
User Vote Request
    ↓
Voting API (Idempotency Check via Redis)
    ↓
Kafka Topic: 'raw-votes'
    ↓
Poll Aggregator (Batch Processing)
    ↓
PostgreSQL (Atomic Increment)
    ↓
Kafka Topic: 'poll-updates'
    ↓
Realtime Service (WebSocket Gateway)
    ↓
Connected Clients (Live Updates)
```

## 🛠️ Technology Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.7
- **Database**: PostgreSQL 15 (via Prisma ORM)
- **Cache**: Redis (Alpine)
- **Message Queue**: Apache Kafka 7.5 (KRaft mode)
- **WebSockets**: Socket.io 4.8
- **Container**: Docker Compose

### Key Dependencies

- `@nestjs/microservices` - Microservices communication
- `@nestjs/websockets` - WebSocket support
- `@prisma/client` - Type-safe database client
- `kafkajs` - Kafka client for Node.js
- `ioredis` - Redis client
- `socket.io` - Real-time bidirectional communication

## 📊 Database Schema

```prisma
model Poll {
  id        String   @id @default(uuid())
  question  String
  options   Option[]
  createdAt DateTime @default(now())
}

model Option {
  id     String @id @default(uuid())
  text   String
  pollId String
  poll   Poll   @relation(fields: [pollId], references: [id])
  votes  Int    @default(0)
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd live-pooling-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d
   ```
   This starts:
   - PostgreSQL on `localhost:5432`
   - Redis on `localhost:6379`
   - Kafka on `localhost:9092`

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Running the Application

#### Development Mode

Each service can be started independently:

```bash
# Start all services in watch mode
npm run start:dev

# Or start individual services
nest start voting-api --watch
nest start poll-aggregator --watch
nest start realtime-service --watch
```

#### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

## 📡 API Endpoints

### Voting API

**POST** `/vote`

Cast a vote for a poll option.

**Request Body:**
```json
{
  "pollId": "uuid",
  "optionId": "uuid",
  "userId": "string"
}
```

**Response:**
```json
{
  "status": "Vote queued"
}
```

**Error Responses:**
- `400 Bad Request` - User has already voted for this poll

### WebSocket Events

**Connect to WebSocket**
```javascript
const socket = io('http://localhost:3000');
```

**Listen for poll updates**
```javascript
socket.on('poll-stats', (data) => {
  console.log('Poll Update:', data);
  // data: { optionId, pollId, newCount }
});
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://admin:password@localhost:5432/polling_db"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka
KAFKA_BROKER=localhost:9092

# Service Ports
VOTING_API_PORT=3001
POLL_AGGREGATOR_PORT=3002
REALTIME_SERVICE_PORT=3003
```

### Docker Compose Services

- **Kafka**: Message broker with KRaft consensus (no Zookeeper required)
- **PostgreSQL**: Primary data store
- **Redis**: Idempotency cache and session storage

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov

# Watch mode
npm run test:watch
```

## 📈 Performance Features

### Vote Batching
- Votes are buffered in-memory
- Batch writes to database every 2 seconds
- Reduces database load by 100-1000x

### Idempotency
- Redis-based duplicate vote prevention
- 1-hour TTL on vote locks
- Prevents double-counting

### Atomic Operations
- PostgreSQL atomic increment operations
- Ensures vote count accuracy under high concurrency

### Event-Driven Architecture
- Asynchronous processing via Kafka
- Decoupled services for scalability
- Each service can scale independently

## 🔍 Monitoring & Debugging

### Kafka Topics

Monitor Kafka topics:
```bash
# List topics
docker exec -it kafka kafka-topics --bootstrap-server localhost:9092 --list

# Monitor raw votes
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic raw-votes --from-beginning

# Monitor poll updates
docker exec -it kafka kafka-console-consumer --bootstrap-server localhost:9092 --topic poll-updates --from-beginning
```

### Database

```bash
# Open Prisma Studio
npx prisma studio
```

### Logs

Application logs are written to console. Key log messages:
- Vote received and queued
- Batch flush operations
- WebSocket client connections/disconnections
- Kafka connection status

## 🏋️ Load Testing

A stress test script is included: `stress-test.js`

```bash
node stress-test.js
```

## 📁 Project Structure

```
live-pooling-app/
├── apps/
│   ├── voting-api/           # Vote ingestion service
│   ├── poll-aggregator/      # Vote processing & aggregation
│   └── realtime-service/     # WebSocket broadcasting
├── libs/
│   └── prisma/               # Shared Prisma module
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── generated/
│   └── prisma/               # Generated Prisma Client
├── docker-compose.yml        # Infrastructure services
└── package.json
```

## 🔐 Security Considerations

- **Input Validation**: Validate all incoming vote data
- **Rate Limiting**: Consider implementing rate limiting on vote endpoints
- **CORS**: Configure CORS properly for production environments
- **Authentication**: Add user authentication for production use
- **SQL Injection**: Prisma provides protection against SQL injection
- **Environment Variables**: Never commit sensitive credentials

## 🚢 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Enable authentication/authorization
- [ ] Set up monitoring and logging (e.g., Datadog, New Relic)
- [ ] Configure database connection pooling
- [ ] Set up Redis cluster for high availability
- [ ] Deploy Kafka cluster (minimum 3 brokers)
- [ ] Configure health checks
- [ ] Set up auto-scaling policies
- [ ] Enable SSL/TLS for WebSocket connections

### Docker Deployment

```bash
# Build production images
docker build -t voting-api ./apps/voting-api
docker build -t poll-aggregator ./apps/poll-aggregator
docker build -t realtime-service ./apps/realtime-service

# Run with docker-compose (production config)
docker-compose -f docker-compose.prod.yml up -d
```

## 🛣️ Roadmap

- [ ] Add authentication & authorization
- [ ] Implement poll creation API
- [ ] Add poll expiration functionality
- [ ] Implement analytics dashboard
- [ ] Add result visualization
- [ ] Support for multiple choice polls
- [ ] Rate limiting per user/IP
- [ ] Admin panel for poll management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting

```bash
# Format code
npm run format

# Lint code
npm run lint
```

## 📄 License

This project is [UNLICENSED](LICENSE).

## 👥 Authors

Your name and team

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/)
- Database ORM by [Prisma](https://www.prisma.io/)
- Real-time communication via [Socket.io](https://socket.io/)
- Message queuing with [Apache Kafka](https://kafka.apache.org/)
