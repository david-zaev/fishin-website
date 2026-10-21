# FishIn · Next-Generation Angling Intelligence

> **Official Website & Product Showcase for the FishIn Mobile App & Intelligence Engine.**  
> Built with pure graphite monochrome aesthetics (Apple / Linear / Obsidian inspired, zero neon).

🌐 **Live Website:** [https://david-zaev.github.io/fishin-website/](https://david-zaev.github.io/fishin-website/)  
📱 **Google Play Store:** [Download on Google Play](https://play.google.com/store/apps/details?id=com.daev.fishin) (`com.daev.fishin`)

---

## Overview

**FishIn** is an AI-native angling intelligence platform designed for serious anglers. By bridging deterministic environmental telemetry (barometric pressure gradients, solunar harmonics, tidal currents, thermal stratification) with state-of-the-art multimodal reasoning, FishIn acts as an intelligent co-pilot for every cast and water body.

### Core Capabilities

1. **AI Tactical Bite Forecast & Fish Score:**
   - Multi-variable 0–100 bite scoring engine (`ScoreWeights.kt`).
   - Evaluates 3-hour barometric delta, solunar major/minor feeding peaks, solar elevation, lunar illumination, and cloud cover.
   - Generates tactical game plans tailored to the angler's actual saved tackle box inventory.

2. **Multimodal Computer Vision (Scan Tackle & Scan Fish):**
   - **Tackle Recognition:** Ingests field photos of hard baits, soft plastics, wire baits, and jigs. Identifies classification, dive depth column, colorway contrast, and recommended water clarity.
   - **Fish Biometrics:** Instant species taxonomy identification, estimated length/weight ranges, visual health/spawning status, and automatic catch log ingestion.

3. **Adaptive AI Fishing Coach:**
   - Conversational domain guide adapted to user skill levels (`Beginner`, `Intermediate`, `Advanced`).
   - Strict Pydantic guardrails prevent prompt injection, hallucinations, and conversational drift.

4. **Rig Engineering & Knot Studio:**
   - Interactive terminal for synthesizing and balancing custom terminal tackle setups.
   - Verified spacing between floats, shot weights, swivels, and hooks.
   - Step-by-step vector knot guides (Palomar, Uni-to-Uni, Blood Knot, FG Knot).

5. **100% Offline Global Spot Atlas (`world.bin`):**
   - Compact spatial binary indexing allowing phones to query millions of waterway coordinates without cellular network reception.
   - Downloadable offline country packs for remote expeditions.

6. **Automated Catch Logbook & Cloud Vault:**
   - Automatically tags weather, barometric pressure trend, and solunar phase at the moment of catch.
   - High-resolution photo backup to server with FishIn Pro.

---

## Technical Architecture

```
[ Android Native Client (Kotlin / Compose) ]
                    │
                    ├──> Onboard GPS & Sensor Telemetry
                    ├──> Offline Spatial Atlas (world.bin)
                    └──> Camera Frame Capture (Tackle / Catch)
                                │
                                ▼ HTTPS (TLS 1.3)
                    [ FastAPI Core Gateway (Python) ]
                                │
                                ├──> Pydantic Schema Validation & Sanitization
                                ├──> Rate Limiting & Google Play License Verification
                                │
                                ▼
         [ Anthropic Claude 3.5 Multimodal Reasoning Engine ]
                                │
                                ├──> Multimodal Visual Taxonomy (Tackle & Fish)
                                ├──> Non-Linear Hydrographic / Solunar Synthesis
                                └──> Strict Pydantic JSON Output Conformance
                                │
                                ▼
             [ PostgreSQL + PostGIS on Oracle Cloud (Frankfurt) ]
```

---

## Claude for Startups Program Alignment

FishIn has been engineered from day one as an AI-native physical-world application:
- **High-Entropy Domain:** Outdoor angling takes place in non-linear, multi-variable physical environments where static weather apps fail.
- **Why Claude:** Claude 3.5 Sonnet provides industry-leading reasoning over spatial-temporal telemetry and unmatched multimodal accuracy on complex outdoor imagery (reflections, wet lures, variable lighting).
- **Program Roadmap:** Utilizing the Claude for Startups program ($1,000 API usage credits & 5 team seats) to:
  1. Scale real-time conversational voice coaching directly on the water.
  2. Expand multimodal species recognition to support regional fisheries conservation.
  3. Distill specialized edge models for seamless offline inference.

---

## Deployment & Setup

The website is a static, zero-dependency, ultra-fast web application styled in pure CSS and enhanced with an ambient HTML5 Canvas bathymetric wave simulation.

### Local Development
```bash
# Serve locally using Python
python -m http.server 8080 --directory .
# Open http://localhost:8080 in your browser
```

### GitHub Pages
Deploy directly to GitHub Pages by selecting the `main` branch root as the publishing source in repository settings.

---

## License & Contact

- **Developer:** Independent Developer, Skopje, North Macedonia
- **Package:** `com.daev.fishin`
- **Legal:** [Privacy Policy](privacy.html) · [Terms of Service](terms.html) · [Account Deletion](delete-account.html)
