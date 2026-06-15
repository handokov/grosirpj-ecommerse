'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import {
  Search,
  MapPin,
  Truck,
  Loader2,
  AlertCircle,
  X,
  Clock,
  BadgeCheck,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

interface City {
  id: string;
  name: string;
  province: string;
  postalCode: string;
}

interface CourierService {
  code: string;
  description: string;
  cost: number;
  etd: string;
  note: string;
}

interface CourierResult {
  courier: string;
  courierName: string;
  services: CourierService[];
}

export interface SelectedShipping {
  courier: string;
  courierName: string;
  service: CourierService;
  cost: number;
  destinationId: string;
  destinationName: string;
}

interface ShippingCalculatorProps {
  totalWeight: number; // in grams
  onShippingSelected: (shipping: SelectedShipping | null) => void;
  currentShippingCost: number;
}

// Toggle: set to true when shipping API (CekOngkir/RajaOngkir) is configured
const SHIPPING_API_ENABLED = process.env.NEXT_PUBLIC_SHIPPING_API_ENABLED === 'true';

// ─── Disabled Mode: Manual ongkir input ─────────────────────────
function ShippingCalculatorDisabled({
  onShippingSelected,
  currentShippingCost,
}: ShippingCalculatorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-1 block">Ongkir</label>
      <div className="bg-gray-50 border rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Truck className="h-4 w-4 text-gray-500 mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-medium text-gray-700">Ongkir Akan Dikonfirmasi Admin</p>
            <p className="text-gray-500 mt-1">
              Cek ongkir otomatis belum tersedia. Ongkir akan dikonfirmasi via WhatsApp setelah checkout.
            </p>
          </div>
        </div>
        <div className="mt-2">
          <Input
            type="number"
            placeholder="Masukkan nominal ongkir (opsional)"
            value={currentShippingCost > 0 ? currentShippingCost : ''}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onShippingSelected(
                val > 0
                  ? {
                      courier: 'manual',
                      courierName: 'Manual',
                      service: { code: 'manual', description: 'Ongkir manual', cost: val, etd: '-', note: '' },
                      cost: val,
                      destinationId: '',
                      destinationName: '',
                    }
                  : null
              );
            }}
            className="h-9 text-sm"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Enabled Mode: Full shipping calculator with API ─────────────
