import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Order, Product } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const statusColor: Record<Order["status"], string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-lime-100 text-lime-800",
  cancelled: "bg-red-100 text-red-800",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*, products(*)")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed fetch orders" });
    } else {
      setOrders(data as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: Order["status"]) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ variant: "destructive", title: "Update failed", description: error.message });
    } else {
      toast({ title: "Status updated" });
      fetchOrders();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Orders</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Card key={o.id} onClick={() => setSelected(o)} className="cursor-pointer hover:bg-muted/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 py-3">
                <CardTitle className="text-lg">{o.customer_name}</CardTitle>
                <Badge className={statusColor[o.status]}>{o.status}</Badge>
              </CardHeader>
              <CardContent className="flex justify-between text-sm text-muted-foreground">
                <span>{format(new Date(o.created_at), "dd MMM yyyy HH:mm")}</span>
                <span>IDR {o.total_price.toLocaleString("id-ID")}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      {selected && (
        <Dialog open onOpenChange={() => setSelected(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Order Detail</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <p><strong>Customer:</strong> {selected.customer_name}</p>
              <p><strong>Phone:</strong> {selected.customer_phone}</p>
              <p><strong>Total:</strong> IDR {selected.total_price.toLocaleString("id-ID")}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Created:</strong> {format(new Date(selected.created_at), "dd MMM yyyy HH:mm")}</p>
            </div>
            <div className="flex gap-2 mt-4">
              {(["pending", "paid", "shipped", "delivered", "cancelled"] as Order["status"][]).map((s) => (
                <Button key={s} size="sm" variant={selected.status===s?"default":"outline"} onClick={() => updateStatus(selected.id, s)}>
                  {s}
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OrdersPage;