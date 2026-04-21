# miraie-ac-js

[![npm version](https://img.shields.io/npm/v/miraie-ac-js.svg)](https://npmjs.org/package/miraie-ac-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A robust, fluent Node.js client for controlling and monitoring Panasonic MirAIe Air Conditioners.

> **Note:** This library is heavily inspired by and ported from the excellent Python library [rkzofficial/miraie-ac](https://github.com/rkzofficial/miraie-ac).

This library allows you to easily discover devices, connect via MQTT, and issue commands to your MirAIe ACs, such as turning them on/off, setting temperature, fan speed, swing modes, and reading device statuses.

## Features

- **Fluent API:** Chain commands intuitively (e.g. `ac.turnOn().setTemperature(24)`).
- **TypeScript Ready:** Fully typed with built-in enums.
- **MQTT Integration:** Seamless connection and real-time status updates via MQTT.
- **Comprehensive Controls:** HVAC modes, Fan speed, Swing controls, Converti modes, Eco/Boost presets, and more.

## Installation

Install using npm, pnpm, or yarn:

```bash
npm install miraie-ac-js
# or
pnpm add miraie-ac-js
# or
yarn add miraie-ac-js
```

## Quick Start

Here is a simple example to get you started:

```typescript
import { createSession, DisplayMode, ConvertiMode } from "miraie-ac-js";

async function run() {
  // 1. Initialize the session with your MirAIe credentials
  const session = await createSession({
    username: "+91XXXXXXXXXX", // Mobile number or email used for MirAIe app
    password: "your_password",
  });

  await session.connect();

  // 2. Discover AC devices
  const devices = await session.getDevices();

  if (devices.length === 0) {
    console.log("No devices found.");
    return;
  }

  const myAc = devices[0];

  // Subscribe to real-time status updates
  await session.subscribeToTopics([`${myAc.data.topic[0]}/status`]);

  console.log(`Targeting AC: ${myAc.getFriendlyName()}`);

  // 3. Control your AC fluently
  await myAc.turnOn();
  await myAc.setTemperature(26);
  await myAc.setDisplayMode(DisplayMode.OFF);

  // You can also use other advanced commands
  await myAc.setConvertiMode(ConvertiMode.C40);

  // 4. Close the session gracefully when done
  setTimeout(async () => {
    await session.close();
  }, 5000);
}

run().catch(console.error);
```

## API Reference

### `createSession(credentials)`

Creates and authenticates a new session.

**Parameters:**

- `credentials.username` (string): Your registered mobile number (with country code, e.g., `+91XXXXXXXXXX`) or email address.
- `credentials.password` (string): Your MirAIe password.
- `credentials.brokerUrl` (string, optional): A custom MQTT broker URL. Defaults to the official MirAIe broker (`mqtts://mqtt.miraie.in:8883`).

> **Note on Browser and Edge Environments (Cloudflare Workers):**
> To use this client in a Browser or Cloudflare Worker, you must provide a WebSocket (`wss://`) broker URL. Since the official MirAIe broker currently only supports raw TCP (`mqtts://`), you will need to run an intermediate MQTT proxy/bridge (like Mosquitto configured for WebSockets) to use this package natively in edge/browser environments.

**Returns:** `Promise<Session>`

---

### `Session` Class

Manages the MQTT connection and discovery of devices.

- `connect(): Promise<void>`: Establishes the MQTT connection.
- `getDevices(): Promise<FluentDevice[]>`: Discovers and returns a list of AC devices associated with the account.
- `subscribeToTopics(topics: string[]): Promise<void>`: Subscribes to MQTT topics for real-time status.
- `close(): Promise<void>`: Closes the active MQTT connection gracefully.

---

### `FluentDevice` Class

The primary class for interacting with an individual AC unit. All action methods are chainable if not awaiting their individual completion (however, awaiting is recommended for reliable execution).

#### State & Info

- `getFriendlyName(): string`: Returns the configured name of the AC (e.g., "Bedroom AC").
- `getDetails(): any`: Returns the hardware details of the device (model number, firmware, etc.).
- `getStatus(): any`: Returns the real-time status (if subscribed to the status topic).

#### Controls

- `turnOn(): Promise<this>`: Turns the AC on.
- `turnOff(): Promise<this>`: Turns the AC off.
- `setTemperature(temp: number): Promise<this>`: Sets the target temperature (e.g. `24.5`).
- `setHvacMode(mode: HVACMode): Promise<this>`: Sets the operating mode.
- `setFanMode(mode: FanMode): Promise<this>`: Sets the fan speed.
- `setPresetMode(mode: PresetMode): Promise<this>`: Sets a preset (ECO, BOOST, CLEAN).
- `setVSwingMode(mode: SwingMode): Promise<this>`: Sets the Vertical swing.
- `setHSwingMode(mode: SwingMode): Promise<this>`: Sets the Horizontal swing.
- `setDisplayMode(mode: DisplayMode): Promise<this>`: Turns the AC unit's LED display ON or OFF.
- `setConvertiMode(mode: ConvertiMode): Promise<this>`: Sets the Panasonic Converti mode capacity (e.g., run at 40%, 80%, etc.).

---

### Enums

The library provides several strongly typed Enums for safe configuration:

#### `HVACMode`

- `COOL`
- `HEAT`
- `DRY`
- `FAN`
- `AUTO`

#### `FanMode`

- `AUTO`
- `LOW`
- `MEDIUM`
- `HIGH`
- `QUIET`

#### `ConvertiMode`

Adjust your AC's tonnage/capacity dynamically.

- `HC` (110%)
- `FC` (100%)
- `C90` (90%)
- `C80` (80%)
- `C70` (70%)
- `C55` (55%)
- `C40` (40%)
- `NS` (Normal)
- `OFF` (Disable Converti)

#### `PresetMode`

- `NONE`
- `ECO`
- `BOOST`
- `CLEAN`

#### `SwingMode`

Vertical and Horizontal swing positions.

- `AUTO` (0)
- `ONE` (1)
- `TWO` (2)
- `THREE` (3)
- `FOUR` (4)
- `FIVE` (5)

#### `DisplayMode`

- `ON`
- `OFF`

## Development

- Install dependencies:

```bash
vp install
```

- Run type checking and linters:

```bash
vp check
```

- Run unit tests:

```bash
vp test
```

- Build the library:

```bash
vp pack
```

## License

This project is licensed under the [MIT License](LICENSE).
