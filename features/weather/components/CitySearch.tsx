"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuArrowUpRight, LuMapPin, LuSearch } from "react-icons/lu";
import { searchCities } from "../lib/api";

export default function CitySearch({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const matches = searchCities(query);

  function navigate(name: string) {
    if (!name.trim()) return;
    onNavigate?.();
    router.push(`/${encodeURIComponent(name.trim())}`);
    setQuery("");
    setOpen(false);
  }

  return (
    <form
      className="city-search"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(query);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <LuSearch aria-hidden="true" />
      <label className="sr-only" htmlFor="city-search">
        Search for a city
      </label>
      <input
        id="city-search"
        placeholder="Search any city…"
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setOpen(false);
        }}
      />
      <button className="search-submit" type="submit" aria-label="Search city">
        <LuArrowUpRight />
      </button>
      {open && query.trim() && (
        <div className="search-results">
          <span className="eyebrow">
            {matches.length ? "LOCATIONS" : "NO MATCHES — TRY ANOTHER CITY"}
          </span>
          {matches.map((city) => (
            <button
              type="button"
              key={city.name}
              aria-label={`${city.name}, ${city.country}`}
              onClick={() => navigate(city.name)}
            >
              <LuMapPin aria-hidden="true" />
              <span>
                {city.name}
                <small>{city.country}</small>
              </span>
              <LuArrowUpRight aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
    </form>
  );
}
