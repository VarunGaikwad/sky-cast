import { LuCalendarDays } from "react-icons/lu";
import type { CurrentWeather } from "../types";
import {
  dayLabel,
  temperature,
  weatherDescription,
  type Unit,
} from "../lib/weather";
import WeatherIcon from "./WeatherIcon";

export default function WeeklyForecast({
  info,
  unit,
}: {
  info: CurrentWeather;
  unit: Unit;
}) {
  const low = Math.min(...info.daily.temperature_2m_min);
  const high = Math.max(...info.daily.temperature_2m_max);
  const range = high - low || 1;
  return (
    <section
      className="panel weekly-panel"
      id="forecast"
      aria-labelledby="weekly-title"
    >
      <div className="section-heading">
        <div>
          <h2 id="weekly-title">The week ahead</h2>
          <p>A plan for every kind of day.</p>
        </div>
        <LuCalendarDays className="section-icon" aria-hidden="true" />
      </div>
      <div className="week-list">
        {info.daily.time.map((date, index) => {
          const min = info.daily.temperature_2m_min[index];
          const max = info.daily.temperature_2m_max[index];
          const description = weatherDescription(
            info.daily.weather_code[index],
          );
          return (
            <div className="week-row" key={date}>
              <span className="week-day">
                {index === 0 ? "Today" : dayLabel(date, { weekday: "short" })}
                <small>
                  {dayLabel(date, { month: "short", day: "numeric" })}
                </small>
              </span>
              <span className="week-condition" title={description}>
                <WeatherIcon code={info.daily.weather_code[index]} />
                <span className="sr-only">{description}</span>
              </span>
              <span
                className="week-low"
                aria-label={`Low ${temperature(min, unit)} degrees`}
              >
                {temperature(min, unit)}°
              </span>
              <div className="temperature-track" aria-hidden="true">
                <span
                  style={{
                    left: `${((min - low) / range) * 100}%`,
                    width: `${Math.max(((max - min) / range) * 100, 3)}%`,
                  }}
                />
              </div>
              <strong aria-label={`High ${temperature(max, unit)} degrees`}>
                {temperature(max, unit)}°
              </strong>
            </div>
          );
        })}
      </div>
      <div className="week-legend">
        <span>Daily low</span>
        <span className="legend-gradient" />
        <span>Daily high</span>
      </div>
    </section>
  );
}
