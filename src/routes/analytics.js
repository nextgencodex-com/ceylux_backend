import { Router } from 'express';
import { getCollection } from '../services/firestore.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [bookings, packages, customers] = await Promise.all([
      getCollection('bookings'),
      getCollection('tour_packages'),
      getCollection('customers')
    ]);

    res.json({
      data: {
        totals: {
          bookings: bookings.length,
          packages: packages.length,
          customers: customers.length
        },
        recentBookings: bookings.slice(0, 10)
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
