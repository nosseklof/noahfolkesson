// ===========================
// 0. Code Overview ---
// ===========================

/* 1. Global Settings
   2. Data Loading Functions
   4. Info Panel Functions
   5. Sparkline Rendering
   6. UI Rendering (accordion + slider ticks)
   7. Map Main Logic (map.on("load"))
*/


// ===========================
// 1. GLOBAL SETTINGS
// ===========================

// Mapbox access token to access styles and polygon data
mapboxgl.accessToken = "pk.eyJ1Ijoibm9zc2Vsa29mIiwiYSI6ImNta2NoMzdhYTAwdmEzZHFvNWNtamFtZm0ifQ.JjmRqHPoSbmBQRibRQ3myA";

// Initialise the map, set style and centre on Östergötland
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [15.7, 58.35],
  zoom: 7
});

// Load polygon URL - access kommun boundary data
const polygonURL =
  "https://api.mapbox.com/datasets/v1/nosselkof/cml5ba30z00e21nqvax14ofkm/features?access_token=" +
  mapboxgl.accessToken;

// Load CSV URL - access dairy farms/cows data
const csvUrl =
  "https://raw.githubusercontent.com/nosseklof/noahfolkesson/main/ostergotland_cow_data.csv";

const geocoder = new MapboxGeocoder({
  accessToken: mapboxgl.accessToken,
  mapboxgl: mapboxgl,
  marker: false,
  flyTo: false,
  placeholder: "Search for places in Östergötland",
  proximity: {
    longitude: 15.7,
    latitude: 58.35
  }
});

// Create hover pop-up for kommun name on hover
const hoverPopup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
  offset: [0, -6]   // lifts the popup slightly above the cursor
});

// Select all accordion headers in the both consoles
const headers = document.querySelectorAll(".accordion-header");

// create element slider
const slider = document.getElementById("yearSlider");

// Set custom introductory sentences for each municipality for executive summary
const customIntros = {
  // Ödeshög - 0509
  "0509": "Ödeshög stretches from fertile plains along Vättern to more rugged inland ground, giving it a long history of both crop farming and grazing. Dairy has been part of rural life but never dominant, with mixed farming shaping most of the area. The municipality is also rich in cultural heritage, home to some of Sweden’s highest concentrations of rune stones and ancient sites that anchor the landscape in deep history. Ödeshög has seen significant decreases in both dairy farms and dairy cows between 2003 and 2023, with the remaining seven dairy farms staying small (with an average of 53 dairy cows in 2023) and leaving a countryside shaped by larger crop operations",
  // Ydre - 0512
  "0512": "Ydre’s hilly, forested landscape has shaped a rural life built on grazing, cattle, and small family farms. Dairy has deep roots here, though the number of farms has fallen sharply over time. The countryside still reflects generations of meadows, pastures, and mixed agriculture woven into the forested hills. The number of dairy farms in Ydre decreased from 52 to 17 between 2003 and 2023, with dairy cow numbers decreasing by almost 1,000 heads. The average herd size in remaining farms has doubled from 45 to 88 cows per farm. Nevertheless, Ydre remains one of the municipalities with the highest density of both dairy farms and cows in 2023.",
  // Kinda - 0513
  "0513": "Kinda’s valleys, forests, and lakes have long supported grazing, cattle, and small‑scale mixed farming, with dairy playing a meaningful role across the rural landscape. The Kinda Canal has been central to the area’s development, once linking farms and forests to wider markets and shaping how goods moved through the region. In recent decades, many smaller herds and holdings have disappeared, leaving a countryside defined by larger mixed operations and the enduring presence of the canal winding through fields and water. The municipality has seen a significant decrease in the number of farms, from 69 to 27, but is one of the only municipalities to see a slight increase in the number of dairy cows. The average herd size has subsequently increased from 44 cows in 2003 to 130 in 2023.",
  // Boxholm
  "0560": "Boxholm’s mix of forests, lakes, and open fields has long supported small‑scale mixed farming, with cattle and grazing playing a steady role. Dairy has been especially meaningful here, thanks to the area’s well‑known cheesemaking tradition, even if herds were never large by regional standards. The number of farms has fallen over time, with the number of dairy farms decreasing from 16 to 4 between 2003 and 2023. This leaves a landscape shaped by a handful of larger operations, as the average number of cows per herd increased from 59 to 195 in the same period - leaving Boxholm as one of the municipalities with the largest average herd size in the county in 2023.",
  // Åtvidaberg
  "0561": "Åtvidaberg’s rolling forests and lakes surround pockets of farmland where small‑scale mixed farming has deep roots. Dairy and cattle have been steady features, though never on a large scale. Over time, many smaller farms have disappeared, leaving a rural landscape shaped by forestry and a handful of larger agricultural operations. The number of dairy farms decreased from 37 in 2003 to 9 in 2023, with the number of dairy cows following suit. While remaining relatively small, the average herd size in the surviving farms nearly doubled from 51 to 90 in the same time period.",
  // Finspång
  "0562": "Finspång’s forests, lakes, and scattered fields have long supported small farms, grazing, and mixed agriculture, but the ironworks has shaped the area more than anything else. For centuries, local farms supplied the bruk with cattle, hay, and labour, creating a rural economy closely tied to industry. Dairy has been part of this mix, though never dominant, and many smaller farms have disappeared over time. Today, agriculture continues on a more consolidated scale, with the landscape still carrying the imprint of its long connection between farming and the ironworks.",
  // Valdemarsvik
  "0563": "Valdemarsvik’s coastline, forests, and scattered farmland have shaped a long tradition of small‑scale mixed agriculture, with grazing and cattle playing steady roles across the inlets and valleys. Dairy has existed here but never on a large scale, as the rugged terrain favoured smaller herds and flexible farming. Fishing and coastal trade once complemented rural livelihoods, and in recent decades many farms have consolidated or disappeared. The landscape today reflects that mix of sea, forest, and long‑standing agricultural pockets woven through the archipelago edge.",
  // Linkoping - 0580
  "0580": "Some of Sweden’s richest farmland surround Östergötland's biggest city Linköping, where grain, oilseeds, and cattle have defined rural life for generations. Dairy exists but has never been the main driver compared to the strong arable tradition. As the city has grown and farms have modernised, the countryside now reflects a pattern of larger, more specialised operations shaping the plains. Between 2003 and 2023, has seen a significant decrease in the number of dairy farms, while it is one of few municipalities where the number of dairy cows has increased. The average herd in the municipality now consist of 180 cows compared to 57 in 2003. This reflects Linköping’s increasing importance in dairy production, as it now has some of the highest density of both dairy farms and cows in the county.",
  // Norrköping - 0581
  "0581": "Beyond its industrial centre, Norrköping is ringed by productive farmland that has long supplied grain, cattle, and dairy to the region. Dairy has mattered, but crop farming has always been the stronger force. Recent decades have brought the same trend seen across the plains: fewer farms, larger fields, and increasingly specialised production. The number of dairy farms dropped from 77 to 21 between 2003 and 2023, with the number of dairy cows also decreasing significantly. The average number of cows per herd increased from 66 to 100 dairy cows in the same period.",
  // Söderköping - 0582
  "0582": "Söderköping’s mix of coastline, forests, and open fields has supported a long tradition of varied agriculture, from grain and vegetables to grazing and cattle. Dairy has been present but never the dominant force, as the area’s soils and climate have favoured a broad mix of farming. The old town’s trading history once tied local farms to wider markets, and in recent decades many smaller holdings have disappeared, leaving a landscape shaped by larger arable operations and pockets of mixed farming spread across the coastal valleys. The number of dairy farms dropped from 36 to 11 between 2003 and 2023, with the number of dairy cows also decreasing significantly. The average number of cows per herd increased from 42 to 92 dairy cows in the same period.",
  // Motala - 83
  "0583": "Motala’s mix of lakes, rivers, and open farmland has supported varied agriculture, from grain to cattle. Dairy has played a steady role, shaped by the fertile soils around Vättern and the waterways that once linked farms to markets. Between 2003 and 20, the number of farms has declined from 29 to 10, leaving production concentrated in fewer, larger holdings as the average herd size per farm in the municipality has more than doubled from 51 to 114 dairy cows.",
  // Vadstena - 84
  "0584": "Vadstena’s wide plains and lakeside soils have supported farming for centuries, with grain and cattle shaping much of the rural landscape. Dairy has been present but never dominant, as arable farming has long been the backbone here. The area’s famous monastery fields add a unique historical layer, even as modern agriculture has shifted toward fewer, larger farms working the open land. Two dairy farms closed in Vadstena municipality between 2003 and 2023, leaving three operational dairy farms. However, the remaining farms continue on a small scale as the average herd size has only seen a moderate increase from 24 to 54 dairy cows.",
  // Mjölby - 86
  "0586": "Mjölby sits at the heart of the Östergötland plains, where broad, fertile fields have long made crop farming central to the area’s identity. The town grew around its historic mill sites, which once anchored local grain production and trade. Dairy and cattle have complemented the landscape, though many smaller herds have disappeared over time. In recent years, potato farming has become increasingly important, adding a new layer to the region’s strong arable tradition and shaping how the countryside is farmed today. In Mjölby, the number of dairy farms decreased significantly from 21 farms in 2003 to four farms in 2023; while the number of dairy cows also decreased significantly, the average herd size more than tripled in the time period, from 70 to 225, leaving Mjölby with the largest average number of dairy cows per farm in Östergötland."
};

