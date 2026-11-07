import * as Location from 'expo-location';

export type WeatherData = {
  temperature: number;
  weatherCode: number;
  windspeed: number;
  forecast: { date: string; maxTemp: number; minTemp: number; weatherCode: number }[];
};

// Maps WMO weather codes to human-readable descriptions.
// Full list: https://open-meteo.com/en/docs#weathervariables
export function describeWeatherCode(code: number): string {
  if (code === 0) return 'Clear sky';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 49) return 'Foggy';
  if (code <= 67) return 'Rainy';
  if (code <= 77) return 'Snowy';
  if (code <= 82) return 'Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function fetchWeather(): Promise<WeatherData> {
  const location = await Location.getCurrentPositionAsync({});
  const { latitude, longitude } = location.coords;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${latitude}&longitude=${longitude}` +
    `&current_weather=true` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min` +
    `&forecast_days=5&timezone=auto`;

  // AbortController gives us a timeout without a third-party library.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`Weather API error: ${res.status}`);
    const json = await res.json();

    return {
      temperature: json.current_weather.temperature,
      weatherCode: json.current_weather.weathercode,
      windspeed: json.current_weather.windspeed,
      forecast: (json.daily.time as string[]).map((date: string, i: number) => ({
        date,
        maxTemp: json.daily.temperature_2m_max[i],
        minTemp: json.daily.temperature_2m_min[i],
        weatherCode: json.daily.weathercode[i],
      })),
    };
  } finally {
    clearTimeout(timeout);
  }
}
