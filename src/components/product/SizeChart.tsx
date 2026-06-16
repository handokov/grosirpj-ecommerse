'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Ruler,
  Baby,
  Smile,
  UserRound,
  Info,
  TrendingUp,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import { getWhatsAppLink } from '@/lib/store-config';
import { cn } from '@/lib/utils';

// ---------- Types ----------

interface SizeRow {
  size: string;
  age: string;
  heightCm: string;
  weightKg: string;
}

interface AgeGroup {
  /** Stable id used as the tab value */
  id: 'bayi' | 'balita' | 'anak';
  /** Tab label */
  label: string;
  /** Short description shown under the title */
  range: string;
  /** Lucide icon element rendered in the tab trigger + section header */
  icon: React.ReactNode;
  /** Accent color classes (emerald / amber theme, no indigo/blue) */
  accentText: string;
  accentBg: string;
  accentBorder: string;
  accentHeaderBg: string;
  rows: SizeRow[];
}

// ---------- Data ----------

const AGE_GROUPS: AgeGroup[] = [
  {
    id: 'bayi',
    label: 'Bayi',
    range: '0–12 Bulan',
    icon: <Baby className="h-3.5 w-3.5" />,
    accentText: 'text-emerald-800',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentHeaderBg: 'bg-emerald-100/70',
    rows: [
      { size: 'BB (Baru Lahir)', age: '0–1 bulan', heightCm: '45–50', weightKg: '2.5–3.5' },
      { size: '0–3B', age: '0–3 bulan', heightCm: '50–56', weightKg: '3.5–5' },
      { size: '3–6B', age: '3–6 bulan', heightCm: '56–62', weightKg: '5–7' },
      { size: '6–12B', age: '6–12 bulan', heightCm: '62–74', weightKg: '7–10' },
    ],
  },
  {
    id: 'balita',
    label: 'Balita',
    range: '1–5 Tahun',
    icon: <Smile className="h-3.5 w-3.5" />,
    accentText: 'text-amber-700',
    accentBg: 'bg-amber-50',
    accentBorder: 'border-amber-200',
    accentHeaderBg: 'bg-amber-100/70',
    rows: [
      { size: '1–2T', age: '1–2 tahun', heightCm: '74–86', weightKg: '10–12' },
      { size: '2–3T', age: '2–3 tahun', heightCm: '86–96', weightKg: '12–14' },
      { size: '3–4T', age: '3–4 tahun', heightCm: '96–104', weightKg: '14–16' },
      { size: '4–5T', age: '4–5 tahun', heightCm: '104–110', weightKg: '16–18' },
    ],
  },
  {
    id: 'anak',
    label: 'Anak',
    range: '5–12 Tahun',
    icon: <UserRound className="h-3.5 w-3.5" />,
    accentText: 'text-emerald-800',
    accentBg: 'bg-emerald-50',
    accentBorder: 'border-emerald-200',
    accentHeaderBg: 'bg-emerald-100/70',
    rows: [
      { size: '5–6T', age: '5–6 tahun', heightCm: '110–116', weightKg: '18–20' },
      { size: '7–8T', age: '7–8 tahun', heightCm: '116–128', weightKg: '20–25' },
      { size: '9–10T', age: '9–10 tahun', heightCm: '128–138', weightKg: '25–30' },
      { size: '11–12T', age: '11–12 tahun', heightCm: '138–148', weightKg: '30–38' },
    ],
  },
];

// Category slug → tab id mapping so we can default to the right tab
function resolveDefaultTab(categorySlug?: string | null): AgeGroup['id'] {
  if (!categorySlug) return 'bayi';
  const slug = categorySlug.toLowerCase();
  if (slug.includes('anak')) return 'anak';
  if (slug.includes('balita')) return 'balita';
  return 'bayi';
}

// ---------- Component ----------

interface SizeChartProps {
  /** Optional category slug used to default to the most relevant tab */
  categorySlug?: string | null;
  /** Override the default trigger button label */
  triggerLabel?: string;
  /** Optional className applied to the trigger button */
  triggerClassName?: string;
  /** Use the small outline style by default — set false to use default size */
  compact?: boolean;
}