// Set valid years for slider (must match data years)
const validYears = [2003, 2005, 2007, 2010, 2013, 2016, 2020, 2023];

// Set object to hold full trend per kommun, keyed by KnKod:
// { [KnKod]: { farms:[{date,value}], cows:[{date,value}] } }
const seriesByKod = {};

const areaUnitKm2 = 50;   // constant for calc density per 50 km²

const countyChartContainer = document.getElementById("countyMiniChart");

// track current selection + year
let currentYear;
let selectedKnKod = null;

let enriched = null;

// Globals for calculating cow and farm density
let currentFarmBreaks = null;
let currentCowBreaks = null;

let currentDensityMode = "farms";   // default mode

let allFarmDensities = [];
let allCowDensities = [];

let miniGeom = null;          // main mini chart

let countyMiniGeom = null;    // county mini chart
let activeMiniGeom = null;    // whichever chart is being dragged

let isScrubbingMini = false; // distiguish main slider vs chart slider drag
let isDraggingMiniChart = false;

// ===========================
// 2. DATA LOADING FUNCTIONS
// ===========================

// Load CSV data (dairy farms and cows)
async function loadCSV() {
  const response = await fetch(csvUrl);
  const text = await response.text();
  return Papa.parse(text, { header: true }).data;
}

// Load polygon data (kommun boundaries)
async function loadPolygons() {
  const response = await fetch(polygonURL);
  return response.json();
}

// ===========================
// 3. HELPER FUNCTIONS
// ===========================

/*Utility: compute 5-class break values for density measure
Used to build choropleth legend and desnity classes*/
function computeBreaks(values) {
  const sorted = [...values].sort((a, b) => a - b);
  return [
    sorted[Math.floor(sorted.length * 0.20)],
    sorted[Math.floor(sorted.length * 0.40)],
    sorted[Math.floor(sorted.length * 0.60)],
    sorted[Math.floor(sorted.length * 0.80)]
  ];
}

/*Utility: compute densities for farms and cows for all years*/
function computeDensitiesForYear(year) {
  enriched.features.forEach(f => {
    const dairy = f.properties.dairy;

    const farmsRow = dairy.dairy_farms.find(d => d.year === year);
    const cowsRow  = dairy.dairy_cows.find(d => d.year === year);

    const farms = farmsRow ? farmsRow.value : 0;
    const cows  = cowsRow  ? cowsRow.value  : 0;

    f.properties.farmDensity = farms / (f.properties.areaKm2 / areaUnitKm2);
    f.properties.cowDensity  = cows  / (f.properties.areaKm2 / areaUnitKm2);
    f.properties.avgCowsPerFarm = farms > 0 ? cows / farms : 0;

    const breaks = currentDensityMode === "farms"
      ? currentFarmBreaks
      : currentCowBreaks;

    const val = currentDensityMode === "farms"
      ? f.properties.farmDensity
      : f.properties.cowDensity;

    f.properties.densityClass =
      val <= breaks[0] ? 1 :
      val <= breaks[1] ? 2 :
      val <= breaks[2] ? 3 :
      val <= breaks[3] ? 4 : 5;
  });
}

/*Draw stats from main data set on number of cows and farms
per year and municipality, and calculate average*/
function getStatsFor(enrichedGeoJSON, knkod, year) {
  const feature = enrichedGeoJSON.features.find(
    (f) => f.properties.KnKod === knkod
  );
  if (!feature) return null;

  const dairy = feature.properties.dairy || {};
  const cowsRow = (dairy.dairy_cows || []).find((d) => d.year === year);
  const farmsRow = (dairy.dairy_farms || []).find((d) => d.year === year);

  const cows = cowsRow ? cowsRow.value : 0;
  const farms = farmsRow ? farmsRow.value : 0;
  const avg = farms > 0 ? cows / farms : 0;

  return {
    name: feature.properties.KnNamn,
    cows,
    farms,
    avg
  };
}

/*Calculate country totals*/
function computeCountyTimeSeries(enriched, validYears) {
  const series = [];

  validYears.forEach(year => {
    let totalCows = 0;
    let totalFarms = 0;

    enriched.features.forEach(f => {
      const dairy = f.properties.dairy;

      const cowsRow  = dairy.dairy_cows.find(d => d.year === year);
      const farmsRow = dairy.dairy_farms.find(d => d.year === year);

      totalCows  += cowsRow  ? cowsRow.value  : 0;
      totalFarms += farmsRow ? farmsRow.value : 0;
    });

    series.push({
      year,
      cows: totalCows,
      farms: totalFarms
    });
  });

  return series;
}

function computeCountyAverages(enriched, validYears) {
  const totals = computeCountyTimeSeries(enriched, validYears);

  return totals.map(d => ({
    year: d.year,
    avgCowsPerFarm: d.farms > 0 ? d.cows / d.farms : 0
  }));
}

//function describing what happens when updating info panel
// contains text format for municipal summary
function updateInfoPanel(enrichedGeoJSON, year, selectedKnKodArg) {

  const infoTitle = document.getElementById("infoTitle");
  const infoYear  = document.getElementById("infoYear");
  const infoFarms = document.getElementById("infoFarms");
  const infoCows  = document.getElementById("infoCows");
  const infoAvg   = document.getElementById("infoAvg");
  const chartEl   = document.getElementById("mini-chart");

  const summaryContent = document.getElementById("summaryContent");

  infoYear.textContent = year;

  if (!selectedKnKodArg) {
    infoTitle.textContent = "Select a municipality";
    summaryContent.textContent = "—";
    infoFarms.textContent = "—";
    infoCows.textContent  = "—";
    infoAvg.textContent   = "—";

    renderMiniChart(chartEl, [], [], {
      width: 250,
      height: 175,
      normalize: true,
      years: validYears.map(String),
      yTitleLeft: "Cows",
      yTitleRight: "Farms",
      xTitle: "Year",
      title: "Dairy farms and cows over time"
    });
    attachMiniChartListeners();

    return;
  }

  const stats = getStatsFor(enrichedGeoJSON, selectedKnKodArg, year);

  if (!stats) {
    infoTitle.textContent = "Select a municipality";
    summaryContent.textContent = "—";
    infoFarms.textContent = "—";
    infoCows.textContent  = "—";
    infoAvg.textContent   = "—";

    renderMiniChart(chartEl, [], [], {
      width: 250,
      height: 175,
      normalize: true,
      years: validYears.map(String),
      yTitleLeft: "Cows",
      yTitleRight: "Farms",
      xTitle: "Year",
      title: "Trends over time"
    });
    attachMiniChartListeners();

    return;
  }

  infoTitle.textContent = stats.name + " Municipality";
  infoFarms.textContent = stats.farms.toLocaleString("en-GB");
  infoCows.textContent  = stats.cows.toLocaleString("en-GB");
  infoAvg.textContent   = stats.avg ? Math.round(stats.avg) : "0";

  const series = seriesByKod[selectedKnKodArg] || { farms: [], cows: [] };

  renderMiniChart(chartEl, series.farms, series.cows, {
    width: 250,
    height: 175,
    normalize: true,
    years: validYears.map(String),
    highlightYear: year,
    yTitleLeft: "Cows",
    yTitleRight: "Farms",
    xTitle: "Year",
    title: "Trends over time in " + stats.name
  });
  attachMiniChartListeners();

  const farms2003 = series.farms.find(d => d.date === 2003)?.value ?? 0;
  const farms2023 = series.farms.find(d => d.date === 2023)?.value ?? 0;
  const cows2003  = series.cows.find(d => d.date === 2003)?.value ?? 0;
  const cows2023  = series.cows.find(d => d.date === 2023)?.value ?? 0;

  const avg2003 = farms2003 > 0 ? cows2003 / farms2003 : 0;
  const avg2023 = farms2023 > 0 ? cows2023 / farms2023 : 0;

  const farmTrend = classifyTrend(farms2003, farms2023);
  const cowTrend  = classifyTrend(cows2003, cows2023);
  const avgTrend  = avg2023 > avg2003 ? "increased" : "decreased";

  const intro = customIntros[selectedKnKodArg] 
    || `There is no information about ${stats.name}.`;

  const summaryHTML = `
    <p>${intro}</p>`;
  summaryContent.innerHTML = summaryHTML;
}

