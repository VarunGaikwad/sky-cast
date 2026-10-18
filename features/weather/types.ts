export type CityList = {
  addresstype?: string;
  boundingbox?: string[];
  class?: string;
  display_name?: string;
  importance?: number;
  lat?: string;
  licence?: string;
  lon?: string;
  name?: string;
  osm_id?: number;
  osm_type?: string;
  place_id?: number;
  place_rank?: number;
  type?: string;
};

export interface CurrentWeather {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  display_name: string;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
    rain: string;
    weather_code: string;
    pressure_msl: string;
    wind_speed_10m: string;
    cloud_cover: string;
    precipitation: string;
    is_day: string;
    surface_pressure: string;
    wind_direction_10m: string;
  };
  current: {
    time: string;
    surface_pressure: number;
    is_day: number;
    interval: number;
    temperature_2m: number;
    relative_humidity_2m: number;
    rain: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    cloud_cover: number;
    precipitation: number;
    wind_direction_10m: string;
  };
  daily_units: {
    time: string;
    temperature_2m_max: string;
    temperature_2m_min: string;
    weather_code: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    sunrise: string[];
    sunset: string[];
  };
  hourly_units: {
    time: string;
    rain: string;
    temperature_2m: string;
    wind_speed_10m: string;
  };
  hourly: {
    is_day: number[];
    weather_code: number[];
    rain: number[];
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
  };
}

export interface CitiesProp {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  population: number;
}
