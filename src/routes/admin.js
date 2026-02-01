import { Router } from 'express';
import { db } from '../config/firebaseAdmin.js';

const router = Router();

// WARNING: This endpoint will DELETE ALL categories from Firestore
// Use with caution!
router.delete('/cleanup-all-categories', async (req, res) => {
  try {
    console.log('\n⚠️  CLEANUP: Deleting ALL categories from Firestore...\n');
    
    const snapshot = await db.collection('tour_categories').get();
    
    if (snapshot.empty) {
      console.log('✅ No categories found in database.');
      return res.json({ message: 'No categories to delete', deleted: 0 });
    }
    
    console.log(`Found ${snapshot.size} categories to delete:`);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      console.log(`  - Deleting: ${doc.id} (${doc.data().title})`);
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    
    console.log(`\n✅ Successfully deleted ${snapshot.size} categories\n`);
    
    res.json({ 
      message: 'All categories deleted successfully', 
      deleted: snapshot.size 
    });
  } catch (err) {
    console.error('❌ Cleanup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// WARNING: This endpoint will DELETE ALL packages from Firestore
// Use with caution!
router.delete('/cleanup-all-packages', async (req, res) => {
  try {
    console.log('\n⚠️  CLEANUP: Deleting ALL packages from Firestore...\n');
    
    const snapshot = await db.collection('tour_packages').get();
    
    if (snapshot.empty) {
      console.log('✅ No packages found in database.');
      return res.json({ message: 'No packages to delete', deleted: 0 });
    }
    
    console.log(`Found ${snapshot.size} packages to delete:`);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      console.log(`  - Deleting: ${doc.id} (${doc.data().title})`);
      deletePromises.push(doc.ref.delete());
    });
    
    await Promise.all(deletePromises);
    
    console.log(`\n✅ Successfully deleted ${snapshot.size} packages\n`);
    
    res.json({ 
      message: 'All packages deleted successfully', 
      deleted: snapshot.size 
    });
  } catch (err) {
    console.error('❌ Cleanup error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fix ID mismatch: Update Firestore document IDs to match their custom IDs
router.post('/fix-category-ids', async (req, res) => {
  try {
    console.log('\n🔧 FIXING: Category ID mismatches...\n');
    
    const snapshot = await db.collection('tour_categories').get();
    
    if (snapshot.empty) {
      console.log('✅ No categories found in database.');
      return res.json({ message: 'No categories to fix', fixed: 0 });
    }
    
    const fixes = [];
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const firestoreId = doc.id;
      const customId = data.id;
      
      console.log(`\nCategory: ${data.title}`);
      console.log(`  Firestore ID: ${firestoreId}`);
      console.log(`  Custom ID: ${customId || 'NONE'}`);
      
      if (customId && customId !== firestoreId) {
        console.log(`  ⚠️  MISMATCH DETECTED - Fixing...`);
        
        // Check if a document with the custom ID already exists
        const existingDoc = await db.collection('tour_categories').doc(customId).get();
        
        if (existingDoc.exists) {
          console.log(`  ❌ Cannot fix: Document with ID "${customId}" already exists`);
          fixes.push({ 
            title: data.title, 
            status: 'skipped',
            reason: 'ID already exists',
            firestoreId,
            customId 
          });
        } else {
          // Create new document with custom ID
          await db.collection('tour_categories').doc(customId).set(data);
          
          // Delete old document
          await doc.ref.delete();
          
          console.log(`  ✅ Fixed: Moved from ${firestoreId} to ${customId}`);
          fixes.push({ 
            title: data.title, 
            status: 'fixed',
            oldId: firestoreId,
            newId: customId 
          });
        }
      } else if (!customId) {
        console.log(`  ℹ️  No custom ID - document will keep Firestore ID`);
        fixes.push({ 
          title: data.title, 
          status: 'no-custom-id',
          firestoreId 
        });
      } else {
        console.log(`  ✅ IDs match - no fix needed`);
        fixes.push({ 
          title: data.title, 
          status: 'ok',
          id: firestoreId 
        });
      }
    }
    
    console.log(`\n✅ Fix operation completed\n`);
    
    res.json({ 
      message: 'Category ID fix completed', 
      total: snapshot.size,
      fixes 
    });
  } catch (err) {
    console.error('❌ Fix error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