function ShippingCalculatorEnabled({
  totalWeight,
  onShippingSelected,
  currentShippingCost,
}: ShippingCalculatorProps) {
  // City search
  const [citySearch, setCitySearch] = useState('');
  const debouncedCitySearch = useDebounce(citySearch, 400);
  const [cities, setCities] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [apiUnavailable, setApiUnavailable] = useState(false);

  // Courier results
  const [courierResults, setCourierResults] = useState<CourierResult[]>([]);
  const [isCheckingCost, setIsCheckingCost] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    courier: string;
    courierName: string;
    service: CourierService;
  } | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Find cheapest across all results
  const [cheapestCost, setCheapestCost] = useState<number | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search cities with debounce
  useEffect(() => {
    if (!debouncedCitySearch.trim()) {
      setCities([]);
      setShowCityDropdown(false);
      return;
    }

    setIsSearchingCity(true);
    fetch(`/api/ongkir/cities?q=${encodeURIComponent(debouncedCitySearch.trim())}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.cities?.length === 0 && data.error) {
          setApiUnavailable(true);
        } else {
          setApiUnavailable(false);
        }
        setCities(data.cities || []);
        setShowCityDropdown(true);
      })
      .catch(() => {
        setCities([]);
        setApiUnavailable(true);
      })
      .finally(() => {
        setIsSearchingCity(false);
      });
  }, [debouncedCitySearch]);

  // Check shipping cost
  const handleCheckCost = async () => {
    if (!selectedCity) return;

    setIsCheckingCost(true);
    setCourierResults([]);
    setSelectedService(null);
    setCheapestCost(null);
    setHasChecked(true);

    try {
      const res = await fetch('/api/ongkir/cost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedCity.id,
          weight: totalWeight,
        }),
      });

      const data = await res.json();

      if (data.error && (!data.results || data.results.length === 0)) {
        setApiUnavailable(true);
      } else {
        setApiUnavailable(false);
      }

      const results = data.results || [];
      setCourierResults(results);

      // Find cheapest
      if (results.length > 0) {
        let minCost = Infinity;
        results.forEach((courier: CourierResult) => {
          courier.services.forEach((s: CourierService) => {
            if (s.cost > 0 && s.cost < minCost) minCost = s.cost;
          });
        });
        setCheapestCost(minCost === Infinity ? null : minCost);
      }
    } catch {
      setCourierResults([]);
      setApiUnavailable(true);
    } finally {
      setIsCheckingCost(false);
    }
  };

  // Select a courier service
  const handleSelectService = (courier: string, courierName: string, service: CourierService) => {
    setSelectedService({ courier, courierName, service });
    onShippingSelected({
      courier,
      courierName,
      service,
      cost: service.cost,
      destinationId: selectedCity!.id,
      destinationName: `${selectedCity!.name}, ${selectedCity!.province}`,
    });
  };

  // Clear shipping selection
  const handleClearShipping = () => {
    setSelectedService(null);
    setCourierResults([]);
    setHasChecked(false);
    setCheapestCost(null);
    onShippingSelected(null);
  };

  // Change city
  const handleCityChange = () => {
    setSelectedCity(null);
    setCitySearch('');
    handleClearShipping();
  };

  // Weight display
  const weightKg = (totalWeight / 1000).toFixed(1);

  // Format ETD for display
  const formatEtd = (etd: string) => {
    if (!etd || etd === '-') return '';
    const lower = etd.toLowerCase();
    if (lower.includes('same day') || lower.includes('jam')) return etd;
    if (lower.includes('hari')) return etd;
    return `${etd} hari`;
  };

  // API unavailable fallback
  if (apiUnavailable) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Estimasi Ongkir</label>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-amber-800">Cek Ongkir Otomatis Belum Tersedia</p>
              <p className="text-amber-700 mt-1">
                Fitur cek ongkir otomatis belum diaktifkan. Silakan masukkan ongkir secara manual atau hubungi admin.
              </p>
            </div>
          </div>
          <p className="text-[10px] text-amber-600 mt-2 italic">⚠️ Harga estimasi, bukan harga resmi. Cek ke kurir untuk harga pasti.</p>
          <div className="mt-2">
            <Input
              type="number"
              placeholder="Masukkan nominal ongkir"
              value={currentShippingCost > 0 ? currentShippingCost : ''}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onShippingSelected(
                  val > 0
                    ? {
                        courier: 'manual',
                        courierName: 'Manual',
                        service: { code: 'manual', description: 'Ongkir manual', cost: val, etd: '-', note: '' },
                        cost: val,
                        destinationId: '',
                        destinationName: '',
                      }
                    : null
                );
              }}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 block">Estimasi Ongkir</label>

      {/* City Selection */}
      {!selectedCity ? (
        <div ref={dropdownRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ketik kota tujuan pengiriman..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="pl-9 h-10 text-sm"
            />
            {isSearchingCity && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            )}
          </div>

          {/* City dropdown */}
          {showCityDropdown && cities.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {cities.map((city) => (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    setSelectedCity(city);
                    setCitySearch('');
                    setShowCityDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{city.name}</p>
                      <p className="text-xs text-gray-500">{city.province}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {showCityDropdown && cities.length === 0 && citySearch.trim().length >= 3 && !isSearchingCity && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-3">
              <p className="text-sm text-gray-500 text-center">Kota tidak ditemukan</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900 truncate">{selectedCity.name}</p>
            <p className="text-xs text-emerald-700">{selectedCity.province}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
            onClick={handleCityChange}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Weight info */}
      <p className="text-xs text-muted-foreground">
        <Truck className="h-3 w-3 inline mr-1" />
        Total berat: {weightKg} kg
      </p>

      {/* Check cost button */}
      {selectedCity && !hasChecked && (
        <Button
          onClick={handleCheckCost}
          disabled={isCheckingCost}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-9 text-sm rounded-lg"
        >
          {isCheckingCost ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Mengecek ongkir...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Cek Estimasi Ongkir
            </>
          )}
        </Button>
      )}

      {/* Loading */}
      {isCheckingCost && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Mengecek estimasi ongkir...</span>
        </div>
      )}

      {/* No results */}
      {hasChecked && !isCheckingCost && courierResults.length === 0 && (
        <div className="bg-gray-50 border rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500">Tidak ada layanan pengiriman tersedia untuk tujuan ini.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={handleCheckCost}
          >
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Courier results */}
      {courierResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">
              Pilih Ekspedisi
              <span className="font-normal text-gray-500 ml-1">({courierResults.length} kurir)</span>
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-xs text-gray-500 hover:text-gray-700"
              onClick={handleClearShipping}
            >
              Hapus pilihan
            </Button>
          </div>

          {courierResults.map((courier) => (
            <div key={courier.courier} className={`border rounded-lg overflow-hidden ${getCourierColor(courier.courier)}`}>
              {/* Courier header */}
              <div className={`px-3 py-2 border-b ${getCourierHeaderColor(courier.courier)}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold uppercase">{courier.courierName}</p>
                  <span className="text-[10px] opacity-70">{courier.services.length} layanan</span>
                </div>
              </div>

              {/* Services */}
              <div className="divide-y divide-black/5">
                {courier.services.map((service) => {
                  const isSelected =
                    selectedService?.courier === courier.courier &&
                    selectedService?.service.code === service.code;

                  const isCheapest = cheapestCost !== null && service.cost === cheapestCost;

                  return (
                    <button
                      key={`${courier.courier}-${service.code}`}
                      type="button"
                      onClick={() => handleSelectService(courier.courier, courier.courierName, service)}
                      className={`w-full text-left px-3 py-2.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-50/80 border-l-2 border-l-emerald-600'
                          : 'hover:bg-white/50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">
                              {service.description}
                            </p>
                            {isCheapest && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold bg-emerald-600 text-white px-1.5 py-0.5 rounded shrink-0">
                                <BadgeCheck className="h-3 w-3" />
                                Termurah
                              </span>
                            )}
                          </div>
                          {service.etd && service.etd !== '-' && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Clock className="h-3 w-3" />
                              Estimasi: {formatEtd(service.etd)}
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">
                            {formatRupiah(service.cost)}
                          </p>
                          {isSelected && (
                            <span className="text-[10px] text-emerald-700 font-medium">✓ Dipilih</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclaimer */}
      {selectedService && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 italic">Harga estimasi, bukan harga resmi. Cek ke kurir untuk harga pasti.</p>
          </div>
        </div>
      )}

      {/* Selected shipping summary */}
      {selectedService && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs font-medium text-emerald-900">
                  {selectedService.courierName} - {selectedService.service.description}
                </p>
                {selectedService.service.etd && selectedService.service.etd !== '-' && (
                  <p className="text-[10px] text-emerald-700">Est. {formatEtd(selectedService.service.etd)}</p>
                )}
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-900">{formatRupiah(selectedService.service.cost)}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Courier color scheme ────────────────────────────────────────
function getCourierColor(code: string) {
  const colors: Record<string, string> = {
    jne: 'bg-orange-50 border-orange-200 text-orange-800',
    tiki: 'bg-red-50 border-red-200 text-red-800',
    pos: 'bg-red-50 border-red-200 text-red-700',
    jnt: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    sicepat: 'bg-sky-50 border-sky-200 text-sky-800',
    anteraja: 'bg-purple-50 border-purple-200 text-purple-800',
    wahana: 'bg-amber-50 border-amber-200 text-amber-800',
    ninja: 'bg-teal-50 border-teal-200 text-teal-800',
    lion: 'bg-rose-50 border-rose-200 text-rose-800',
    gosend: 'bg-green-50 border-green-200 text-green-800',
    grab: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  };
  return colors[code] || 'bg-gray-50 border-gray-200 text-gray-800';
}

function getCourierHeaderColor(code: string) {
  const colors: Record<string, string> = {
    jne: 'bg-orange-100 text-orange-900',
    tiki: 'bg-red-100 text-red-900',
    pos: 'bg-red-100 text-red-800',
    jnt: 'bg-yellow-100 text-yellow-900',
    sicepat: 'bg-sky-100 text-sky-900',
    anteraja: 'bg-purple-100 text-purple-900',
    wahana: 'bg-amber-100 text-amber-900',
    ninja: 'bg-teal-100 text-teal-900',
    lion: 'bg-rose-100 text-rose-900',
    gosend: 'bg-green-100 text-green-900',
    grab: 'bg-emerald-100 text-emerald-900',
  };
  return colors[code] || 'bg-gray-100 text-gray-900';
}

// ─── Main export: switch between disabled/enabled mode ──────────
export default function ShippingCalculator(props: ShippingCalculatorProps) {
  if (!SHIPPING_API_ENABLED) {
    return <ShippingCalculatorDisabled {...props} />;
  }
  return <ShippingCalculatorEnabled {...props} />;
}
