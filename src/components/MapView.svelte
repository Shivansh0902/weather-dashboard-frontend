<script>
  import { onMount, onDestroy } from 'svelte';
  import L from 'leaflet';

  // 1) Import the marker images so Vite will copy them to /assets
  import iconUrl from 'leaflet/dist/images/marker-icon.png';
  import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
  import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

  // 2) Tell Leaflet to use these URLs instead of the defaults
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl
  });

  export let lat;
  export let lon;
  export let city = '';

  let mapDiv;
  let mapInstance;

  onMount(() => {
    if (!lat || !lon) return;

    // Initialize the map
    mapInstance = L.map(mapDiv, {
      center: [lat, lon],
      zoom: 10,
      zoomControl: false,
      attributionControl: false
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(mapInstance);

    // Add a marker at the city coordinates
    L.marker([lat, lon])
      .addTo(mapInstance)
      .bindPopup(`<strong>${city}</strong>`)
      .openPopup();
  });

  onDestroy(() => {
    mapInstance && mapInstance.remove();
  });
</script>

<style>
  .map-container {
    width: 100%;
    height: 16rem;           /* adjust height as needed */
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
</style>

<div bind:this={mapDiv} class="map-container"></div>
