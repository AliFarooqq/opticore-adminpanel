export const queryKeys = {
  ivlSuppliers:     ()        => ['ivlSuppliers'],
  contactSuppliers: ()        => ['contactSuppliers'],
  ivlSupplier:      (id)      => ['ivlSupplier', id],
  contactSupplier:  (id)      => ['contactSupplier', id],
  brands:           (sid)     => ['brands', sid],
  ivlLenses:        (sid, bid) => ['ivlLenses', sid, bid],
  contactLenses:    (sid, bid) => ['contactLenses', sid, bid],
  ivlLens:          (lensId)  => ['ivlLens', lensId],
};
