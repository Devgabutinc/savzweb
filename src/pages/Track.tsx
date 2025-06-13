import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OrderEvent {
  status: string;
  occurred_at: string;
  note?: string | null;
}

interface OrderInfo {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  quantity: number;
  size: string;
  products?: { name: string } | null;
}

const statusLabel: Record<string,string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled"
};

const TrackPage = () => {
  const [code,setCode] = useState("");
  const [loading,setLoading] = useState(false);
  const [events,setEvents] = useState<OrderEvent[]>([]);
  const [notFound,setNotFound]=useState(false);
  const [order,setOrder] = useState<OrderInfo|null>(null);

  const handleSearch = async () => {
    const suffix = code.replace(/[^0-9a-zA-Z]/g,"").slice(-4);
    // console.log('suffix', suffix);
    if(!suffix) return;
    setLoading(true);
    setEvents([]);
    setOrder(null);
    setNotFound(false);
    // find order uuid
    let { data: orderData } = await supabase
      .from("orders")
      .select("id")
      .like("id", `%${suffix}`);

    if(!orderData || orderData.length===0){
      // fallback fetch recent orders and match on client
      const { data: recent } = await supabase
        .from("orders")
        .select("id")
        .limit(1000);
      orderData = recent?.filter((o:any)=>o.id.endsWith(suffix));
    }

    // console.log('orderData', orderData);

    if(!orderData || orderData.length===0){
      setNotFound(true);
      setLoading(false);
      return;
    }

    const orderId = orderData[0].id;

    // fetch order info
    const { data: orderDetail } = await supabase
      .from("orders")
      .select("customer_name, customer_phone, customer_address, quantity, size, products(name)")
      .eq("id", orderId)
      .single();
    setOrder(orderDetail as any);

    const { data: ev, error: evErr } = await (supabase as any)
      .from("order_events")
      .select("status, occurred_at, note")
      .eq("order_id", orderId)
      .order("occurred_at", { ascending: true });
    // console.log('events', ev, evErr);

    if(evErr || !ev || ev.length===0){
      setNotFound(true);
    } else {
      setEvents(ev as any);
      setNotFound(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex flex-col items-center flex-1 p-6">
        <h1 className="text-2xl font-bold mb-4">Lacak Pesanan</h1>
        <div className="flex gap-2 mb-6 w-full max-w-md">
          <Input placeholder="Masukkan kode order (ORD#1234)" value={code} onChange={(e)=>setCode(e.target.value)}/>
          <Button onClick={handleSearch} disabled={loading}>Cari</Button>
        </div>

        <Button variant="link" className="mb-4" asChild>
          <a href="/">← Kembali ke Home</a>
        </Button>

        {loading && <p>Loading...</p>}
        {notFound && !order && <p className="text-muted-foreground">Pesanan tidak ditemukan.</p>}
        {order && (
          <div className="w-full max-w-md mb-6 border rounded-lg p-4 text-sm bg-card">
            <p><strong>Nama:</strong> {order.customer_name}</p>
            <p><strong>No Telp:</strong> {order.customer_phone}</p>
            <p><strong>Alamat:</strong> {order.customer_address}</p>
            <p><strong>Produk:</strong> {order.products?.name ?? '-'}</p>
            <p><strong>Ukuran / Qty:</strong> {order.size} / {order.quantity}</p>
          </div>
        )}
        {events.length>0 && (
          <ol className="border-l border-accent w-full max-w-md">
            {events.map(ev=> (
              <li key={ev.occurred_at} className="mb-4 ml-4">
                <div className="absolute w-3 h-3 bg-primary rounded-full -left-1.5 border border-white" />
                <time className="mb-1 text-xs font-normal leading-none text-muted-foreground">
                  {format(new Date(ev.occurred_at), "dd MMM yyyy HH:mm", { locale: id })}
                </time>
                <p className="text-sm font-medium">{statusLabel[ev.status] ?? ev.status} {ev.note ? `- ${ev.note}` : ""}</p>
              </li>
            ))}
          </ol>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TrackPage;
