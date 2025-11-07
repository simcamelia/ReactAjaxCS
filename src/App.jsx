import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

/* ---------- APIs ---------- */
const GEO = (q) =>
  `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    q
  )}&count=1&language=en&format=json`;

const FORE = (lat, lon) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`;

/* ---------- Helpers ---------- */
const codeToText = (code) => {
  const map = {
    0: "Clear Sky",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Rime Fog",
    51: "Light Drizzle",
    53: "Drizzle",
    55: "Dense Drizzle",
    61: "Light Rain",
    63: "Rain",
    65: "Heavy Rain",
    66: "Freezing Rain",
    67: "Freezing Rain",
    71: "Light Snow",
    73: "Snow",
    75: "Heavy Snow",
    77: "Snow Grains",
    80: "Light Showers",
    81: "Showers",
    82: "Heavy Showers",
    85: "Snow Showers",
    86: "Snow Showers",
    95: "Thunderstorm",
    96: "Thunderstorm with Hail",
    99: "Thunderstorm with Hail",
  };
  return map[code] || "Weather";
};

const codeToIcon = (code) => {
  // OpenWeather icon codes for a clean monochrome-ish look
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

export default function App() {
  const [q, setQ] = useState("Lisbon");
  const [unit, setUnit] = useState("C"); // "C" | "F"

  const [city, setCity] = useState("—");
  const [date, setDate] = useState("—");
  const [desc, setDesc] = useState("—");
  const [icon, setIcon] = useState("01d");
  const [tempC, setTempC] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [wind, setWind] = useState(null);
  const [err, setErr] = useState("");

  const tempDisplay = useMemo(() => {
    if (tempC == null) return "–";
    const c = Math.round(tempC);
    const f = Math.round(c * 9 / 5 + 32);
    return unit === "C" ? `${c}` : `${f}`;
  }, [tempC, unit]);

  const loadCity = useCallback(async (query) => {
    try {
      setErr("");
      // Geo
      const g = await axios.get(GEO(query));
      const res = g?.data?.results || [];
      if (!res.length) {
        setErr("City not found. Try another search.");
        return;
      }
      const place = res[0];
      const label = `${place.name}${place.admin1 ? ", " + place.admin1 : ""}${place.country ? ", " + place.country : ""}`;

      // Current
      const f = await axios.get(FORE(place.latitude, place.longitude));
      const cur = f?.data?.current || {};

      setCity(label);
      setDate(
        new Date().toLocaleString(undefined, {
          weekday: "long",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      setDesc(codeToText(cur.weather_code));
      setIcon(codeToIcon(cur.weather_code));
      setTempC(cur.temperature_2m ?? null);
      setHumidity(Math.round(cur.relative_humidity_2m ?? 0));
      setWind(cur.wind_speed_10m ?? null);
    } catch (e) {
      console.error(e);
      setErr("Unable to load data. Please try again.");
    }
  }, []);

  useEffect(() => {
    loadCity("Lisbon");
  }, [loadCity]);

  function onSubmit(e) {
    e.preventDefault();
    const val = q.trim();
    if (val) loadCity(val);
  }

  return (
    <div className="page">
      <div className="card">
        {/* Search Row */}
        <form className="search-row" onSubmit={onSubmit}>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="lisbon"
            aria-label="City"
          />
          <button type="submit" className="btn-primary">Search</button>
        </form>

        {/* City / Date / Desc */}
        <div className="city-block">
          <div className="city">{city}</div>
          <div className="date">{date}</div>
          <div className="desc">{desc}</div>
        </div>

        {/* Main Row: Icon + Temp + Units / Metrics */}
        <div className="main-row">
          <div className="left">
            <img
              className="big-ico"
              src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
              alt={desc}
              width="90"
              height="90"
            />
            <div className="temp-wrap">
              <span className="temp">{tempDisplay}</span>
              <span className="units">
                <button
                  type="button"
                  className={`unit ${unit === "C" ? "active" : ""}`}
                  onClick={() => setUnit("C")}
                  aria-pressed={unit === "C"}
                >
                  °C
                </button>
                <span className="sep">|</span>
                <button
                  type="button"
                  className={`unit ${unit === "F" ? "active" : ""}`}
                  onClick={() => setUnit("F")}
                  aria-pressed={unit === "F"}
                >
                  °F
                </button>
              </span>
            </div>
          </div>

          <ul className="metrics">
            <li>Humidity: <strong>{humidity ?? "—"}%</strong></li>
            <li>Wind: <strong>{wind != null ? (wind * 3.6).toFixed(1) : "—"} km/h</strong></li>
          </ul>
        </div>

        {err && <div className="error">{err}</div>}

        {/* Footer, matching your Netlify style/wording */}
        <div className="footer">
          This project was coded by <strong>Camelia Simion</strong> and is{" "}
          <a href="https://github.com/simcamelia/ReactAjaxCS" target="_blank" rel="noreferrer">
            open-sourced on GitHub
          </a>{" "}
          and{" "}
          <a href="https://reactw5cs.netlify.app/" target="_blank" rel="noreferrer">
            hosted on Netlify
          </a>.
        </div>
      </div>
    </div>
  );
}
