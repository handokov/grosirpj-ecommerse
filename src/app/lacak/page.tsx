'use client';

import { useState, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Package,
  Truck,
  User,
  Phone,
  MapPin,
  CreditCard,
  CheckCircle,
  Upload,
  XCircle,
  Clock,
  ArrowRight,
  MessageCircle,
  ImageIcon,
  Loader2,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { WA_NUMBER, BCA_REKENING, getWhatsAppLink } from '@/lib/store-config';
import { formatRupiah, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

// ---------- Types ----------

interface OrderItem {
  quantity: number;
  size: string | null;
  color: string | null;
  variant: string | null;
  price: number;
  productName: string;
  productImage: string | null;
  product: { name: string; images: string | null };
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddr: string | null;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentProof: string | null;
  paymentNotes: string | null;
  totalAmount: number;
  shippingCost: number;
  courier: string | null;
  courierService: string | null;
  destinationCity: string | null;
  note: string | null;
  createdAt: string;
  items: OrderItem[];
}

// ---------- Timeline Config ----------

const STATUS_STEPS_PUBLIC = [
  { key: 'pending' as const, label: 'Pesanan Dibuat', icon: Clock },
  { key: 'confirmed' as const, label: 'Dikonfirmasi', icon: CheckCircle },
  { key: 'processing' as const, label: 'Diproses', icon: Package },
  { key: 'shipped' as const, label: 'Dikirim', icon: Truck },
  { key: 'completed' as const, label: 'Selesai', icon: CheckCircle },
];

const COURIER_LABELS: Record<string, string> = {
  jne: 'JNE',
  jnt: 'J&T Express',
  sicepat: 'SiCepat',
  anteraja: 'AnterAja',
  tiki: 'TIKI',
  pos: 'POS Indonesia',
  wahana: 'Wahana Express',
  ninja: 'Ninja Xpress',
  gosend: 'GoSend',
  grab: 'Grab Express',
};

function getCourierLabel(courier: string | null): string {
  if (!courier) return '-';
  return COURIER_LABELS[courier.toLowerCase()] || courier.toUpperCase();
}

// ---------- Vertical Timeline ----------

function StatusTimeline({ status }: { status: OrderData['status'] }) {
  const isCancelled = status === 'cancelled';
  const currentStepIndex = STATUS_STEPS_PUBLIC.findIndex((s) => s.key === status);

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <XCircle className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="font-semibold text-red-700 text-sm">Pesanan Dibatalkan</p>
          <p className="text-xs text-red-500">Pesanan ini telah dibatalkan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {STATUS_STEPS_PUBLIC.map((step, index) => {
        const isCompleted = currentStepIndex > index;
        const isCurrent = currentStepIndex === index;
        const isFuture = currentStepIndex < index;
        const StepIcon = step.icon;
        const isLast = index === STATUS_STEPS_PUBLIC.length - 1;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Left column: dot + line */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : isCurrent
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'bg-gray-50 border-gray-200 text-gray-300'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <StepIcon className="w-3.5 h-3.5" />
                )}
              </div>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 min-h-[32px] flex-1',
                    isCompleted ? 'bg-emerald-400' : 'bg-gray-200'
                  )}
                />
              )}
            </div>
            {/* Right column: label */}
            <div className={cn('pb-4', isLast && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-medium leading-tight pt-1',
                  isCompleted
                    ? 'text-emerald-700'
                    : isCurrent
                      ? 'text-emerald-600 font-semibold'
                      : 'text-gray-400'
                )}
              >
                {step.label}
              </p>
              {isCurrent && (
                <p className="text-[11px] text-emerald-500 mt-0.5">Sedang berlangsung</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------- Payment Proof Upload ----------

function PaymentProofUpload({
  orderNumber,
  onUploadSuccess,
}: {
  orderNumber: string;
  onUploadSuccess: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('File terlalu besar. Maksimal 10MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('paymentProof', selectedFile);
      if (paymentNotes.trim()) {
        formData.append('paymentNotes', paymentNotes.trim());
      }

      const res = await fetch(`/api/orders/${orderNumber}/payment-proof`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Gagal mengupload bukti pembayaran.');
        return;
      }

      setSelectedFile(null);
      setPreview(null);
      setPaymentNotes('');
      onUploadSuccess();
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      <Separator />
      <div>
        <h4 className="text-sm font-semibold text-gray-800 mb-1">Upload Bukti Pembayaran</h4>
        <p className="text-xs text-gray-500 mb-3">
          Kirim foto bukti transfer untuk mempercepat verifikasi
        </p>
      </div>

      {/* File Input */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          id="payment-proof-input"
        />
        {!selectedFile ? (
          <label
            htmlFor="payment-proof-input"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">Klik untuk pilih foto</span>
            <span className="text-[11px] text-gray-400 mt-1">JPG, PNG, WebP, GIF (maks. 10MB)</span>
          </label>
        ) : (
          <div className="relative">
            {preview && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={preview}
                  alt="Preview bukti pembayaran"
                  fill
                  className="object-contain bg-gray-50"
                />
                <button
                  onClick={clearFile}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Hapus foto"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1.5 truncate">{selectedFile.name}</p>
          </div>
        )}
      </div>

      {/* Optional Notes */}
      <div>
        <label htmlFor="payment-notes" className="text-xs text-gray-600 font-medium block mb-1">
          Catatan (opsional)
        </label>
        <Input
          id="payment-notes"
          placeholder="Misalnya: Transfer dari BCA atas nama..."
          value={paymentNotes}
          onChange={(e) => setPaymentNotes(e.target.value)}
          className="text-sm"
          maxLength={200}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
      >
        {uploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Mengupload...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            Upload Bukti Pembayaran
          </>
        )}
      </Button>
    </div>
  );
}

// ---------- Main Content ----------

function LacakPageContent() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('order') || '';

  const [orderInput, setOrderInput] = useState(initialOrderNumber);
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async (orderNumber: string) => {
    const trimmed = orderNumber.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setError('Pesanan tidak ditemukan. Pastikan nomor invoice benar.');
        } else {
          setError(data.error || 'Terjadi kesalahan saat mencari pesanan.');
        }
        setOrder(null);
        return;
      }

      setOrder(data.order);
    } catch {
      setError('Tidak dapat terhubung ke server. Silakan coba lagi.');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderInput.trim()) {
      fetchOrder(orderInput);
    }
  };

  const refreshOrder = useCallback(() => {
    if (order?.orderNumber) {
      fetchOrder(order.orderNumber);
    }
  }, [order?.orderNumber, fetchOrder]);

  // Auto-search if initial order number from URL
  const hasAutoSearched = useRef(false);
  if (initialOrderNumber && !hasAutoSearched.current && !searched) {
    hasAutoSearched.current = true;
    // Defer to avoid React state update during render
    setTimeout(() => fetchOrder(initialOrderNumber), 0);
  }

  // ---- Render: Search Form ----

  const renderSearchForm = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 mb-4 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Lacak Pesanan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Masukkan nomor invoice untuk melihat status pesanan
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              value={orderInput}
              onChange={(e) => setOrderInput(e.target.value)}
              placeholder="Contoh: GPJ-20260616-0005"
              className="pl-10 pr-4 h-12 text-base rounded-xl border-gray-300 focus:border-emerald-500 focus:ring-emerald-500/20"
              aria-label="Nomor invoice"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !orderInput.trim()}
            className="w-full h-12 text-base bg-gradient-to-r from-emerald-600 to-emerald-800 hover:from-emerald-700 hover:to-emerald-900 rounded-xl shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mencari...
              </>
            ) : (
              <>
                <Truck className="w-5 h-5" />
                Lacak Pesanan
              </>
            )}
          </Button>
        </form>

        {/* Error State */}
        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-sm text-red-700 font-medium mb-1">{error}</p>
            <p className="text-xs text-red-500 mb-3">
              Pastikan nomor invoice sudah benar atau hubungi kami untuk bantuan
            </p>
            <a
              href={getWhatsAppLink('Halo, saya tidak bisa menemukan pesanan saya.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Hubungi via WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );

  // ---- Render: Order Result ----

  const renderOrderResult = () => {
    if (!order) return null;

    const isCancelled = order.status === 'cancelled';
    const isShippedOrCompleted = order.status === 'shipped' || order.status === 'completed';
    const productTotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return (
      <div className="max-w-2xl mx-auto px-4 py-6 md:py-10 space-y-4">
        {/* Order Header */}
        <Card className="border-0 shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-700 to-emerald-900 px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-200 text-xs font-medium uppercase tracking-wide">Invoice</p>
                <h2 className="text-lg md:text-xl font-bold tracking-tight">{order.orderNumber}</h2>
              </div>
              <Badge
                className={cn(
                  'text-xs font-semibold px-3 py-1',
                  isCancelled
                    ? 'bg-red-500/20 text-red-100 border-red-400/30'
                    : 'bg-emerald-400/20 text-emerald-100 border-emerald-400/30'
                )}
              >
                {isCancelled ? 'Dibatalkan' : 'Aktif'}
              </Badge>
            </div>
            <p className="text-emerald-200 text-xs mt-1">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </Card>

        {/* Status Timeline */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-emerald-600" />
              Status Pesanan
            </h3>
            <StatusTimeline status={order.status} />
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Info Penerima
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Nama</p>
                  <p className="text-sm font-medium text-gray-800">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400">Telepon</p>
                  <p className="text-sm font-medium text-gray-800">{order.customerPhone}</p>
                </div>
              </div>
              {order.customerAddr && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Alamat</p>
                    <p className="text-sm font-medium text-gray-800">{order.customerAddr}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-600" />
              Daftar Produk
            </h3>
            <div className="space-y-3">
              {order.items.map((item, index) => {
                const itemImage =
                  item.productImage ||
                  (item.product?.images
                    ? (() => {
                        try {
                          const parsed = JSON.parse(item.product.images);
                          return Array.isArray(parsed) ? parsed[0] : parsed;
                        } catch {
                          return item.product.images;
                        }
                      })()
                    : null);

                return (
                  <div
                    key={index}
                    className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 shrink-0 border border-gray-200">
                      {itemImage ? (
                        <Image
                          src={itemImage}
                          alt={item.productName}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.productName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {item.size && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-sky-100 text-sky-800 hover:bg-sky-200">
                            {item.color}
                          </Badge>
                        )}
                        {item.variant && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-800 hover:bg-amber-200">
                            {item.variant}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {item.quantity} × {formatRupiah(item.price)}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-700 mt-1">
                        {formatRupiah(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Note */}
            {order.note && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-xs font-medium text-amber-700 mb-0.5">Catatan Pesanan:</p>
                <p className="text-xs text-amber-600">{order.note}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Ringkasan Pembayaran
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal Produk</span>
                <span className="text-gray-700 font-medium">{formatRupiah(productTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Ongkir
                  {order.courier && (
                    <span className="text-gray-400 ml-1">
                      ({getCourierLabel(order.courier)}
                      {order.courierService ? ` ${order.courierService}` : ''})
                    </span>
                  )}
                </span>
                <span className="text-gray-700 font-medium">
                  {order.shippingCost > 0 ? formatRupiah(order.shippingCost) : 'Gratis'}
                </span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-800">Total Bayar</span>
                <span className="text-lg font-bold text-emerald-600">
                  {formatRupiah(order.totalAmount)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Section */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Status Pembayaran
            </h3>

            {/* Paid */}
            {order.paymentStatus === 'paid' && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-emerald-700">Pembayaran Dikonfirmasi ✓</p>
                  <p className="text-xs text-emerald-500">Terima kasih, pembayaran Anda sudah kami terima</p>
                </div>
              </div>
            )}

            {/* Proof uploaded but not yet confirmed */}
            {order.paymentStatus === 'unpaid' && order.paymentProof && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <Clock className="w-6 h-6 text-amber-500 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-amber-700">Bukti Terkirim — Menunggu Verifikasi</p>
                    <p className="text-xs text-amber-500">
                      Kami sedang memverifikasi bukti pembayaran Anda
                    </p>
                  </div>
                </div>
                {order.paymentProof && (
                  <a
                    href={order.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <Image
                        src={order.paymentProof}
                        alt="Bukti pembayaran"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 text-center">
                      Klik untuk melihat gambar asli
                    </p>
                  </a>
                )}
              </div>
            )}

            {/* Unpaid and no proof */}
            {order.paymentStatus === 'unpaid' && !order.paymentProof && (
              <div className="space-y-4">
                {/* BCA Rekening Info */}
                <div className="p-4 rounded-xl bg-sky-50 border border-sky-200">
                  <p className="text-xs font-semibold text-sky-700 mb-2">Transfer ke rekening:</p>
                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-sky-100">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider">Bank BCA</p>
                      <p className="text-lg font-bold text-gray-900 tracking-wider font-mono">
                        {BCA_REKENING}
                      </p>
                      <p className="text-xs text-gray-500">a.n. GrosirPJ</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(BCA_REKENING);
                      }}
                    >
                      Salin
                    </Button>
                  </div>
                  <p className="text-[11px] text-sky-600 mt-2">
                    Total: <span className="font-bold">{formatRupiah(order.totalAmount)}</span>
                  </p>
                </div>

                {/* Upload Form */}
                {!isCancelled && (
                  <PaymentProofUpload
                    orderNumber={order.orderNumber}
                    onUploadSuccess={refreshOrder}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Info (only when shipped or completed) */}
        {isShippedOrCompleted && order.courier && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                Info Pengiriman
              </h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Kurir</p>
                    <p className="text-sm font-medium text-gray-800">
                      {getCourierLabel(order.courier)}
                      {order.courierService ? ` — ${order.courierService}` : ''}
                    </p>
                  </div>
                </div>
                {order.destinationCity && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-400">Tujuan</p>
                      <p className="text-sm font-medium text-gray-800">{order.destinationCity}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* WhatsApp Contact Button */}
        <div className="pt-2 pb-6">
          <a
            href={getWhatsAppLink(
              `Halo, saya ingin bertanya tentang pesanan saya ${order.orderNumber}`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-400 text-sm font-semibold"
            >
              <MessageCircle className="w-5 h-5" />
              Butuh Bantuan? Chat WhatsApp
            </Button>
          </a>

          {/* Search Again */}
          <button
            onClick={() => {
              setOrder(null);
              setSearched(false);
              setError(null);
              setOrderInput('');
            }}
            className="w-full text-center text-sm text-gray-500 hover:text-emerald-600 mt-3 py-2 transition-colors"
          >
            ← Lacak pesanan lain
          </button>
        </div>
      </div>
    );
  };

  // ---- Main Render ----

  return (
    <section className="min-h-[70vh]">
      {order ? renderOrderResult() : renderSearchForm()}
    </section>
  );
}

// ---------- Page Export with Suspense ----------

export default function LacakPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-sm text-gray-500">Memuat...</p>
          </div>
        </div>
      }
    >
      <LacakPageContent />
    </Suspense>
  );
}