// function for creating municipal chart + main frame for mini charts
function renderMiniChart(container, farmsSeries, cowsSeries, opts = {}) {
  
  /* Function Overview
     a. Chart dimensions and padding
     b. Build date domain
     c. Align farms and cows series
     d. Create SVG + coordinate helpers
     e. Compute min/max for axes
     f. Title
     g. Left Y-axis (cows)
     h. Right Y-axis (farms)
     i. X-axis baseline + labels
     j. Lines
     k. Highlight dots
     l. Attach svg
  */

  // --------------------------
  // a. Chart dimensions and padding
  // --------------------------

  const width  = opts.width  ?? 250;
  const height = opts.height ?? 175;

  const p = { l: 45, r: 50, t: 26, b: 26, ...(opts.padding || {}) };

  const colors = {
    farms: "#00441b",
    cows:  "#41ab5d",
    ...(opts.colors || {})
  };

  const svgNS = "http://www.w3.org/2000/svg";
  container.innerHTML = "";
  
  const geomTarget = opts.geomTarget || "miniGeom";

  // --------------------------
  // b. Build date domain
  // --------------------------
  const toKey = (d) => String(d);

  let dates;
  if (opts.years) {
    // If explicit years are provided, use them as the x-domain
    dates = opts.years.map(String);
  } else {
    // Otherwise, derive the domain from the series
    const datesSet = new Set();
    (farmsSeries || []).forEach(d => datesSet.add(toKey(d.date)));
    (cowsSeries  || []).forEach(d => datesSet.add(toKey(d.date)));
    dates = Array.from(datesSet).sort();
  }

  // Fallback: if still empty, but years were provided, reuse them
  if (!dates.length) {
    dates = opts.years ? opts.years.map(String) : [];
  }

  // --------------------------
  // c. Align farms and cows series
  // --------------------------
  const align = (src) => dates.map(dt => {
    const hit = (src || []).find(d => toKey(d.date) === dt);
    return { date: dt, value: hit ? Number(hit.value) : null };
  });

  const farms = align(farmsSeries);
  const cows  = align(cowsSeries);

  // --------------------------
  // d. Create SVG + coordinate helpers
  // --------------------------
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", width);
  svg.setAttribute("height", height);

  const x0 = p.l, x1 = width - p.r;
  const y0 = height - p.b, y1 = p.t;

  const xScale = (i) =>
    x0 + (x1 - x0) * (i / Math.max(1, dates.length - 1));

  // --------------------------
  // e. Compute min/max for axes
  // --------------------------
  const farmsVals = farms.map(d => d.value).filter(v => v != null);
  const cowsVals  = cows .map(d => d.value).filter(v => v != null);

  const farmsMinActual = farmsVals.length ? Math.min(...farmsVals) : 0;
  const farmsMaxActual = farmsVals.length ? Math.max(...farmsVals) : 0;

  const cowsMinActual  = cowsVals.length ? Math.min(...cowsVals) : 0;
  const cowsMaxActual  = cowsVals.length ? Math.max(...cowsVals) : 0;

  // Axes always start at 0
  const farmsMin = 0;
  const cowsMin  = 0;

  // Add 5% headroom
  const farmsMax = farmsMaxActual * 1.05;
  const cowsMax  = cowsMaxActual * 1.05;

  // Tick arrays (not all used explicitly, but kept for clarity)
  const farmsTicks = farmsMinActual > 0
    ? [0, farmsMinActual, farmsMaxActual]
    : [0, farmsMaxActual];

  const cowsTicks = cowsMinActual > 0
    ? [0, cowsMinActual, cowsMaxActual]
    : [0, cowsMaxActual];

  // PURE JS y‑scales
  const yScaleLeft = (v) => {
    const t = (v - cowsMin) / Math.max(1e-9, cowsMax - cowsMin);
    return y0 + (y1 - y0) * t;
  };

  const yScaleRight = (v) => {
    const t = (v - farmsMin) / Math.max(1e-9, farmsMax - farmsMin);
    return y0 + (y1 - y0) * t;
  };

  // --------------------------
  // f. Title
  // --------------------------
  if (opts.title) {
    const title = document.createElementNS(svgNS, "text");
    title.setAttribute("x", (x0 + x1) / 2);
    title.setAttribute("y", p.t - 8);
    title.setAttribute("fill", "#111");
    title.setAttribute("font-size", "11");
    title.setAttribute("font-weight", "bold");
    title.setAttribute("text-anchor", "middle");
    title.textContent = opts.title;
    svg.appendChild(title);
  }

  // --------------------------
  // g. Left Y-axis (cows)
  // --------------------------
  if (cowsVals.length) {
    const axisLeft = document.createElementNS(svgNS, "line");
    axisLeft.setAttribute("x1", x0);
    axisLeft.setAttribute("x2", x0);
    axisLeft.setAttribute("y1", y0);
    axisLeft.setAttribute("y2", y1);
    axisLeft.setAttribute("stroke", "#999");
    svg.appendChild(axisLeft);

    // 0 tick mark
    const tick0 = document.createElementNS(svgNS, "line");
    tick0.setAttribute("x1", x0 - 4);
    tick0.setAttribute("x2", x0);
    tick0.setAttribute("y1", y0);
    tick0.setAttribute("y2", y0);
    tick0.setAttribute("stroke", "#999");
    svg.appendChild(tick0);

    // 0 tick label
    const txtMin = document.createElementNS(svgNS, "text");
    txtMin.setAttribute("x", x0 - 8);
    txtMin.setAttribute("text-anchor", "end");
    txtMin.setAttribute("y", y0 - 2);
    txtMin.setAttribute("fill", "#666");
    txtMin.setAttribute("font-size", "9");
    txtMin.textContent = cowsMin.toLocaleString("en-GB");
    svg.appendChild(txtMin);

    // minActual tick label (only if > 0)
    if (cowsMinActual > 0) {
      const yMinActual = yScaleLeft(cowsMinActual);
      const txtMid = document.createElementNS(svgNS, "text");
      txtMid.setAttribute("x", x0 - 6);
      txtMid.setAttribute("text-anchor", "end");
      txtMid.setAttribute("y", yMinActual + 3);
      txtMid.setAttribute("fill", "#666");
      txtMid.setAttribute("font-size", "9");
      txtMid.textContent = cowsMinActual.toLocaleString("en-GB");
      svg.appendChild(txtMid);
    }

    // minActual tick mark
    if (cowsMinActual > 0) {
      const yMinActual = yScaleLeft(cowsMinActual);
      const tickMin = document.createElementNS(svgNS, "line");
      tickMin.setAttribute("x1", x0 - 4);
      tickMin.setAttribute("x2", x0);
      tickMin.setAttribute("y1", yMinActual);
      tickMin.setAttribute("y2", yMinActual);
      tickMin.setAttribute("stroke", "#999");
      svg.appendChild(tickMin);
    }

    // max tick label
    const txtMax = document.createElementNS(svgNS, "text");
    txtMax.setAttribute("x", x0 - 6);
    txtMax.setAttribute("text-anchor", "end");
    txtMax.setAttribute("y", y1 + 10);
    txtMax.setAttribute("fill", "#666");
    txtMax.setAttribute("font-size", "9");
    txtMax.textContent = cowsMaxActual.toLocaleString("en-GB");
    svg.appendChild(txtMax);

    // maxActual tick mark
    const yMaxActual = yScaleLeft(cowsMaxActual);
    const tickMax = document.createElementNS(svgNS, "line");
    tickMax.setAttribute("x1", x0 - 4);
    tickMax.setAttribute("x2", x0);
    tickMax.setAttribute("y1", yMaxActual);
    tickMax.setAttribute("y2", yMaxActual);
    tickMax.setAttribute("stroke", "#999");
    svg.appendChild(tickMax);

    // create axis title
    if (opts.yTitleLeft) {
      const titleLeft = document.createElementNS(svgNS, "text");

      // Position: outside chart, centered vertically
      const cx = x0 - 37; // move left of axis
      const cy = ((y0 + y1) / 2); // vertical center

      titleLeft.setAttribute("x", cx);
      titleLeft.setAttribute("y", cy);
      titleLeft.setAttribute("fill", "#41ab5d");
      titleLeft.setAttribute("font-size", "11");
      titleLeft.setAttribute("font-weight", "bold");
      titleLeft.setAttribute("text-anchor", "middle");
      // Rotate around its center
      titleLeft.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);

      titleLeft.textContent = "Number of " + opts.yTitleLeft;
      svg.appendChild(titleLeft);
    }
  }

  // --------------------------
  // h. Right Y-axis (farms)
  // --------------------------
  if (farmsVals.length) {
    const axisRight = document.createElementNS(svgNS, "line");
    axisRight.setAttribute("x1", x1);
    axisRight.setAttribute("x2", x1);
    axisRight.setAttribute("y1", y0);
    axisRight.setAttribute("y2", y1);
    axisRight.setAttribute("stroke", "#999");
    svg.appendChild(axisRight);

    // 0 tick mark
    const tick0R = document.createElementNS(svgNS, "line");
    tick0R.setAttribute("x1", x1);
    tick0R.setAttribute("x2", x1 + 4);
    tick0R.setAttribute("y1", y0);
    tick0R.setAttribute("y2", y0);
    tick0R.setAttribute("stroke", "#999");
    svg.appendChild(tick0R);

    // 0 tick label
    const txtMinR = document.createElementNS(svgNS, "text");
    txtMinR.setAttribute("x", x1 + 6);
    txtMinR.setAttribute("text-anchor", "start");
    txtMinR.setAttribute("y", y0 - 2);
    txtMinR.setAttribute("fill", "#666");
    txtMinR.setAttribute("font-size", "9");
    txtMinR.textContent = farmsMin.toLocaleString("en-GB");
    svg.appendChild(txtMinR);

    // minActual tick label (only if > 0)
    if (farmsMinActual > 0) {
      const yMinActual = yScaleRight(farmsMinActual);
      const txtMidR = document.createElementNS(svgNS, "text");
      txtMidR.setAttribute("x", x1 + 6);
      txtMidR.setAttribute("text-anchor", "start");
      txtMidR.setAttribute("y", yMinActual + 3);
      txtMidR.setAttribute("fill", "#666");
      txtMidR.setAttribute("font-size", "9");
      txtMidR.textContent = farmsMinActual.toLocaleString("en-GB");
      svg.appendChild(txtMidR);
    }

    // minActual tick mark
    if (farmsMinActual > 0) {
      const yMinActual = yScaleRight(farmsMinActual);
      const tickMinR = document.createElementNS(svgNS, "line");
      tickMinR.setAttribute("x1", x1);
      tickMinR.setAttribute("x2", x1 + 4);
      tickMinR.setAttribute("y1", yMinActual);
      tickMinR.setAttribute("y2", yMinActual);
      tickMinR.setAttribute("stroke", "#999");
      svg.appendChild(tickMinR);
    }

    // Max tick label
    const txtMaxR = document.createElementNS(svgNS, "text");
    txtMaxR.setAttribute("x", x1 + 6);
    txtMaxR.setAttribute("text-anchor", "start");
    txtMaxR.setAttribute("y", y1 + 10);
    txtMaxR.setAttribute("fill", "#666");
    txtMaxR.setAttribute("font-size", "9");
    txtMaxR.textContent = farmsMaxActual.toLocaleString("en-GB");
    svg.appendChild(txtMaxR);

    // maxActual tick mark
    const yMaxActual = yScaleRight(farmsMaxActual);
    const tickMaxR = document.createElementNS(svgNS, "line");
    tickMaxR.setAttribute("x1", x1);
    tickMaxR.setAttribute("x2", x1 + 4);
    tickMaxR.setAttribute("y1", yMaxActual);
    tickMaxR.setAttribute("y2", yMaxActual);
    tickMaxR.setAttribute("stroke", "#999");
    svg.appendChild(tickMaxR);

    // axis title
    if (opts.yTitleRight) {
      const titleRight = document.createElementNS(svgNS, "text");

      // Position: outside chart, centered vertically
      const cx = x1 + 30;                 // move right of axis
      const cy = (y0 + y1) / 2;           // vertical center

      titleRight.setAttribute("x", cx);
      titleRight.setAttribute("y", cy);
      titleRight.setAttribute("fill", "#00441b");
      titleRight.setAttribute("font-size", "11");
      titleRight.setAttribute("font-weight", "bold");
      titleRight.setAttribute("text-anchor", "middle");

      // Rotate around its center
      titleRight.setAttribute("transform", `rotate(90 ${cx} ${cy})`);
      titleRight.textContent = "Number of " + opts.yTitleRight;
      svg.appendChild(titleRight);
    }
  }

  // --------------------------
  // i. X-axis baseline + labels
  // --------------------------
  const axisX = document.createElementNS(svgNS, "line");
  axisX.setAttribute("x1", x0);
  axisX.setAttribute("x2", x1);
  axisX.setAttribute("y1", y0);
  axisX.setAttribute("y2", y0);
  axisX.setAttribute("stroke", "#999");
  svg.appendChild(axisX);

  if (dates.length) {
    const firstYear = dates[0];
    const lastYear  = dates[dates.length - 1];

    const txtFirst = document.createElementNS(svgNS, "text");
    txtFirst.setAttribute("x", x0);
    txtFirst.setAttribute("y", y0 + 14);
    txtFirst.setAttribute("fill", "#666");
    txtFirst.setAttribute("font-size", "9");
    txtFirst.textContent = firstYear;
    svg.appendChild(txtFirst);

    const txtLast = document.createElementNS(svgNS, "text");
    txtLast.setAttribute("x", x1);
    txtLast.setAttribute("y", y0 + 14);
    txtLast.setAttribute("fill", "#666");
    txtLast.setAttribute("font-size", "9");
    txtLast.setAttribute("text-anchor", "end");
    txtLast.textContent = lastYear;
    svg.appendChild(txtLast);
  }

  if (opts.xTitle) {
    const xTitle = document.createElementNS(svgNS, "text");
    xTitle.setAttribute("x", (x0 + x1) / 2);
    xTitle.setAttribute("y", y0 + 26);
    xTitle.setAttribute("fill", "#333");
    xTitle.setAttribute("font-size", "10");
    xTitle.setAttribute("text-anchor", "middle");
    xTitle.textContent = opts.xTitle;
    svg.appendChild(xTitle);
  }

  // --------------------------
  // j. Lines
  // --------------------------
  const toPath = (series, yScale) => {
    let d = "";
    series.forEach((pt, i) => {
      const x = xScale(i);
      if (pt.value == null) d += ` M ${x} ${yScale(0)}`;
      else d += (d === "" ? "M" : " L") + ` ${x} ${yScale(pt.value)}`;
    });
    return d;
  };

  const cowsPath = document.createElementNS(svgNS, "path");
  cowsPath.setAttribute("d", toPath(cows, yScaleLeft));
  cowsPath.setAttribute("fill", "none");
  cowsPath.setAttribute("stroke", colors.cows);
  cowsPath.setAttribute("stroke-width", 2.2);
  cowsPath.setAttribute("stroke-opacity", 0.65);
  cowsPath.setAttribute("vector-effect", "non-scaling-stroke");
  svg.appendChild(cowsPath);

  const farmsPath = document.createElementNS(svgNS, "path");
  farmsPath.setAttribute("d", toPath(farms, yScaleRight));
  farmsPath.setAttribute("fill", "none");
  farmsPath.setAttribute("stroke", colors.farms);
  farmsPath.setAttribute("stroke-width", 2.2);
  farmsPath.setAttribute("vector-effect", "non-scaling-stroke");
  svg.appendChild(farmsPath);

  // --------------------------
  // k. Highlight dots
  // --------------------------
  if (opts.highlightYear) {
    const highlightKey = String(opts.highlightYear);
    const idx = dates.indexOf(highlightKey);

    if (idx !== -1) {
      const x = xScale(idx);

      const pf = farms[idx];
      if (pf && pf.value != null) {
        const y = yScaleRight(pf.value);
        const dot = document.createElementNS(svgNS, "circle");
        dot.setAttribute("cx", x);
        dot.setAttribute("cy", y);
        dot.setAttribute("r", 3.5);
        dot.setAttribute("fill", colors.farms);
        dot.setAttribute("stroke", "#fff");
        dot.setAttribute("stroke-width", 1.2);
        dot.setAttribute("vector-effect", "non-scaling-stroke");
        
        dot.classList.add("highlight-dot");
        
        svg.appendChild(dot);
      }

      const pc = cows[idx];
      if (pc && pc.value != null) {
        const y = yScaleLeft(pc.value);
        const dotCows = document.createElementNS(svgNS, "circle");
        dotCows.setAttribute("cx", x);
        dotCows.setAttribute("cy", y);
        dotCows.setAttribute("r", 3.5);
        dotCows.setAttribute("fill", colors.cows);
        dotCows.setAttribute("stroke", "#fff");
        dotCows.setAttribute("stroke-width", 1.2);
        dotCows.setAttribute("vector-effect", "non-scaling-stroke");
        
        dotCows.classList.add("highlight-dot");
        
        svg.appendChild(dotCows);
      }
  }
}
  
  // --------------------------
  // l. Interactive elements
  // --------------------------
  
  // 1. Create interaction layer
  const interaction = document.createElementNS(svgNS, "rect");
  interaction.setAttribute("class", "interaction-layer");
  interaction.setAttribute("x", x0);
  interaction.setAttribute("y", 0);
  interaction.setAttribute("width", x1 - x0);
  interaction.setAttribute("height", height);
  interaction.setAttribute("fill", "transparent");
  interaction.style.cursor = "pointer";
  svg.appendChild(interaction);
  
  // --------------------------
  // m. Attach SVG
  // --------------------------
  container.innerHTML = "";   
  container.appendChild(svg);
  
  // 2. assign geometry
   window[geomTarget] = {
    svg,
    interaction,
    x0,
    x1,
    dates,
    xScale,
    yScaleLeft,
    yScaleRight,
    farms,
    cows
  };
}

