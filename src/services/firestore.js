import { db, FieldValue, Timestamp } from '../config/firebaseAdmin.js';

const convertValue = (value) => {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(convertValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, val]) => [key, convertValue(val)])
    );
  }

  return value;
};

export const formatDoc = (doc) => ({
  id: doc.id,
  ...convertValue(doc.data())
});

export const getCollection = async (name, orderByField = 'createdAt', direction = 'desc') => {
  const snapshot = await db.collection(name).orderBy(orderByField, direction).get();
  return snapshot.docs.map(formatDoc);
};

export const getDocById = async (name, id) => {
  const docRef = db.collection(name).doc(id);
  const docSnap = await docRef.get();
  return docSnap.exists ? formatDoc(docSnap) : null;
};

export const addDoc = async (name, data) => {
  const now = FieldValue.serverTimestamp();
  const docData = {
    ...data,
    createdAt: now,
    updatedAt: now
  };
  const ref = await db.collection(name).add(docData);
  const created = await ref.get();
  return formatDoc(created);
};

export const setDoc = async (name, id, data) => {
  const now = FieldValue.serverTimestamp();
  const docData = {
    ...data,
    updatedAt: now
  };
  await db.collection(name).doc(id).set(docData, { merge: true });
  const updated = await db.collection(name).doc(id).get();
  return formatDoc(updated);
};

export const deleteDocById = async (name, id) => {
  await db.collection(name).doc(id).delete();
};

export { FieldValue };
