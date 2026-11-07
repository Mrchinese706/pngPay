import { useCallback, useState } from 'react';
import * as weatherService from '../services/weatherService';
import type { WeatherData } from '../services/weatherService';

type State = {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  permissionDenied: boolean;
};

export function useWeather() {
  const [state, setState] = useState<State>({
    data: null,
    loading: false,
    error: null,
    permissionDenied: false,
  });

  const fetch = useCallback(async () => {
    setState({ data: null, loading: true, error: null, permissionDenied: false });
    try {
      const granted = await weatherService.requestLocationPermission();
      if (!granted) {
        setState({ data: null, loading: false, error: null, permissionDenied: true });
        return;
      }
      const data = await weatherService.fetchWeather();
      setState({ data, loading: false, error: null, permissionDenied: false });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Could not load weather.';
      setState({ data: null, loading: false, error: message, permissionDenied: false });
    }
  }, []);

  return { ...state, fetchWeather: fetch };
}