// function for creating county chart, pulls on renderMiniChart for formatting
function renderCountyMiniChart(container, countySeries, currentYear) {
  const farmsSeries = countySeries.map(d => ({
    date: String(d.year),
    value: d.farms
  }));

  const cowsSeries = countySeries.map(d => ({
    date: String(d.year),
    value: d.cows
  }));
  
  renderMiniChart(container, farmsSeries, cowsSeries, {
    title: "County trend over time",
    xTitle: "Year",
    yTitleLeft: "cows",
    yTitleRight: "farms",
    years: countySeries.map(d => String(d.year)),
    highlightYear: currentYear,
    geomTarget: "countyMiniGeom"
  });
}

// function for info panel to classify trends
function classifyTrend(start, end) {
  const pct = start > 0 ? ((end - start) / start) * 100 : 0;
  if (Math.abs(pct) < 5) return "remained stable";
  if (pct <= -30) return "decreased significantly";
  if (pct < 0)   return "decreased slightly";
  if (pct >= 30) return "increased significantly";
  return "increased slightly";
}

// convert mouse x position to nearest year in mini-chart
function getYearFromX(x, width, validYears) {
  // 1. Normalize x to 0–1 range
  const t = x / width;

  // 2. Scale to year index
  let idx = Math.round(t * (validYears.length - 1));

  // 3. Clamp to valid range
  idx = Math.max(0, Math.min(validYears.length - 1, idx));

  // 4. Return the actual year
  return validYears[idx];
}


