import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { wheatCountries, countryISOtoKey } from "../data/countries";

const countryCoords = {
  CHN: { lat: 35, lon: 105 },
  IND: { lat: 22, lon: 80 },
  RUS: { lat: 60, lon: 90 },
  USA: { lat: 38, lon: -97 },
  AUS: { lat: -25, lon: 133 },
  UKR: { lat: 49, lon: 32 },
  ARG: { lat: -34, lon: -64 },
  BRA: { lat: -10, lon: -53 },
  CAN: { lat: 56, lon: -96 },
  PAK: { lat: 30, lon: 69 },
};

export default function WorldMap({ onCountrySelect, selectedCountry, onMarkerPosition }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const projRef = useRef(null);
  const zoomRef = useRef(null);
  const currentTransformRef = useRef(d3.zoomIdentity);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: "", flag: "", production: 0 });

  const getScreenPos = useCallback((lat, lon) => {
    if (!projRef.current) return null;
    const proj = projRef.current;
    const t = currentTransformRef.current;
    const [px, py] = proj([lon, lat]);
    return { x: t.x + px * t.k, y: t.y + py * t.k };
  }, []);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    svg.selectAll("*").remove();

    // Defs
    const defs = svg.append("defs");

    // Ocean gradient
    const oceanGrad = defs.append("radialGradient").attr("id", "oceanGrad");
    oceanGrad.append("stop").attr("offset", "0%").attr("stop-color", "#0d2137");
    oceanGrad.append("stop").attr("offset", "100%").attr("stop-color", "#060d18");

    // Glow filter
    const glow = defs.append("filter").attr("id", "glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    // Strong glow for selected
    const glowStrong = defs.append("filter").attr("id", "glowStrong");
    glowStrong.append("feGaussianBlur").attr("stdDeviation", "6").attr("result", "blur");
    const merge2 = glowStrong.append("feMerge");
    merge2.append("feMergeNode").attr("in", "blur");
    merge2.append("feMergeNode").attr("in", "SourceGraphic");

    // Country gradients per wheat country
    Object.entries(wheatCountries).forEach(([key, c]) => {
      const grad = defs.append("linearGradient")
        .attr("id", `grad-${key}`)
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "100%");
      grad.append("stop").attr("offset", "0%").attr("stop-color", c.color).attr("stop-opacity", 0.9);
      grad.append("stop").attr("offset", "100%").attr("stop-color", c.color).attr("stop-opacity", 0.5);
    });

    const projection = d3.geoNaturalEarth1()
      .scale(width / 8.0)
      .translate([width / 2, height / 2]);
    projRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const g = svg.append("g");
    gRef.current = g;

    const zoom = d3.zoom()
      .scaleExtent([1,  1 ])
          .translateExtent([[0, 0], [width, height]])
    
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
        currentTransformRef.current = e.transform;
        // Update marker positions
        if (onMarkerPosition) {
          const positions = {};
          Object.entries(countryCoords).forEach(([key, { lat, lon }]) => {
            const [px, py] = projection([lon, lat]);
            positions[key] = {
              x: e.transform.x + px * e.transform.k,
              y: e.transform.y + py * e.transform.k,
            };
          });
          onMarkerPosition(positions);
        }
      });
    zoomRef.current = zoom;
    svg.call(zoom);

    // Ocean sphere
    g.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "url(#oceanGrad)")
      .attr("stroke", "rgba(100,160,255,0.15)")
      .attr("stroke-width", 0.5);

    // Graticule
    const graticule = d3.geoGraticule();
    g.append("path")
      .datum(graticule())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(100,160,255,0.06)")
      .attr("stroke-width", 0.4);

    // Countries
    fetch("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(r => r.json())
      .then(world => {
        const countries = feature(world, world.objects.countries);

        g.selectAll(".country-path")
          .data(countries.features)
          .enter()
          .append("path")
          .attr("class", "country-path")
          .attr("d", path)
          .attr("fill", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key) return "rgba(255,255,255,0.045)";
            return `url(#grad-${key})`;
          })
          .attr("stroke", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key) return "rgba(255,255,255,0.07)";
            return wheatCountries[key].color;
          })
          .attr("stroke-width", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            return key ? 1 : 0.3;
          })
          .attr("filter", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            return key ? "url(#glow)" : "none";
          })
          .style("cursor", d => {
            const iso = String(d.id).padStart(3, "0");
            return countryISOtoKey[iso] ? "pointer" : "default";
          })
          .on("mousemove", function (event, d) {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key) return;
            const [mx, my] = d3.pointer(event, svgRef.current);
            setTooltip({ visible: true, x: mx, y: my, name: wheatCountries[key].name, flag: wheatCountries[key].flag, production: wheatCountries[key].production });
            d3.select(this).attr("opacity", 1.3);
          })
          .on("mouseleave", function (event, d) {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            setTooltip(t => ({ ...t, visible: false }));
            if (!key) return;
            d3.select(this).attr("opacity", 1);
          })
          .on("click", function (event, d) {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key) return;
            onCountrySelect(key);
            // Send marker screen position
            const coords = countryCoords[key];
            const [px, py] = projection([coords.lon, coords.lat]);
            const t = currentTransformRef.current;
            if (onMarkerPosition) {
              onMarkerPosition({ [key]: { x: t.x + px * t.k, y: t.y + py * t.k } });
            }
          });

        // Wheat markers (pulsing dots)
        Object.entries(countryCoords).forEach(([key, { lat, lon }]) => {
          const [cx, cy] = projection([lon, lat]);
          const color = wheatCountries[key].color;

          // Pulse ring
          g.append("circle")
            .attr("class", `pulse-ring-${key}`)
            .attr("cx", cx).attr("cy", cy)
            .attr("r", 8)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.5);

          // Center dot
          g.append("circle")
            .attr("class", `marker-dot-${key}`)
            .attr("cx", cx).attr("cy", cy)
            .attr("r", 4)
            .attr("fill", color)
            .attr("filter", "url(#glow)")
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.8)
            .style("cursor", "pointer")
            .on("click", () => {
              onCountrySelect(key);
              const t = currentTransformRef.current;
              if (onMarkerPosition) {
                onMarkerPosition({ [key]: { x: t.x + cx * t.k, y: t.y + cy * t.k } });
              }
            });
        });

        // Animate pulses
        const animatePulse = () => {
          Object.entries(countryCoords).forEach(([key]) => {
            g.select(`.pulse-ring-${key}`)
              .attr("r", 6)
              .attr("opacity", 0.7)
              .transition()
              .duration(1800)
              .ease(d3.easeSinOut)
              .attr("r", 14)
              .attr("opacity", 0)
              .on("end", function () {
                d3.select(this).attr("r", 6).attr("opacity", 0.7);
                animatePulse();
              });
          });
        };
        animatePulse();

        // Initial marker positions
        const positions = {};
        Object.entries(countryCoords).forEach(([key, { lat, lon }]) => {
          const [px, py] = projection([lon, lat]);
          positions[key] = { x: px, y: py };
        });
        if (onMarkerPosition) onMarkerPosition(positions);
      });

    return () => svg.selectAll("*").remove();
  }, []);

  return (
    <div className="relative w-full h-full">
      <svg ref={svgRef} className="w-full h-full" />
      {tooltip.visible && (
        <div
          className="pointer-events-none absolute z-20 px-3 py-2 text-sm font-medium"
          style={{
            left: tooltip.x + 14, top: tooltip.y - 44,
            background: "rgba(6,13,24,0.95)",
            border: "1px solid rgba(232,184,75,0.35)",
            borderRadius: "6px",
            color: "#F5EDD8",
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <span className="mr-1">{tooltip.flag}</span>
          {tooltip.name}
          <span className="ml-2 text-xs" style={{ color: "rgba(245,237,216,0.45)" }}>{tooltip.production} Mi t</span>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-xs select-none" style={{ color: "rgba(245,237,216,0.2)" }}>
        Scroll para zoom · Arraste para mover
      </div>
    </div>
  );
}