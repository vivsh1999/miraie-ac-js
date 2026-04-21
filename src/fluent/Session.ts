import { login, fetchHomes, fetchDeviceDetails } from "../core/api.js";
import { type AuthToken } from "../types/auth.js";
import { createMqttClient, publish } from "../core/mqtt.js";
import mqtt from "mqtt";
import {
  HVACMode,
  FanMode,
  PresetMode,
  SwingMode,
  DisplayMode,
  ConvertiMode,
} from "../types/enums.js";

/**
 * A wrapper class that provides fluent API methods for controlling an AC device.
 */
export class FluentDevice {
  private status: any;

  /**
   * Internal constructor for FluentDevice.
   * @param session The active Session.
   * @param data The raw device data.
   * @param details The raw device details.
   */
  constructor(
    private session: Session,
    public data: any,
    private details: any,
  ) {
    this.session.getMqttClient().on("message", (topic, message) => {
      if (topic === `${this.data.topic[0]}/status`) {
        this.status = JSON.parse(message.toString());
      }
    });
  }

  /**
   * Gets the latest status of the device.
   * @returns The status object.
   */
  getStatus(): any {
    return this.status;
  }

  /**
   * Gets the details of the device.
   * @returns The details object.
   */
  getDetails(): any {
    return this.details;
  }

  /**
   * Gets the friendly name of the device.
   * @returns The friendly name.
   */
  getFriendlyName(): string {
    return this.data.deviceName;
  }

  private getControlTopic(): string {
    return `${this.data.topic[0]}/control`;
  }

  private buildPayload(extra: Record<string, any>) {
    return JSON.stringify({
      ki: 1,
      cnt: "an",
      sid: "1",
      ...extra,
    });
  }

  /**
   * Turns on the device.
   * @returns The FluentDevice instance for chaining.
   */
  async turnOn(): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ ps: "on" }),
    );
    return this;
  }

  /**
   * Turns off the device.
   * @returns The FluentDevice instance for chaining.
   */
  async turnOff(): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ ps: "off" }),
    );
    return this;
  }

  /**
   * Sets the temperature of the device.
   * @param temp The target temperature.
   * @returns The FluentDevice instance for chaining.
   */
  async setTemperature(temp: number): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ actmp: temp.toString() }),
    );
    return this;
  }

  /**
   * Sets the HVAC mode.
   * @param mode The desired HVAC mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setHvacMode(mode: HVACMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acmd: mode.toString() }),
    );
    return this;
  }

  /**
   * Sets the fan mode.
   * @param mode The desired fan mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setFanMode(mode: FanMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acfs: mode.toString() }),
    );
    return this;
  }

  /**
   * Sets the preset mode.
   * @param mode The desired preset mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setPresetMode(mode: PresetMode): Promise<this> {
    let payload: Record<string, any> = {};
    if (mode === PresetMode.NONE) {
      payload = { acem: "off", acpm: "off", acec: "off", cnv: 0 };
    } else if (mode === PresetMode.ECO) {
      payload = { acem: "on", acpm: "off", acec: "off", actmp: 26.0, cnv: 0 };
    } else if (mode === PresetMode.BOOST) {
      payload = { acem: "off", acpm: "on", acec: "off", cnv: 0 };
    } else if (mode === PresetMode.CLEAN) {
      payload = { acem: "off", acpm: "off", acec: "on", cnv: 0 };
    }

    await publish(this.session.getMqttClient(), this.getControlTopic(), this.buildPayload(payload));
    return this;
  }

  /**
   * Sets the vertical swing mode.
   * @param mode The desired swing mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setVSwingMode(mode: SwingMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acvs: mode }),
    );
    return this;
  }

  /**
   * Sets the horizontal swing mode.
   * @param mode The desired swing mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setHSwingMode(mode: SwingMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ achs: mode }),
    );
    return this;
  }

  /**
   * Sets the display mode.
   * @param mode The desired display mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setDisplayMode(mode: DisplayMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acdc: mode.toString() }),
    );
    return this;
  }

  /**
   * Sets the converti mode.
   * @param mode The desired converti mode.
   * @returns The FluentDevice instance for chaining.
   */
  async setConvertiMode(mode: ConvertiMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acem: "off", acpm: "off", cnv: mode }),
    );
    return this;
  }
}

/**
 * The Session class manages the connection to the MirAIe MQTT broker.
 */
export class Session {
  private token: string;
  private mqttClient: mqtt.MqttClient;

  /**
   * Internal constructor for Session.
   * @param token The authentication token.
   * @param mqttClient The active MQTT client.
   */
  constructor(token: AuthToken, mqttClient: mqtt.MqttClient) {
    this.token = token.accessToken;
    this.mqttClient = mqttClient;
  }

  /**
   * Gets the underlying MQTT client.
   * @returns The mqtt.MqttClient instance.
   */
  getMqttClient(): mqtt.MqttClient {
    return this.mqttClient;
  }

  /**
   * Connects to the MQTT broker.
   * @returns A promise that resolves when connected.
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient.on("connect", () => {
        resolve();
      });
      this.mqttClient.on("error", (err) => {
        reject(err);
      });
    });
  }

  /**
   * Subscribes to the given topics.
   * @param topics The array of topic names to subscribe to.
   * @returns A promise that resolves when subscribed.
   */
  async subscribeToTopics(topics: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient.subscribe(topics, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Fetches the user's devices and creates FluentDevice wrappers.
   * @returns A promise that resolves to an array of FluentDevices.
   */
  async getDevices(): Promise<FluentDevice[]> {
    const homes = await fetchHomes(this.token);
    const devicesData = homes[0].spaces.flatMap((space: any) => space.devices);

    const deviceIds = devicesData.map((d: any) => d.deviceId).join(",");
    const detailsList = await fetchDeviceDetails(this.token, deviceIds);

    return devicesData.map((d: any) => {
      const details = detailsList.find((dl: any) => dl.deviceId === d.deviceId);
      return new FluentDevice(this, d, details);
    });
  }

  /**
   * Closes the MQTT connection.
   * @returns A promise that resolves when the connection is closed.
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.mqttClient.end(false, () => {
        resolve();
      });
    });
  }
}

/**
 * Creates a new Session by logging in with the given credentials.
 * @param credentials - The username and password for the MirAIe account.
 * @returns A promise that resolves to a Session instance.
 */
export const createSession = async (credentials: {
  username: string;
  password: string;
}): Promise<Session> => {
  const token = await login(credentials.username, credentials.password);

  const homes = await fetchHomes(token.accessToken);
  const homeId = homes[0].homeId;

  const mqttClient = createMqttClient("mqtts://mqtt.miraie.in:8883", {
    username: homeId,
    password: token.accessToken,
  });

  return new Session(token, mqttClient);
};
