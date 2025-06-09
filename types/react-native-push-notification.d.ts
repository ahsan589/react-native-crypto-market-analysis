declare module 'react-native-push-notification' {
    import { EmitterSubscription } from 'react-native';
  
    export interface PushNotificationOptions {
      onRegister?: (token: { os: string; token: string }) => void;
      onNotification?: (notification: any) => void;
      onAction?: (notification: any) => void;
      onRegistrationError?: (error: any) => void;
      permissions?: {
        alert?: boolean;
        badge?: boolean;
        sound?: boolean;
      };
      popInitialNotification?: boolean;
      requestPermissions?: boolean;
    }
  
    export interface PushNotificationObject {
      id?: string;
      title?: string;
      message: string;
      userInfo?: any;
      playSound?: boolean;
      soundName?: string;
      number?: string;
      repeatType?: string;
      repeatTime?: number;
      actions?: string[];
      channelId?: string; // Add channelId for Android
    }
  
    export interface PushNotificationChannel {
      channelId: string;
      channelName: string;
      channelDescription?: string;
      soundName?: string;
      importance?: number;
      vibrate?: boolean;
    }
  
    const PushNotification: {
      configure: (options: PushNotificationOptions) => void;
      localNotification: (details: PushNotificationObject) => void;
      cancelLocalNotifications: (details: { id: string }) => void;
      cancelAllLocalNotifications: () => void;
      scheduleLocalNotification: (details: PushNotificationObject) => void;
      requestPermissions: (permissions?: { alert?: boolean; badge?: boolean; sound?: boolean }) => Promise<{ alert: boolean; badge: boolean; sound: boolean }>;
      abandonPermissions: () => void;
      checkPermissions: (callback: (permissions: { alert: boolean; badge: boolean; sound: boolean }) => void) => void;
      getApplicationIconBadgeNumber: (callback: (badgeCount: number) => void) => void;
      setApplicationIconBadgeNumber: (badgeCount: number) => void;
      getScheduledLocalNotifications: (callback: (notifications: PushNotificationObject[]) => void) => void;
      removeAllDeliveredNotifications: () => void;
      removeDeliveredNotifications: (identifiers: string[]) => void;
      getDeliveredNotifications: (callback: (notifications: PushNotificationObject[]) => void) => void;
      addEventListener: (type: string, handler: (notification: any) => void) => EmitterSubscription;
      removeEventListener: (type: string, handler: (notification: any) => void) => void;
      createChannel: (channel: PushNotificationChannel, callback: (created: boolean) => void) => void; // Add createChannel
    };
  
    export default PushNotification;
  }