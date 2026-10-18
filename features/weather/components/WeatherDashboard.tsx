"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  LuArrowRight,
  LuArrowUpRight,
  LuCalendarDays,
  LuCheck,
  LuClock3,
  LuCloudSun,
  LuGlobe2,
  LuLayoutDashboard,
  LuLocateFixed,
  LuMapPin,
  LuRefreshCw,
  LuSun,
} from "react-icons/lu";
import {
  fetchWeather,
  findCity,
  quickCities,
  type WeatherLocation,
} from "../lib/api";
import { dayLabel, type Unit } from "../lib/weather";
import type { CurrentWeather } from "../types";
import CitySearch from "./CitySearch";
import CurrentConditions from "./CurrentConditions";
import HourlyForecast from "./HourlyForecast";
import WeeklyForecast from "./WeeklyForecast";

const navigation = [
  { id: "overview", label: "Overview", icon: LuLayoutDashboard },
  { id: "hourly", label: "Hourly forecast", icon: LuClock3 },
  { id: "forecast", label: "7-day forecast", icon: LuCalendarDays },
  { id: "locations", label: "Explore cities", icon: LuGlobe2 },
];

export default function WeatherDashboard({
  city = "Paris",
}: {
  city?: string;
}) {
  const [info, setInfo] = useState<CurrentWeather>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState<Unit>("celsius");
  const [refresh, setRefresh] = useState(0);
  const [deviceLocation, setDeviceLocation] = useState<WeatherLocation>();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const locationRequest = useRef(0);
  const pathname = usePathname();
  const location = deviceLocation ?? findCity(city);
  const [activeSection, setActiveSection] = useState("overview");

  const resetDeviceLocation = useCallback(() => {
    locationRequest.current += 1;
    setDeviceLocation(undefined);
    setLocating(false);
    setLocationError("");
  }, []);

  useEffect(() => {
    resetDeviceLocation();
    return () => {
      locationRequest.current += 1;
    };
  }, [pathname, resetDeviceLocation]);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocationError(
        "Location isn’t supported in this browser. Please search for a city instead.",
      );
      return;
    }
    const request = ++locationRequest.current;
    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (request !== locationRequest.current) return;
        setDeviceLocation({
          name: "Your location",
          country: "Current location",
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLocating(false);
      },
      (cause) => {
        if (request !== locationRequest.current) return;
        setLocating(false);
        setLocationError(
          cause.code === 1
            ? "Location access was denied. Allow location in your browser settings, or search for a city."
            : cause.code === 3
              ? "Finding your location took too long. Try again, or search for a city."
              : "We couldn’t determine your location. Try again, or search for a city.",
        );
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  }

  useEffect(() => {
    function syncActiveSection() {
      const section = window.location.hash.slice(1);
      setActiveSection(
        navigation.some((item) => item.id === section) ? section : "overview",
      );
    }
    syncActiveSection();
    window.addEventListener("hashchange", syncActiveSection);
    return () => window.removeEventListener("hashchange", syncActiveSection);
  }, [city]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    setInfo(undefined);
    fetchWeather(deviceLocation ?? city, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setInfo(data);
      })
      .catch((cause) => {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error
              ? cause.message
              : "We can’t connect to the weather service. Check your connection and try again.",
          );
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [city, deviceLocation, refresh]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to weather
      </a>
      <aside className="sidebar">
        <Link
          className="brand"
          href="/"
          aria-label="Skycast home"
          onClick={resetDeviceLocation}
        >
          <span className="brand-icon">
            <LuCloudSun />
          </span>
          skycast<span className="brand-period">.</span>
        </Link>
        <span className="sidebar-label">YOUR DAILY OUTLOOK</span>
        <nav className="main-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className={activeSection === id ? "nav-active" : undefined}
              aria-current={activeSection === id ? "location" : undefined}
            >
              <Icon aria-hidden="true" />
              {label}
              {activeSection === id && <span className="nav-indicator" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-locations">
          <span className="sidebar-label">QUICK LOCATIONS</span>
          {quickCities.map((name) => (
            <Link
              href={`/${encodeURIComponent(name)}`}
              key={name}
              onClick={resetDeviceLocation}
              className={
                location?.name === name
                  ? "location-link selected"
                  : "location-link"
              }
              aria-current={location?.name === name ? "page" : undefined}
            >
              <LuMapPin />
              <span>{name}</span>
              {location?.name === name ? (
                <span className="location-dot" />
              ) : (
                <LuArrowUpRight className="location-arrow" />
              )}
            </Link>
          ))}
        </div>
        <div className="sidebar-bottom">
          <div className="sidebar-illustration">
            <LuSun />
            <span className="tiny-cloud">
              <LuCloudSun />
            </span>
          </div>
          <h3>A little sky perspective.</h3>
          <p>
            Whatever the weather,
            <br />
            make the most of your day.
          </p>
          <span className="sidebar-bottom-rule" />
          <small>Thoughtfully forecast.</small>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            Your world<span>/</span>
            <strong>Weather overview</strong>
          </div>
          <CitySearch onNavigate={resetDeviceLocation} />
          <div className="live-badge">
            <span className="status-dot" />
            Live weather
          </div>
        </header>
        <main id="main-content">
          <section className="page-heading" id="overview">
            <div>
              <div className="eyebrow location-eyebrow">
                <LuMapPin aria-hidden="true" />
                {location?.country || "LET’S FIND YOUR FORECAST"}
              </div>
              <h1>
                {location?.name || city}
                <span>’s weather</span>
              </h1>
              <p>
                {info
                  ? dayLabel(info.current.time, {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "A clearer view of the day ahead."}
              </p>
            </div>
            <div className="heading-actions">
              <button
                className="location-button"
                onClick={useMyLocation}
                disabled={locating}
                aria-busy={locating}
              >
                <LuLocateFixed aria-hidden="true" />
                {locating ? "Finding location…" : "Use my location"}
              </button>
              <button
                className="refresh-button"
                onClick={() => setRefresh((value) => value + 1)}
                disabled={loading}
                aria-label="Refresh weather"
              >
                <LuRefreshCw className={loading ? "spin" : ""} />
              </button>
              <div className="unit-toggle" aria-label="Temperature unit">
                <button
                  aria-pressed={unit === "celsius"}
                  onClick={() => setUnit("celsius")}
                >
                  °C
                </button>
                <button
                  aria-pressed={unit === "fahrenheit"}
                  onClick={() => setUnit("fahrenheit")}
                >
                  °F
                </button>
              </div>
            </div>
          </section>
          {locationError && (
            <p className="location-feedback" role="alert">
              {locationError}
            </p>
          )}
          {locating && (
            <p className="location-feedback" role="status">
              Waiting for your device location. Your browser may ask for
              permission.
            </p>
          )}
          {loading ? (
            <div className="loading-state" role="status">
              <div className="loading-sky">
                <LuCloudSun />
              </div>
              <h2>Looking at the sky…</h2>
              <p>Getting the latest forecast for {location?.name || city}.</p>
              <div className="loading-bar" />
            </div>
          ) : error ? (
            <section className="error-state" role="alert">
              <LuCloudSun />
              <h2>A little cloudy on our end.</h2>
              <p>{error}</p>
              <button
                className="primary-button"
                onClick={() => setRefresh((value) => value + 1)}
              >
                Try again <LuRefreshCw />
              </button>
              <Link href="/Paris" onClick={resetDeviceLocation}>
                Back to Paris <LuArrowRight />
              </Link>
            </section>
          ) : info ? (
            <>
              <CurrentConditions info={info} unit={unit} />
              <div className="forecast-grid">
                <HourlyForecast info={info} unit={unit} />
                <WeeklyForecast info={info} unit={unit} />
              </div>
            </>
          ) : null}
          <section
            className="explore-section"
            id="locations"
            aria-labelledby="explore-title"
          >
            <div>
              <span className="eyebrow">A CHANGE OF SCENERY</span>
              <h2 id="explore-title">Same sky. A different city.</h2>
            </div>
            <div className="explore-links">
              {quickCities
                .filter((name) => name !== location?.name)
                .slice(0, 4)
                .map((name) => (
                  <Link
                    key={name}
                    href={`/${encodeURIComponent(name)}`}
                    onClick={resetDeviceLocation}
                  >
                    {name}
                    <LuArrowUpRight />
                  </Link>
                ))}
            </div>
          </section>
          <footer className="footer">
            <span>
              <LuCloudSun /> A little more clarity, every day.
            </span>
            <span>
              Weather data by{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo <LuArrowUpRight />
              </a>
              {info && (
                <>
                  {" "}
                  <span className="footer-divider">·</span> <LuCheck /> Updated{" "}
                  {info.current.time.slice(11, 16)} local
                </>
              )}
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
}
