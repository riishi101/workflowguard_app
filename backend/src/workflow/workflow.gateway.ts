import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface WorkflowUpdate {
  id: string;
  name: string;
  status: string;
  lastModified: string;
  [key: string]: any;
}

interface WorkflowVersion {
  id: string;
  workflowId: string;
  versionNumber: number;
  snapshotType: string;
  createdBy: string;
  createdAt: string;
  data: Record<string, any>;
}

@WebSocketGateway({
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = [
        'https://www.workflowguard.pro',
        'https://workflowguard.pro',
        'http://localhost:5173',
        'http://localhost:3000'
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  path: '/socket.io/',
  serveClient: false,
  transports: ['websocket', 'polling'],
  namespace: '/',
  cookie: {
    name: 'io',
    httpOnly: true,
    path: '/',
    sameSite: 'strict',
  },
})
export class WorkflowGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WorkflowGateway.name);
  private readonly connectedClients = new Map<string, Socket>();

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      // Validate token from handshake auth
      const token = client.handshake?.auth?.token;
      if (!token) {
        throw new UnauthorizedException('No authentication token provided');
      }

      try {
        await this.jwtService.verifyAsync(token);
      } catch (error) {
        throw new UnauthorizedException('Invalid authentication token');
      }

      this.connectedClients.set(client.id, client);
      this.logger.log(`Client connected: ${client.id}`);
      
      // Send initial connection status
      client.emit('connection:status', { 
        status: 'connected',
        clientId: client.id,
        timestamp: new Date().toISOString()
      });

      // Set up heartbeat
      const heartbeatInterval = setInterval(() => {
        if (client.connected) {
          client.emit('heartbeat', { timestamp: new Date().toISOString() });
        } else {
          clearInterval(heartbeatInterval);
        }
      }, 30000); // 30 seconds

      // Clean up on disconnect
      client.on('disconnect', () => {
        clearInterval(heartbeatInterval);
      });

    } catch (error) {
      this.logger.error(`Error in handleConnection: ${error.message}`, error.stack);
      client.emit('connection:error', { 
        message: 'Failed to establish connection',
        timestamp: new Date().toISOString()
      });
    }
  }

  handleDisconnect(client: Socket) {
    try {
      this.connectedClients.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id}`);
      
      // Notify client about disconnect
      client.emit('connection:status', {
        status: 'disconnected',
        clientId: client.id,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      this.logger.error(`Error in handleDisconnect: ${error.message}`, error.stack);
    }
  }

  emitWorkflowUpdate(workflow: WorkflowUpdate) {
    try {
      this.logger.debug(`Emitting workflow update: ${workflow.id}`);
      this.server.emit('workflow:update', {
        ...workflow,
        timestamp: new Date().toISOString(),
        type: 'update'
      });
    } catch (error) {
      this.logger.error(`Error emitting workflow update: ${error.message}`, error.stack);
    }
  }

  emitWorkflowVersion(workflowId: string, version: Partial<WorkflowVersion>) {
    try {
      this.logger.debug(`Emitting workflow version: ${workflowId}`);
      
      // Transform version data to match expected structure
      const transformedVersion = {
        id: version.id,
        workflowId: version.workflowId,
        versionNumber: version.versionNumber || 1,
        snapshotType: version.snapshotType || 'manual',
        createdBy: version.createdBy || 'system',
        createdAt: version.createdAt || new Date().toISOString(),
        data: version.data || {},
      };

      this.server.emit('workflow:version', {
        workflowId,
        version: transformedVersion,
        timestamp: new Date().toISOString(),
        type: 'version'
      });
    } catch (error) {
      this.logger.error(`Error emitting workflow version: ${error.message}`, error.stack);
    }
  }

  // Handle errors
  handleError(client: any, error: any) {
    this.logger.error(`WebSocket error: ${error.message}`, error.stack);
    client.emit('error', {
      message: 'An error occurred in the WebSocket connection',
      timestamp: new Date().toISOString()
    });
  }
}
