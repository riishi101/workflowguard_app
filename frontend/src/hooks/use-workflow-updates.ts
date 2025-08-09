import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '@/lib/config';

export function useWorkflowUpdates(onWorkflowUpdate: (workflow: any) => void) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(API_URL, {
      path: '/socket.io',
      transports: ['websocket'],
    });

    // Listen for workflow updates
    socketRef.current.on('workflow:update', (updatedWorkflow) => {
      console.log('🔄 Received workflow update:', updatedWorkflow);
      onWorkflowUpdate(updatedWorkflow);
    });

    // Listen for workflow version updates
    socketRef.current.on('workflow:version', (data) => {
      console.log('🔄 Received version update:', data);
      onWorkflowUpdate(data);
    });

    // Handle connection errors
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [onWorkflowUpdate]);

  return socketRef.current;
}
