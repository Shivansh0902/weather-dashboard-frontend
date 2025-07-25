import { render, screen } from '@testing-library/svelte';
import App from './App.svelte';

describe('App.svelte', () => {
  it('renders the header', () => {
    render(App);
    expect(screen.getByText('Weather Dashboard')).toBeInTheDocument();
  });

  it('shows the "Get Weather" button', () => {
    render(App);
    expect(screen.getByRole('button', { name: /get weather/i })).toBeEnabled();
  });
});
