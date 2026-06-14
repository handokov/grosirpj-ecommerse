'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  MapPin,
  Truck,
  ChevronDown,
  Loader2,
  AlertCircle,
  X,
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

interface SelectedShipping {
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

export default function ShippingCalculator({
  totalWeight,
  onShippingSelected,
  currentShippingCost,
}: ShippingCalculatorProps) {
  // City search
  const [citySearch, setCitySearch] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Courier results
  const [courierResults, setCourierResults] = useState<CourierResult[]>([]);
  const [isCheckingCost, setIsCheckingCost] = useState(false);
  const [selectedService, setSelectedService] = useState<{
    courier: string;
    service: CourierService;
  } | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

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
    if (!citySearch.trim()) {
      setCities([]);
      setShowCityDropdown(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearchingCity(true);
      try {
        const res = await fetch(`/api/ongkir/cities?q=${encodeURIComponent(citySearch.trim())}`);
        const data = await res.json();

        if (data.error && data.cities?.length === 0) {
          setApiKeyMissing(true);
        }

        setCities(data.cities || []);
        setShowCityDropdown(true);
      } catch {
        setCities([]);
      } finally {
        setIsSearchingCity(false);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [citySearch]);

  // Check shipping cost
  const handleCheckCost = async () => {
    if (!selectedCity) return;

    setIsCheckingCost(true);
    setCourierResults([]);
    setSelectedService(null);
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
        setApiKeyMissing(true);
      }

      setCourierResults(data.results || []);
    } catch {
      setCourierResults([]);
    } finally {
      setIsCheckingCost(false);
    }
  };

  // Select a courier service
  const handleSelectService = (courier: string, courierName: string, service: CourierService) => {
    setSelectedService({ courier, service });
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

  // API key missing state
  if (apiKeyMissing) {
    return (
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">Ongkos Kirim</label>
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
      <label className="text-sm font-medium text-gray-700 block">Ongkos Kirim</label>

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
              Cek Ongkir
            </>
          )}
        </Button>
      )}

      {/* Loading */}
      {isCheckingCost && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
          <span className="ml-2 text-sm text-gray-600">Mengecek ongkir dari berbagai ekspedisi...</span>
        </div>
      )}

      {/* Courier results */}
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

      {courierResults.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-700">Pilih Ekspedisi</p>
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
            <div key={courier.courier} className="border rounded-lg overflow-hidden">
              {/* Courier header */}
              <div className="bg-gray-50 px-3 py-2 border-b">
                <p className="text-sm font-semibold text-gray-800 uppercase">{courier.courierName}</p>
              </div>

              {/* Services */}
              <div className="divide-y">
                {courier.services.map((service) => {
                  const isSelected =
                    selectedService?.courier === courier.courier &&
                    selectedService?.service.code === service.code;

                  return (
                    <button
                      key={`${courier.courier}-${service.code}`}
                      type="button"
                      onClick={() => handleSelectService(courier.courier, courier.courierName, service)}
                      className={`w-full text-left px-3 py-2.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-50 border-l-2 border-l-emerald-600'
                          : 'hover:bg-gray-50 border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {service.code}
                            <span className="text-xs text-gray-500 font-normal ml-1">({service.description})</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Estimasi: {service.etd} hari
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-900">
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
      {selectedService && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs font-medium text-emerald-900">
                  {selectedService.courier.toUpperCase()} - {selectedService.service.code}
                </p>
                <p className="text-[10px] text-emerald-700">Est. {selectedService.service.etd} hari</p>
              </div>
            </div>
            <p className="text-sm font-bold text-emerald-900">{formatRupiah(selectedService.service.cost)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
