import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Product } from "@/types/database";
import MultiImageUploader from "./MultiImageUploader";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { image_path: string | null; image_paths: string[] | null }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm = ({ product, onSubmit, onCancel, isLoading }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    image_paths: product?.image_paths ?? [],
    status: "draft" as 'draft' | 'active' | 'closed',
    po_start_date: "",
    po_end_date: "",
    available_sizes: [] as string[],
    stock_quantity: "",
  });

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        original_price: product.original_price?.toString() || "",
        image_paths: product.image_paths ?? [],
        status: product.status,
        po_start_date: product.po_start_date ? new Date(product.po_start_date).toISOString().slice(0, 16) : "",
        po_end_date: product.po_end_date ? new Date(product.po_end_date).toISOString().slice(0, 16) : "",
        available_sizes: product.available_sizes,
        stock_quantity: (product.stock_quantity || 0).toString(),
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: Omit<Product, 'id' | 'created_at' | 'updated_at'> & { image_path: string | null; image_paths: string[] | null } = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : null,
      image_path: formData.image_paths[0] ?? null,
      image_paths: formData.image_paths.length > 0 ? formData.image_paths : null,
      orders_count: null,
      status: formData.status,
      po_start_date: formData.po_start_date || null,
      po_end_date: formData.po_end_date || null,
      available_sizes: formData.available_sizes as ('XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL')[],
      stock_quantity: parseInt(formData.stock_quantity) || 0,
    };

    onSubmit(submitData);
  };

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        available_sizes: [...prev.available_sizes, size]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        available_sizes: prev.available_sizes.filter(s => s !== size)
      }));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{product ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Price (IDR)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Original Price (IDR)</label>
              <Input
                type="number"
                value={formData.original_price}
                onChange={(e) => setFormData(prev => ({ ...prev, original_price: e.target.value }))}
                placeholder="Optional - for discount display"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Stock Quantity</label>
            <Input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Upload Images</label>
            <MultiImageUploader
              bucket="product-images"
              initialPaths={formData.image_paths}
              onChange={(paths) => setFormData((prev) => ({ ...prev, image_paths: paths }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={formData.status} onValueChange={(value: 'draft' | 'active' | 'closed') => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Pre-Order Start</label>
              <Input
                type="datetime-local"
                value={formData.po_start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, po_start_date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Pre-Order End</label>
              <Input
                type="datetime-local"
                value={formData.po_end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, po_end_date: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Available Sizes</label>
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <div key={size} className="flex items-center space-x-2">
                  <Checkbox
                    id={size}
                    checked={formData.available_sizes.includes(size)}
                    onCheckedChange={(checked) => handleSizeChange(size, checked as boolean)}
                  />
                  <label htmlFor={size} className="text-sm">{size}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductForm;
