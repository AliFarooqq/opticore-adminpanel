import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const _getBrands = httpsCallable(functions, 'getBrands');
const _createBrand = httpsCallable(functions, 'createBrand');
const _updateBrand = httpsCallable(functions, 'updateBrand');
const _deleteBrand = httpsCallable(functions, 'deleteBrand');

export async function getBrands(supplierId) {
  const result = await _getBrands({ supplierId });
  return result.data;
}

export async function createBrand(supplierId, name) {
  const result = await _createBrand({ supplierId, name });
  return result.data.id;
}

export async function updateBrand(supplierId, brandId, name) {
  await _updateBrand({ supplierId, brandId, name });
}

export async function deleteBrand(supplierId, brandId) {
  await _deleteBrand({ supplierId, brandId });
}
