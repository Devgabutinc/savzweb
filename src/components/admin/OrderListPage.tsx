import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone.includes(searchQuery) ||
      order.id.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || statusFilter === '' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // update order status
  const updateStatus = async (orderId: string, status: string, note?: string | null) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      // log event
      const { error: evErr } = await supabase.from('order_events').insert({ order_id: orderId, status, note });
      if (evErr) {
        console.error('log event error', evErr);
        toast({ variant: 'destructive', title: 'Error', description: evErr.message });
      } else {
        toast({ title: 'Status updated' });
      }
      fetchOrders();
    }
  };

  const handleChangeStatus = (orderId: string, status: string) => {
    const note = window.prompt('Catatan (opsional)');
    updateStatus(orderId, status, note || null);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
      setTotalPages(Math.ceil((data?.length || 0) / itemsPerPage));
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusColor = (status: string) => {
    const statusColors = {
      pending: "warning",
      confirmed: "success",
      processing: "info",
      shipped: "primary",
      completed: "success",
      cancelled: "destructive",
    };
    return statusColors[status as keyof typeof statusColors] || "secondary";
  };

  const formatPaymentMethod = (method: string) => {
    return method.toUpperCase();
  };

  const formatPaymentType = (type: string) => {
    return type === 'dp50' ? 'DP 50%' : 'Penuh';
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const rows = filteredOrders.map((o) => [
      `ORD#${o.id.toString().slice(-4)}`,
      o.customer_name,
      o.quantity,
      o.size,
      `${formatPaymentMethod(o.payment_method)} ${formatPaymentType(o.payment_type)}`,
      o.customer_address ?? "",
    ]);
    autoTable(doc, {
      head: [["No Order", "Customer", "Qty", "Size", "Pembayaran", "Alamat"]],
      body: rows,
    });
    doc.save("orders.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Daftar Order PO</h1>
        <div className="flex gap-2">
          <Button onClick={fetchOrders}>Refresh</Button>
          <Button variant="outline" onClick={exportPdf}>Export PDF</Button>
          <Input
            placeholder="Cari nomor order, nama customer, atau nomor telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="px-6 py-3 text-left text-sm font-medium">No. Order</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Tanggal</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Customer</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Produk</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Pembayaran</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Bukti</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">Tidak ada order yang ditemukan</p>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-6 py-4 font-medium">ORD#{order.id.toString().slice(-4)}</td>
                    <td className="px-6 py-4">
                      {format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: id })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-medium">{order.products?.name ?? order.product_id}</p>
                        <p className="text-sm text-muted-foreground">
                          Size: {order.size}, Qty: {order.quantity}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <Badge variant="outline">{formatPaymentMethod(order.payment_method)}</Badge>
                          <Badge variant="outline">{formatPaymentType(order.payment_type)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          DP: {formatPrice(order.payment_amount)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {order.payment_proof ? (
                        <Button variant="ghost" size="sm" asChild>
                          <a
                            href={`https://ckwjrajkkyasujivfleg.supabase.co/storage/v1/object/public/payment-barcodes/${order.payment_proof}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Bukti
                          </a>
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={getOrderStatusColor(order.status)}>
                        {order.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {['pending','confirmed','processing','shipped','completed','cancelled'].map((s)=>(
                          <Button
                            key={s}
                            variant={order.status===s? 'default' : 'outline'}
                            size="sm"
                            onClick={()=>handleChangeStatus(order.id, s)}
                          >
                            {s}
                          </Button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} dari {filteredOrders.length} order
        </p>
        {/* Pagination controls */}
        <div className="flex gap-2">
          <button
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage>1) setCurrentPage(currentPage-1); }}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              href="#"
              className={page === currentPage ? 'bg-primary text-white' : ''}
              onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
            >
              {page}
            </button>
          ))}
          <button
            href="#"
            onClick={(e) => { e.preventDefault(); if (currentPage<totalPages) setCurrentPage(currentPage+1); }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
