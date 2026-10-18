import type { CurrentWeather } from "../types";

export type Unit = "celsius" | "fahrenheit";

export function temperature(value: number, unit: Unit) {
  return Math.round(unit === "fahrenheit" ? (value * 9) / 5 + 32 : value);
}

export function weatherDescription(code: number) {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Foggy";
  if (code >= 51 && code <= 57) return "Light drizzle";
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82))
    return "Rain showers";
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)
    return "Snowfall";
  if (code >= 95 && code <= 99) return "Thunderstorms";
  return "Conditions unavailable";
}

// Open-Meteo timestamps are local to the selected city, not the browser.
export function upcomingHours(info: CurrentWeather, count = 8) {
  const start = info.hourly.time.findIndex(
    (time) => time >= info.current.time.toString(),
  );
  if (start === -1) return [];
  return info.hourly.time.slice(start, start + count).map((time, offset) => {
    const index = start + offset;
    return {
      time,
      code: info.hourly.weather_code[index],
      isDay: info.hourly.is_day[index],
      temperature: info.hourly.temperature_2m[index],
      rain: info.hourly.rain[index],
      wind: info.hourly.wind_speed_10m[index],
    };
  });
}

export function clockTime(time: string) {
  const hour = Number(time.slice(11, 13));
  return `${hour % 12 || 12}:${time.slice(14, 16)} ${hour >= 12 ? "PM" : "AM"}`;
}

export function dayLabel(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", {
    ...options,
    timeZone: "UTC",
  }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}
