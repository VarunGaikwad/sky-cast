import WeatherDashboard from "@/features/weather/components/WeatherDashboard";

export default function CityPage({ params }: { params: { CityName: string } }) {
  return <WeatherDashboard city={params.CityName} />;
}
