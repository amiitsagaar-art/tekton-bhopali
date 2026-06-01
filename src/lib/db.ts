import { db } from "./firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, setDoc } from "firebase/firestore";

export async function getWorkers() {
  const q = query(collection(db, "workers"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getAppointments() {
  const q = query(collection(db, "bookings"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createBooking(data: any) {
  return await addDoc(collection(db, "bookings"), {
    ...data,
    createdAt: new Date().toISOString()
  });
}

export async function updateBooking(id: string, data: any) {
  return await updateDoc(doc(db, "bookings", id), data);
}

export async function getUsers() {
  const q = query(collection(db, "users"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createUser(data: any) {
  return await setDoc(doc(db, "users", data.phone), {
    ...data,
    createdAt: new Date().toISOString()
  });
}
