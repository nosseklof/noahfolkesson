// The value for 'accessToken' begins with 'pk...'
mapboxgl.accessToken = "pk.eyJ1Ijoibm9zc2Vsa29mIiwiYSI6ImNta2NoMzdhYTAwdmEzZHFvNWNtamFtZm0ifQ.JjmRqHPoSbmBQRibRQ3myA";

// set the style for the map and centre it
const map = new mapboxgl.Map({
  container: 'map', // container element id
  style: 'mapbox://styles/mapbox/light-v10',
  center: [-3.75, 52.05],
  zoom: 7
});

// call data API
const data_url = 
"https://api.mapbox.com/datasets/v1/nosselkof/cmkwqyj880dt21opi4yfocd8f/features?access_token=pk.eyJ1Ijoibm9zc2Vsa29mIiwiYSI6ImNta2NoMzdhYTAwdmEzZHFvNWNtamFtZm0ifQ.JjmRqHPoSbmBQRibRQ3myA";

map.on('load', () => {
  
  // 1. Add Dyfed‑Powys boundary source 
  map.addSource('dyfed-powys', { type: 'geojson', data: 'https://data.police.uk/api/forces/dyfed-powys/boundary' });
  
  // 2. Add fill layer (optional)
  map.addLayer({ id: 'dyfed-powys-fill', type: 'fill', source: 'dyfed-powys', paint: { 'fill-color': '#2dc4b2', 'fill-opacity': 0.15 } });
  
  // 3. Add outline layer
  map.addLayer({ id: 'dyfed-powys-outline', type: 'line', source: 'dyfed-powys', paint: { 'line-color': '#2dc4b2', 'line-width': 3 }
               });
  
  // add crime data
  map.addLayer({
    id: 'crimes',
    type: 'circle',
    source: {
      type: 'geojson',
      data: data_url 
    },
    paint: {
      'circle-radius': 10,
      'circle-color': '#eb4d4b',
      'circle-opacity': 0.9
    }
  });
 
 // initialise Map Filter
  filterMonth = ['==', ['get', 'Month'], '2024-01']
  filterType = ['!=', ['get', 'Crime type'], 'placeholder']
  
  map.setFilter('crimes', ['all', filterMonth, filterType])
  
  //Slider interaction code goes below
  document.getElementById('slider').addEventListener('input', (event) => {
    
    //Get the month value from the slider
    const month = parseInt(event.target.value);
    
    // get the correct format for the data
    formatted_month = '2024-' + ("0" + month).slice(-2)
    
    //Create a filter
    filterMonth = ['==', ['get', 'Month'], formatted_month]
    
    //set the map filter
    // map.setFilter('crimes', ['all', filterMonth]);
    map.setFilter('crimes', ['all', filterMonth, filterType]);
    
    // update text in the UI
    document.getElementById('active-month').innerText = month;
  });
 
 //Radio button interaction code goes below
  document.getElementById('filters').addEventListener('change', (event) => {
    const type = event.target.value;
    console.log(type);
    
    // update the map filter
    if (type == 'all') {
      filterType = ['!=', ['get', 'Crime.type'], 'placeholder'];
    } else if (type == 'shoplifting') {
      filterType = ['==', ['get', 'Crime.type'], 'Shoplifting'];
    } else if (type == 'drugs') {
      filterType = ['==', ['get', 'Crime.type'], 'Drugs'];
    } else {
      console.log('error');
    }
    // map.setFilter('crimes', ['all', filterMonth, filterType]);
    map.setFilter('crimes', ['all', filterMonth, filterType]);
  });
});

/* 
Add an event listener that runs
  when a user clicks on the map element.
*/
map.on('click', (event) => {
  // If the user clicked on one of your markers, get its information.
  const features = map.queryRenderedFeatures(event.point, {
    layers: ['crimes'] // replace with your layer name
  });
  if (!features.length) {
    return;
  }
  const feature = features[0];

  /* 
    Create a popup, specify its options 
    and properties, and add it to the map.
  */
  const popup = new mapboxgl.Popup({ offset: [0, -15] })
    .setLngLat(feature.geometry.coordinates)
    .setHTML(
      `<h3>Month: ${feature.properties.Month}</h3>
      
      <h3>Crime type: ${feature.properties['Crime.type']}</h3>
      
      <h3>Location: ${feature.properties['Location']}</h3>`
    )
    .addTo(map);

});