export declare class RealtimeService {
    sendNotification(userId: string, message: string): Promise<void>;
    broadcastToAdmins(message: string): Promise<void>;
}
