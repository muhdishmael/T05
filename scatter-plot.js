/**
 * Chart 1: Scatter Plot
 * Energy Consumption vs Star Rating across TV models
 */
(() => {
  const container = d3.select("#scatter-plot");
  if (container.empty()) return;

  const tooltip = d3.select("#d3-global-tooltip");

  // Logical dimensions for SVG viewBox
  const width = 560;
  const height = 380;
  const margin = { top: 30, right: 25, bottom: 55, left: 60 };

  const svg = container.append("svg")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("class", "chart-svg");

  d3.csv("data/Ex5_TV_energy.csv", d => ({
    brand: d.brand,
    screenTech: d.screen_tech,
    screenSize: +d.screensize,
    energy: +d.energy_consumpt,
    star: +d.star2,
    count: +d.count
  })).then(data => {
    // Filter out invalid records if any
    const validData = data.filter(d => !isNaN(d.energy) && !isNaN(d.star) && d.energy > 0 && d.star > 0);

    // Domains
    const xExtent = d3.extent(validData, d => d.star);
    const yExtent = [0, d3.max(validData, d => d.energy) * 1.08];

    // Scales
    const xScale = d3.scaleLinear()
      .domain([Math.max(0, xExtent[0] - 0.5), xExtent[1] + 0.5])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain(yExtent)
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Color scale for screen technology
    const techCategories = Array.from(new Set(validData.map(d => d.screenTech)));
    const colorScale = d3.scaleOrdinal()
      .domain(techCategories)
      .range(["#0284c7", "#0d9488", "#f43f5e", "#8b5cf6"]);

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
    const xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d => d + "★");
    const yAxis = d3.axisLeft(yScale).ticks(6);

    const gX = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)
      .call(g => g.selectAll(".tick text").style("font-size", "11px").style("fill", "#64748b"))
      .call(g => g.select(".domain").attr("stroke", "#cbd5e1"));

    const gY = svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(yAxis)
      .call(g => g.selectAll(".tick text").style("font-size", "11px").style("fill", "#64748b"))
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
      .text("Energy Star Rating (Stars)");

    svg.append("text")
      .attr("class", "axis-label")
      .attr("transform", "rotate(-90)")
      .attr("x", -(margin.top + (height - margin.top - margin.bottom) / 2))
      .attr("y", 18)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "600")
      .style("fill", "#475569")
      .text("Annual Energy Consumption (kWh / year)");

    // Plot circles with jitter to reduce visual collision
    const dots = svg.append("g")
      .selectAll("circle")
      .data(validData)
      .join("circle")
      .attr("cx", d => xScale(d.star))
      .attr("cy", d => yScale(d.energy))
      .attr("r", 4.5)
      .attr("fill", d => colorScale(d.screenTech))
      .attr("fill-opacity", 0.65)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.75)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        d3.select(this)
          .raise()
          .transition().duration(150)
          .attr("r", 7.5)
          .attr("fill-opacity", 1)
          .attr("stroke", "#0f172a")
          .attr("stroke-width", 2);

        tooltip
          .style("opacity", 1)
          .html(`
            <strong>${d.brand.toUpperCase()}</strong> (${d.screenSize}")<br/>
            <div class="tooltip-divider"></div>
            <strong>Technology:</strong> ${d.screenTech}<br/>
            <strong>Star Rating:</strong> ${d.star} ★<br/>
            <strong>Consumption:</strong> ${d.energy} kWh/year
          `);
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", (event.pageX + 14) + "px")
          .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseleave", function (event, d) {
        d3.select(this)
          .transition().duration(150)
          .attr("r", 4.5)
          .attr("fill-opacity", 0.65)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.75);

        tooltip.style("opacity", 0);
      });

    // Create Legend below chart
    const legendContainer = d3.select("#scatter-legend");
    if (!legendContainer.empty()) {
      let activeTech = null;

      techCategories.forEach(tech => {
        const item = legendContainer.append("div")
          .attr("class", "legend-item")
          .on("click", function () {
            if (activeTech === tech) {
              activeTech = null;
              dots.transition().duration(250)
                .attr("fill-opacity", 0.65)
                .attr("r", 4.5);
              legendContainer.selectAll(".legend-item").style("opacity", 1);
            } else {
              activeTech = tech;
              dots.transition().duration(250)
                .attr("fill-opacity", d => d.screenTech === tech ? 0.9 : 0.08)
                .attr("r", d => d.screenTech === tech ? 5.5 : 3.5);
              legendContainer.selectAll(".legend-item")
                .style("opacity", t => (t === tech || d3.select(this).text().includes(tech)) ? 1 : 0.4);
            }
          });

        item.append("span")
          .attr("class", "legend-color circle")
          .style("background-color", colorScale(tech));

        item.append("span").text(tech);
      });
    }
  }).catch(err => {
    console.error("Error loading scatter plot data:", err);
    container.append("p").text("Error loading data. Please ensure CSV files are present in the data/ folder.");
  });
})();
