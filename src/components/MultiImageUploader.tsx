import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { X, Loader2, Plus } from "lucide-react";
import { nanoid } from "nanoid";

interface MultiImageUploaderProps {
  bucket: string;
  initialPaths?: string[];
  onChange: (paths: string[]) => void;
}

type Img = {
  path: string; // storage path
  previewUrl: string; // public/full URL
  uploading: boolean;
};

const MultiImageUploader: React.FC<MultiImageUploaderProps> = ({ bucket, initialPaths = [], onChange }) => {
  const [images, setImages] = useState<Img[]>(() => initialPaths.map((p) => ({ path: p, previewUrl: supabase.storage.from(bucket).getPublicUrl(p).data.publicUrl, uploading: false })));
  const { toast } = useToast();

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files) return;

      const newImgs: Img[] = [];

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const filename = `${nanoid()}.${ext}`;
        const uploadImg: Img = { path: filename, previewUrl: URL.createObjectURL(file), uploading: true };
        setImages((prev) => [...prev, uploadImg]);
        try {
          const { error } = await supabase.storage.from(bucket).upload(filename, file, { upsert: false });
          if (error) throw error;
          const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
          uploadImg.previewUrl = data.publicUrl;
          uploadImg.uploading = false;
          newImgs.push(uploadImg);
          setImages((prev) => [...prev.filter((i) => i.path !== uploadImg.path), uploadImg]);
        } catch (e) {
          toast({ variant: "destructive", title: "Upload failed", description: (e as Error).message });
          setImages((prev) => prev.filter((i) => i.path !== uploadImg.path));
        }
      }

      onChange(imagesAfterUpload(newImgs));
    },
    [bucket, onChange, toast]
  );

  const imagesAfterUpload = (added: Img[] = []) => {
    return [...images.filter((img) => !img.uploading), ...added].map((i) => i.path);
  };

  const removeImage = async (path: string) => {
    if (!confirm("Remove this image?")) return;
    // Optimistic update
    setImages((prev) => prev.filter((i) => i.path !== path));
    onChange(imagesAfterUpload());
    await supabase.storage.from(bucket).remove([path]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-4">
        {images.map((img) => (
          <div key={img.path} className="relative w-24 h-24 rounded overflow-hidden border">
            {img.uploading ? (
              <div className="w-full h-full flex items-center justify-center animate-spin text-accent">
                <Loader2 className="w-6 h-6" />
              </div>
            ) : (
              <>
                <img src={img.previewUrl} alt="uploaded" className="object-cover w-full h-full" />
                <button
                  type="button"
                  onClick={() => removeImage(img.path)}
                  className="absolute -top-2 -right-2 bg-background text-foreground rounded-full p-1 shadow"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
        {/* Add Button */}
        <label htmlFor="img-uploader" className="w-24 h-24 border-dashed border flex items-center justify-center rounded cursor-pointer hover:bg-accent/10">
          <Plus className="w-6 h-6 text-muted-foreground" />
        </label>
        <input id="img-uploader" type="file" multiple hidden accept="image/*" onChange={(e) => {
          const f = e.target.files;
          handleFiles(f);
          e.target.value = ""; // reset
        }} />
      </div>
    </div>
  );
};

export default MultiImageUploader;
