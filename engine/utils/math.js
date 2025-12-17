// linear remap with clamped endpoints (ChatGPT)
function parallax(input) {
  const clamped = Math.max(0, Math.min(100, input));
  return 0.75 * clamped + 12.5;
}
function remap(value, inMin, inMax, outMin, outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
  // Call: remap(x, 0, 100, 12.5, 87.5);
}

module.exports = {
    parallax, remap,
}