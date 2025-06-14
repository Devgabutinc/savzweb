import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  Download, 
  RefreshCw, 
  Search,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  User,
  Package,
  DollarSign
} from "lucide-react";

interface PaymentUpdate {
  orderId: string;
  paymentType: 'dp50' | 'full';
  paymentAmount: number;
  paymentMethod: string;
  notes?: string;
}

export default function OrderListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentUpdate>({
    orderId: '',
    paymentType: 'full',
    paymentAmount: 0,
    paymentMethod: 'transfer',
    notes: ''
  });
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

  useEffect(() => {
    setTotalPages(Math.ceil(filteredOrders.length / itemsPerPage));
  }, [filteredOrders.length]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*, products(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
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

  const updateStatus = async (orderId: string, status: string, note?: string | null) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      const { error: evErr } = await supabase.from('order_events').insert({ order_id: orderId, status, note });
      if (evErr) {
        console.error('log event error', evErr);
        toast({ variant: 'destructive', title: 'Error', description: evErr.message });
      } else {
        toast({ title: 'Status berhasil diupdate' });
      }
      fetchOrders();
    }
  };

  const handleChangeStatus = (orderId: string, status: string) => {
    const note = window.prompt('Catatan (opsional)');
    updateStatus(orderId, status, note || null);
  };

  const handlePaymentUpdate = async () => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_type: paymentData.paymentType,
          payment_amount: paymentData.paymentAmount,
          payment_method: paymentData.paymentMethod,
          status: paymentData.paymentType === 'full' ? 'confirmed' : 'pending'
        })
        .eq('id', paymentData.orderId);

      if (error) throw error;

      // Log payment event
      const { error: evErr } = await supabase.from('order_events').insert({
        order_id: paymentData.orderId,
        status: paymentData.paymentType === 'full' ? 'payment_completed' : 'payment_updated',
        note: `Pembayaran diupdate: ${paymentData.paymentMethod.toUpperCase()} - ${formatPaymentType(paymentData.paymentType)} - ${formatPrice(paymentData.paymentAmount)}${paymentData.notes ? ` | Catatan: ${paymentData.notes}` : ''}`
      });

      if (evErr) console.error('log event error', evErr);

      toast({ title: 'Pembayaran berhasil diupdate' });
      setPaymentDialogOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal mengupdate pembayaran",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      // Delete order events first (foreign key constraint)
      await supabase.from('order_events').delete().eq('order_id', orderId);
      
      // Delete the order
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      
      if (error) throw error;
      
      toast({ title: 'Order berhasil dihapus' });
      fetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menghapus order",
        variant: "destructive",
      });
    }
  };

  const openPaymentDialog = (order: any) => {
    setSelectedOrder(order);
    setPaymentData({
      orderId: order.id,
      paymentType: order.payment_type || 'dp50',
      paymentAmount: order.payment_amount || 0,
      paymentMethod: order.payment_method || 'transfer',
      notes: ''
    });
    setPaymentDialogOpen(true);
  };

  const getOrderStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      processing: "bg-blue-100 text-blue-800 border-blue-200",
      shipped: "bg-purple-100 text-purple-800 border-purple-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getPaymentStatusColor = (paymentType: string) => {
    return paymentType === 'full' 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-orange-100 text-orange-800 border-orange-200";
  };

  const formatPaymentMethod = (method: string) => {
    return method.toUpperCase();
  };

  const formatPaymentType = (type: string) => {
    return type === 'dp50' ? 'DP 50%' : 'Lunas';
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    const rows = filteredOrders.map((o) => [
      `ORD#${o.id.toString().slice(-4)}`,
      o.customer_name,
      o.quantity,
      o.size,
      `${formatPaymentMethod(o.payment_method)} ${formatPaymentType(o.payment_type)}`,
      formatPrice(o.payment_amount),
      o.status.toUpperCase(),
      o.customer_address ?? "",
    ]);
    autoTable(doc, {
      head: [["No Order", "Customer", "Qty", "Size", "Pembayaran", "Jumlah", "Status", "Alamat"]],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }
    });
    doc.save(`orders-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
  };

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-8 w-8 text-blue-600" />
                Daftar Order PO
              </CardTitle>
              <p className="text-gray-600 mt-1">Kelola semua order dan pembayaran customer</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchOrders} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button variant="outline" onClick={exportPdf} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari nomor order, nama customer, atau nomor telepon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
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
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      No. Order
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Tanggal
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Produk
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Pembayaran
                    </div>
                  </TableHead>
                  <TableHead className="font-semibold text-gray-900">Bukti</TableHead>
                  <TableHead className="font-semibold text-gray-900">Status</TableHead>
                  <TableHead className="font-semibold text-gray-900">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500">Memuat data...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="h-12 w-12 text-gray-400" />
                        <p className="text-gray-500 text-lg">Tidak ada order yang ditemukan</p>
                        <p className="text-gray-400 text-sm">Coba ubah filter atau kata kunci pencarian</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="font-mono font-medium text-blue-600">
                        ORD#{order.id.toString().slice(-4)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="font-medium">{format(new Date(order.created_at), 'dd MMM yyyy', { locale: id })}</p>
                          <p className="text-gray-500">{format(new Date(order.created_at), 'HH:mm', { locale: id })}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{order.customer_name}</p>
                          <p className="text-sm text-gray-500">{order.customer_phone}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-gray-900">{order.products?.name ?? order.product_id}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">Size: {order.size}</Badge>
                            <Badge variant="outline" className="text-xs">Qty: {order.quantity}</Badge>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">{formatPaymentMethod(order.payment_method)}</Badge>
                            <Badge className={`text-xs border ${getPaymentStatusColor(order.payment_type)}`}>
                              {formatPaymentType(order.payment_type)}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium text-green-600">
                            {formatPrice(order.payment_amount)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.payment_proof ? (
                          <Button variant="ghost" size="sm" asChild className="text-blue-600 hover:text-blue-800">
                            <a
                              href={`https://ckwjrajkkyasujivfleg.supabase.co/storage/v1/object/public/payment-barcodes/${order.payment_proof}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1"
                            >
                              <Eye className="h-3 w-3" />
                              Lihat
                            </a>
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getOrderStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPaymentDialog(order)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <CreditCard className="h-3 w-3" />
                            Bayar
                          </Button>
                          
                          <Select
                            value={order.status}
                            onValueChange={(status) => handleChangeStatus(order.id, status)}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Order</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin menghapus order ORD#{order.id.toString().slice(-4)}? 
                                  Tindakan ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteOrder(order.id)} className="bg-red-600 hover:bg-red-700">
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} dari {filteredOrders.length} order
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <Button
                      key={page}
                      variant={page === currentPage ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Update Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Update Pembayaran
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Order</p>
                <p className="font-semibold">ORD#{selectedOrder.id.toString().slice(-4)} - {selectedOrder.customer_name}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentType">Jenis Pembayaran</Label>
                  <Select
                    value={paymentData.paymentType}
                    onValueChange={(value: 'dp50' | 'full') => setPaymentData(prev => ({ ...prev, paymentType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dp50">DP 50%</SelectItem>
                      <SelectItem value="full">Lunas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Metode Pembayaran</Label>
                  <Select
                    value={paymentData.paymentMethod}
                    onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="qris">QRIS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="paymentAmount">Jumlah Pembayaran (Rp)</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={paymentData.paymentAmount}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, paymentAmount: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <Textarea
                  id="notes"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Tambahkan catatan pembayaran..."
                  rows={3}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handlePaymentUpdate}>
              Update Pembayaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}