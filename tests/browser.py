"""Optional browser smoke check: pip install playwright && playwright install chromium.
Run against `npm run start`: python tests/browser.py (http://localhost:3000).
Uses deterministic API responses; does not depend on Open-Meteo availability.
"""
import json
import os
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")


def forecast():
    start = datetime(2026, 10, 17)
    days = [(start + timedelta(days=i)).isoformat(timespec="minutes")[:10] for i in range(7)]
    times = [(start + timedelta(hours=i)).isoformat(timespec="minutes") for i in range(168)]
    return {
        "latitude": 48.8567, "longitude": 2.3522, "timezone": "Europe/Paris",
        "current": {"time": "2026-10-17T10:15", "temperature_2m": 22, "weather_code": 2,
                    "is_day": 1, "wind_speed_10m": 12, "relative_humidity_2m": 62,
                    "precipitation": 0, "surface_pressure": 1014, "wind_direction_10m": 240},
        "daily": {"time": days, "temperature_2m_max": [24, 25, 22, 20, 23, 24, 21],
                  "temperature_2m_min": [16, 17, 15, 14, 15, 16, 14],
                  "weather_code": [2, 0, 3, 61, 2, 1, 3],
                  "sunrise": [d + "T07:12" for d in days], "sunset": [d + "T18:54" for d in days]},
        "hourly": {"time": times, "temperature_2m": [18 + i % 7 for i in range(168)],
                   "rain": [i % 3 / 10 for i in range(168)], "wind_speed_10m": [10 + i % 5 for i in range(168)],
                   "weather_code": [2] * 168, "is_day": [1] * 168},
    }


