'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { searchCities, type CityProvince } from '@/lib/city-province-map';
import {
  Search,
  MapPin,
  Truck,
  Loader2,
  AlertCircle,
  X,
  Clock,
  BadgeCheck,
  ChevronDown,
} from 'lucide-react';
import { formatRupiah } from '@/lib/format';

interface CourierService {
  code: string;
  label: string;
  cost: number;
  etd: string;
  firstKg: number;
  nextKg: number;
}

interface CourierResult {
  courier: string;
  courierName: string;
  services: CourierService[];
}

export interface SelectedShipping {
  courier: string;
  courierName: string;
  service: { code: string; description: string; cost: number; etd: string; note: string };
  cost: number;
  destinationId: string;
  destinationName: string;
  province: string;
}

interface ShippingCalculatorProps {
  totalWeight: number; // in grams
  onShippingSelected: (shipping: SelectedShipping | null) => void;
  currentShippingCost: number;
}

// ─── City Search + Zone-based Shipping Calculator ──────────────────
export default function ShippingCalculator({
  totalWeight,
  onShippingSelected,
  currentShippingCost,
}: ShippingCalculatorProps) {
  // City search state
  const [citySearch, setCitySearch] = useState('');
  const debouncedCitySearch = useDebounce(citySearch, 300);
  const [cityResults, setCityResults] = useState<CityProvince[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityProvince | null>(null);

  // Courier results state
  const [courierResults, setCourierResults] = useState<CourierResult[]>([]);
  const [isCheckingCost, setIsCheckingCost] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    courier: string;
    courierName: string;
    service: CourierService;
  } | null>(null);
  const [cheapestCost, setCheapestCost] = useState<number | null>(null);
  const [zoneInfo, setZoneInfo] = useState<{ code: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Search cities locally when debounced query changes
  useEffect(() => {
    if (!debouncedCitySearch.trim()) {
      setCityResults([]);
      setShowCityDropdown(false);
      return;
    }
    const results = searchCities(debouncedCitySearch.trim(), 15);
    setCityResults(results);
    setShowCityDropdown(results.length > 0);
  }, [debouncedCitySearch]);

  // Fetch shipping costs when a city is selected
  const fetchShippingCosts = useCallback(async (province: string) => {
    setIsCheckingCost(true);
    setCourierResults([]);
    setSelectedService(null);
    setCheapestCost(null);
    setZoneInfo(null);
    setErrorMessage(null);

    try {
      const res = await fetch(
        `/api/shipping/calculate?province=${encodeURIComponent(province)}&weight=${totalWeight}`
      );
      const data = await res.json();

      if (data.message && (!data.results || data.results.length === 0)) {
        setErrorMessage(data.message);
        setCourierResults([]);
        return;
      }

      const results: CourierResult[] = data.results || [];
      setCourierResults(results);
      setZoneInfo(data.zone || null);

      // Find cheapest across all results
      if (results.length > 0) {
        let minCost = Infinity;
        results.forEach((courier) => {
          courier.services.forEach((s) => {
            if (s.cost > 0 && s.cost < minCost) minCost = s.cost;
          });
        });
        setCheapestCost(minCost === Infinity ? null : minCost);
      }
    } catch {
      setErrorMessage('Gagal mengambil data ongkir. Silakan coba lagi.');
    } finally {
      setIsCheckingCost(false);
    }
  }, [totalWeight]);

  // Auto-fetch when city is selected
  useEffect(() => {
    if (selectedCity) {
      fetchShippingCosts(selectedCity.province);
    }
  }, [selectedCity, fetchShippingCosts]);

  // Handle city selection from dropdown
  const handleSelectCity = (city: CityProvince) => {
    setSelectedCity(city);
    setCitySearch('');
    setShowCityDropdown(false);
    // Clear previous shipping selection
    onShippingSelected(null);
    setSelectedService(null);
  };

  // Handle courier service selection
  const handleSelectService = (courier: string, courierName: string, service: CourierService) => {
    setSelectedService({ courier, courierName, service });
    onShippingSelected({
      courier,
      courierName,
      service: {
        code: service.code,
        description: service.label,
        cost: service.cost,
        etd: service.etd,
        note: '',
      },
      cost: service.cost,
      destinationId: '',
      destinationName: `${selectedCity!.city}, ${selectedCity!.province}`,
      province: selectedCity!.province,
    });
  };

  // Clear shipping selection
  const handleClearShipping = () => {
    setSelectedService(null);
    setCourierResults([]);
    setZoneInfo(null);
    setCheapestCost(null);
    setErrorMessage(null);
    onShippingSelected(null);
  };

  // Change city
  const handleChangeCity = () => {
    setSelectedCity(null);
    setCitySearch('');
    handleClearShipping();
  };

  // Weight display
  const weightKg = (totalWeight / 1000).toFixed(1);

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700 block">
        <Truck className="h-3.5 w-3.5 inline mr-1 -mt-0.5" />
        Estimasi Ongkir
      </label>

      {/* Origin badge */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <MapPin className="h-3 w-3 shrink-0" />
        <span>Dikirim dari <b className="text-gray-700">Jakarta</b></span>
        <span className="text-gray-300 mx-1">•</span>
        <span>Berat: {weightKg} kg</span>
      </div>

      {/* City Search */}
      {!selectedCity ? (
        <div ref={dropdownRef} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Ketik kota tujuan pengiriman..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              className="pl-9 h-10 text-sm pr-8"
            />
            {citySearch && (
              <button
                type="button"
                onClick={() => { setCitySearch(''); setCityResults([]); setShowCityDropdown(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* City dropdown */}
          {showCityDropdown && cityResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-56 overflow-y-auto">
              {cityResults.map((item, idx) => (
                <button
                  key={`${item.city}-${item.province}-${idx}`}
                  type="button"
                  onClick={() => handleSelectCity(item)}
                  className="w-full text-left px-3 py-2.5 hover:bg-emerald-50 transition-colors border-b last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.city}</p>
                      <p className="text-xs text-gray-500">{item.province}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {citySearch.trim().length >= 2 && cityResults.length === 0 && !showCityDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg p-3">
              <p className="text-sm text-gray-500 text-center">Kota tidak ditemukan</p>
              <p className="text-xs text-gray-400 text-center mt-1">Coba ketik nama provinsi, misal &quot;Jawa Barat&quot;</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-900 truncate">{selectedCity.city}</p>
            <p className="text-xs text-emerald-700">{selectedCity.province}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100"
            onClick={handleChangeCity}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Loading indicator */}
      {isCheckingCost && (
        <div className="flex items-center justify-center py-4 gap-2">
          <Loader2 className="h-5 w-5 text-emerald-600 animate-spin" />
          <span className="text-sm text-gray-600">Mengecek ongkir...</span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && !isCheckingCost && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs">
              <p className="font-medium text-amber-800">{errorMessage}</p>
              <p className="text-amber-700 mt-1">
                Hubungi admin via WhatsApp untuk informasi ongkir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Courier results */}
      {courierResults.length > 0 && !isCheckingCost && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">
              Pilih Ekspedisi
              <span className="font-normal text-gray-500 ml-1">({courierResults.length} kurir)</span>
            </p>
            {selectedService && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-gray-500 hover:text-gray-700"
                onClick={handleClearShipping}
              >
                Hapus pilihan
              </Button>
            )}
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
                              {service.label}
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
                              Estimasi: {service.etd}
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

      {/* Selected shipping summary */}
      {selectedService && selectedCity && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs font-medium text-emerald-900">
                  {selectedService.courierName} — {selectedService.service.label}
                </p>
                <p className="text-[10px] text-emerald-700">
                  ke {selectedCity.city} • Est. {selectedService.service.etd}
                </p>
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-900">{formatRupiah(selectedService.service.cost)}</p>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      {selectedService && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
          <div className="flex items-start gap-1.5">
            <AlertCircle className="h-3 w-3 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[10px] text-amber-700 italic">Harga estimasi berdasarkan tarif terbaru. Admin akan konfirmasi jika ada perubahan harga.</p>
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
    jnt: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    sicepat: 'bg-sky-50 border-sky-200 text-sky-800',
    pos: 'bg-red-50 border-red-200 text-red-800',
    anteraja: 'bg-purple-50 border-purple-200 text-purple-800',
    tiki: 'bg-red-50 border-red-200 text-red-800',
    wahana: 'bg-amber-50 border-amber-200 text-amber-800',
    ninja: 'bg-teal-50 border-teal-200 text-teal-800',
    lion: 'bg-rose-50 border-rose-200 text-rose-800',
  };
  return colors[code] || 'bg-gray-50 border-gray-200 text-gray-800';
}

function getCourierHeaderColor(code: string) {
  const colors: Record<string, string> = {
    jne: 'bg-orange-100 text-orange-900',
    jnt: 'bg-yellow-100 text-yellow-900',
    sicepat: 'bg-sky-100 text-sky-900',
    pos: 'bg-red-100 text-red-900',
    anteraja: 'bg-purple-100 text-purple-900',
    tiki: 'bg-red-100 text-red-900',
    wahana: 'bg-amber-100 text-amber-900',
    ninja: 'bg-teal-100 text-teal-900',
    lion: 'bg-rose-100 text-rose-900',
  };
  return colors[code] || 'bg-gray-100 text-gray-900';
}
