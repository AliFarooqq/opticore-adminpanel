import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from './firebase';

const _getContactSuppliers = httpsCallable(functions, 'getContactSuppliers');
const _getContactSupplier = httpsCallable(functions, 'getContactSupplier');
const _createContactSupplier = httpsCallable(functions, 'createContactSupplier');
const _updateContactSupplier = httpsCallable(functions, 'updateContactSupplier');
const _deleteContactSupplier = httpsCallable(functions, 'deleteContactSupplier');

export async function getContactSuppliers() {
  const result = await _getContactSuppliers();
  return result.data;
}

export async function getContactSupplier(supplierId) {
  const result = await _getContactSupplier({ supplierId });
  return result.data;
}

export async function createContactSupplier(data) {
  const result = await _createContactSupplier(data);
  return result.data.id;
}

export async function updateContactSupplier(supplierId, data) {
  await _updateContactSupplier({ supplierId, data });
}

export async function deleteContactSupplier(supplierId) {
  await _deleteContactSupplier({ supplierId });
}

// Storage upload stays client-side — Cloud Functions don't handle binary uploads
export async function uploadContactSupplierLogo(supplierId, file) {
  const storageRef = ref(storage, `contactSuppliers/${supplierId}/logo`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
