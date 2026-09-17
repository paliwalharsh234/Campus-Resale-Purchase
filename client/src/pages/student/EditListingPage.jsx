import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Upload, DollarSign, MapPin, X, ArrowLeft } from 'lucide-react';
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
const STATUSES = ['Available', 'Reserved', 'Sold'];

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFree, setIsFree] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await listingService.getListingById(id);
        if (res.success && res.listing) {
          const item = res.listing;
          reset({
            title: item.title,
            description: item.description,
            price: item.price,
            category: item.category,
            condition: item.condition,
            meetingPoint: item.meetingPoint,
            status: item.status,
          });
          setIsFree(item.price === 0);
          setExistingImages(item.images || []);
        }
      } catch (err) {
        toast.error('Failed to load listing for editing.');
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id, reset, navigate]);

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
    if (existingImages.length + newImageFiles.length + files.length > 6) {
      toast.error('Max 6 images allowed in total.');
      return;
    }
    setNewImageFiles((prev) => [...prev, ...files]);
    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
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
      data.append('status', formData.status);
      data.append('keepExistingImages', 'true');

      newImageFiles.forEach((file) => {
        data.append('images', file);
      });

      const res = await listingService.updateListing(id, data);
      if (res.success) {
        toast.success('Listing updated successfully!');
        navigate(`/listings/${id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-6 sm:p-10 shadow-lg border border-gray-100">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Edit Listing</h1>
          <p className="text-sm text-gray-500">Update item details, price, or availability status.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Listing Status
            </label>
            <select className="input-field bg-white" {...register('status')}>
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Item Title *
            </label>
            <input
              type="text"
              className="input-field"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select className="input-field bg-white" {...register('category')}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Condition
              </label>
              <select className="input-field bg-white" {...register('condition')}>
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Price (₹)
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={handleFreeToggle}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  FREE (₹0)
                </span>
              </label>
            </div>
            <input
              type="number"
              disabled={isFree}
              className={`input-field ${isFree ? 'bg-gray-100 font-bold text-emerald-600' : ''}`}
              {...register('price')}
            />
          </div>

          {/* Meeting location */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Campus Meeting Point *
            </label>
            <input
              type="text"
              className="input-field"
              {...register('meetingPoint', { required: 'Meeting point is required' })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Description *
            </label>
            <textarea
              rows={4}
              className="input-field"
              {...register('description', { required: 'Description is required' })}
            />
          </div>

          {/* Existing Photos */}
          {existingImages.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Existing Photos
              </p>
              <div className="flex gap-2 flex-wrap">
                {existingImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt="Existing"
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Add more photos */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Add Additional Photos (Max 6 total)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
              {newImagePreviews.map((preview, idx) => (
                <div key={idx} className="relative h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={preview} alt="New preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 p-0.5 bg-red-600 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="h-20 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500">
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] text-gray-500">Add Photo</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary py-2 px-6">
              {submitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
