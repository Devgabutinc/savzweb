import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Edit } from "lucide-react";
import MultiImageUploader from "@/components/MultiImageUploader";

interface PayAcc {
  id: string;
  method: "bank"|"qris";
  bank_name: string;
  account_number: string;
  account_name: string;
  barcode_path: string | null;
  is_active: boolean;
}

const BUCKET = "payment-barcodes";

const BankConfigPage = () => {
  const [accounts, setAccounts] = useState<PayAcc[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<PayAcc | null>(null);
  const [form, setForm] = useState({ method: "bank" as "bank"|"qris", bank_name: "", account_number: "", account_name: "", barcode_path: "", is_active: true, barcodeFile: null as File | null });
  const { toast } = useToast();

  const fetchAccounts = async () => {
    setLoading(true);
    // @ts-ignore - table not in generated types yet
    const { data, error } = await supabase.from("payment_accounts" as any).select("*").order("created_at", { ascending: false });
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else setAccounts(data as any);
    setLoading(false);
  };

  useEffect(() => { fetchAccounts(); }, []);

  const resetForm = () => {
    setForm({ method: "bank", bank_name: "", account_number: "", account_name: "", barcode_path: "", is_active: true, barcodeFile: null });
    setEditing(null);
  };

  const uploadBarcode = async (file: File | null): Promise<string | null> => {
    if (!file) return editing?.barcode_path ?? null;
    const ext = file.name.split(".").pop();
    const filename = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(filename, file);
    if (error) {
      toast({ variant: "destructive", title: "Upload error", description: error.message });
      return null;
    }
    return filename;
  };

  const handleSubmit = async () => {
    const path = await uploadBarcode(form.barcodeFile);
    if (path === null && form.barcodeFile) return; // upload failed

    const payload = { method: form.method, bank_name: form.bank_name, account_number: form.account_number, account_name: form.account_name, barcode_path: path, is_active: form.is_active };

    if (editing) {
      // @ts-ignore
      const { error } = await supabase.from("payment_accounts" as any).update(payload).eq("id", editing.id);
      if (error) toast({ variant: "destructive", title: "Error", description: error.message });
      else toast({ title: "Updated" });
    } else {
      // @ts-ignore
      const { error } = await supabase.from("payment_accounts" as any).insert(payload);
      if (error) toast({ variant: "destructive", title: "Error", description: error.message });
      else toast({ title: "Added" });
    }
    setOpenForm(false);
    resetForm();
    fetchAccounts();
  };

  const handleDelete = async (acc: PayAcc) => {
    if (!confirm("Delete this account?")) return;
    // @ts-ignore
    const { error } = await supabase.from("payment_accounts" as any).delete().eq("id", acc.id);
    if (error) toast({ variant: "destructive", title: "Error", description: error.message });
    else {
      if (acc.barcode_path) await supabase.storage.from(BUCKET).remove([acc.barcode_path]);
      toast({ title: "Deleted" });
      fetchAccounts();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold">Bank Config</h2>
        <Button onClick={() => { resetForm(); setOpenForm(true); }}><Plus className="w-4 h-4 mr-2"/>Add</Button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map(acc => (
            <Card key={acc.id}>
              <CardHeader className="flex justify-between items-start space-y-0 pb-2">
                <CardTitle className="text-lg">{acc.bank_name}</CardTitle>
                {!acc.is_active && <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>}
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p><strong>Name:</strong> {acc.account_name}</p>
                <p><strong>No:</strong> {acc.account_number}</p>
                {acc.barcode_path && <img src={supabase.storage.from(BUCKET).getPublicUrl(acc.barcode_path).data.publicUrl} alt="barcode" className="w-24 h-24 object-contain mt-2" />}
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => { setEditing(acc); setForm({ ...acc, barcodeFile: null }); setOpenForm(true); }}><Edit className="w-4 h-4"/></Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(acc)}><Trash2 className="w-4 h-4"/></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form dialog */}
      {openForm && (
        <Dialog open onOpenChange={(v)=>{if(!v){setOpenForm(false);resetForm();}}}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>{editing?"Edit":"Add"} Account</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Select value={form.method} onValueChange={(v: "bank"|"qris")=>setForm({...form, method:v})}>
                <SelectTrigger><SelectValue placeholder="Method"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">Bank Transfer</SelectItem>
                  <SelectItem value="qris">QRIS</SelectItem>
                </SelectContent>
              </Select>

              <Input placeholder="Label / Bank Name" value={form.bank_name} onChange={e=>setForm({...form, bank_name:e.target.value})} />
              {form.method==='bank' && <Input placeholder="Account Number" value={form.account_number} onChange={e=>setForm({...form, account_number:e.target.value})} />}
              {form.method==='bank' && <Input placeholder="Account Holder Name" value={form.account_name} onChange={e=>setForm({...form, account_name:e.target.value})} />}
              <div>
                <label className="block text-sm mb-1">{form.method==='qris' ? 'QRIS Barcode' : 'Optional Barcode'}</label>
                <Input type="file" accept="image/*" onChange={e=>setForm({...form, barcodeFile:e.target.files?.[0]||null})} />
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={handleSubmit}>{editing?"Update":"Save"}</Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BankConfigPage;
