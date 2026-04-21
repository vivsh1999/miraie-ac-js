import mqtt from "mqtt";

export const createMqttClient = (brokerUrl: string, options: mqtt.IClientOptions) => {
  return mqtt.connect(brokerUrl, options);
};

export const subscribe = (client: mqtt.MqttClient, topic: string) => {
  return new Promise<void>((resolve, reject) => {
    client.subscribe(topic, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const publish = (client: mqtt.MqttClient, topic: string, payload: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    client.publish(topic, payload, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
