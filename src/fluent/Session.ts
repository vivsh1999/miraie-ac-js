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

export class FluentDevice {
  private status: any;

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

  getStatus(): any {
    return this.status;
  }

  getDetails(): any {
    return this.details;
  }

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

  async turnOn(): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ ps: "on" }),
    );
    return this;
  }

  async turnOff(): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ ps: "off" }),
    );
    return this;
  }

  async setTemperature(temp: number): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ actmp: temp.toString() }),
    );
    return this;
  }

  async setHvacMode(mode: HVACMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acmd: mode.toString() }),
    );
    return this;
  }

  async setFanMode(mode: FanMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acfs: mode.toString() }),
    );
    return this;
  }

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

  async setVSwingMode(mode: SwingMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acvs: mode }),
    );
    return this;
  }

  async setHSwingMode(mode: SwingMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ achs: mode }),
    );
    return this;
  }

  async setDisplayMode(mode: DisplayMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acdc: mode.toString() }),
    );
    return this;
  }

  async setConvertiMode(mode: ConvertiMode): Promise<this> {
    await publish(
      this.session.getMqttClient(),
      this.getControlTopic(),
      this.buildPayload({ acem: "off", acpm: "off", cnv: mode }),
    );
    return this;
  }
}

export class Session {
  private token: string;
  private mqttClient: mqtt.MqttClient;

  constructor(token: AuthToken, mqttClient: mqtt.MqttClient) {
    this.token = token.accessToken;
    this.mqttClient = mqttClient;
  }

  getMqttClient(): mqtt.MqttClient {
    return this.mqttClient;
  }

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

  async subscribeToTopics(topics: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.mqttClient.subscribe(topics, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

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

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.mqttClient.end(false, () => {
        resolve();
      });
    });
  }
}

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
