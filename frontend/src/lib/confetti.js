import confetti from "canvas-confetti";

/**
 * Premium dopamine confetti — Sunya brand palette (green + gold + ivory).
 * Fires from the click position if event provided, otherwise center.
 */
export const fireConfetti = (e) => {
  const x = e ? e.clientX / window.innerWidth : 0.5;
  const y = e ? e.clientY / window.innerHeight : 0.55;

  const colors = ["#00C950", "#00A040", "#FFD700", "#FAF9F6", "#FFFFFF"];

  confetti({
    particleCount: 70,
    spread: 75,
    startVelocity: 35,
    origin: { x, y },
    colors,
    scalar: 1.05,
    ticks: 180,
    gravity: 1.05,
    zIndex: 9999,
  });
  // Burst from sides for delight
  setTimeout(() => {
    confetti({
      particleCount: 30,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 30,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    });
  }, 220);
};

export const fireMilestoneConfetti = () => {
  // For free-shipping unlock or order success — bigger burst
  const colors = ["#00C950", "#FFD700", "#FAF9F6"];
  const end = Date.now() + 1500;
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors, zIndex: 9999 });
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors, zIndex: 9999 });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
};
