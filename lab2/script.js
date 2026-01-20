// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken =
  "pk.eyJ1Ijoibm9zc2Vsa29mIiwiYSI6ImNta2NoMzdhYTAwdmEzZHFvNWNtamFtZm0ifQ.JjmRqHPoSbmBQRibRQ3myA";

// Define a map object by initialising a Map from Mapbox
const map = new mapboxgl.Map({
  container: "map",
  // Replace YOUR_STYLE_URL with your style URL.
  style: "mapbox://styles/nosselkof/cmkml7tlp006w01qz7n1q8e3u",
  center: [-4.2559, 55.8652],
  zoom: 10.5
});

// Add hover interaction
map.on("mousemove", (event) => {
  const dzone = map.queryRenderedFeatures(event.point, {
    layers: ["simd2020-glasgowcitycouncil"]
  });
  document.getElementById("pd").innerHTML = dzone.length
    ? `<h3>${dzone[0].properties.DZName}</h3><p>Rank: 
<strong>${dzone[0].properties.Percentv2}</strong> %</p>`
    : `<p>Hover over a data zone!</p>`;
  map.getSource("hover").setData({
    type: "FeatureCollection",
    features: dzone.map(function (f) {
      return { type: "Feature", geometry: f.geometry };
    })
  });
});

// Add legend
map.on("load", () => {
  const layers = ["<10", "20", "30", "40", "50", "60", "70", "80", "90", "100"];

  const colors = [
    "#67001f",
    "#b2182b",
    "#d6604d",
    "#f4a582",
    "#fddbc7",
    "#d1e5f0",
    "#92c5de",
    "#4393c3",
    "#2166ac",
    "#053061"
  ];

  const legend = document.getElementById("legend");
  // add elegend structure
  layers.forEach((layer, i) => {
    const color = colors[i];
    const key = document.createElement("div");
    if (i <= 1 || i >= 8) {
      key.style.color = "white";
    }
    key.className = "legend-key";
    key.style.backgroundColor = color;
    key.innerHTML = `${layer}`;
    legend.appendChild(key);
  });
  // add hover feature
  map.addSource("hover", {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] }
  });
  map.addLayer({
    id: "dz-hover",
    type: "line",
    source: "hover",
    layout: {},
    paint: {
      "line-color": "#252525",
      "line-width": 2
    }
  });
});

// add geocoder search control
const geocoder = new MapboxGeocoder({
  // Initialize the geocoder
  accessToken: mapboxgl.accessToken, // Set the access token
  mapboxgl: mapboxgl, // Set the mapbox-gl instance
  marker: false, // Do not use the default marker style
  placeholder: "Search for places in Glasgow", // Placeholder text for the search bar
  proximity: {
    longitude: 55.8642,
    latitude: 4.2518
  } // Coordinates of Glasgow center
});
map.addControl(geocoder, "top-left");

// add navigation control
map.addControl(new mapboxgl.NavigationControl(), "top-left");

// add find my current location
map.addControl(
  new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true
    },
    trackUserLocation: true,
    showUserHeading: true
  }),
  "top-left"
);