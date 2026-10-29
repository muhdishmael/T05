/**
 * Chart 2: Donut Chart
 * Energy consumption across screen technologies (All TV sizes combined)
 */
(() => {
  const container = d3.select("#donut-chart");
  if (container.empty()) return;

  const tooltip = d3.select("#d3-global-tooltip");

  const width = 560;
  const height = 380;
  const radius = Math.min(width, height) / 2 - 35;
  const innerRadius = radius * 0.58;

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "chart-svg");

  const chartGroup = svg.append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  d3.csv("data/Ex5_TV_energy_Allsizes_byScreenType.csv", d => ({
    screenTech: d.Screen_Tech,
    meanEnergy: +d["Mean(Labelled energy consumption (kWh/year))"]
  })).then(data => {
    const validData = data.filter(d => !isNaN(d.meanEnergy) && d.meanEnergy > 0);

    const totalEnergy = d3.sum(validData, d => d.meanEnergy);

    // Color palette consistent with dashboard
    const colorScale = d3.scaleOrdinal()
      .domain(validData.map(d => d.screenTech))
      .range(["#0284c7", "#0d9488", "#f43f5e"]);

    // Pie and Arc generators
    const pie = d3.pie()
      .value(d => d.meanEnergy)
      .sort(null)
      .padAngle(0.025);

    const normalArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(5);

    const hoverArc = d3.arc()
      .innerRadius(innerRadius - 4)
      .outerRadius(radius + 9)
      .cornerRadius(6);

    const arcData = pie(validData);

    // Donut Slices
    const paths = chartGroup.selectAll("path")
      .data(arcData)
      .join("path")
      .attr("d", normalArc)
      .attr("fill", d => colorScale(d.data.screenTech))
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .transition().duration(200)
          .attr("d", hoverArc)
          .attr("filter", "drop-shadow(0px 4px 6px rgba(0,0,0,0.2))");

        const percent = ((d.data.meanEnergy / totalEnergy) * 100).toFixed(1);

        // Update center text dynamically
        centerTitle.text(d.data.screenTech);
        centerValue.text(`${Math.round(d.data.meanEnergy)} kWh`);
        centerSub.text(`${percent}% of total mean`);

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.data.screenTech}</strong><br/>
            <div class="tooltip-divider"></div>
            <strong>Mean Consumption:</strong> ${d.data.meanEnergy.toFixed(1)} kWh/yr<br/>
            <strong>Share:</strong> ${percent}%
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 14) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition().duration(200)
          .attr("d", normalArc)
          .attr("filter", "none");

        // Reset center text to default summary
        centerTitle.text("All Screens");
        centerValue.text(`${Math.round(d3.mean(validData, d => d.meanEnergy))} kWh`);
        centerSub.text("Overall Average");

        tooltip.style("opacity", 0);
      });

    // Outer percentage text labels
    const labelArc = d3.arc()
      .innerRadius(radius * 0.76)
      .outerRadius(radius * 0.76);

    chartGroup.selectAll(".donut-slice-label")
      .data(arcData)
      .join("text")
      .attr("class", "donut-slice-label")
      .attr("transform", d => `translate(${labelArc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("fill", "#ffffff")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("pointer-events", "none")
      .text(d => `${((d.data.meanEnergy / totalEnergy) * 100).toFixed(0)}%`);

    // Center summary display
    const centerGroup = chartGroup.append("g").attr("class", "center-summary");

    const centerTitle = centerGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-1.1em")
      .style("font-size", "13px")
      .style("font-weight", "600")
      .style("fill", "#64748b")
      .text("All Screens");

    const centerValue = centerGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.25em")
      .style("font-size", "22px")
      .style("font-weight", "700")
      .style("fill", "#1e293b")
      .text(`${Math.round(d3.mean(validData, d => d.meanEnergy))} kWh`);

    const centerSub = centerGroup.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.7em")
      .style("font-size", "11px")
      .style("fill", "#94a3b8")
      .text("Overall Average");

    // Donut Legend
    const legendContainer = d3.select("#donut-legend");
    if (!legendContainer.empty()) {
      validData.forEach(item => {
        const row = legendContainer.append("div")
          .attr("class", "legend-item");

        row.append("span")
          .attr("class", "legend-color circle")
          .style("background-color", colorScale(item.screenTech));

        row.append("span")
          .text(`${item.screenTech}: ${item.meanEnergy.toFixed(1)} kWh/yr`);
      });
    }
  }).catch(err => {
    console.error("Error loading donut chart data:", err);
    container.append("p").text("Error loading donut chart data.");
  });
})();
