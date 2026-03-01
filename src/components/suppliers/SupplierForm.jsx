import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Upload } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { createIvlSupplier, updateIvlSupplier, uploadIvlSupplierLogo } from '../../services/ivlSuppliersService';
import { createContactSupplier, updateContactSupplier, uploadContactSupplierLogo } from '../../services/contactSuppliersService';
import { useToast } from '../../hooks/useToast';

export default function SupplierForm({ isOpen, onClose, supplier, onSaved, supplierType }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(supplier?.logoUrl || '');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: supplier?.name || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: supplier?.name || '',
        email: supplier?.email || '',
        phone: supplier?.phone || '',
      });
      setLogoFile(null);
      setLogoPreview(supplier?.logoUrl || '');
    }
  }, [isOpen, supplier, reset]);

  function handleLogoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  const createFn = supplierType === 'ivl' ? createIvlSupplier : createContactSupplier;
  const updateFn = supplierType === 'ivl' ? updateIvlSupplier : updateContactSupplier;
  const uploadLogoFn = supplierType === 'ivl' ? uploadIvlSupplierLogo : uploadContactSupplierLogo;

  async function onSubmit(data) {
    setLoading(true);
    try {
      let logoUrl = supplier?.logoUrl || '';

      if (supplier) {
        await updateFn(supplier.id, { ...data, logoUrl });
        if (logoFile) {
          logoUrl = await uploadLogoFn(supplier.id, logoFile);
          await updateFn(supplier.id, { logoUrl });
        }
        toast.success('Supplier updated successfully');
      } else {
        const id = await createFn({ ...data, logoUrl: '' });
        if (logoFile) {
          logoUrl = await uploadLogoFn(id, logoFile);
          await updateFn(id, { logoUrl });
        }
        toast.success('Supplier created successfully');
      }

      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save supplier');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : supplierType === 'ivl' ? 'Add IVL Supplier' : 'Add Contact Supplier'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Name *"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />

        {/* Logo upload */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-slate-700">Logo</label>
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-14 h-14 rounded-lg object-contain border border-slate-200 bg-slate-50"
              />
            ) : (
              <div className="w-14 h-14 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                <Upload size={18} className="text-slate-400" />
              </div>
            )}
            <label className="cursor-pointer">
              <span className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                {logoPreview ? 'Change logo' : 'Upload logo'}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoChange}
              />
            </label>
          </div>
        </div>

        <Input
          label="Email"
          type="email"
          {...register('email')}
        />

        <Input
          label="Phone"
          type="tel"
          {...register('phone')}
        />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {supplier ? 'Save Changes' : 'Add Supplier'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
