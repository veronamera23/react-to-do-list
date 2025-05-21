// src/services/api.js
// Replace the entire file with Firebase Firestore operations
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from "firebase/firestore";
import { db } from "../firebase";

const tasksCollection = collection(db, "tasks");

// Helper to safely convert Firestore Timestamp or string to ISO string
function toISOStringMaybe(ts) {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate().toISOString();
  if (typeof ts === "string") return ts;
  return null;
}

export const getTasks = async () => {
  const q = query(tasksCollection, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: toISOStringMaybe(data.createdAt),
      dueDate: toISOStringMaybe(data.dueDate),
    };
  });
};

export const createTask = async (task) => {
  // Convert date strings to JS Date objects for Firestore
  const taskToAdd = {
    ...task,
    createdAt: new Date(),
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
  };
  
  const docRef = await addDoc(tasksCollection, taskToAdd);
  return {
    id: docRef.id,
    ...task,
    createdAt: taskToAdd.createdAt.toISOString(),
    dueDate: taskToAdd.dueDate ? taskToAdd.dueDate.toISOString() : null,
  };
};

export const updateTask = async (id, task) => {
  console.log("updateTask called with id:", id, "task:", task);
  const taskDoc = doc(db, "tasks", id);

  // Convert dueDate to JS Date if it's a string
  let dueDate = task.dueDate;
  if (dueDate === undefined) dueDate = null;
  if (dueDate && typeof dueDate === "string") {
    dueDate = new Date(dueDate);
  }

  // Don't update the createdAt field
  const { createdAt, id: _id, ...taskToUpdate } = task;

  // Remove any undefined fields
  Object.keys(taskToUpdate).forEach(
    key => taskToUpdate[key] === undefined && delete taskToUpdate[key]
  );

  try {
    await updateDoc(taskDoc, {
      ...taskToUpdate,
      dueDate: dueDate || null,
    });
    return {
      id,
      ...task,
      dueDate: dueDate ? dueDate.toISOString() : null,
    };
  } catch (error) {
    console.error("Firestore update error:", error);
    throw error;
  }
};

export const deleteTask = async (id) => {
  const taskDoc = doc(db, "tasks", id);
  await deleteDoc(taskDoc);
  return id;
};