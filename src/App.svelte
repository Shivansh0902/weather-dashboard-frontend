<script>
  import { onMount } from 'svelte';
  import { debounce } from 'lodash-es';
  import { fade, fly } from 'svelte/transition';
  import ForecastChart from './components/ForecastChart.svelte';
  import MapView from './components/MapView.svelte';
  import { formatDate } from './lib/utils.js';

  // --- Theme Toggle ---
  // --- Theme Toggle & URL sync ---
  let theme = 'dark';
  function loadTheme() {
    const stored = localStorage.getItem('theme');
    theme = stored === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }
  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    // Update URL to reflect theme
    updateUrl();
  }

  // --- State ---
  let city = '';
  let suggestions = [];
  let selectedLocation = null;
  let weather = null;
  let forecast = [];
  let error = '';
  let loading = false;
  let units = 'metric';
  let favorites = [];

  // Push current state into the URL
  function updateUrl() {
    const params = new URLSearchParams({
      city,
      units,
      theme
    });
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL;

  // --- Favorites Helpers ---
  function loadFavorites() {
    const stored = localStorage.getItem('weather-favs');
    favorites = stored ? JSON.parse(stored) : [];
  }
  function saveFavorites() {
    localStorage.setItem('weather-favs', JSON.stringify(favorites));
  }
  function addFavorite() {
    if (!weather) return;
    const loc = {
      name: weather.city,
      country: weather.country,
      lat: selectedLocation?.lat,
      lon: selectedLocation?.lon
    };
    if (!favorites.find(f => f.name===loc.name && f.country===loc.country)) {
      favorites = [...favorites, loc];
      saveFavorites();
    }
  }
  function removeFavorite(i) {
    favorites.splice(i,1);
    favorites = favorites;
    saveFavorites();
  }
  function selectFavorite(fav) {
    selectedLocation = fav.lat!=null ? fav : null;
    city = `${fav.name}, ${fav.country}`;
    fetchWeather();
  }

  // --- Geocode Suggestions ---
  const fetchSuggestions = debounce(async () => {
    if (!city.trim()) {
      suggestions = [];
      return;
    }
    const res = await fetch(`${API_BASE}/geocode?city=${encodeURIComponent(city)}`);
    if (res.ok) suggestions = await res.json();
    else suggestions = [];
  }, 300);

  
  async function fetchWeather() {
    loading = true; error=''; weather=null; forecast=[]; suggestions=[];
    let params = selectedLocation?.lat!=null
      ? `lat=${selectedLocation.lat}&lon=${selectedLocation.lon}`
      : `city=${encodeURIComponent(city)}`;
    try {
      const r1 = await fetch(`${API_BASE}/weather?${params}&units=${units}`);
      if (!r1.ok) throw new Error((await r1.json()).detail);
      weather = await r1.json();
      // after successful fetch, sync URL
      updateUrl();

      const r2 = await fetch(`${API_BASE}/forecast?${params}&units=${units}`);
      if (!r2.ok) throw new Error((await r2.json()).detail);
      forecast = (await r2.json()).forecast;
    } catch(e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  // --- Unit Toggle & Geolocation ---
  function toggleUnits() {
    units = units==='metric'?'imperial':'metric';
    if (weather) fetchWeather();
    else updateUrl();
  }
  function tryGeolocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      selectedLocation = { lat:pos.coords.latitude, lon:pos.coords.longitude };
      fetchWeather();
    });
  }

  let deferredPrompt;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  function installApp() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null;
    });
  }

  // --- Lifecycle ---
  onMount(() => {
    loadTheme();
    // 1) parse URL params
    const params = new URLSearchParams(window.location.search);
    if (params.has('theme')) {
      theme = params.get('theme');
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      loadTheme();
    }
    // 2) set units from URL
    if (params.has('units')) units = params.get('units');
    // 3) set city from URL (no geocode for URL city)
    if (params.has('city')) {
      city = params.get('city');
    }
    loadFavorites();
    tryGeolocation();
    city = 'Melbourne';
    fetchWeather();
    // 4) geolocate only if no city param
    if (!city) {
      tryGeolocation();
    } else {
      fetchWeather();
    }
  });
</script>

