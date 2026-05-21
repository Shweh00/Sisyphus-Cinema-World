const KEY = "sisyphusCinemaWorld.v1";

export function loadSave() {
  try {
    return { lonelyUnlocked: localStorage.getItem(KEY) === "lonely" };
  } catch {
    return { lonelyUnlocked: false };
  }
}

export function unlockLonely() {
  try {
    localStorage.setItem(KEY, "lonely");
  } catch {
    // localStorage can be unavailable in private contexts; gameplay continues.
  }
}
