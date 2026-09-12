import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  AlertCircle, 
  Tag, 
  DollarSign, 
  User, 
  Folder, 
  ExternalLink, 
  Trash2, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

export default function VendorApp() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gadgets');
  const [tagsInput, setTagsInput] = useState('modern, gadget, tech');
  const [vendorName, setVendorName] = useState('Apex Store');
  const [price, setPrice] = useState('149.99');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [recentUploads, setRecentUploads] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch recent uploads
  const fetchRecentUploads = async () => {
    setIsLoadingList(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/images?limit=20`);
      const data = await res.json();
      if (data.success) {
        setRecentUploads(data.data);
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    fetchRecentUploads();
  }, []);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      if (!title) {
        // Auto-fill title from filename
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
      setErrorMessage(null);
    }
  };

  // Drag & Drop Handlers
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      if (dropped.type.startsWith('image/')) {
        setFile(dropped);
        setPreviewUrl(URL.createObjectURL(dropped));
        if (!title) {
          const cleanName = dropped.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
          setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      } else {
        setErrorMessage('Please drop an image file (JPG, PNG, WebP).');
      }
    }
  };

  // Submit Upload Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select an image file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please enter an image title.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadSuccess(null);

    const formData = new FormData();
    formData.append('image', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('tags', tagsInput);
    formData.append('vendor_name', vendorName);
    formData.append('price', price);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Upload failed');
      }

      setUploadSuccess(`Successfully uploaded "${title}" to Supabase!`);
      // Reset form
      setFile(null);
      setPreviewUrl(null);
      setTitle('');
      setDescription('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh list
      fetchRecentUploads();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to connect to backend server.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <UploadCloud className="w-3.5 h-3.5" /> Vendor Portal
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Supabase Image Upload Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Upload high-resolution images to Supabase Storage and register database records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-300">
              API: <span className="text-indigo-400 font-mono">{API_BASE_URL}</span>
            </span>
            <button
              onClick={fetchRecentUploads}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Uploads"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Main Grid: Upload Form + Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Upload Form (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-indigo-400" /> New Image Upload
            </h2>

            {uploadSuccess && (
              <div className="mb-4 p-4 rounded-xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{uploadSuccess}</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-4 p-4 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-300 text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  file ? 'border-indigo-500 bg-indigo-950/20' : 'border-slate-600 hover:border-slate-500 bg-slate-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-200">
                  {file ? file.name : 'Click to select or drag & drop image here'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, WebP, GIF up to 15MB</p>
                {file && (
                  <p className="text-xs text-indigo-300 font-mono mt-2">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                )}
              </div>

              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Image Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Wireless Ergonomic Headphone"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Gadgets">Gadgets</option>
                    <option value="Interior">Interior</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Photography">Photography</option>
                    <option value="General">General</option>
                  </select>
                </div>
              </div>

              {/* Tags & Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tags (comma separated)
                  </label>
                  <div className="relative">
                    <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="gadget, wireless, music"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Vendor / Store Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Store or Vendor Name"
                      value={vendorName}
                      onChange={(e) => setVendorName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional details, specs, or aesthetic notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 cursor-pointer"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Uploading to Supabase Storage & Database...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    Upload Image to Supabase
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Live Preview Card (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Live Preview</h2>
              <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center relative group">
                {previewUrl ? (
                  <img src={previewUrl} alt="Upload Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-6 text-slate-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-2 stroke-[1.5]" />
                    <p className="text-xs">No image selected yet</p>
                  </div>
                )}
                {previewUrl && (
                  <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] text-white">
                    Preview
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full">
                    {category}
                  </span>
                  <span className="text-xs text-slate-400">{vendorName}</span>
                </div>
                <h3 className="font-semibold text-white text-base truncate">
                  {title || 'Image Title Will Appear Here'}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2">
                  {description || 'Description will be stored along with Supabase metadata.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-700 text-xs text-slate-400 space-y-1 font-mono">
              <div className="flex justify-between">
                <span>Storage Target:</span>
                <span className="text-emerald-400">bucket/images</span>
              </div>
              <div className="flex justify-between">
                <span>Database Table:</span>
                <span className="text-emerald-400">public.images</span>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded History Table */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Uploaded Images ({recentUploads.length})</h2>
            <span className="text-xs text-slate-400">Stored in Supabase Database</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/60 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Thumbnail</th>
                  <th className="py-3 px-4">Title & Category</th>
                  <th className="py-3 px-4">Tags</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentUploads.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-12 h-12 object-cover rounded-lg border border-slate-700"
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-white truncate max-w-xs">{item.title}</div>
                      <div className="text-xs text-indigo-400">{item.category}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {item.tags && Array.isArray(item.tags) ? (
                          item.tags.map((t: string, idx: number) => (
                            <span key={idx} className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">{item.vendor_name}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => copyToClipboard(item.image_url, item.id)}
                          className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs flex items-center gap-1"
                          title="Copy Image URL"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <a
                          href={item.image_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200"
                          title="Open full image"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
                {recentUploads.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">
                      No images uploaded yet. Use the form above to upload your first image!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