// ===========================
// 6. UI Rendering
// ===========================

// -- ACCORDION HEADERS -- //
function openRightAccordionSection(targetId) {
  const rightAccordion = document.querySelector("#console_right .accordion");
  if (!rightAccordion) return;

  // Close all items in the right accordion
  rightAccordion.querySelectorAll(".accordion-content").forEach(c => {
    c.classList.remove("open");
    c.style.maxHeight = 0;
  });

  rightAccordion.querySelectorAll(".accordion-arrow").forEach(a => {
    a.style.transform = "rotate(0deg)";
  });
  
  // Remove highlight from all items
  rightAccordion.querySelectorAll(".accordion-item").forEach(i => {
    i.classList.remove("open");
  });

  // Open the requested section
  const header = rightAccordion.querySelector(`[data-target="${targetId}"]`);
  const content = rightAccordion.querySelector(`#${targetId}`);
  if (!header || !content) return;

  const arrow = header.querySelector(".accordion-arrow");
  const item = header.closest(".accordion-item");

  content.classList.add("open");
  content.style.maxHeight = content.scrollHeight + "px";
  arrow.style.transform = "rotate(180deg)";
  
  item.classList.add("open");
}

function closeRightAccordion() {
  const rightAccordion = document.querySelector("#console_right .accordion");
  if (!rightAccordion) return;

  rightAccordion.querySelectorAll(".accordion-content").forEach(c => {
    c.classList.remove("open");
    c.style.maxHeight = 0;
  });

  rightAccordion.querySelectorAll(".accordion-arrow").forEach(a => {
    a.style.transform = "rotate(0deg)";
  });
  
  rightAccordion.querySelectorAll(".accordion-item").forEach(i => {
    i.classList.remove("open"); // ⭐ remove highlight
  });

}

function openLeftAccordionSection(targetId) {
  const accordion = document.querySelector("#console_left .accordion");
  if (!accordion) return;

  const items = accordion.querySelectorAll(".accordion-item");

  items.forEach(item => {
    const content = item.querySelector(".accordion-content");
    if (!content) return;

    if (content.id === targetId) {
      content.classList.add("open");
      content.style.maxHeight = content.scrollHeight + "px";
      item.classList.add("open");   // highlight
    } else {
      content.classList.remove("open");
      content.style.maxHeight = null;
      item.classList.remove("open"); // remove highlight
    }
  });
}

function isClickOnUI(event) {
  const target = event.target;
  if (!(target instanceof Element)) return false;

  return target.closest(
    "#console_left, #console_right, #infoPanel, #yearSliderContainer, #density-mode-container, .mapboxgl-control-container"

  );
}

// Accordion header click handler
/*runs only when user clicks header to open and close accordion sections.
Does not run when clicking content, map, or polygons*/
document.querySelectorAll(".accordion").forEach(accordion => {
  const headers = accordion.querySelectorAll(".accordion-header");

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const targetId = header.getAttribute("data-target");
      const content = accordion.querySelector("#" + targetId);
      const arrow = header.querySelector(".accordion-arrow");
      const item = header.closest(".accordion-item");

      const isOpen = content.classList.contains("open");

      // Close ONLY items inside THIS accordion
      accordion.querySelectorAll(".accordion-content").forEach(c => {
        c.classList.remove("open");
        c.style.maxHeight = 0;
      });

      accordion.querySelectorAll(".accordion-arrow").forEach(a => {
        a.style.transform = "rotate(0deg)";
      });

      // ⭐ Remove highlight from all items
      accordion.querySelectorAll(".accordion-item").forEach(i => {
        i.classList.remove("open");
      });

      // Toggle the clicked one
      if (!isOpen) {
        content.classList.add("open");
        content.style.maxHeight = content.scrollHeight + "px";
        arrow.style.transform = "rotate(180deg)";

        if (item) {
          item.classList.add("open");  // ⭐ highlight the clicked item
        }
      }
    });
  });
});

