import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  writeBatch,
  getDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { LinkItem } from '../types'

const LINKS_COLLECTION = 'links'

// Get all links ordered by order field
export async function getLinks(): Promise<LinkItem[]> {
  const q = query(collection(db, LINKS_COLLECTION), orderBy('order', 'asc'))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as LinkItem[]
}

// Get a single link by ID
export async function getLink(id: string): Promise<LinkItem | null> {
  const docRef = doc(db, LINKS_COLLECTION, id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as LinkItem
  }
  return null
}

// Add a new link
export async function addLink(title: string, url: string): Promise<string> {
  // Get current links to determine the next order value
  const links = await getLinks()
  const nextOrder = links.length > 0 ? Math.max(...links.map((l) => l.order)) + 1 : 0

  const docRef = await addDoc(collection(db, LINKS_COLLECTION), {
    title,
    url,
    order: nextOrder,
    createdAt: Date.now(),
  })
  return docRef.id
}

// Update a link
export async function updateLink(id: string, title: string, url: string): Promise<void> {
  const docRef = doc(db, LINKS_COLLECTION, id)
  await updateDoc(docRef, {
    title,
    url,
  })
}

// Delete a link
export async function deleteLink(id: string): Promise<void> {
  const docRef = doc(db, LINKS_COLLECTION, id)
  await deleteDoc(docRef)
}

// Batch update order for all links
export async function updateLinksOrder(links: LinkItem[]): Promise<void> {
  const batch = writeBatch(db)
  links.forEach((link) => {
    const docRef = doc(db, LINKS_COLLECTION, link.id)
    batch.update(docRef, { order: link.order })
  })
  await batch.commit()
}
