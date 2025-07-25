<script>
  import { onMount, onDestroy } from 'svelte';
  import Chart from 'chart.js/auto';

  export let forecast = [];
  export let units = 'metric';

  let canvasEl;
  let chartInstance;

  onMount(() => {
    if (chartInstance) chartInstance.destroy();

    const labels = forecast.map(d =>
      new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    );

    const data = {
      labels,
      datasets: [
        {
          label: 'Min Temp',
          data: forecast.map(d => d.min_temp),
          borderColor: 'rgba(99, 102, 241, 0.8)',
          backgroundColor: 'rgba(99, 102, 241, 0.2)',
          tension: 0.3
        },
        {
          label: 'Max Temp',
          data: forecast.map(d => d.max_temp),
          borderColor: 'rgba(236, 72, 153, 0.8)',
          backgroundColor: 'rgba(236, 72, 153, 0.2)',
          tension: 0.3
        }
      ]
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          title: {
            display: true,
            text: `Temp (°${units === 'metric' ? 'C' : 'F'})`
          }
        }
      },
      plugins: {
        legend: { position: 'top' }
      }
    };

    chartInstance = new Chart(canvasEl.getContext('2d'), {
      type: 'line',
      data,
      options
    });
  });

  // Clean up on destroy
  onDestroy(() => {
    chartInstance?.destroy();
  });
</script>

<div class="w-full h-64">
  <canvas bind:this={canvasEl}></canvas>
</div>