// LEFT CONSOLE complete close
document.querySelector(".left-toggle").addEventListener("click", () => {
  document.getElementById("console_left").classList.toggle("console-collapsed");
});

// RIGHT CONSOLE complete close
document.querySelector(".right-toggle").addEventListener("click", () => {
  document.getElementById("console_right").classList.toggle("console-collapsed");
});

// open the Ostergotland summary when map loads.
window.addEventListener("DOMContentLoaded", () => {
  const accordion = document.querySelector("#console_left .accordion");
  if (!accordion) return;

  const header = accordion.querySelector('[data-target="allSummaryContent"]');
  const content = accordion.querySelector("#allSummaryContent");
  const item = header.closest(".accordion-item");
  const arrow = header.querySelector(".accordion-arrow");

  // Close all items first (clean state)
  accordion.querySelectorAll(".accordion-content").forEach(c => {
    c.classList.remove("open");
    c.style.maxHeight = 0;
  });

  accordion.querySelectorAll(".accordion-item").forEach(i => {
    i.classList.remove("open");
  });

  accordion.querySelectorAll(".accordion-arrow").forEach(a => {
    a.style.transform = "rotate(0deg)";
  });

  // Now open the Overview section properly
  content.classList.add("open");
  content.style.maxHeight = content.scrollHeight + "px";

  item.classList.add("open");        // ⭐ highlight green
  arrow.style.transform = "rotate(180deg)"; // ⭐ arrow points up
});

document.addEventListener("click", (e) => {
  if (isClickOnUI(e)) return;
  if (e.target.closest("#map")) return;
  if (e.target.closest(".accordion-header") ||
      e.target.closest(".accordion-section")) {
    return;
  }
});

// -- YEAR SLIDER -- //
// function for reading which year slider is on
function buildYearTicks(validYears) {
  const tickContainer = document.getElementById("yearTicks");
  tickContainer.innerHTML = "";

  validYears.forEach(year => {
    const tick = document.createElement("span");
    tick.textContent = year;
    tick.dataset.year = year;        // REQUIRED
    tick.classList.add("year-tick"); // optional but clean
    tickContainer.appendChild(tick);
  });
}

function updateActiveYearTick(selectedYear) {
  document.querySelectorAll("#yearTicks span").forEach(tick => {
    if (tick.dataset.year == selectedYear) {
      tick.classList.add("active");
    } else {
      tick.classList.remove("active");
    }
  });
}

// slider setup
slider.min  = 0;
slider.max  = validYears.length - 1;
slider.step = 1;

const defaultIndex = validYears.indexOf(2003);
slider.value = defaultIndex;

// event listener for slider
slider.addEventListener("input", () => {
  const idx = +slider.value;
  const year = validYears[idx];
  setYearFromMiniChart(year);
});

// Build ticks
buildYearTicks(validYears);

// Highlight the default year
updateActiveYearTick(currentYear);

function updateMiniChartHighlight(svg, dates, year, xScale, yScaleLeft, yScaleRight, farms, cows) {
  svg.querySelectorAll(".highlight-dot").forEach(el => el.remove());
  
  const idx = dates.indexOf(String(year));
  if (idx === -1) return;

  const x = xScale(idx);

  // Remove old highlights
  svg.querySelectorAll(".highlight-dot").forEach(el => el.remove());

  // Add new farm dot
  const f = farms[idx];
  if (f && f.value != null) {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.classList.add("highlight-dot");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", yScaleRight(f.value));
    dot.setAttribute("r", 3.5);
    dot.setAttribute("fill", "#000");
    dot.setAttribute("stroke", "#fff");
    dot.setAttribute("stroke-width", 1.2);
    svg.appendChild(dot);
  }

  // Add new cow dot
  const c = cows[idx];
  if (c && c.value != null) {
    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.classList.add("highlight-dot");
    dot.setAttribute("cx", x);
    dot.setAttribute("cy", yScaleLeft(c.value));
    dot.setAttribute("r", 3.5);
    dot.setAttribute("fill", "#74c476");
    dot.setAttribute("stroke", "#fff");
    dot.setAttribute("stroke-width", 1.2);
    svg.appendChild(dot);
  }
}

//unified interaction handler for sliders
function handleMiniChartEvent(event) {  
  
  const geom = activeMiniGeom;
  if (!geom) return;
  
  // --- DEBUG: which geometry is active ---
  console.log(
    "Active geom target:",
    geom === window.miniGeom ? "miniGeom" :
    geom === window.countyMiniGeom ? "countyMiniGeom" :
    "UNKNOWN"
  );

  // --- DEBUG: bounding box of the interaction layer ---
  const rect = geom.interaction.getBoundingClientRect();
  console.log("rect.width:", rect.width, "rect.left:", rect.left);

  // --- DEBUG: click position ---
  console.log("event.clientX:", event.clientX);

  // Use the SVG’s bounding box, not the rect’s width
  const svgRect = geom.svg.getBoundingClientRect();
  const x = event.clientX - svgRect.left;

  const chartWidth = geom.x1 - geom.x0;
  const t = (x - geom.x0) / chartWidth;

  const idx = Math.round(t * (geom.dates.length - 1));
  const safeIdx = Math.max(0, Math.min(geom.dates.length - 1, idx));

  const year = Number(geom.dates[safeIdx]);

  if (isDraggingMiniChart) {
    currentYear = year;
    slider.value = safeIdx;
    updateActiveYearTick(year);

    // update density map
    computeDensitiesForYear(year);
    map.getSource("areas").setData(enriched);
    map.getSource("centroids").setData({
      type: "FeatureCollection",
      features: enriched.features.map(f => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: f.properties.centroid },
        properties: {
          KnKod: f.properties.KnKod,
          avgCowsPerFarm: f.properties.avgCowsPerFarm
        }
      }))
    });

    // update mini chart highlights
    updateMiniChartHighlight(
      geom.svg,
      geom.dates,
      year,
      geom.xScale,
      geom.yScaleLeft,
      geom.yScaleRight,
      geom.farms,
      geom.cows
    );
    
    return;
  }
}

// post-drag finalizer following from interaction handler (sliders)
function setYearFromMiniChart(year) {
  
    // If dragging, update only the year and slider, not the charts
  if (isDraggingMiniChart) {
    currentYear = year;
    const idx = validYears.indexOf(year);
    if (idx !== -1) slider.value = idx;
    updateActiveYearTick(year);
    return;
  }

  // 1. Update global state
  currentYear = year;

  // 2. Update slider position
  const idx = validYears.indexOf(year);
  if (idx !== -1) {
    slider.value = idx; // no guard needed anymore
  }

  // 3. Update map densities
  computeDensitiesForYear(year);
  map.getSource("areas").setData(enriched);

  // 4. Update centroid circles
  map.getSource("centroids").setData({
    type: "FeatureCollection",
    features: enriched.features.map(f => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: f.properties.centroid },
      properties: {
        KnKod: f.properties.KnKod,
        avgCowsPerFarm: f.properties.avgCowsPerFarm
      }
    }))
  });

  // 5. Update municipal mini-chart
  renderMiniChart(
    document.getElementById("mini-chart"),
    seriesByKod[selectedKnKod]?.farms || [],
    seriesByKod[selectedKnKod]?.cows || [],
    {
      years: validYears.map(String),     // ⭐ FIX: force full year domain
      highlightYear: year,
      geomTarget: "miniGeom",
      title: "Dairy farms and cows over time",
      xTitle: "Year",
      yTitleLeft: "Cows",
      yTitleRight: "Farms"
    }
  );
  attachMiniChartListeners();

  // 6. Update county mini-chart
  renderCountyMiniChart(
    document.getElementById("mini-chart-county"),
    window.countySeries,
    year
  );
  attachMiniChartListeners();

  // 7. Update active tick highlight
  updateActiveYearTick(year);

  // 8. Update info panel if a municipality is selected
  if (selectedKnKod) {
    updateInfoPanel(enriched, year, selectedKnKod);
  }
}

