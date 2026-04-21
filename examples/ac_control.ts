import { createSession, ConvertiMode, DisplayMode } from "../dist/index.mjs";

async function setOptimalCooling() {
  // 1. Initialize Session
  const session = await createSession({
    username: "+91xxxxxxxxxx", // Placeholder
    password: "your_password_here", // Placeholder
  });
  await session.connect();

  // 2. Get Devices
  const devices = await session.getDevices();

  // Extract topics and subscribe
  const topics = devices.map((d) => `${(d as any).data.topic[0]}/status`);
  await session.subscribeToTopics(topics);

  if (devices.length === 0) {
    console.log("No devices found.");
    return;
  }

  const myAc = devices[0];
  const details = myAc.getDetails();

  console.log("--- Hardware Details ---");
  console.log(`Model: ${details.modelNumber}`);
  console.log(`Firmware: ${details.firmwareVersion}`);

  console.log(`\nTargeting Device: ${myAc.getFriendlyName()}`);

  // 3. Configure AC
  console.log("Sending Power ON command...");
  await myAc.turnOn();
  await myAc.setDisplayMode(DisplayMode.ON);

  console.log("Setting temperature to 27°C...");
  await myAc.setTemperature(26.0);

  console.log("Setting mode to Converti C40...");
  await myAc.setConvertiMode(ConvertiMode.C40);

  // 4. Wait 30 seconds and turn off display
  console.log("Waiting 30 seconds before turning off display...");
  await new Promise((resolve) => setTimeout(resolve, 30000));

  await myAc.setDisplayMode(DisplayMode.OFF);
  console.log("Configuration complete and display turned off.");

  await session.close();
  console.log("Session closed.");
}

setOptimalCooling().catch(console.error);
