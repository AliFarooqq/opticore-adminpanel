import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from './firebase';

const _getIvlSuppliers = httpsCallable(functions, 'getIvlSuppliers');
const _getIvlSupplier = httpsCallable(functions, 'getIvlSupplier');
const _createIvlSupplier = httpsCallable(functions, 'createIvlSupplier');
const _updateIvlSupplier = httpsCallable(functions, 'updateIvlSupplier');
const _deleteIvlSupplier = httpsCallable(functions, 'deleteIvlSupplier');

export async function getIvlSuppliers() {
  const result = await _getIvlSuppliers();
  return result.data;
}

export async function getIvlSupplier(supplierId) {
  const result = await _getIvlSupplier({ supplierId });
  return result.data;
}

export async function createIvlSupplier(data) {
  const result = await _createIvlSupplier(data);
  return result.data.id;
}

export async function updateIvlSupplier(supplierId, data) {
  await _updateIvlSupplier({ supplierId, data });
}

export async function deleteIvlSupplier(supplierId) {
  await _deleteIvlSupplier({ supplierId });
}

// Storage upload stays client-side — Cloud Functions don't handle binary uploads
export async function uploadIvlSupplierLogo(supplierId, file) {
  const storageRef = ref(storage, `ivlSuppliers/${supplierId}/logo`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
