'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MexicoMapProps {
    onStateSelect: (stateName: string, stateCode: string) => void;
    selectedStateCode: string | null;
}

function InvalidateMapSize() {
    const map = useMap();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const resizeObserver = new ResizeObserver(() => {
            // Use a small delay to ensure any CSS transitions are accounted for
            const timer = setTimeout(() => {
                map.invalidateSize();
            }, 250);
            return () => clearTimeout(timer);
        });

        const container = map.getContainer();
        resizeObserver.observe(container);

        return () => {
            resizeObserver.disconnect();
        };
    }, [map]);

    return null;
}

export default function MexicoMap({ onStateSelect, selectedStateCode }: MexicoMapProps) {
    const [geoData, setGeoData] = useState<any>(null);

    useEffect(() => {
        fetch('/maps/mx.json')
            .then(res => res.json())
            .then(data => setGeoData(data));
    }, []);

    const style = (feature: any) => {
        const isSelected = feature.properties.entidad_cd === selectedStateCode;
        return {
            fillColor: isSelected ? '#3b82f6' : '#1e293b', // Blue if selected, Slate-800 if not
            weight: isSelected ? 2 : 1,
            opacity: 1,
            color: isSelected ? '#60a5fa' : '#475569', // Border
            fillOpacity: isSelected ? 0.6 : 0.4
        };
    };

    const onEachFeature = (feature: any, layer: L.Layer) => {
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 2,
                    color: '#93c5fd',
                    fillOpacity: 0.7
                });
            },
            mouseout: (e) => {
                const layer = e.target;
                // Only reset if not selected. However, style function handles state, 
                // so calling resetStyle might revert to unselected style even if selected 
                // if we don't handle it carefully. 
                // Simplest is to just re-apply style function logic or rely on react-leaflet re-render?
                // React-leaflet GeoJSON updates style when props change.
                // For hover, let's just let it revert to "style" prop logic on subsequent renders, 
                // or manually reset to what we want.
                // Actually, geojsonRef.resetStyle(layer) works best if we had the ref.
                // For now simple hover effect:
                if (feature.properties.entidad_cd !== selectedStateCode) {
                    layer.setStyle({
                        fillColor: '#1e293b',
                        color: '#475569',
                        weight: 1,
                        fillOpacity: 0.4
                    });
                } else {
                    layer.setStyle({
                        fillColor: '#3b82f6',
                        color: '#60a5fa',
                        weight: 2,
                        fillOpacity: 0.6
                    });
                }
            },
            click: (e) => {
                const props = feature.properties;
                // console.log("State Clicked:", props);
                if (props && props.entidad_cd) {
                    onStateSelect(props.name, props.entidad_cd);
                }
            }
        });

        // Tooltip
        if (feature.properties && feature.properties.name) {
            layer.bindTooltip(feature.properties.name, {
                permanent: false,
                direction: "center",
                className: "bg-black/50 text-white px-2 py-1 rounded text-xs border-none"
            });
        }
    };

    return (
        <MapContainer
            center={[23.6345, -102.5528]}
            zoom={5}
            scrollWheelZoom={false}
            className="w-full h-[400px] md:h-full rounded-xl"
            style={{ minHeight: '300px', height: '100%', width: '100%', background: 'transparent' }}
        >
            <InvalidateMapSize />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                crossOrigin="anonymous"
            />
            {geoData && (
                <GeoJSON
                    data={geoData}
                    style={style}
                    onEachFeature={onEachFeature}
                />
            )}
        </MapContainer>
    );
}
