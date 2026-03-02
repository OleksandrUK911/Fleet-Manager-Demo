# Data Generator

> Background service that simulates vehicle movement using a random-walk algorithm.
> File: `backend/app/generator.py`
> Systemd unit: `deploy/fleet-generator.service`

---

## Planned

_(nothing pending)_

---

## In Progress

_(nothing active)_

---

## Done

- ✅ Random-walk algorithm simulates realistic GPS movement
- ✅ Seeds 5 sample vehicles on first startup
- ✅ Configurable tick speed via `GENERATOR_INTERVAL_SECS` env var (default: 10 s)
- ✅ Saves `current_speed` per vehicle in real time
- ✅ Multi-city support via `GENERATOR_CITY` env var: `london` · `manchester` · `birmingham` · `edinburgh`
- ✅ Dynamic bounding box per city in `simulate_movement()`
- ✅ systemd unit file `deploy/fleet-generator.service` for production auto-start
- ✅ Generator integrated into `deploy/setup-vps.sh` provisioning script
