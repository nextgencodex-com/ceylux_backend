import { Router } from 'express';
import { addDoc, getCollection } from '../services/firestore.js';
import { createNotification, notificationTypes } from '../services/notifications.js';

const router = Router();
const COLLECTION = 'bookings';

router.get('/', async (req, res, next) => {
  try {
    const bookings = await getCollection(COLLECTION);
    res.json({ data: bookings });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      status: req.body.status || 'pending'
    };
    const created = await addDoc(COLLECTION, payload);
    
    await createNotification(
      notificationTypes.NEW_BOOKING,
      `New booking received for ${payload.packageTitle || payload.packageName || 'a package'}`,
      { bookingId: created.id, customerName: payload.customerName || payload.name }
    );
    
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

export default router;
