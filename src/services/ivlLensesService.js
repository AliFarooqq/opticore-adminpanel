import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

const _getIvlLenses = httpsCallable(functions, 'getIvlLenses');
const _getIvlLens = httpsCallable(functions, 'getIvlLens');
const _createIvlLens = httpsCallable(functions, 'createIvlLens');
const _updateIvlLens = httpsCallable(functions, 'updateIvlLens');
const _deleteIvlLens = httpsCallable(functions, 'deleteIvlLens');
const _updateStockGrid = httpsCallable(functions, 'updateStockGrid');
const _updateRxRange = httpsCallable(functions, 'updateRxRange');

export async function getIvlLenses(supplierId, brandId) {
  const result = await _getIvlLenses({ supplierId, brandId });
  return result.data;
}

export async function getIvlLens(supplierId, brandId, lensId) {
  const result = await _getIvlLens({ supplierId, brandId, lensId });
  return result.data;
}

export async function createIvlLens(supplierId, brandId, data) {
  const result = await _createIvlLens({ supplierId, brandId, data });
  return result.data.id;
}

export async function updateIvlLens(supplierId, brandId, lensId, data) {
  await _updateIvlLens({ supplierId, brandId, lensId, data });
}

export async function deleteIvlLens(supplierId, brandId, lensId) {
  await _deleteIvlLens({ supplierId, brandId, lensId });
}

export async function updateStockGrid(supplierId, brandId, lensId, cells) {
  await _updateStockGrid({ supplierId, brandId, lensId, cells });
}

export async function updateRxRange(supplierId, brandId, lensId, rxRange) {
  await _updateRxRange({ supplierId, brandId, lensId, rxRange });
}
