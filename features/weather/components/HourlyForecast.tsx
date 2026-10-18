"use client";

import { useState } from "react";
import { LuClock3 } from "react-icons/lu";
import type { CurrentWeather } from "../types";
import {
  clockTime,
  temperature,
  upcomingHours,
  type Unit,
} from "../lib/weather";
import WeatherIcon from "./WeatherIcon";

type Metric = "temperature" | "rain" | "wind";

export default function HourlyForecast({
  info,
  unit,
}: {
  info: CurrentWeather;
  unit: Unit;
}) {
  const [metric, setMetric] = useState<Metric>("temperature");
  const hours = upcomingHours(info, 24).filter((_, index) => index % 3 === 0);
  if (!hours.length) {
    return (
      <section className="panel" id="hourly" aria-labelledby="hourly-title">
        <h2 id="hourly-title">Hourly forecast</h2>
        <p className="panel-note">
          No upcoming hours are available. Refresh to get the latest forecast.
        </p>
      </section>
    );
  }
  const values = hours.map((hour) =>
    metric === "temperature"
      ? temperature(hour.temperature, unit)
      : hour[metric],
  );
  const suffix =
    metric === "temperature" ? "°" : metric === "rain" ? " mm" : " km/h";
  const min = Math.min(...values) - 2;
  const range = Math.max(...values) - min + 2;
  const points = values.map(
    (value, index) =>
      `${20 + (index * 680) / Math.max(values.length - 1, 1)},${110 - ((value - min) / range) * 85}`,
  );

  return (
    <section
      className="panel hourly-panel"
      id="hourly"
      aria-labelledby="hourly-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="hourly-title">A little look ahead</h2>
          <p>Your next 24 hours, at a glance.</p>
        </div>
        <span className="small-badge">
          <LuClock3 aria-hidden="true" /> Hourly forecast
        </span>
      </div>
      <div className="metric-tabs" aria-label="Forecast metric">
        {(["temperature", "rain", "wind"] as Metric[]).map((item) => (
          <button
            key={item}
            onClick={() => setMetric(item)}
            aria-pressed={metric === item}
          >
            {item === "rain"
              ? "Precipitation"
              : item[0].toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>
      <div className="hourly-scroll">
        <div className="hourly-chart">
          <div className="hour-labels">
            {hours.map((hour, index) => (
              <div key={hour.time}>
                <span>
                  {hour.time === info.current.time
                    ? "Now"
                    : clockTime(hour.time).replace(":00", "")}
                </span>
                <WeatherIcon code={hour.code} night={!hour.isDay} />
                <strong>
                  {values[index]}
                  {suffix}
                </strong>
              </div>
            ))}
          </div>
          <svg
            className="trend-chart"
            viewBox="0 0 720 140"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#49a4c0" stopOpacity=".2" />
                <stop offset="100%" stopColor="#49a4c0" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[35, 75, 115].map((y) => (
              <line
                key={y}
                x1="0"
                x2="720"
                y1={y}
                y2={y}
                stroke="#e7eff2"
                strokeDasharray="4 5"
              />
            ))}
            <path
              d={`M${points.join(" L")} L700,140 L20,140 Z`}
              fill="url(#chart-fill)"
            />
            <polyline
              points={points.join(" ")}
              fill="none"
              stroke="#2f8fab"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.split(",")[0]}
                cy={point.split(",")[1]}
                r="4"
                fill="white"
                stroke="#2f8fab"
                strokeWidth="2"
              />
            ))}
          </svg>
        </div>
      </div>
      <div className="panel-note">
        <span className="status-dot" /> Forecast times are local to{" "}
        {info.display_name}.
      </div>
    </section>
  );
}
