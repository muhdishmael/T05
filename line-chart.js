/**
 * Chart 4: Multi-Line Chart
 * Australian Spot Power Prices (1998 - 2024) across States & National Average
 */
(() => {
  const container = d3.select("#line-chart");
  if (container.empty()) return;

  const tooltip = d3.select("#d3-global-tooltip");

  const width = 560;
  const height = 380;
  const margin = { top: 30, right: 30, bottom: 55, left: 65 };

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "chart-svg");

  d3.csv("data/Ex5_ARE_Spot_Prices.csv").then(rawData => {
    // Defined regions/series
    const seriesKeys = [
      { key: "Queensland ($ per megawatt hour)", name: "Queensland", color: "#0284c7", width: 1.8, dash: "" },
      { key: "New South Wales ($ per megawatt hour)", name: "NSW", color: "#0d9488", width: 1.8, dash: "" },
      { key: "Victoria ($ per megawatt hour)", name: "Victoria", color: "#8b5cf6", width: 1.8, dash: "" },
      { key: "South Australia ($ per megawatt hour)", name: "South Australia", color: "#f59e0b", width: 1.8, dash: "" },
      { key: "Tasmania ($ per megawatt hour)", name: "Tasmania", color: "#10b981", width: 1.8, dash: "" },
      { key: "Average Price (notTas-Snowy)", name: "National Average", color: "#e11d48", width: 3, dash: "" }
    ];

    // Parse data
    const parsedData = rawData.map(d => {
      const row = { year: +d.Year };
      seriesKeys.forEach(s => {
        const val = d[s.key];
        row[s.name] = (val !== undefined && val !== "" && !isNaN(+val)) ? +val : null;
      });
      return row;
    }).filter(d => !isNaN(d.year));

    // Find max price for Y domain
    let maxPrice = 0;
    parsedData.forEach(row => {
      seriesKeys.forEach(s => {
        if (row[s.name] !== null && row[s.name] > maxPrice) {
          maxPrice = row[s.name];
        }
      });
    });

    const years = parsedData.map(d => d.year);

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(years))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, maxPrice * 1.1])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Background horizontal grid lines
    svg.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("")
      )
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line")
        .attr("stroke", "#f1f5f9")
        .attr("stroke-dasharray", "3,3"));

    // Axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(6)
      .tickFormat(d3.format("d")); // Avoid comma in year (1998 not 1,998)

    const yAxis = d3.axisLeft(yScale)
      .ticks(6)
      .tickFormat(d => `$${d}`);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.selectAll(".tick text")
        .style("font-size", "11px")
        .style("fill", "#64748b"))
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"));

    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .call(g => g.selectAll(".tick text")
        .style("font-size", "11px")
        .style("fill", "#64748b"))
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"));

    // Axis Labels
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", margin.left + (width - margin.left - margin.right) / 2)
      .attr("y", height - 15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#475569")
      .text("Year (1998 - 2024)");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#475569")
      .text("Spot Price ($ AUD / Megawatt Hour)");

    // Line paths
    const linesGroup = svg.append("g").attr("class", "lines-layer");

    seriesKeys.forEach(s => {
      const lineGen = d3.line()
        .defined(d => d[s.name] !== null)
        .x(d => xScale(d.year))
        .y(d => yScale(d[s.name]))
        .curve(d3.curveMonotoneX);

      linesGroup.append("path")
        .datum(parsedData)
        .attr("class", `line-path line-${s.name.replace(/\s+/g, "-")}`)
        .attr("fill", "none")
        .attr("stroke", s.color)
        .attr("stroke-width", s.width)
        .attr("stroke-dasharray", s.dash)
        .attr("stroke-linecap", "round")
        .attr("d", lineGen);
    });

    // Vertical hover guide line & crosshair dot
    const hoverGuide = svg.append("line")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#64748b")
      .attr("stroke-dasharray", "3,3")
      .attr("stroke-width", 1.5)
      .style("opacity", 0)
      .style("pointer-events", "none");

    // Transparent overlay for hover detection
    svg.append("rect")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mx] = d3.pointer(event);
        const yearHover = Math.round(xScale.invert(mx));
        const matchedRow = parsedData.find(d => d.year === yearHover);

        if (!matchedRow) return;

        const xPos = xScale(matchedRow.year);
        hoverGuide
          .attr("x1", xPos)
          .attr("x2", xPos)
          .style("opacity", 1);

        let tooltipHTML = `<strong>Year ${matchedRow.year} Spot Prices</strong><br/><div class="tooltip-divider"></div>`;
        seriesKeys.forEach(s => {
          const val = matchedRow[s.name];
          const valText = val !== null ? `$${val.toFixed(2)}/MWh` : "N/A";
          const isAvg = s.name === "National Average";
          tooltipHTML += `
            <div style="display:flex; justify-content:space-between; gap:12px; font-weight:${isAvg ? "700" : "400"}; color:${isAvg ? "#fca5a5" : "#e2e8f0"}">
              <span><span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${s.color}; margin-right:4px;"></span>${s.name}:</span>
              <span>${valText}</span>
            </div>
          `;
        });

        tooltip
          .style("opacity", 1)
          .html(tooltipHTML)
          .style("left", (event.pageX + 16) + "px")
          .style("top", (event.pageY - 40) + "px");
      })
      .on("mouseleave", function () {
        hoverGuide.style("opacity", 0);
        tooltip.style("opacity", 0);
      });

    // Legend
    const legendContainer = d3.select("#line-legend");
    if (!legendContainer.empty()) {
      let activeFilter = null;

      seriesKeys.forEach(s => {
        const item = legendContainer.append("div")
          .attr("class", "legend-item")
          .on("click", function () {
            if (activeFilter === s.name) {
              activeFilter = null;
              linesGroup.selectAll(".line-path")
                .transition().duration(200)
                .style("opacity", 1)
                .attr("stroke-width", d => seriesKeys.find(k => d.some(r => r[k.name] !== undefined))?.width || 2);
              legendContainer.selectAll(".legend-item").style("opacity", 1);
            } else {
              activeFilter = s.name;
              linesGroup.selectAll(".line-path")
                .transition().duration(200)
                .style("opacity", 0.15);

              linesGroup.select(`.line-${s.name.replace(/\s+/g, "-")}`)
                .transition().duration(200)
                .style("opacity", 1)
                .attr("stroke-width", s.width + 1.5)
                .raise();

              legendContainer.selectAll(".legend-item")
                .style("opacity", l => d3.select(this).text().includes(s.name) ? 1 : 0.4);
            }
          });

        item.append("span")
          .attr("class", "legend-color line")
          .style("background-color", s.color)
          .style("height", s.width >= 3 ? "4px" : "2.5px");

        item.append("span").text(s.name);
      });
    }
  }).catch(err => {
    console.error("Error loading spot prices data:", err);
    container.append("p").text("Error loading spot prices data.");
  });
})();
