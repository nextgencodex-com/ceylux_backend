import { addDoc } from './firestore.js';

const COLLECTION = 'notifications';

export const createNotification = async (type, message, data = {}) => {
  try {
    const notification = {
      type,
      message,
      data,
      createdAt: new Date().toISOString(),
      read: false
    };
    await addDoc(COLLECTION, notification);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

export const notificationTypes = {
  NEW_BOOKING: 'new_booking',
  NEW_INQUIRY: 'new_inquiry',
  PACKAGE_UPDATED: 'package_updated',
  PACKAGE_CREATED: 'package_created',
  LOW_BOOKING: 'low_booking'
};
