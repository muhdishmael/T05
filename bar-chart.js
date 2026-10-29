/**
 * Chart 3: Bar Chart
 * Energy consumption for different screen technologies (55-inch TVs only)
 */
(() => {
  const container = d3.select("#bar-chart");
  if (container.empty()) return;

  const tooltip = d3.select("#d3-global-tooltip");

  const width = 560;
  const height = 380;
  const margin = { top: 35, right: 30, bottom: 55, left: 65 };

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "chart-svg");

  d3.csv("data/Ex5_TV_energy_55inchtv_byScreenType.csv", d => ({
    screenTech: d.Screen_Tech,
    meanEnergy: +d["Mean(Labelled energy consumption (kWh/year))"]
  })).then(data => {
    const validData = data.filter(d => !isNaN(d.meanEnergy) && d.meanEnergy > 0);

    // Scales
    const xScale = d3.scaleBand()
      .domain(validData.map(d => d.screenTech))
      .range([margin.left, width - margin.right])
      .padding(0.38);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(validData, d => d.meanEnergy) * 1.18])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
      .domain(validData.map(d => d.screenTech))
      .range(["#0284c7", "#0d9488", "#f43f5e"]);

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
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).ticks(6);

    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.selectAll(".tick text")
        .style("font-size", "12px")
        .style("font-weight", "600")
        .style("fill", "#334155"))
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
      .text("Screen Technology (55-Inch Models)");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#475569")
      .text("Mean Energy Consumption (kWh / year)");

    // Bars
    const bars = svg.selectAll(".bar-rect")
      .data(validData)
      .join("rect")
      .attr("class", "bar-rect")
      .attr("x", d => xScale(d.screenTech))
      .attr("y", d => yScale(d.meanEnergy))
      .attr("width", xScale.bandwidth())
      .attr("height", d => (height - margin.bottom) - yScale(d.meanEnergy))
      .attr("fill", d => colorScale(d.screenTech))
      .attr("rx", 6)
      .attr("ry", 6)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition().duration(150)
          .attr("opacity", 0.85)
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 2);

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.screenTech} (55" Displays)</strong><br/>
            <div class="tooltip-divider"></div>
            <strong>Mean Consumption:</strong> ${d.meanEnergy.toFixed(2)} kWh/yr<br/>
            <strong>Relative to LCD:</strong> +${(((d.meanEnergy / validData[0].meanEnergy) - 1) * 100).toFixed(1)}%
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 14) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition().duration(150)
          .attr("opacity", 1)
          .attr("stroke", "none");

        tooltip.style("opacity", 0);
      });

    // Value Labels on top of each bar
    svg.selectAll(".bar-value-label")
      .data(validData)
      .join("text")
      .attr("class", "bar-value-label")
      .attr("x", d => xScale(d.screenTech) + xScale.bandwidth() / 2)
      .attr("y", d => yScale(d.meanEnergy) - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "700")
      .style("fill", "#1e293b")
      .text(d => `${d.meanEnergy.toFixed(1)} kWh`);

    // Legend
    const legendContainer = d3.select("#bar-legend");
    if (!legendContainer.empty()) {
      validData.forEach(item => {
        const row = legendContainer.append("div")
          .attr("class", "legend-item");

        row.append("span")
          .attr("class", "legend-color")
          .style("background-color", colorScale(item.screenTech));

        row.append("span")
          .text(`${item.screenTech} (55"): ${item.meanEnergy.toFixed(1)} kWh/yr`);
      });
    }
  }).catch(err => {
    console.error("Error loading bar chart data:", err);
    container.append("p").text("Error loading bar chart data.");
  });
})();
