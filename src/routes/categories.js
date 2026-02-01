import { Router } from 'express';
import {
  addDoc,
  deleteDocById,
  getCollection,
  getDocById,
  setDoc,
  FieldValue
} from '../services/firestore.js';

const router = Router();
const COLLECTION = 'tour_categories';

router.get('/', async (req, res, next) => {
  try {
    const categories = await getCollection(COLLECTION);
    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const category = await getDocById(COLLECTION, req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { id, ...data } = req.body;
    let created;
    
    if (id) {
      // If custom ID is provided, check if it already exists
      const existing = await getDocById(COLLECTION, id);
      if (existing) {
        return res.status(409).json({ message: 'Category with this ID already exists' });
      }
      // Use setDoc with the custom ID
      created = await setDoc(COLLECTION, id, {
        ...data,
        createdAt: FieldValue.serverTimestamp()
      });
    } else {
      // Let Firestore auto-generate the ID
      created = await addDoc(COLLECTION, data);
    }
    
    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const existing = await getDocById(COLLECTION, req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    const payload = {
      ...req.body,
      updatedAt: FieldValue.serverTimestamp()
    };
    const updated = await setDoc(COLLECTION, req.params.id, payload);
    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    
    const existing = await getDocById(COLLECTION, categoryId);
    if (!existing) {
      return res.status(404).json({ 
        message: 'Category not found',
        requestedId: categoryId 
      });
    }
    
    // Get all packages with this category and delete them
    const packages = await getCollection('tour_packages');
    const packagesToDelete = packages.filter(pkg => pkg.category === categoryId);
    
    // Delete all packages in this category
    const deletePromises = packagesToDelete.map(pkg => 
      deleteDocById('tour_packages', pkg.id)
    );
    await Promise.all(deletePromises);
    
    // Delete the category
    await deleteDocById(COLLECTION, categoryId);
    
    res.status(200).json({ 
      message: 'Category and associated packages deleted successfully',
      deletedPackagesCount: packagesToDelete.length
    });
  } catch (err) {
    next(err);
  }
});

export default router;
