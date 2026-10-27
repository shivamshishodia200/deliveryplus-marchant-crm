import React, { useState } from 'react';
import { Plus, Upload, Barcode, Trash2, Edit, Search, FileDown } from 'lucide-react';

export interface MerchantProduct {
  id: string;
  skuCode: string;
  description: string;
  price: number;
  weightKg: number;
  packageType: string;
  barcodeString: string;
}

export const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<MerchantProduct[]>([
    {
      id: 'p-1',
      skuCode: 'SOFA-SECT-01',
      description: 'L-Shaped Sectional Fabric Sofa (Charcoal Grey)',
      price: 1850.0,
      weightKg: 78.5,
      packageType: 'HEAVY_FURNITURE',
      barcodeString: '934589201991'
    },
    {
      id: 'p-2',
      skuCode: 'TAB-OAK-02',
      description: 'Solid White Oak Dining Table (6 Seater)',
      price: 1200.0,
      weightKg: 45.0,
      packageType: 'FLAT_PACK',
      barcodeString: '934589201992'
    },
    {
      id: 'p-3',
      skuCode: 'CHAIR-ARM-03',
      description: 'Velvet Accent Armchair with Brass Legs',
      price: 450.0,
      weightKg: 18.2,
      packageType: 'PARCEL',
      barcodeString: '934589201993'
    }
  ]);

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MerchantProduct | null>(null);

  const [formData, setFormData] = useState({
    skuCode: '',
    description: '',
    price: 100,
    weightKg: 5,
    packageType: 'PARCEL',
    barcodeString: ''
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      skuCode: '',
      description: '',
      price: 100,
      weightKg: 5,
      packageType: 'PARCEL',
      barcodeString: `DP${Math.floor(100000000 + Math.random() * 900000000)}`
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id ? { ...p, ...formData } : p
        )
      );
    } else {
      const newProd: MerchantProduct = {
        id: `p-${Date.now()}`,
        ...formData
      };
      setProducts([newProd, ...products]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this product from catalog?')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  // CSV Ingestion simulation
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter((l) => l.trim().length > 0);
      const imported: MerchantProduct[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 4) {
          imported.push({
            id: `p-${Date.now()}-${i}`,
            skuCode: parts[0]?.trim() || `SKU-${i}`,
            description: parts[1]?.trim() || 'Imported SKU',
            price: parseFloat(parts[2]) || 50,
            weightKg: parseFloat(parts[3]) || 2,
            packageType: parts[4]?.trim() || 'PARCEL',
            barcodeString: parts[5]?.trim() || `BAR-${Date.now()}-${i}`
          });
        }
      }

      setProducts([...imported, ...products]);
      alert(`Successfully imported ${imported.length} products from CSV.`);
    };
    reader.readAsText(file);
  };

  const filtered = products.filter(
    (p) =>
      p.skuCode.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.barcodeString.includes(search)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 font-sans space-y-6">
      {/* Header & CSV Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Merchant Product Catalog</h2>
          <p className="text-xs text-slate-500">Manage SKU barcodes, item dimensions, and packaging profiles.</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
          </label>

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute w-4 h-4 text-slate-400 left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by SKU code, barcode, or product description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:border-emerald-600 outline-none"
        />
      </div>

      {/* Catalog Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-600">
              <th className="px-4 py-3">SKU Code</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Unit Price</th>
              <th className="px-4 py-3">Weight (KG)</th>
              <th className="px-4 py-3">Package Type</th>
              <th className="px-4 py-3">Barcode (Code128)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                  No products found.
                </td>
              </tr>
            ) : (
              filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">{prod.skuCode}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{prod.description}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">${prod.price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-600">{prod.weightKg} kg</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {prod.packageType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 w-fit">
                      <Barcode className="w-3.5 h-3.5 text-slate-500" />
                      <span>{prod.barcodeString}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingProduct(prod);
                          setFormData(prod);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-700"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              {editingProduct ? 'Edit Product SKU' : 'Add New Product SKU'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">SKU Code *</label>
                <input
                  type="text"
                  required
                  value={formData.skuCode}
                  onChange={(e) => setFormData({ ...formData, skuCode: e.target.value })}
                  placeholder="e.g. SOFA-MOD-01"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description *</label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Premium 3-Seater Recliner Sofa"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Price ($) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Weight (KG)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Package Type</label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none"
                  >
                    <option value="PARCEL">Standard Parcel</option>
                    <option value="FLAT_PACK">Flat Pack</option>
                    <option value="HEAVY_FURNITURE">Heavy Furniture</option>
                    <option value="FRAGILE">Fragile / Glass</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Barcode String</label>
                  <input
                    type="text"
                    value={formData.barcodeString}
                    onChange={(e) => setFormData({ ...formData, barcodeString: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
