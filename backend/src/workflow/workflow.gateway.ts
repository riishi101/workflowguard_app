import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: (origin) => {
      if (!origin) return true;
      const allowedOrigins = [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://www.workflowguard.pro',
        'https://workflowguard.pro',
        process.env.FRONTEND_URL,
      ].filter(Boolean);
      
      return allowedOrigins.includes(origin) || 
             origin.match(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/) ||
             origin.match(/^https:\/\/(www\.)?workflowguard\.pro$/);
    },
    credentials: true,
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
export class WorkflowGateway {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WorkflowGateway.name);

  handleConnection(client: any) {
    try {
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

  handleDisconnect(client: any) {
    try {
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

  emitWorkflowUpdate(workflow: any) {
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

  emitWorkflowVersion(workflowId: string, version: any) {
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
