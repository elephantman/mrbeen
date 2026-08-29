import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3Geo from 'd3-geo';
import * as topojson from 'topojson-client';
import { useTravel } from '../../context/TravelContext';
import { COUNTRIES } from '../../data/countries';
import { POPULAR_CITIES } from '../../data/cities';
import { CountryData } from '../../types/geo';
import { RotateCw, Play, Pause, Plus } from 'lucide-react';

interface CountryFeature {
  type: string;
  id: string;
  properties: { name: string };
  geometry: any;
}

export const WorldGlobe: React.FC = () => {
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
  const [rotation, setRotation] = useState<[number, number, number]>([0, -20, 0]);
  const [autoRotate, setAutoRotate] = useState(true);
  const [scale, setScale] = useState(240);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialRotation, setInitialRotation] = useState<[number, number, number]>([0, -20, 0]);

  const [hoveredCountry, setHoveredCountry] = useState<CountryData | null>(null);
  const [hoveredCity, setHoveredCity] = useState<any | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number | null>(null);

  const width = 800;
  const height = 600;

  // Load TopoJSON
  useEffect(() => {
    fetch('/world-topo.json')
      .then((res) => res.json())
      .then((topology) => {
        const geojson: any = topojson.feature(topology, topology.objects.countries);
        setFeatures(geojson.features || []);
      })
      .catch((err) => console.error('Failed to load globe map data:', err));
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

  // D3 Orthographic Projection
  const projection = useMemo(() => {
    return d3Geo
      .geoOrthographic()
      .scale(scale)
      .translate([width / 2, height / 2])
      .rotate(rotation)
      .clipAngle(90);
  }, [scale, width, height, rotation]);

  const pathGenerator = useMemo(() => {
    return d3Geo.geoPath().projection(projection);
  }, [projection]);

  // Graticule
  const graticule = useMemo(() => {
    return d3Geo.geoGraticule10();
  }, []);

  // Auto rotation loop
  useEffect(() => {
    if (!autoRotate || isDragging) return;

    let lastTime = performance.now();
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      setRotation(([r0, r1, r2]) => [(r0 + 0.025 * delta) % 360, r1, r2]);
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [autoRotate, isDragging]);

  // Mouse drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialRotation([...rotation]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      const sensitivity = 0.35;
      setRotation([
        initialRotation[0] + dx * sensitivity,
        Math.max(-80, Math.min(80, initialRotation[1] - dy * sensitivity)),
        initialRotation[2],
      ]);
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setScale((s) => Math.max(130, Math.min(550, s * zoomFactor)));
  };

  // Mobile Touch
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      setInitialRotation([...rotation]);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - dragStart.x;
      const dy = e.touches[0].clientY - dragStart.y;
      const sensitivity = 0.45;
      setRotation([
        initialRotation[0] + dx * sensitivity,
        Math.max(-80, Math.min(80, initialRotation[1] - dy * sensitivity)),
        initialRotation[2],
      ]);
    }
  };

  // Combine cities
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

  // Center coordinate of globe view for clipping
  const centerLng = -rotation[0];
  const centerLat = -rotation[1];

  const activeFocusCountryId = hoveredCountry?.id || selectedCountryId;

  // Render only visited, wishlist or focused country cities on the globe
  const visibleGlobeCities = useMemo(() => {
    return allCities.filter((city) => {
      const isVisited = !!data.visitedCities[city.id];
      const isWishlist = !!data.wishlistCities[city.id];
      if (isVisited || isWishlist) return true;
      if (activeFocusCountryId && city.countryId === activeFocusCountryId) return true;
      return false;
    });
  }, [allCities, data.visitedCities, data.wishlistCities, activeFocusCountryId]);

  const pinScale = Math.min(4, Math.max(2, 3.2 * (scale / 240)));

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
      {/* Background Deep Space Atmosphere */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${activeTheme.primaryColor}15, transparent 65%)`,
        }}
      />

      {/* SVG 3D Globe */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full max-w-full max-h-full transition-transform duration-75"
      >
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
            <stop offset="0%" stopColor="#1e293b" stopOpacity="1" />
            <stop offset="70%" stopColor="#0f172a" stopOpacity="1" />
            <stop offset="100%" stopColor="#020617" stopOpacity="1" />
          </radialGradient>
          <radialGradient id="atmosphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor={activeTheme.primaryColor} stopOpacity="0" />
            <stop offset="98%" stopColor={activeTheme.primaryColor} stopOpacity="0.35" />
            <stop offset="100%" stopColor={activeTheme.primaryColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Atmosphere Outer Ring */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={scale + 8}
          fill="url(#atmosphereGlow)"
          className="pointer-events-none"
        />

        {/* Globe Base Ocean Sphere */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={scale}
          fill="url(#globeGlow)"
          stroke={activeTheme.primaryColor}
          strokeOpacity="0.25"
          strokeWidth="1.2"
        />

        {/* Graticule Grid Lines */}
        <path
          d={pathGenerator(graticule) || ''}
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="0.5"
        />

        {/* Globe Countries */}
        <g className="globe-countries">
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

            if (isVisited) {
              fillColor = activeTheme.visitedFill;
              strokeColor = '#ffffff';
            } else if (isWishlist) {
              fillColor = activeTheme.wishlistFill;
              strokeColor = activeTheme.wishlistFill;
            } else if (isFocused) {
              fillColor = '#334155';
              strokeColor = '#94a3b8';
            }

            return (
              <path
                key={feature.id}
                d={pathD}
                fill={fillColor}
                fillOpacity={isVisited ? 1 : isWishlist ? 0.65 : 0.9}
                stroke={strokeColor}
                strokeWidth={isVisited ? '0.7' : '0.35'}
                strokeLinejoin="round"
                className="transition-colors duration-150 hover:brightness-125 cursor-pointer"
                onMouseEnter={() => {
                  if (country) setHoveredCountry(country);
                }}
                onMouseLeave={() => setHoveredCountry(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (countryId) setSelectedCountryId(countryId);
                }}
              />
            );
          })}
        </g>

        {/* Globe City Pins */}
        <g className="globe-cities pointer-events-auto">
          {visibleGlobeCities.map((city) => {
            const distance = d3Geo.geoDistance([city.lng, city.lat], [centerLng, centerLat]);
            if (distance > Math.PI / 2) return null;

            const coords = projection([city.lng, city.lat]);
            if (!coords) return null;
            const [cx, cy] = coords;

            const isCityVisited = !!data.visitedCities[city.id];
            const isCityWishlist = !!data.wishlistCities[city.id];

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
                {isCityVisited && (
                  <circle
                    r={pinScale * 2.2}
                    fill={activeTheme.primaryColor}
                    opacity="0.4"
                    className="animate-pin-ping"
                  />
                )}
                <circle
                  r={pinScale + 0.8}
                  fill="#000000"
                  opacity="0.6"
                />
                <circle
                  r={pinScale}
                  fill={
                    isCityVisited
                      ? activeTheme.cityPinColor
                      : isCityWishlist
                      ? activeTheme.wishlistFill
                      : '#64748b'
                  }
                  stroke={isCityVisited ? activeTheme.primaryColor : '#0f172a'}
                  strokeWidth="0.8"
                />
                {isCityVisited && (
                  <circle
                    r={pinScale * 0.4}
                    fill={activeTheme.primaryColor}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
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
            </div>
            <div className="text-[11px] text-slate-400">
              {t('capital_label')}: {hoveredCountry.capital} • {hoveredCountry.continent}
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
              {hoveredCity.countryName}
            </div>
          </div>
        </div>
      )}

      {/* Globe Floating Controls */}
      <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`h-10 px-3 rounded-xl glass-panel text-xs font-semibold flex items-center gap-2 shadow-lg transition-all ${
            autoRotate ? 'text-white border-orange-500/50 bg-orange-500/20' : 'text-slate-400 hover:text-white'
          }`}
          title={autoRotate ? t('pause') : t('spin')}
        >
          {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{autoRotate ? t('pause') : t('spin')}</span>
        </button>

        <button
          onClick={() => setRotation([0, -20, 0])}
          className="h-9 px-3 rounded-xl glass-panel hover:bg-slate-800 text-xs font-semibold text-slate-300 flex items-center gap-1.5 shadow-lg transition-all"
          title={t('reset_orientation')}
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>{t('reset_orientation')}</span>
        </button>

        <button
          onClick={() => setIsAddCityOpen(true)}
          className="h-9 px-3 rounded-xl glass-panel hover:bg-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 shadow-lg transition-all"
          title={t('pin_city')}
        >
          <Plus className="w-3.5 h-3.5 text-orange-400" />
          <span>{t('pin_city')}</span>
        </button>
      </div>
    </div>
  );
};
