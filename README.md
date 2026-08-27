# Maintain

Personal life-OS PWA for Joshua’s iPhone home screen.

Live: https://joshroman922.github.io/maintain/

## Pages

- `index.html` — Hub (v8.3 weather clock + calendar + day timeline on the v7.6 orbital hub)
- `field.html` — Field Protocol (breathe / bell / mixer)
- `dawn.html` — Morning card

Data stays on the phone (`localStorage` keys `maintain:v1` and `maintain:v8:*`).

## Change log

- **v8.3** — Polish: calendar/timeline no longer collide with +. Hour labels thinned to 12/3/6/9. Camera shortcut tries `Maintain Camera` then `maintain Camara`. Empty Health / Work / Files / Journal folders seeded. Timeline chips for the selected calendar day. Gemini panel talks with a phone-local API key (Google AI Studio).
- **v8.2** — Calendar beside clock, hourly AM/PM + weather thumbnails.
- **v8.1** — Clearer clock, no overlap with hub.
- **v8.0** — Glass weather clock (Open-Meteo, Clarksville / New Albany), 24-hour forecast ring, real-time day timeline (7:30 AM–9:00 PM).
- **v7.6** — 3D depth pass + Field Protocol + Dawn.
