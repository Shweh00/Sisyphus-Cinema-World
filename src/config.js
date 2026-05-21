export const W = 360;
export const H = 640;

export const COLORS = {
  bg: "#050506",
  bg2: "#0A0A0B",
  platform: "#1B1B1F",
  inert: "#56565A",
  dull: "#3E3E42",
  silver: "#A9A9A8",
  paper: "#B8AA86",
  ivory: "#D8D2C0",
  overalls: "#354D62",
  fire: "#7A1B17",
  ember: "#B6412D",
  glitchCyan: "#5DA7AA",
  glitchMagenta: "#8A3A5E",
};

export const CONFIG = {
  gravity: 1580,
  moveSpeed: 126,
  jumpSpeed: 430,
  doubleJumpSpeed: 360,
  climbSpeed: 110,
  playerW: 14,
  playerH: 26,
  ledgeWindow: 10,
  worldEndY: -10200,
  lonelySegmentHeight: 900,
  fireKillChance: 0.5,
  fireWakeRadius: 92,
  fireContactRadius: 18,
  fireFadePerFall: 0.17,
  maxFallsBeforeLonely: 5,
  platformGapMin: 74,
  platformGapMax: 122,
  startPlatform: { x: 72, y: 574, w: 216, h: 24, type: "stone" },
};

export const OBJECT_TYPES = ["tv", "newspaper", "film", "frame"];
