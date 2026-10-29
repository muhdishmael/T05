# T05: Multi-Chart Webpage Dashboard

**Unit:** COS30045 Data Visualisation  
**Author:** Muhammad Ishmael 'Aqib  

---

## 📌 Project Overview
An interactive, responsive multi-chart web application built with **D3.js (v7)** visualizing Australian appliance energy consumption and National Electricity Market (NEM) spot power prices.

### 📊 Included Visualizations (One JS file per chart)
1. **Scatter Plot (`scatter-plot.js`)**
   - **Data:** `data/Ex5_TV_energy.csv`
   - **Topic:** Energy Consumption vs. Star Rating across 588 TV models.
   - **Encodings:** Star rating on X-axis, annual energy consumption (kWh/year) on Y-axis, dots color-coded by screen technology (`LCD`, `LCD (LED)`, `OLED`) with interactive click-to-filter legend and hover tooltips.

2. **Donut Chart (`donut-chart.js`)**
   - **Data:** `data/Ex5_TV_energy_Allsizes_byScreenType.csv`
   - **Topic:** Mean energy consumption across screen technologies (all TV sizes combined).
   - **Encodings:** Proportional arc angles with inner hole radius, dynamic center summary text on hover, percentage slice labels, and interactive tooltips.

3. **Bar Chart (`bar-chart.js`)**
   - **Data:** `data/Ex5_TV_energy_55inchtv_byScreenType.csv`
   - **Topic:** Energy consumption benchmark for 55-inch models only across screen types.
   - **Encodings:** Vertical bars with direct numeric labels, standardized axis ticks, and relative comparison percentages on hover.

4. **Line Chart (`line-chart.js`)**
   - **Data:** `data/Ex5_ARE_Spot_Prices.csv`
   - **Topic:** Australian wholesale spot power prices ($/MWh) from 1998 to 2024.
   - **Encodings:** Multi-series lines for NEM states (Queensland, NSW, Victoria, South Australia, Tasmania) and bold National Average line, with vertical crosshair scrubber and interactive state isolation legend.

---

## 🚀 Running Locally
Due to browser CORS restrictions with `d3.csv()` reading local files, serve using any local web server:

```bash
# Using Python
python -m http.server 8000

# Or using VS Code Live Server extension:
# Right-click index.html -> "Open with Live Server"
```

Open `http://localhost:8000` in your web browser.
