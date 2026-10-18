import {
  LuCloud,
  LuCloudDrizzle,
  LuCloudFog,
  LuCloudLightning,
  LuCloudRain,
  LuCloudSnow,
  LuCloudSun,
  LuMoon,
  LuSun,
} from "react-icons/lu";

export default function WeatherIcon({
  code,
  night = false,
  className = "",
}: {
  code: number;
  night?: boolean;
  className?: string;
}) {
  const Icon =
    code === 0 || code === 1
      ? night
        ? LuMoon
        : LuSun
      : code === 2
        ? LuCloudSun
        : code === 3
          ? LuCloud
          : code === 45 || code === 48
            ? LuCloudFog
            : code >= 95
              ? LuCloudLightning
              : (code >= 71 && code <= 77) || code === 85 || code === 86
                ? LuCloudSnow
                : code >= 51 && code <= 57
                  ? LuCloudDrizzle
                  : LuCloudRain;
  return (
    <Icon
      className={`weather-icon ${className}`}
      aria-hidden="true"
      strokeWidth={1.5}
    />
  );
}
