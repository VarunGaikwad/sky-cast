import cities from "../data/cities.json";
import type { CitiesProp, CurrentWeather } from "../types";

export const quickCities = ["Paris", "London", "New York", "Tokyo", "Mumbai"];

export function findCity(name: string) {
  return (cities as CitiesProp[]).find(
    (city) => city.name?.toLowerCase() === name.trim().toLowerCase(),
  );
}

export function searchCities(query: string) {
  if (!query.trim()) return [];
  const value = query.trim().toLowerCase();
  const matches: CitiesProp[] = [];
  // City-name routes resolve the most populous match in the existing dataset.
  for (const city of cities as CitiesProp[]) {
    if (
      city.name?.toLowerCase().startsWith(value) &&
      !matches.some((match) => match.name === city.name)
    )
      matches.push(city);
    if (matches.length === 6) break;
  }
  return matches;
}

export type WeatherLocation = Pick<
  CitiesProp,
  "name" | "latitude" | "longitude" | "country"
>;

export async function fetchWeather(
  location: string | WeatherLocation,
  signal: AbortSignal,
): Promise<CurrentWeather> {
  const city = typeof location === "string" ? findCity(location) : location;
  if (!city)
    throw new Error(
      "We couldn’t find that city. Try a city from the search suggestions.",
    );
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      "temperature_2m,relative_humidity_2m,is_day,rain,weather_code,wind_speed_10m,precipitation,cloud_cover,surface_pressure,wind_direction_10m",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,sunrise,sunset",
    hourly: "rain,temperature_2m,wind_speed_10m,weather_code,is_day",
    timezone: "auto",
    forecast_days: "7",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`,
    { signal },
  );
  if (!response.ok)
    throw new Error(
      "The weather service is taking a break. Please try again in a moment.",
    );
  const data = await response.json();
  if (
    !data.current ||
    !data.daily?.time?.length ||
    !data.hourly?.time?.length
  ) {
    throw new Error(
      "The weather service returned an incomplete forecast. Please try again.",
    );
  }
  return { ...data, display_name: city.name };
}
