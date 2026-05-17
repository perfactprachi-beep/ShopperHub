export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const randomDelay = (min, max) =>
  delay(Math.floor(Math.random() * (max - min + 1)) + min);
