import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { createBrand, updateBrand } from '../../services/brandsService';
import { useToast } from '../../hooks/useToast';

export default function BrandForm({ isOpen, onClose, supplierId, brand, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { name: brand?.name || '' } });

  useEffect(() => {
    if (isOpen) reset({ name: brand?.name || '' });
  }, [isOpen, brand, reset]);

  async function onSubmit({ name }) {
    setLoading(true);
    try {
      if (brand) {
        await updateBrand(supplierId, brand.id, name);
        toast.success('Brand updated');
      } else {
        await createBrand(supplierId, name);
        toast.success('Brand created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save brand');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={brand ? 'Edit Brand' : 'Add Brand'}
      size="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input
          label="Brand Name *"
          error={errors.name?.message}
          {...register('name', { required: 'Brand name is required' })}
          autoFocus
        />
        <div className="flex justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {brand ? 'Save Changes' : 'Add Brand'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
