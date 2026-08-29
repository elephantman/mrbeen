import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import * as d3Geo from 'd3-geo';
import * as topojson from 'topojson-client';
import { useTravel } from '../../context/TravelContext';
import { COUNTRIES } from '../../data/countries';
import { POPULAR_CITIES } from '../../data/cities';
import { CountryData } from '../../types/geo';
import { Plus, Eye, Sparkles } from 'lucide-react';

interface FeatureGeometry {
  type: string;
  coordinates: any;
}

interface CountryFeature {
  type: string;
  id: string;
  properties: { name: string };
  geometry: FeatureGeometry;
}

export type PinFilterMode = 'visited' | 'focused' | 'all';

export const WorldMap: React.FC = () => {
  const {
    data,
    activeTheme,
    toggleCityVisited,
    selectedCountryId,
    setSelectedCountryId,
    setIsAddCityOpen,
    t,
  } = useTravel();

  const [features, setFeatures] = useState<CountryFeature[]>([]);
  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Map transform (pan & zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [pinFilterMode, setPinFilterMode] = useState<PinFilterMode>('visited');

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Map dimensions
  const width = 960;
  const height = 500;

  // Load TopoJSON
  useEffect(() => {
    fetch('/world-topo.json')
      .then((res) => res.json())
      .then((topology) => {
        const geojson: any = topojson.feature(topology, topology.objects.countries);
        setFeatures(geojson.features || []);
      })
      .catch((err) => console.error('Failed to load map data:', err));
  }, []);

  // Map numeric ID to CountryData
  const numericToCountryMap = useMemo(() => {
    const map = new Map<string, CountryData>();
    COUNTRIES.forEach((c) => {
      map.set(c.numericId, c);
      map.set(c.numericId.padStart(3, '0'), c);
    });
    return map;
  }, []);

  const alpha3ToCountryMap = useMemo(() => {
    const map = new Map<string, CountryData>();
    COUNTRIES.forEach((c) => map.set(c.id, c));
    return map;
  }, []);

  // D3 Projection & Path Generator
  const projection = useMemo(() => {
    return d3Geo
      .geoNaturalEarth1()
      .scale(155)
      .translate([width / 2, height / 2 + 20]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return d3Geo.geoPath().projection(projection);
  }, [projection]);

  // Combine popular cities with user custom cities
  const allCities = useMemo(() => {
    const combined = [...POPULAR_CITIES];
    if (data.customCities) {
      data.customCities.forEach((cc) => {
        if (!combined.some((c) => c.id === cc.id)) {
          combined.push({
            id: cc.id,
            name: cc.name,
            countryId: cc.countryId,
            countryName: alpha3ToCountryMap.get(cc.countryId)?.name || '',
            continent: alpha3ToCountryMap.get(cc.countryId)?.continent || 'EU',
            lat: cc.lat,
            lng: cc.lng,
            isCustom: true,
          });
        }
      });
    }
    return combined;
  }, [data.customCities, alpha3ToCountryMap]);

  // Pan and Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setZoom((prev) => Math.max(0.7, Math.min(8, prev * zoomFactor)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mobile touch handlers
  const [touchStartDist, setTouchStartDist] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setTouchStartDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      setPan({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2 && touchStartDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / touchStartDist;
      setZoom((prev) => Math.max(0.7, Math.min(8, prev * (ratio > 1 ? 1.05 : 0.95))));
      setTouchStartDist(dist);
    }
  };

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  // Compute active focused country (hovered or drawer-selected)
  const activeFocusCountryId = hoveredCountry?.id || selectedCountryId;

  // Filter cities to render based on Creative Director rules:
  // 1. Visited cities ALWAYS render with dynamic scale
  // 2. Wishlist cities render with dynamic scale
  // 3. Unvisited cities ONLY render if in focused country OR if pinFilterMode is 'all' and zoom >= 2.5
  const visibleCities = useMemo(() => {
    return allCities.filter((city) => {
      const isVisited = !!data.visitedCities[city.id];
      const isWishlist = !!data.wishlistCities[city.id];

      if (isVisited || isWishlist) return true;

      if (pinFilterMode === 'all') {
        return zoom >= 2.2;
      }

      // If 'visited' or 'focused' mode, only show unvisited city if it belongs to hovered/selected country
      if (activeFocusCountryId && city.countryId === activeFocusCountryId) {
        return true;
      }

      return false;
    });
  }, [allCities, data.visitedCities, data.wishlistCities, pinFilterMode, zoom, activeFocusCountryId]);

  // Scaled dimensions to prevent giant bubble clutter on zoom
  const zoomScaleFactor = Math.pow(zoom, 0.7);
  const visitedPinRadius = Math.max(1.8, 3.8 / zoomScaleFactor);
  const unvisitedPinRadius = Math.max(1.0, 2.2 / zoomScaleFactor);
  const strokeWidthScaled = 0.6 / zoom;
  const countryStrokeScaled = (0.4 / Math.pow(zoom, 0.4)).toFixed(2);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[calc(100vh-4rem)] bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing select-none flex items-center justify-center"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsDragging(false)}
    >
      {/* Background Subtle Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.2) 1px, transparent 0)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* SVG Map Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-w-full max-h-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
      >
        <defs>
          <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={activeTheme.primaryColor} stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect x="0" y="0" width={width} height={height} fill="url(#mapGlow)" />

        {/* Countries Layer */}
        <g className="countries-layer">
          {features.map((feature) => {
            const country = numericToCountryMap.get(feature.id);
            const countryId = country?.id;
            const isVisited = countryId ? !!data.visitedCountries[countryId] : false;
            const isWishlist = countryId ? !!data.wishlistCountries[countryId] : false;
            const isFocused = countryId && countryId === activeFocusCountryId;
            const pathD = pathGenerator(feature as any);
            if (!pathD) return null;

            let fillColor = activeTheme.landColor;
            let strokeColor = activeTheme.landStroke;
            let fillOpacity = 0.92;

            if (isVisited) {
              fillColor = activeTheme.visitedFill;
              strokeColor = '#ffffff';
              fillOpacity = 1;
            } else if (isWishlist) {
              fillColor = activeTheme.wishlistFill;
              fillOpacity = 0.65;
              strokeColor = activeTheme.wishlistFill;
            } else if (isFocused) {
              fillColor = '#334155';
              fillOpacity = 1;
              strokeColor = '#94a3b8';
            }

            return (
              <path
                key={feature.id}
                d={pathD}
                fill={fillColor}
                fillOpacity={fillOpacity}
                stroke={strokeColor}
                strokeWidth={isVisited ? Number(countryStrokeScaled) * 1.5 : countryStrokeScaled}
                strokeLinejoin="round"
                className="transition-colors duration-150 hover:brightness-125 cursor-pointer"
                onMouseEnter={() => {
                  if (country) setHoveredCountry(country);
                }}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (countryId) {
                    setSelectedCountryId(countryId);
                  }
                }}
              />
            );
          })}
        </g>

        {/* Smart City Pins Layer */}
        <g className="cities-layer pointer-events-auto">
          {visibleCities.map((city) => {
            const coords = projection([city.lng, city.lat]);
            if (!coords) return null;
            const [cx, cy] = coords;

            const isCityVisited = !!data.visitedCities[city.id];
            const isCityWishlist = !!data.wishlistCities[city.id];

            const currentRadius = isCityVisited ? visitedPinRadius : unvisitedPinRadius;

            return (
              <g
                key={city.id}
                transform={`translate(${cx}, ${cy})`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCityVisited(city.id);
                }}
              >
                {/* 1. Visited City: Glowing Pulse Halo */}
                {isCityVisited && (
                  <circle
                    r={currentRadius * 2.2}
                    fill={activeTheme.primaryColor}
                    opacity="0.35"
                    className="animate-pin-ping"
                  />
                )}

                {/* 2. Soft Drop Shadow */}
                <circle
                  r={currentRadius + (0.8 / zoom)}
                  fill="#000000"
                  opacity="0.5"
                />

                {/* 3. Main Pin Bead */}
                <circle
                  r={currentRadius}
                  fill={
                    isCityVisited
                      ? activeTheme.cityPinColor
                      : isCityWishlist
                      ? activeTheme.wishlistFill
                      : '#64748b'
                  }
                  stroke={isCityVisited ? activeTheme.primaryColor : '#0f172a'}
                  strokeWidth={strokeWidthScaled}
                  className="transition-transform group-hover:scale-125"
                />

                {/* 4. Center Micro Core for Visited */}
                {isCityVisited && (
                  <circle
                    r={currentRadius * 0.4}
                    fill={activeTheme.primaryColor}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Country Tooltip */}
      {hoveredCountry && !hoveredCity && (
        <div
          className="absolute z-20 pointer-events-none glass-dropdown px-3.5 py-2 rounded-xl text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-100 border border-slate-700"
          style={{
            left: `${mousePos.x + 15}px`,
            top: `${mousePos.y - 40}px`,
          }}
        >
          <span className="text-xl">{hoveredCountry.flag}</span>
          <div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span>{hoveredCountry.name}</span>
              {data.visitedCountries[hoveredCountry.id] && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {t('status_been')}
                </span>
              )}
              {data.wishlistCountries[hoveredCountry.id] && (
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                  {t('status_wishlist')}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {t('capital_label')}: <span className="text-slate-200">{hoveredCountry.capital}</span> • {t('click_to_explore')}
            </div>
          </div>
        </div>
      )}

      {/* Floating City Tooltip (On Hover) */}
      {hoveredCity && (
        <div
          className="absolute z-30 pointer-events-none glass-dropdown px-3.5 py-2.5 rounded-2xl text-xs shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-100 border border-slate-700/80 bg-slate-950/95"
          style={{
            left: `${mousePos.x + 16}px`,
            top: `${mousePos.y - 42}px`,
          }}
        >
          <span className="text-xl drop-shadow">
            {COUNTRIES.find((c) => c.id === hoveredCity.countryId)?.flag || '📍'}
          </span>
          <div>
            <div className="font-bold text-white text-xs flex items-center gap-1.5">
              <span>{hoveredCity.name}</span>
              {data.visitedCities[hoveredCity.id] && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {t('status_visited')}
                </span>
              )}
              {data.wishlistCities[hoveredCity.id] && (
                <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  {t('status_wishlist')}
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 font-medium">
              {hoveredCity.countryName} {hoveredCity.isCapital ? '• ' + t('capital_badge') : ''}
            </div>
          </div>
        </div>
      )}

      {/* Top Map Filter HUD: Pin Mode Selector */}
      <div className="absolute top-4 left-4 z-20 hidden sm:flex items-center gap-1 p-1 rounded-xl glass-panel text-xs">
        <button
          onClick={() => setPinFilterMode('visited')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            pinFilterMode === 'visited'
              ? 'bg-orange-500 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
          title={t('pin_mode_visited')}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{t('pin_mode_visited')} ({Object.keys(data.visitedCities).length})</span>
        </button>

        <button
          onClick={() => setPinFilterMode('all')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
            pinFilterMode === 'all'
              ? 'bg-slate-800 text-white font-bold border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
          title={t('pin_mode_all')}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{t('pin_mode_all')}</span>
        </button>
      </div>

      {/* Floating Map HUD Controls (Bottom Right) */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setZoom((z) => Math.min(8, z * 1.3))}
          className="w-10 h-10 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 text-base font-bold"
          title={t('zoom_in')}
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.7, z * 0.75))}
          className="w-10 h-10 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 text-base font-bold"
          title={t('zoom_out')}
        >
          -
        </button>
        <button
          onClick={resetView}
          className="px-2.5 h-8 rounded-xl glass-panel hover:bg-slate-800 text-[11px] font-semibold text-slate-300 flex items-center justify-center shadow-lg transition-all"
          title={t('reset_view')}
        >
          {t('reset_orientation')}
        </button>
        <button
          onClick={() => setIsAddCityOpen(true)}
          className="px-3 h-9 rounded-xl glass-panel hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-lg transition-all hover:text-white"
          title={t('pin_city')}
        >
          <Plus className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">{t('pin_city')}</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-4 px-4 py-2 rounded-xl glass-panel text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: activeTheme.visitedFill }} />
          <span>{t('legend_country_been')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-orange-500" style={{ backgroundColor: activeTheme.cityPinColor }} />
          <span>{t('legend_visited_city')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: activeTheme.wishlistFill }} />
          <span>{t('legend_wishlist')}</span>
        </div>
      </div>
    </div>
  );
};
