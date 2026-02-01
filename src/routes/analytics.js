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

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthKey = `${months[date.getMonth()]} ${date.getFullYear()}`;
      monthlyData[monthKey] = { bookings: 0, revenue: 0 };
    }

    bookings.forEach(booking => {
      if (booking.bookingDate) {
        const bookingDate = new Date(booking.bookingDate);
        if (bookingDate >= sixMonthsAgo) {
          const monthKey = `${months[bookingDate.getMonth()]} ${bookingDate.getFullYear()}`;
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].bookings += 1;
            monthlyData[monthKey].revenue += (booking.totalPrice || 0);
          }
        }
      }
    });

    const revenueData = Object.keys(monthlyData).map(month => ({
      month: month.split(' ')[0],
      revenue: monthlyData[month].revenue,
      bookings: monthlyData[month].bookings
    }));

    const categoryStats = {};
    packages.forEach(pkg => {
      const category = pkg.category || 'Other';
      categoryStats[category] = (categoryStats[category] || 0) + 1;
    });

    const colors = ['#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
    const totalPackages = packages.length || 1;
    const packageData = Object.keys(categoryStats).map((category, index) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
      value: Math.round((categoryStats[category] / totalPackages) * 100),
      color: colors[index % colors.length]
    }));

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    const sortedBookings = [...bookings]
      .filter(b => b.bookingDate)
      .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

    res.json({
      data: {
        totals: {
          bookings: bookings.length,
          packages: packages.length,
          customers: customers.length,
          revenue: totalRevenue
        },
        recentBookings: sortedBookings.slice(0, 10),
        revenueData,
        packageData,
        topPackages: packages
          .filter(p => p.isBestSelling || p.isKeyExperience)
          .slice(0, 5)
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
