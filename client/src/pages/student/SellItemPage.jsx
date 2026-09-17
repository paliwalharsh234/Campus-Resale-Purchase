import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Upload, DollarSign, MapPin, Tag, ShieldCheck, X, Image as ImageIcon } from 'lucide-react';
import listingService from '../../services/listingService';

const CATEGORIES = [
  'Electronics',
  'Books',
  'Furniture',
  'Cycles',
  'Vehicles',
  'Clothing',
  'Hostel Items',
  'Study Materials',
  'Accessories',
  'Sports',
  'Appliances',
  'Other',
];

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Used'];

export default function SellItemPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      price: '',
      condition: 'Good',
      category: 'Electronics',
    },
  });

  const handleFreeToggle = (e) => {
    const checked = e.target.checked;
    setIsFree(checked);
    if (checked) {
      setValue('price', '0');
    } else {
      setValue('price', '');
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (imageFiles.length + files.length > 6) {
      toast.error('You can upload a maximum of 6 images.');
      return;
    }

    const updatedFiles = [...imageFiles, ...files];
    setImageFiles(updatedFiles);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
  };

  const onSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', isFree ? '0' : formData.price);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      data.append('meetingPoint', formData.meetingPoint);

      imageFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await listingService.createListing(data);
      if (res.success) {
        toast.success('Listing created successfully!');
        navigate(`/listings/${res.listing._id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 sm:p-10 shadow-lg border border-gray-100">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Sell an Item</h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish your item for sale or give it away for free to your college mates.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Item Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Item Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Scientific Calculator Casio FX-991EX"
              className="input-field"
              {...register('title', {
                required: 'Title is required',
                maxLength: { value: 100, message: 'Max 100 characters allowed' },
              })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Category *
              </label>
              <select className="input-field bg-white" {...register('category', { required: true })}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Condition *
              </label>
              <select className="input-field bg-white" {...register('condition', { required: true })}>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Free Item Box */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price (₹) *
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={handleFreeToggle}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  Give away for FREE (₹0)
                </span>
              </label>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                disabled={isFree}
                placeholder={isFree ? '0 (FREE)' : 'e.g. 450'}
                className={`input-field pl-8 ${isFree ? 'bg-gray-100 font-bold text-emerald-600' : ''}`}
                {...register('price', {
                  required: !isFree ? 'Price is required' : false,
                  min: { value: 0, message: 'Price cannot be negative' },
                })}
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
          </div>

          {/* Safe Campus Meeting Point */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Safe Campus Meeting Point *
            </label>
            <input
              type="text"
              placeholder="e.g. Central Library Entrance, Canteen Area, Main Gate"
              className="input-field"
              {...register('meetingPoint', {
                required: 'Meeting point is required for campus safety',
                maxLength: { value: 100, message: 'Max 100 characters' },
              })}
            />
            <p className="text-xs text-gray-400 mt-1">
              For privacy, only specify a public landmark inside the campus (never your room number).
            </p>
            {errors.meetingPoint && (
              <p className="text-red-500 text-xs mt-1">{errors.meetingPoint.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Item Description *
            </label>
            <textarea
              rows={4}
              placeholder="Describe your item, how long you used it, reasons for selling, and any specific details..."
              className="input-field"
              {...register('description', {
                required: 'Description is required',
                maxLength: { value: 2000, message: 'Max 2000 characters' },
              })}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Image Upload Gallery */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Item Photos (Max 6)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden h-28 border border-gray-200">
                  <img src={preview} alt="Upload preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {imagePreviews.length < 6 && (
                <label className="h-28 border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
                  <Upload className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 font-medium">Add Photo</span>
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-gray-400">Accepted formats: JPG, PNG, WebP (Max 5MB each)</p>
          </div>

          {/* Submit button */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary py-2.5 px-6 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Publishing Listing...</span>
                </>
              ) : (
                'Publish Listing'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
