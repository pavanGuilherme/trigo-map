import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
import { countryISOtoKey, countryCoords } from "../data/countries";

export default function WorldMap({ onCountrySelect, selectedCountry, onMarkerPosition, currentCountries, currentGrain }) {
  const svgRef = useRef(null);
  const gRef = useRef(null);
  const projRef = useRef(null);
  const currentTransformRef = useRef(d3.zoomIdentity);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: "", flag: "", production: 0 });

  const buildMap = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.clientWidth || window.innerWidth;
    const height = svgRef.current.clientHeight || window.innerHeight;

    svg.selectAll("*").remove();

    const defs = svg.append("defs");

    const oceanGrad = defs.append("radialGradient").attr("id", "oceanGrad");
    oceanGrad.append("stop").attr("offset", "0%").attr("stop-color", "#0d2137");
    oceanGrad.append("stop").attr("offset", "100%").attr("stop-color", "#060d18");

    const glow = defs.append("filter").attr("id", "glow");
    glow.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "blur");
    const merge = glow.append("feMerge");
    merge.append("feMergeNode").attr("in", "blur");
    merge.append("feMergeNode").attr("in", "SourceGraphic");

    const isMobile = window.innerWidth < 768;
    const scale = isMobile ? width / 5.5 : width / 8.0;

    const projection = d3.geoNaturalEarth1()
      .scale(scale)
      .translate([width / 2, height / 2]);
    projRef.current = projection;

    const path = d3.geoPath().projection(projection);
    const g = svg.append("g");
    gRef.current = g;

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
        currentTransformRef.current = e.transform;
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
    svg.call(zoom);

    g.append("path")
      .datum({ type: "Sphere" })
      .attr("d", path)
      .attr("fill", "url(#oceanGrad)")
      .attr("stroke", "rgba(100,160,255,0.15)")
      .attr("stroke-width", 0.5);

    const graticule = d3.geoGraticule();
    g.append("path")
      .datum(graticule())
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgba(100,160,255,0.06)")
      .attr("stroke-width", 0.4);

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
            if (!key || !currentCountries[key]) return "rgba(255,255,255,0.045)";
            return currentCountries[key].color + "99";
          })
          .attr("stroke", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key || !currentCountries[key]) return "rgba(255,255,255,0.07)";
            return currentCountries[key].color;
          })
          .attr("stroke-width", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            return key && currentCountries[key] ? 1 : 0.3;
          })
          .attr("filter", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            return key && currentCountries[key] ? "url(#glow)" : "none";
          })
          .style("cursor", d => {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            return key && currentCountries[key] ? "pointer" : "default";
          })
          .on("mousemove", function (event, d) {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key || !currentCountries[key]) return;
            const [mx, my] = d3.pointer(event, svgRef.current);
            setTooltip({
              visible: true, x: mx, y: my,
              name: currentCountries[key].name,
              flag: currentCountries[key].flag,
              production: currentCountries[key].production,
            });
            d3.select(this).attr("fill", currentCountries[key].color + "cc");
          })
          .on("mouseleave", function (event, d) {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            setTooltip(t => ({ ...t, visible: false }));
            if (!key || !currentCountries[key]) return;
            d3.select(this).attr("fill", currentCountries[key].color + "99");
          })
          .on("click", function (event, d) {
            const iso = String(d.id).padStart(3, "0");
            const key = countryISOtoKey[iso];
            if (!key || !currentCountries[key]) return;
            onCountrySelect(key);
            const coords = countryCoords[key];
            if (coords) {
              const [px, py] = projection([coords.lon, coords.lat]);
              const t = currentTransformRef.current;
              if (onMarkerPosition) {
                onMarkerPosition({ [key]: { x: t.x + px * t.k, y: t.y + py * t.k } });
              }
            }
          });

        // Markers
        Object.entries(countryCoords).forEach(([key, { lat, lon }]) => {
          if (!currentCountries[key]) return;
          const [cx, cy] = projection([lon, lat]);
          const color = currentCountries[key].color;

          g.append("circle")
            .attr("class", `pulse-ring-${key}`)
            .attr("cx", cx).attr("cy", cy)
            .attr("r", 8)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.5);

          g.append("circle")
            .attr("cx", cx).attr("cy", cy)
            .attr("r", isMobile ? 6 : 4)
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

        // Pulse animation
        const animatePulse = () => {
          Object.keys(currentCountries).forEach(key => {
            g.select(`.pulse-ring-${key}`)
              .attr("r", 6).attr("opacity", 0.7)
              .transition().duration(1800).ease(d3.easeSinOut)
              .attr("r", 14).attr("opacity", 0)
              .on("end", function () {
                d3.select(this).attr("r", 6).attr("opacity", 0.7);
                animatePulse();
              });
          });
        };
        animatePulse();

        // Initial positions
        const positions = {};
        Object.entries(countryCoords).forEach(([key, { lat, lon }]) => {
          const [px, py] = projection([lon, lat]);
          positions[key] = { x: px, y: py };
        });
        if (onMarkerPosition) onMarkerPosition(positions);
      });
  }, [currentCountries, currentGrain]);

  useEffect(() => {
    // Small delay to ensure the DOM has rendered with correct dimensions
    const timer = setTimeout(() => buildMap(), 50);
    return () => {
      clearTimeout(timer);
      if (svgRef.current) d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [buildMap]);

  useEffect(() => {
    const handleResize = () => buildMap();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [buildMap]);

  return (
    <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <svg ref={svgRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {tooltip.visible && (
        <div
          style={{
            position: "absolute", pointerEvents: "none", zIndex: 20,
            left: tooltip.x + 14, top: tooltip.y - 44,
            background: "rgba(6,13,24,0.95)",
            border: `1px solid ${currentGrain.color}55`,
            borderRadius: "6px", color: "#F5EDD8",
            padding: "0.4rem 0.75rem",
            fontSize: "0.85rem", fontWeight: 500,
            backdropFilter: "blur(8px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
          }}
        >
          <span style={{ marginRight: "0.25rem" }}>{tooltip.flag}</span>
          {tooltip.name}
          <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "rgba(245,237,216,0.45)" }}>
            {tooltip.production} Mi t
          </span>
        </div>
      )}
      <div style={{ position: "absolute", bottom: "1rem", left: "1rem", fontSize: "0.72rem", color: "rgba(245,237,216,0.2)", userSelect: "none" }}>
        Scroll para zoom · Arraste para mover
      </div>
    </div>
  );
}