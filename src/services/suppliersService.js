import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { functions, storage } from './firebase';

const _getSuppliers = httpsCallable(functions, 'getSuppliers');
const _getSupplier = httpsCallable(functions, 'getSupplier');
const _createSupplier = httpsCallable(functions, 'createSupplier');
const _updateSupplier = httpsCallable(functions, 'updateSupplier');
const _deleteSupplier = httpsCallable(functions, 'deleteSupplier');

export async function getSuppliers() {
  const result = await _getSuppliers();
  return result.data;
}

export async function getSupplier(supplierId) {
  const result = await _getSupplier({ supplierId });
  return result.data;
}

export async function createSupplier(data) {
  const result = await _createSupplier(data);
  return result.data.id;
}

export async function updateSupplier(supplierId, data) {
  await _updateSupplier({ supplierId, data });
}

export async function deleteSupplier(supplierId) {
  await _deleteSupplier({ supplierId });
}

// Storage upload stays client-side — Cloud Functions don't handle binary uploads
export async function uploadSupplierLogo(supplierId, file) {
  const storageRef = ref(storage, `suppliers/${supplierId}/logo`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
