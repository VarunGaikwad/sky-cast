import test from "node:test";
import assert from "node:assert/strict";
import {
  temperature,
  weatherDescription,
  upcomingHours,
  clockTime,
  dayLabel,
} from "../features/weather/lib/weather.ts";

test("temperature converts Celsius to Fahrenheit, including freezing and negative temperatures", () => {
  assert.equal(temperature(0, "fahrenheit"), 32);
  assert.equal(temperature(-40, "fahrenheit"), -40);
  assert.equal(temperature(22.6, "celsius"), 23);
});

test("WMO weather codes distinguish clear skies, snow, rain, and thunderstorms", () => {
  assert.equal(weatherDescription(0), "Clear sky");
  assert.equal(weatherDescription(2), "Partly cloudy");
  assert.equal(weatherDescription(45), "Foggy");
  assert.equal(weatherDescription(61), "Rain showers");
  assert.equal(weatherDescription(85), "Snowfall");
  assert.equal(weatherDescription(95), "Thunderstorms");
  assert.equal(weatherDescription(999), "Conditions unavailable");
});

test("hourly forecast starts after the current city-local time, not midnight", () => {
  const info = {
    current: { time: "2026-10-17T23:15" },
    hourly: {
      time: [
        "2026-10-17T00:00",
        "2026-10-17T23:00",
        "2026-10-18T00:00",
        "2026-10-18T01:00",
      ],
      temperature_2m: [10, 15, 16, 17],
      weather_code: [0, 1, 2, 3],
      is_day: [0, 0, 0, 0],
      rain: [0, 0, 1, 2],
      wind_speed_10m: [5, 6, 7, 8],
    },
  };
  assert.deepEqual(upcomingHours(info, 1), [
    {
      time: "2026-10-18T00:00",
      code: 2,
      isDay: 0,
      temperature: 16,
      rain: 1,
      wind: 7,
    },
  ]);
  assert.equal(
    upcomingHours({ ...info, current: { time: "2026-10-19T00:00" } }).length,
    0,
  );
});

test("city-local clock and day labels do not shift with the browser timezone", () => {
  assert.equal(clockTime("2026-10-18T00:05"), "12:05 AM");
  assert.equal(clockTime("2026-10-18T12:00"), "12:00 PM");
  assert.equal(clockTime("2026-10-18T19:30"), "7:30 PM");
  assert.equal(dayLabel("2026-10-18", { weekday: "long" }), "Sunday");
});