function attachMiniChartListeners() {
  if (window.miniGeom && window.miniGeom.interaction) {
    window.miniGeom.interaction.addEventListener("mousedown", () => {
      isScrubbingMini = true;
      isDraggingMiniChart = true;
      activeMiniGeom = window.miniGeom;
    });
  }

  if (window.countyMiniGeom && window.countyMiniGeom.interaction) {
    window.countyMiniGeom.interaction.addEventListener("mousedown", () => {
      isScrubbingMini = true;
      isDraggingMiniChart = true;
      activeMiniGeom = window.countyMiniGeom;
    });
  }
}

window.addEventListener("mousemove", (event) => {
  if (isScrubbingMini) {
    handleMiniChartEvent(event); // updates year
  }
});

window.addEventListener("mouseup", () => {
  if (isDraggingMiniChart) {
    isDraggingMiniChart = false;
    isScrubbingMini = false;

    // ⭐ Do NOT clear activeMiniGeom here
    // activeMiniGeom = null;

    // Trigger full update only when drag ends
    setYearFromMiniChart(currentYear);
  }
});

// -- GEOCODER -- //
function selectMunicipalityFromGeocoder(knkod) {
  selectedKnKod = knkod;

  const idx  = Number(slider.value);
  const year = validYears[idx];

  updateInfoPanel(enriched, year, selectedKnKod);
  
  if (map.getLayer("areas-selected")) {
    map.setFilter("areas-selected", ["==",
                                     ["get", "KnKod"],
                                     selectedKnKod]);
  }
  
  const bounds = turf.bbox(
    enriched.features.find(f => f.properties.KnKod === knkod)
  );
  
  map.fitBounds(bounds, { padding: 40 });
}

function handleOutsideSearchResult(center, name) {
  showMessage(`"${name}" is outside the mapped areas.`);
}

function showMessage(text) {
  const msg = document.getElementById("mapMessage");

  if (!msg) {
    console.warn("No #mapMessage element found in DOM");
    alert(text); // fallback
    return;
  }

  msg.textContent = text;
  msg.classList.add("visible");

  // Auto-hide after 4 seconds
  setTimeout(() => {
    msg.classList.remove("visible");
  }, 4000);
}

map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

map.addControl(geocoder, "bottom-right");

// -- LEGEND UPDATES -- //
function updateDensityLegend(breaks, mode) {
  const boxes = document.getElementById("density-boxes");
  const boundaries = document.getElementById("density-boundaries");

  boxes.innerHTML = "";
  boundaries.innerHTML = "";

  const colors = [
    "#edf8e9",
    "#bae4b3",
    "#74c476",
    "#31a354",
    "#006d2c"
  ];

  // Add the 5 boxes
  colors.forEach(color => {
    const box = document.createElement("div");
    box.className = "density-box";
    box.style.background = color;
    boxes.appendChild(box);
  });

  // Compute the true max value for the final boundary
  const maxValue = Math.max(...(
    mode === "farms" ? allFarmDensities : allCowDensities
  ));

  // Set 6 labels: 0, b1, b2, b3, b4, max
  const boundaryValues = [0, ...breaks, maxValue];

  boundaryValues.forEach(v => {
    const label = document.createElement("div");
    label.className = "density-boundary-label";
    label.textContent = v.toFixed(1);
    boundaries.appendChild(label);
  });

  // Update title
  document.querySelector(".density-title").textContent =
    mode === "farms"
      ? "Farm density per 50 km²:"
      : "Cow density per 50 km²:";
}

document.querySelectorAll("input[name='densityMode']").forEach(radio => {
  radio.addEventListener("change", () => {
    currentDensityMode = radio.value;

    enriched.features.forEach(f => {
      const val = currentDensityMode === "farms"
        ? f.properties.farmDensity
        : f.properties.cowDensity;

      const breaks = currentDensityMode === "farms"
        ? currentFarmBreaks
        : currentCowBreaks;

      f.properties.densityClass =
        val <= breaks[0] ? 1 :
        val <= breaks[1] ? 2 :
        val <= breaks[2] ? 3 :
        val <= breaks[3] ? 4 : 5;
    });

    map.getSource("areas").setData(enriched);

    // update legend
    updateDensityLegend(
      currentDensityMode === "farms" ? currentFarmBreaks : currentCowBreaks,
      currentDensityMode
    );
  });
});

document.querySelectorAll('input[name="densityMode"]').forEach(radio => {
  radio.addEventListener("change", () => {
    document.querySelectorAll(".density-mode-box").forEach(box => {
      box.classList.remove("active-density-mode");
    });
    radio.closest(".density-mode-box").classList.add("active-density-mode");
  });
});

// -- ANIMATIONS -- //

// pulsating effect around selected areas
let pulse = 0;
function animateGlow(map) {
  pulse = (pulse + 0.02) % (Math.PI * 2);
  const opacity = 0.35 + Math.sin(pulse) * 0.25;

  map.setPaintProperty("areas-selected-glow", "line-opacity", opacity);

  requestAnimationFrame(() => animateGlow(map));
}

// welcome popup

window.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("welcomePopup");
  const closeBtn = document.getElementById("closePopup");

  const hasSeenPopup = localStorage.getItem("seenWelcomePopup");

 //if (!hasSeenPopup) {
 //   popup.style.display = "flex";
 // }
  
  popup.style.display = "flex";

  closeBtn.addEventListener("click", () => {
    popup.style.display = "none";
    localStorage.setItem("seenWelcomePopup", "true");
  });
});

// ===========================
// 7. MAP MAIN LOGIC
// ===========================

