import {
  DESIGN_LABELS, MATERIAL_LABELS, LENS_TYPE_LABELS, GEOMETRY_LABELS,
  WEARING_TIME_LABELS, PACK_TYPE_LABELS, LENS_COLOR_LABELS,
  VISION_TYPE_LABELS, LENS_SHAPE_LABELS, CYL_FORMAT_LABELS,
} from '../constants/lensOptions';

function buildReverseMap(labels) {
  const map = {};
  for (const [key, label] of Object.entries(labels)) {
    map[label.toLowerCase()] = key;
    map[key.toLowerCase()] = key;
  }
  return map;
}

const DESIGN_MAP       = buildReverseMap(DESIGN_LABELS);
const MATERIAL_MAP     = buildReverseMap(MATERIAL_LABELS);
const LENS_TYPE_MAP    = buildReverseMap(LENS_TYPE_LABELS);
const GEOMETRY_MAP     = buildReverseMap(GEOMETRY_LABELS);
const LENS_COLOR_MAP   = buildReverseMap(LENS_COLOR_LABELS);
const VISION_TYPE_MAP  = buildReverseMap(VISION_TYPE_LABELS);
const LENS_SHAPE_MAP   = buildReverseMap(LENS_SHAPE_LABELS);
const WEARING_TIME_MAP = buildReverseMap(WEARING_TIME_LABELS);
const PACK_TYPE_MAP    = buildReverseMap(PACK_TYPE_LABELS);
// CYL_FORMAT_LABELS uses em-dash (−CYL); add plain hyphen aliases too
const CYL_FORMAT_MAP   = {
  ...buildReverseMap(CYL_FORMAT_LABELS),
  '+': 'plus', '-': 'minus', '+cyl': 'plus', '-cyl': 'minus',
};

function norm(value, map) {
  if (!value?.trim()) return value;
  return map[value.trim().toLowerCase()] ?? value.trim();
}

function normMulti(value, map) {
  if (!value?.trim()) return value;
  return value.split(',').map(t => norm(t, map)).join(',');
}

export function normalizeRow(row, type) {
  const out = { ...row };
  if (type === 'ivl-stock' || type === 'ivl-rx') {
    out.design    = norm(row.design,    DESIGN_MAP);
    out.material  = norm(row.material,  MATERIAL_MAP);
    out.lenstypes = normMulti(row.lenstypes, LENS_TYPE_MAP);
    out.geometry  = norm(row.geometry,  GEOMETRY_MAP);
    out.cylformat = norm(row.cylformat, CYL_FORMAT_MAP);
  } else if (type === 'contact') {
    out.lenscolor   = norm(row.lenscolor,   LENS_COLOR_MAP);
    out.visiontype  = norm(row.visiontype,  VISION_TYPE_MAP);
    out.lensshape   = norm(row.lensshape,   LENS_SHAPE_MAP);
    out.wearingtime = norm(row.wearingtime, WEARING_TIME_MAP);
    out.packtype    = norm(row.packtype,    PACK_TYPE_MAP);
  }
  return out;
}