export default function SizeChart({
  categorySlug,
  triggerLabel = 'Panduan Ukuran',
  triggerClassName,
  compact = true,
}: SizeChartProps) {
  const [open, setOpen] = useState(false);
  const defaultTab = useMemo(() => resolveDefaultTab(categorySlug), [categorySlug]);

  const handleWhatsApp = () => {
    window.open(
      getWhatsAppLink('Halo GrosirPJ! Saya ingin bertanya tentang panduan ukuran produk anak.'),
      '_blank',
      'noopener,noreferrer',
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'border-emerald-300 text-emerald-800 hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-900 gap-1.5 font-medium',
            triggerClassName,
          )}
          aria-label="Buka panduan ukuran"
        >
          <Ruler className="h-3.5 w-3.5" />
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header — emerald gradient with ruler icon */}
        <DialogHeader className="px-5 pt-5 pb-4 space-y-1 bg-gradient-to-br from-emerald-700 to-emerald-900 text-white">
          <DialogTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <Ruler className="h-5 w-5 text-amber-300" />
            Panduan Ukuran
          </DialogTitle>
          <DialogDescription className="text-emerald-50/90 text-xs">
            Ukuran pakaian anak & bayi GrosirPJ — pilih ukuran yang paling pas untuk si kecil.
          </DialogDescription>
        </DialogHeader>

        {/* Body — scrollable tabs + tables */}
        <div className="flex-1 overflow-y-auto px-5 py-4 max-h-[calc(92vh-9rem)]">
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full h-auto bg-muted/60 p-1 gap-1">
              {AGE_GROUPS.map((group) => (
                <TabsTrigger
                  key={group.id}
                  value={group.id}
                  className="flex flex-col items-center gap-0.5 py-2 h-auto text-xs data-[state=active]:bg-white data-[state=active]:text-emerald-800 data-[state=active]:shadow-sm"
                >
                  <span className="flex items-center gap-1 font-semibold">
                    {group.icon}
                    {group.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground data-[state=active]:text-emerald-700/80 font-normal">
                    {group.range}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {AGE_GROUPS.map((group) => (
              <TabsContent key={group.id} value={group.id} className="mt-4">
                <div className={cn('rounded-xl border', group.accentBorder, group.accentBg, 'p-3')}>
                  {/* Group header */}
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm',
                        group.accentText,
                      )}
                    >
                      {group.icon}
                    </span>
                    <div>
                      <p className={cn('text-sm font-bold', group.accentText)}>{group.label}</p>
                      <p className="text-[11px] text-muted-foreground">{group.range}</p>
                    </div>
                  </div>

                  {/* Size table */}
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-white">
                    <Table className="text-xs">
                      <TableHeader>
                        <TableRow className={cn('border-b border-gray-200', group.accentHeaderBg)}>
                          <TableHead className="h-9 px-2 text-left font-semibold text-gray-700">Ukuran</TableHead>
                          <TableHead className="h-9 px-2 text-left font-semibold text-gray-700">Usia</TableHead>
                          <TableHead className="h-9 px-2 text-right font-semibold text-gray-700">Tinggi (cm)</TableHead>
                          <TableHead className="h-9 px-2 text-right font-semibold text-gray-700">Berat (kg)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {group.rows.map((row, idx) => (
                          <TableRow
                            key={row.size}
                            className={cn(
                              'border-b border-gray-100 last:border-0',
                              idx % 2 === 1 ? 'bg-gray-50/70' : 'bg-white',
                            )}
                          >
                            <TableCell className="py-2 px-2 font-semibold text-gray-900 whitespace-nowrap">
                              {row.size}
                            </TableCell>
                            <TableCell className="py-2 px-2 text-gray-600 whitespace-nowrap">
                              {row.age}
                            </TableCell>
                            <TableCell className="py-2 px-2 text-right text-gray-700 tabular-nums whitespace-nowrap">
                              {row.heightCm}
                            </TableCell>
                            <TableCell className="py-2 px-2 text-right text-gray-700 tabular-nums whitespace-nowrap">
                              {row.weightKg}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* Notes section */}
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Info className="h-3.5 w-3.5 text-amber-600" />
              <p className="text-xs font-bold text-amber-800">Catatan Penting</p>
            </div>
            <ul className="space-y-1.5 text-[11px] text-amber-900/90">
              <li className="flex items-start gap-1.5">
                <span className="mt-0.5 text-amber-600" aria-hidden>
                  •
                </span>
                <span>Ukuran bersifat estimasi, setiap merek bisa sedikit berbeda.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <TrendingUp className="mt-0.5 h-3 w-3 text-amber-600 shrink-0" />
                <span>
                  Jika anak berada di antara 2 ukuran, disarankan pilih ukuran lebih besar.
                </span>
              </li>
              <li className="flex items-start gap-1.5">
                <MessageCircle className="mt-0.5 h-3 w-3 text-amber-600 shrink-0" />
                <span>Untuk pertanyaan ukuran, hubungi kami via WhatsApp.</span>
              </li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-gray-50 border border-gray-200 p-2.5">
            <AlertTriangle className="h-3.5 w-3.5 text-gray-500 shrink-0 mt-0.5" />
            <p className="text-[10px] leading-relaxed text-gray-500">
              Tinggi & berat badan adalah acuan umum anak Indonesia. Pengukuran langsung ke tubuh
              anak tetap menjadi cara paling akurat.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-100 px-5 py-3 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 bg-white">
          <p className="text-[10px] text-muted-foreground text-center sm:text-left">
            Butuh bantuan memilih ukuran?
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Tutup
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleWhatsApp}
              className="bg-[#25D366] hover:bg-[#20BD5A] text-white gap-1.5"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Tanya via WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
