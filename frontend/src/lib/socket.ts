import { io, Socket } from 'socket.io-client';

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(baseURL: string = import.meta.env.VITE_API_URL || 'https://api.workflowguard.pro'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.socket?.connected) {
          resolve();
          return;
        }

        this.socket = io(baseURL, {
          transports: ['websocket'],
          withCredentials: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
        });

        this.socket.on('connect', () => {
          console.log('Socket connected successfully');
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          this.reconnectAttempts++;
          if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            reject(new Error('Maximum reconnection attempts reached'));
          }
        });

        this.socket.on('error', (error) => {
          console.error('Socket error:', error);
        });

        this.socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

      } catch (error) {
        console.error('Error initializing socket:', error);
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  subscribe<T>(event: string, callback: (data: T) => void): () => void {
    if (!this.socket) {
      throw new Error('Socket not connected');
    }

    const listeners = this.listeners.get(event) || [];
    listeners.push(callback);
    this.listeners.set(event, listeners);

    this.socket.on(event, callback);

    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
        const listeners = this.listeners.get(event) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
          if (listeners.length === 0) {
            this.listeners.delete(event);
          } else {
            this.listeners.set(event, listeners);
          }
        }
      }
    };
  }

  emit<T>(event: string, data?: T): void {
    if (!this.socket?.connected) {
      throw new Error('Socket not connected');
    }
    this.socket.emit(event, data);
  }

  isConnected(): boolean {
    return !!this.socket?.connected;
  }
}

export const socketService = SocketService.getInstance();
export default socketService;
