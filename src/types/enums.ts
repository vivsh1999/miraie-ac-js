/** Enum for Display Mode settings */
export enum DisplayMode {
  ON = "on",
  OFF = "off",
}

/** Enum for Fan Mode settings */
export enum FanMode {
  AUTO = "auto",
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  QUIET = "quiet",
}

/** Enum for HVAC Mode settings */
export enum HVACMode {
  COOL = "cool",
  AUTO = "auto",
  DRY = "dry",
  FAN = "fan",
  HEAT = "heat",
}

/** Enum for Power Mode settings */
export enum PowerMode {
  ON = "on",
  OFF = "off",
}

/** Enum for Preset Mode settings */
export enum PresetMode {
  NONE = "none",
  ECO = "eco",
  BOOST = "boost",
  CLEAN = "clean",
}

/** Enum for Swing Mode settings */
export enum SwingMode {
  AUTO = 0,
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
  FIVE = 5,
}

/** Enum for Converti Mode settings */
export enum ConvertiMode {
  HC = 110,
  FC = 100,
  C90 = 90,
  C80 = 80,
  C70 = 70,
  C55 = 55,
  C40 = 40,
  NS = 1,
  OFF = 0,
}

/** Enum for Consumption Period Type */
export enum ConsumptionPeriodType {
  DAILY = "Daily",
  WEEKLY = "Weekly",
  MONTHLY = "Monthly",
}