with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 1100}, device_scale_factor=1)
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    mode = {"error": False}
    weather_requests = []

    def respond(route):
        weather_requests.append(parse_qs(urlparse(route.request.url).query))
        route.fulfill(status=503 if mode["error"] else 200,
                      content_type="application/json", body=json.dumps(forecast()))

    page.route("https://api.open-meteo.com/**", respond)
    page.goto(BASE_URL)
    page.wait_for_load_state("networkidle")
    expect(page.locator(".sidebar")).to_have_css("display", "flex")
    expect(page.locator(".big-temperature")).to_have_text("22°")
    expect(page.locator(".week-row")).to_have_count(7)
    nav = page.get_by_role("navigation", name="Main navigation")
    for label in ["Overview", "Hourly forecast", "7-day forecast", "Explore cities"]:
        link = nav.get_by_role("link", name=label, exact=True)
        link.click()
        expect(link).to_have_class("nav-active")
        expect(link).to_have_attribute("aria-current", "location")
        expect(nav.locator(".nav-active")).to_have_count(1)
        expect(nav.locator(".nav-indicator")).to_have_count(1)
    page.go_back()
    expect(nav.get_by_role("link", name="7-day forecast")).to_have_attribute("aria-current", "location")
    page.go_forward()
    expect(nav.get_by_role("link", name="Explore cities")).to_have_attribute("aria-current", "location")
    page.goto(f"{BASE_URL}/#hourly")
    expect(nav.get_by_role("link", name="Hourly forecast")).to_have_attribute("aria-current", "location")
    nav.get_by_role("link", name="Overview", exact=True).click()
    page.get_by_role("button", name="°F", exact=True).click()
    expect(page.locator(".big-temperature")).to_have_text("72°")
    page.get_by_role("button", name="°C", exact=True).click()
    page.get_by_role("button", name="Precipitation", exact=True).click()
    expect(page.locator(".hour-labels strong").first).to_contain_text("mm")
    page.get_by_role("button", name="Wind", exact=True).click()
    expect(page.locator(".hour-labels strong").first).to_contain_text("km/h")
    page.get_by_role("button", name="Temperature", exact=True).click()
    page.get_by_role("textbox", name="Search for a city").fill("zzzzzzzz")
    expect(page.locator(".search-results")).to_contain_text("NO MATCHES")
    page.get_by_role("textbox", name="Search for a city").fill("tok")
    page.get_by_role("button", name="Tokyo, Japan").click()
    expect(page).to_have_url(f"{BASE_URL}/Tokyo")
    expect(page.locator("h1")).to_contain_text("Tokyo")
    expect(page.locator(".big-temperature")).to_be_visible()
    page.goto(f"{BASE_URL}/Paris")
    expect(page.locator(".big-temperature")).to_be_visible()
    Path("/tmp/skycast-screenshots").mkdir(exist_ok=True)
    page.screenshot(path="/tmp/skycast-screenshots/desktop.png", full_page=True)

    for width in [320, 390, 768, 1024]:
        page.set_viewport_size({"width": width, "height": 844})
        assert page.evaluate("document.documentElement.scrollWidth <= innerWidth"), f"Overflow at {width}px"
        if width == 390:
            page.screenshot(path="/tmp/skycast-screenshots/mobile.png", full_page=True)

    mode["error"] = True
    page.get_by_role("button", name="Refresh weather").click()
    expect(page.locator(".error-state")).to_contain_text("weather service is taking a break")
    mode["error"] = False
    page.get_by_role("button", name="Try again").click()
    expect(page.locator(".big-temperature")).to_be_visible()
    page.goto(f"{BASE_URL}/NotARealCity123")
    expect(page.locator(".error-state")).to_contain_text("couldn’t find that city")
    page.get_by_role("link", name="Back to Paris").click()
    expect(page.locator(".big-temperature")).to_be_visible()
    # Permission is requested only when the location button is used.
    page.context.grant_permissions(["geolocation"], origin=BASE_URL)
    page.context.set_geolocation({"latitude": -33.8688, "longitude": 151.2093})
    page.get_by_role("button", name="Use my location").click()
    expect(page.locator("h1")).to_contain_text("Your location")
    expect(page.locator(".big-temperature")).to_be_visible()
    assert weather_requests[-1]["latitude"] == ["-33.8688"]
    assert weather_requests[-1]["longitude"] == ["151.2093"]
    page.get_by_role("button", name="Refresh weather").click()
    expect(page.locator(".big-temperature")).to_be_visible()
    assert weather_requests[-1]["latitude"] == ["-33.8688"]
    page.locator(".sidebar-locations").get_by_role("link", name="Paris", exact=True).click()
    expect(page.locator("h1")).to_contain_text("Paris")
    expect(page.locator(".big-temperature")).to_be_visible()
    assert weather_requests[-1]["latitude"] == ["48.8567"]

    for code, message in [(1, "access was denied"), (2, "couldn’t determine"), (3, "took too long")]:
        page.evaluate("""code => Object.defineProperty(navigator, 'geolocation', {
            configurable: true, value: { getCurrentPosition: (success, error) => error({code}) }
        })""", code)
        page.get_by_role("button", name="Use my location").click()
        expect(page.locator(".location-feedback")).to_contain_text(message)
        expect(page.locator("h1")).to_contain_text("Paris")
        expect(page.locator(".big-temperature")).to_be_visible()

    page.evaluate("""Object.defineProperty(navigator, 'geolocation', {
        configurable: true, value: { getCurrentPosition: success => { window.pendingLocation = success; } }
    })""")
    page.get_by_role("button", name="Use my location").click()
    expect(page.get_by_role("button", name="Finding location…")).to_be_disabled()
    page.get_by_role("textbox", name="Search for a city").fill("Paris")
    page.get_by_role("button", name="Paris, France").click()
    page.evaluate("window.pendingLocation({ coords: { latitude: 10, longitude: 20 } })")
    expect(page.locator("h1")).to_contain_text("Paris")
    expect(page.get_by_role("button", name="Use my location")).to_be_enabled()
    page.evaluate("Object.defineProperty(navigator, 'geolocation', { configurable: true, value: undefined })")
    page.get_by_role("button", name="Use my location").click()
    expect(page.locator(".location-feedback")).to_contain_text("isn’t supported")
    assert not errors, errors
    browser.close()
    print("PASS: navigation, forecasts, units, API retry, device location (success/errors/cancellation), and 320–1440px layouts; no browser errors.")
