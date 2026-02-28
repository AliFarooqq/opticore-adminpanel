import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from './firebase';

const _getContactLenses = httpsCallable(functions, 'getContactLenses');
const _createContactLens = httpsCallable(functions, 'createContactLens');
const _updateContactLens = httpsCallable(functions, 'updateContactLens');
const _deleteContactLens = httpsCallable(functions, 'deleteContactLens');

export async function getContactLenses(supplierId, brandId) {
  const result = await _getContactLenses({ supplierId, brandId });
  return result.data;
}

export async function createContactLens(supplierId, brandId, data) {
  const result = await _createContactLens({ supplierId, brandId, data });
  return result.data.id;
}

export async function updateContactLens(supplierId, brandId, lensId, data) {
  await _updateContactLens({ supplierId, brandId, lensId, data });
}

export async function deleteContactLens(supplierId, brandId, lensId) {
  await _deleteContactLens({ supplierId, brandId, lensId });
}

// Storage upload stays client-side — Cloud Functions don't handle binary uploads
export async function uploadContactLensImage(lensId, file) {
  const storageRef = ref(storage, `contactLenses/${lensId}/image`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
