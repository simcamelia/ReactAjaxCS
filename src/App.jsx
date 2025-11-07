import React, { useState } from "react";
import "./App.css";
import axios from "axios";

const GEO = (q) =>
  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=en&format=json`;
const FORE = (lat, lon) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

const codeToText = (code) => {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Rain",
    65: "Heavy rain",
    66: "Freezing rain",
    67: "Freezing rain",
    71: "Light snow",
    73: "Snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Showers",
    82: "Heavy showers",
    85: "Snow showers",
    86: "Snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm w/ hail",
    99: "Thunderstorm w/ hail",
  };
  return map[code] || "Weather";
};

const codeToIcon = (code) => {
  const map = {
    0: "01d",
    1: "02d",
    2: "03d",
    3: "04d",
    45: "50d",
    48: "50d",
    51: "09d",
    53: "09d",
    55: "09d",
    61: "10d",
    63: "10d",
    65: "10d",
    66: "10d",
    67: "10d",
    71: "13d",
    73: "13d",
    75: "13d",
    77: "13d",
    80: "09d",
    81: "09d",
    82: "09d",
    85: "13d",
    86: "13d",
    95: "11d",
    96: "11d",
    99: "11d",
  };
  return map[code] || "01d";
};

function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    onSearch(q);
  };

  return (
    <form className="search" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Enter a city (e.g. Sydney)…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-label="City"
      />
      <button type="submit" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}

function WeatherCard({ city, temp, desc, humidity, wind, icon, error }) {
  if (error) return <div className="error">{error}</div>;
  if (!city) return null;

  return (
    <section className="card">
      <div className="toprow">
        <div className="cityblock">
          <h2 className="city">{city}</h2>
          <p className="desc-chip">{desc}</p>
        </div>
        <div className="icon-bubble" title={desc}>
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={desc}
            width="84"
            height="84"
          />
        </div>
      </div>
      <div className="temp-row">
        <span className="temp">{temp != null ? Math.round(temp) : "–"}°C</span>
      </div>
      <ul className="metrics">
        <li>
          <span className="dot dot-blue" />
          Humidity <strong>{humidity != null ? humidity : "—"}%</strong>
        </li>
        <li>
          <span className="dot dot-green" />
          Wind <strong>{wind != null ? wind.toFixed(1) : "—"} m/s</strong>
        </li>
      </ul>
    </section>
  );
}

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setErr] = useState("");
  const [city, setCity] = useState("");
  const [temp, setTemp] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [desc, setDesc] = useState("");
  const [icon, setIcon] = useState("01d");

  async function handleSearch(q) {
    try {
      setLoading(true);
      setErr("");
      setCity("");
      setTemp(null);

      const geo = await axios.get(GEO(q));
      const r = geo?.data?.results || [];
      if (!r.length) {
        setErr("City not found. Try another search.");
        return;
      }
      const g = r[0];
      const label = `${g.name}${g.admin1 ? ", " + g.admin1 : ""}${
        g.country ? ", " + g.country : ""
      }`;

      const fore = await axios.get(FORE(g.latitude, g.longitude));
      const cur = fore?.data?.current || {};
      const code = cur.weather_code;

      setCity(label);
      setTemp(cur.temperature_2m ?? null);
      setHumidity(Math.round(cur.relative_humidity_2m ?? 0));
      setWind(cur.wind_speed_10m ?? null);
      setDesc(codeToText(code));
      setIcon(codeToIcon(code));
    } catch (e) {
      console.error(e);
      setErr("Could not load data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wrap">
      <div className="glass">
        <h1 className="title">Weather App</h1>
        <SearchBar onSearch={handleSearch} loading={loading} />
        <WeatherCard
          city={city}
          temp={temp}
          desc={desc}
          humidity={humidity}
          wind={wind}
          icon={icon}
          error={error}
        />
        <footer className="footer">
          <span className="rainbow">🌈</span>
          Coded by <strong> Camelia Simion</strong>
        </footer>
      </div>
    </div>
  );
}
