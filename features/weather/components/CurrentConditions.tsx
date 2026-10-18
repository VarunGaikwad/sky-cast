import {
  LuArrowDown,
  LuArrowUp,
  LuCloud,
  LuCompass,
  LuDroplets,
  LuGauge,
  LuSunrise,
  LuSunset,
  LuWind,
} from "react-icons/lu";
import type { CurrentWeather } from "../types";
import {
  clockTime,
  temperature,
  weatherDescription,
  type Unit,
} from "../lib/weather";
import WeatherIcon from "./WeatherIcon";

export default function CurrentConditions({
  info,
  unit,
}: {
  info: CurrentWeather;
  unit: Unit;
}) {
  const current = info.current;
  const highlights = [
    {
      label: "Wind speed",
      value: current.wind_speed_10m,
      unit: "km/h",
      detail: `${current.wind_direction_10m}° wind direction`,
      icon: LuWind,
    },
    {
      label: "Humidity",
      value: current.relative_humidity_2m,
      unit: "%",
      detail: "Relative humidity",
      icon: LuDroplets,
    },
    {
      label: "Precipitation",
      value: current.precipitation,
      unit: "mm",
      detail: "Current precipitation",
      icon: LuCloud,
    },
    {
      label: "Pressure",
      value: Math.round(current.surface_pressure),
      unit: "hPa",
      detail: "Surface air pressure",
      icon: LuGauge,
    },
  ];
  return (
    <section className="conditions-grid" aria-label="Current weather">
      <div className={`current-card ${current.is_day ? "" : "night-card"}`}>
        <div className="current-top">
          <span className="pill">
            <span className="status-dot" /> Current weather
          </span>
          <span>{clockTime(current.time)} local</span>
        </div>
        <div className="current-temperature">
          <div>
            <span className="big-temperature">
              {temperature(current.temperature_2m, unit)}
              <sup>°</sup>
            </span>
            <p>{weatherDescription(current.weather_code)}</p>
          </div>
          <WeatherIcon
            code={current.weather_code}
            night={!current.is_day}
            className="hero-weather-icon"
          />
        </div>
        <div className="high-low">
          <span>
            <LuArrowUp /> {temperature(info.daily.temperature_2m_max[0], unit)}°
          </span>
          <span>
            <LuArrowDown />{" "}
            {temperature(info.daily.temperature_2m_min[0], unit)}°
          </span>
          <span className="temperature-unit">
            {unit === "celsius" ? "Celsius" : "Fahrenheit"}
          </span>
        </div>
        <svg
          className="landscape"
          viewBox="0 0 700 140"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M0 85 Q100 10 220 65 T450 55 T700 45 V140 H0Z"
            fill="currentColor"
            opacity=".09"
          />
          <path
            d="M0 115 Q160 40 320 105 T700 80 V140 H0Z"
            fill="currentColor"
            opacity=".12"
          />
        </svg>
        <div className="current-bottom">
          <LuCompass aria-hidden="true" />
          <span>
            {Math.abs(info.latitude).toFixed(2)}°{" "}
            {info.latitude >= 0 ? "N" : "S"} &nbsp; / &nbsp;{" "}
            {Math.abs(info.longitude).toFixed(2)}°{" "}
            {info.longitude >= 0 ? "E" : "W"}
          </span>
          <span>Open-Meteo</span>
        </div>
      </div>
      <div className="highlights">
        <div className="section-heading">
          <h2>Today’s highlights</h2>
          <span className="eyebrow">THE DETAILS</span>
        </div>
        <div className="highlight-grid">
          {highlights.map(
            ({ label, value, unit: suffix, detail, icon: Icon }) => (
              <article className="highlight-card" key={label}>
                <div className="highlight-label">
                  <span>{label}</span>
                  <Icon aria-hidden="true" />
                </div>
                <p className="metric-value">
                  {value}
                  <span>{suffix}</span>
                </p>
                <small>{detail}</small>
              </article>
            ),
          )}
        </div>
        <div className="sun-times">
          <div>
            <LuSunrise aria-hidden="true" />
            <span>
              Sunrise<strong>{clockTime(info.daily.sunrise[0])}</strong>
            </span>
          </div>
          <div className="sun-track">
            <span />
          </div>
          <div>
            <LuSunset aria-hidden="true" />
            <span>
              Sunset<strong>{clockTime(info.daily.sunset[0])}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