<main in:fade class="p-6 max-w-2xl mx-auto space-y-6">
  <!-- HEADER -->
  <header class="flex items-center justify-between">
    <h1 class="text-4xl font-bold">Weather Dashboard</h1>
    <button type="button" on:click={toggleTheme} class="py-1 px-3">
      {#if theme==='dark'}🌞 Light{:else}🌙 Dark{/if}
    </button>
  </header>

  <!-- SEARCH & SETTINGS CARD -->
  <section class="card space-y-4 search-card">
    <div class="flex flex-wrap gap-2">
      <button on:click={toggleUnits} class="px-3 py-1">{units==='metric'?'Show °F':'Show °C'}</button>
      <button on:click={addFavorite} disabled={!weather} class="px-3 py-1">Add to Favourites</button>
    </div>
    <div class="relative">
      <input
        type="text"
        bind:value={city}
        placeholder="Search city…"
        on:input={() => { selectedLocation=null; fetchSuggestions(); }}
        on:keydown={e => e.key==='Enter'&&fetchWeather()}
        class="w-full"
      />
      {#if suggestions.length}
        <ul class="suggestions mt-1">
          {#each suggestions as loc}
            <li>
              <button type="button" class="w-full text-left"
                on:click={() => {
                  selectedLocation = loc;
                  city = `${loc.name}${loc.state?`, ${loc.state}`:''}, ${loc.country}`;
                  suggestions=[]; fetchWeather();
                }}
              >
                {loc.name}{loc.state?`, ${loc.state}`:''}, {loc.country}
              </button>
            </li>
          {/each}
        </ul>
      {/if}
    </div>
    <button on:click={fetchWeather} class="w-full" disabled={loading}>
      {#if loading}
        <span class="spinner mx-auto"></span>
      {:else}
        Get Weather
      {/if}
    </button>
  </section>

  <!-- FAVOURITES BAR -->
  {#if favorites.length}
    <section class="card">
      <h2 class="text-xl font-semibold mb-2">Favourites</h2>
      <div class="flex flex-wrap gap-2">
        {#each favorites as fav, i}
          <div class="flex items-center space-x-2">
            <button on:click={()=>selectFavorite(fav)} class="underline">
              {fav.name}, {fav.country}
            </button>
            <button on:click={()=>removeFavorite(i)} aria-label="Remove">×</button>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  <!-- CURRENT WEATHER CARD -->
  {#if weather}
    <section class="card" in:fly={{y:20,duration:300}}>
      <h2 class="text-2xl font-semibold mb-2">{weather.city}, {weather.country}</h2>
      <img src={weather.icon_url} alt={weather.description} class="mx-auto mb-4" />
      <p class="capitalize mb-4">{weather.description}</p>
      <div class="grid grid-cols-3 gap-4 text-lg mb-4">
        <div>🌡️ {weather.temperature.toFixed(1)}°{units==='metric'?'C':'F'}</div>
        {#if forecast.length}
          <div>🔻 {forecast[0].min_temp.toFixed(1)}°{units==='metric'?'C':'F'}</div>
          <div>🔺 {forecast[0].max_temp.toFixed(1)}°{units==='metric'?'C':'F'}</div>
        {/if}
      </div>

      <div class="grid grid-cols-3 gap-4 text-sm text-gray-500">
        <div>🤗 Feels like: {weather.feels_like.toFixed(1)}°{units==='metric'?'C':'F'}</div>
        <div>💧 Humidity: {weather.humidity}%</div>
        <div>💨 Wind: {weather.wind_speed.toFixed(1)} {units==='metric'?'m/s':'mph'}</div>
      </div>
    </section>
  {/if}

  <!-- MAP VIEW -->
  {#if weather && selectedLocation?.lat}
    <section class="card" in:fly={{ y: 20, duration: 300 }}>
      <h2 class="text-xl font-semibold mb-2">Location Map</h2>
      <MapView
        lat={selectedLocation.lat}
        lon={selectedLocation.lon}
        city={weather.city}
      />
    </section>
  {/if}

  <!-- 5‑DAY FORECAST GRID -->
 {#if forecast.length}
    <section class="card">
      <h2 class="text-xl font-semibold mb-2">5‑Day Forecast (Chart)</h2>
      <ForecastChart {forecast} {units} />
    </section>
  {/if}

  <!-- ERROR BANNER -->
  {#if error}
    <section class="card border border-red-500 bg-red-100 text-red-800">
      {error}
    </section>
  {/if}

  {#if deferredPrompt}
    <button on:click={installApp} class="fixed bottom-4 right-4 px-4 py-2 bg-green-600 text-white rounded">
      Install App
    </button>
{/if}
</main>