map.on("load", async () => {

  // LOAD DATA
  const [csvData, polygonGeojson] = await Promise.all([
    loadCSV(),
    loadPolygons()
  ]);

  // ENRICH POLYGONS WITH TIME SERIES
  enriched = {
    ...polygonGeojson,
    features: polygonGeojson.features.map((f) => {
      const code = f.properties.KnKod;
      const rows = csvData.filter(
        (r) => String(r.kod).trim() === String(code).trim()
      );

      const grouped = {
        dairy_cows: rows
          .filter((r) => r.typ === "dairy_cows")
          .map((r) => ({ year: Number(r.year), value: Number(r.value) })),
        dairy_farms: rows
          .filter((r) => r.typ === "dairy_farms")
          .map((r) => ({ year: Number(r.year), value: Number(r.value) }))
      };

      return { ...f, properties: { ...f.properties, dairy: grouped } };
    })
  };

  // COMPUTE AREA (km²)
  enriched.features.forEach(f => {
    const areaKm2 = turf.area(f) / 1_000_000;
    f.properties.areaKm2 = areaKm2;
  });

  // BUILD SPARKLINE SERIES
  enriched.features.forEach((f) => {
    const kn = f.properties.KnKod;
    const dairy = f.properties.dairy || {};
    const farms = (dairy.dairy_farms || []).map((d) => ({
      date: d.year,
      value: d.value
    }));
    const cows = (dairy.dairy_cows || []).map((d) => ({
      date: d.year,
      value: d.value
    }));
    farms.sort((a, b) => a.date - b.date);
    cows.sort((a, b) => a.date - b.date);
    seriesByKod[kn] = { farms, cows };
  });

  // COLLECT DENSITIES FOR ALL YEARS (for fixed breaks)
  allFarmDensities = [];
  allCowDensities = [];

  validYears.forEach(year => {
    enriched.features.forEach(f => {
      const dairy = f.properties.dairy;

      const farmsRow = dairy.dairy_farms.find(d => d.year === year);
      const cowsRow  = dairy.dairy_cows.find(d => d.year === year);

      const farms = farmsRow ? farmsRow.value : 0;
      const cows  = cowsRow  ? cowsRow.value  : 0;

      const farmDensity = farms / (f.properties.areaKm2 / 50);
      const cowDensity  = cows  / (f.properties.areaKm2 / 50);

      allFarmDensities.push(farmDensity);
      allCowDensities.push(cowDensity);
    });
  });

  // Calculate break values for farm and cow densities
  currentFarmBreaks = computeBreaks(allFarmDensities);
  currentCowBreaks  = computeBreaks(allCowDensities);

  // Compute densities for farms and cows to show on initial map load
  currentYear = validYears[0];
  updateActiveYearTick(validYears[0]);
  computeDensitiesForYear(currentYear);
  
  // Update density legend as soon as map opens
  updateDensityLegend(
    currentDensityMode === "farms" ? currentFarmBreaks : currentCowBreaks,
    currentDensityMode
  );

  // COMPUTE CENTROIDS w/ adjusted positions
  enriched.features.forEach(f => {
    let [lng, lat] = turf.centroid(f).geometry.coordinates;
    const name = f.properties.KnNamn; // depending on your dataset
    
    // Manual adjustments for odd-shaped municipalities
    if (name === "Norrköping") {
      lng -= 0.25;   // shift left (tweak value to taste)
    }
    
    if (name === "Söderköping") {
      lat += 0.04;   // shift up slightly
      lng -= 0.05;   // shift left slightly
    }
    
    if (name === "Mjölby") {
      lat += 0.025;   // shift up slightly
      lng -= 0.01;   // shift left slightly
    }
    
    if (name === "Boxholm") {
      lng -= 0.015;   // shift left slightly
    }
    
    f.properties.centroid = [lng, lat];
  });

  // ADD SOURCES
  map.addSource("areas", { type: "geojson", data: enriched });

  map.addSource("centroids", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: enriched.features.map(f => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: f.properties.centroid },
        properties: {
          KnKod: f.properties.KnKod,
          avgCowsPerFarm: f.properties.avgCowsPerFarm
        }
      }))
    }
  });

  // CHOROPLETH LAYER - including colour choices
  map.addLayer({
    id: "choropleth",
    type: "fill",
    source: "areas",
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "densityClass"], 1], "#edf8e9",
        ["==", ["get", "densityClass"], 2], "#bae4b3",
        ["==", ["get", "densityClass"], 3], "#74c476",
        ["==", ["get", "densityClass"], 4], "#31a354",
        ["==", ["get", "densityClass"], 5], "#006d2c",
        "#cccccc"
      ],
      "fill-opacity": 0.8
    }
  });

  // OUTLINE
  map.addLayer({
    id: "areas-outline",
    type: "line",
    source: "areas",
    paint: {
      "line-color": "#252525",
      "line-width": 1,
      "line-opacity": 0.9
    }
  });
  
  // SELECTED OUTLINE
  map.addLayer({
    id: "areas-selected",
    type: "line",
    source: "areas",
    paint: {
      "line-color": "#252525",
      "line-width": 4,
      "line-opacity": 0.9
    },
    filter: ["==", ["get", "KnKod"], ""]
  });

  // GLOW LAYER FOR SELECTED OUTLINE
  map.addLayer({
    id: "areas-selected-glow",
    type: "line",
    source: "areas",
    paint: {
      "line-color": "#f7fcf5",
      "line-width": 16,
      "line-blur": 12,
      "line-opacity": 0   // start invisible
    },
    filter: ["==", ["get", "KnKod"], ""]
  }, "areas-selected"); // insert above your selected outline
  // Start shimmer animation
  animateGlow(map);
  
  // HOVER  OUTLINE
  map.addLayer({
    id: "areas-hover",
    type: "line",
    source: "areas",          // same source as your polygons
    paint: {
      "line-color": "#000",
      "line-width": 2.5,
      "line-opacity": 0.9
    },
    filter: ["==", ["get", "KnKod"], ""]
  }, "choropleth");

  // HIT AREA
  map.addLayer({
    id: "areas-hit",
    type: "fill",
    source: "areas",
    paint: {
      "fill-color": "#000000",
      "fill-opacity": 0.001
    }
  });

  // CENTROID CIRCLES - including sixe and colour choices
  map.addLayer({
    id: "avg-cows-circle",
    type: "circle",
    source: "centroids",
    paint: {
      "circle-radius": [
        "interpolate", ["linear"], ["get", "avgCowsPerFarm"],
        0, 0,
        100, 10,
        200, 20
      ],
      "circle-color": "#00441b", 
      "circle-opacity": 1,
      "circle-stroke-width": 1,
      "circle-stroke-color": "#252525"
    }
  });  
  
  // ------ EVENT HANDLERS -------- //
  
  geocoder.on("result", (e) => {
    const center = e.result.center;
    const lngLat = new mapboxgl.LngLat(center[0], center[1]);
    
    // Convert to screen point immediately
    const pixel = map.project(lngLat);
    
    // Query municipality polygons instantly
    const features = map.queryRenderedFeatures(pixel, {
      layers: ["areas-hit"]
    });
    
    if (features.length > 0) {
      const knkod = features[0].properties.KnKod;
      selectMunicipalityFromGeocoder(knkod);
      
      const bounds = turf.bbox(
        enriched.features.find(f => f.properties.KnKod === knkod)
      );
      
      map.fitBounds(bounds, { padding: 40 });
    
    } else {
      handleOutsideSearchResult(center, e.result.place_name);
    }
  });

  // click handler A: fires when clicking on polygon
  /*Update info panel, highlighting selected polygon, opening summary according via helper function*/
  map.on("click", "areas-hit", (e) => {
    if (!e.features || !e.features.length) return;
    selectedKnKod = e.features[0].properties.KnKod;

    const idx  = Number(slider.value);
    const year = validYears[idx];
    
    // open the left accordion to the legend and display section
    openLeftAccordionSection("legendOptionsContent");
    
    // 1. Close the right accordion first
    closeRightAccordion();
    // 2. Wait for the collapse animation to apply
    setTimeout(() => {
      // 3. Update info panel with new polygon data
      updateInfoPanel(enriched, year, selectedKnKod);
      
      // 4. Re-open the summary section with fresh content
      openRightAccordionSection("summaryContent");
    }, 500); // 150ms feels natural with CSS transitions
    
    if (map.getLayer("areas-selected")) {
      map.setFilter("areas-selected", ["==", ["get", "KnKod"], selectedKnKod]);
      map.setFilter("areas-selected-glow", ["==", ["get", "KnKod"], selectedKnKod]);
    }
  });

  // click handler B: fires when clicking outside polygons on the map
  /*detecting clicks on empty map, clearing polygon selection, resetting infopanel, closing only the right accordion and leaving left console untouched.*/
  map.on("click", (e) => {
    if (isClickOnUI(e)) return;

    const features = map.queryRenderedFeatures(e.point, {
      layers: ["areas-hit"]
    });

    if (features.length === 0) {
      selectedKnKod = null;

      const idx  = Number(slider.value);
      const year = validYears[idx];
      updateInfoPanel(enriched, year, null);

      if (map.getLayer("areas-selected")) {
        map.setFilter("areas-selected", ["==", ["get", "KnKod"], ""]);
        map.setFilter("areas-selected-glow", ["==", ["get", "KnKod"], ""])
      }
      
      if (features.length === 0) {
        closeRightAccordion(); // reset info panel, selection, etc.
      }
    }
  });

  // change cursor when over polygon
  map.on("mouseenter", "areas-hit", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", "areas-hit", () => {
    map.getCanvas().style.cursor = "";
  });

  // hover pop-up and thicker lines when over polygon
  map.on("mousemove", "areas-hit", (e) => {
    const feature = e.features[0];
    const name = feature.properties.KnNamn;
    const kod  = feature.properties.KnKod;
     
    // Update popup
    hoverPopup
      .setLngLat(e.lngLat)
      .setHTML(`<div class="hover-label">${name}</div>`)
      .addTo(map);
    
    // Update hover outline
    map.setFilter("areas-hover", ["==", ["get", "KnKod"], kod]);
  });
  
  map.on("mouseleave", "areas-hit", () => {
    hoverPopup.remove();
    
    // Clear hover outline
    map.setFilter("areas-hover", ["==", ["get", "KnKod"], ""]);
  });
  
  // ----- COUNTY CHART ------- //
  // compute county timeseries
  const countySeries = computeCountyTimeSeries(enriched, validYears);
  
  // render county minichart
  renderCountyMiniChart(
    document.getElementById("mini-chart-county"),
                            countySeries,
                            currentYear
  );
  attachMiniChartListeners();
  
  // store for later slider updates
  window.countySeries = countySeries;
  // Fix accordion height on page load
  setTimeout(() => {
    const countyAccordion = document.getElementById("allSummaryContent");
    countyAccordion.style.maxHeight = countyAccordion.scrollHeight + "px";
  }, 50);

}); // END OF MAP.ON("LOAD")
