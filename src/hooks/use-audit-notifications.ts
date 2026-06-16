import { useEffect, useRef } from 'react';
import { subscribeToAuditLog, unsubscribeFromAuditLog } from '../lib/alis';
import { toast } from 'sonner';

export function useAuditNotifications(clientId?: number) {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!clientId) return;

    const channel = subscribeToAuditLog((payload) => {
      const record = payload.new;
      
      // Only show notifications for the current user's client
      if (record.client_id === clientId) {
        const actionMessages: Record<string, string> = {
          'LOGIN': 'User logged in',
          'LOGOUT': 'User logged out',
          'UPLOAD_DOCUMENT': `Document uploaded: ${record.description}`,
          'ANALYSIS_RUN': `Analysis run: ${record.description}`,
          'USER_CREATED': `User created: ${record.description}`,
          'USER_UPDATED': `User updated: ${record.description}`,
          'USER_DELETED': `User deleted: ${record.description}`,
        };

        const message = actionMessages[record.action_type] || record.action_type;
        
        toast(message, {
          description: record.description,
          action: {
            label: 'Dismiss',
            onClick: () => console.log('Notification dismissed'),
          },
        });
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        unsubscribeFromAuditLog(channelRef.current);
      }
    };
  }, [clientId]);

  return null;
}
