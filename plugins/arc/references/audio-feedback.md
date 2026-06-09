# Audio Feedback Reference

When and how to use sound in interfaces. Sound is powerful but easily misused — most interfaces should have zero audio. Use this reference when sound genuinely improves the experience.

---

## When Sound Adds Value

### DO Use Sound For:

| Context             | Example                                  | Why                                                       |
| ------------------- | ---------------------------------------- | --------------------------------------------------------- |
| **Confirmations**   | Payment processed, message sent          | Reinforces success when user may not be looking at screen |
| **Errors/warnings** | Form validation failure, connection lost | Alerts user to problems, especially if focused elsewhere  |
| **Notifications**   | New message, timer complete              | Draws attention across applications                       |
| **Completion**      | Upload finished, build complete          | Background task done — user may have switched context     |

### DON'T Use Sound For:

| Context                                                  | Why Not                                  |
| -------------------------------------------------------- | ---------------------------------------- |
| **Decorative** (hover sounds, page transitions)          | Annoying after the first few times       |
| **High-frequency actions** (scrolling, typing, clicking) | Overwhelming, physically unpleasant      |
| **Punishment** (aggressive error sounds)                 | Creates anxiety, discourages exploration |
| **Ambient/background**                                   | Unexpected, intrusive in shared spaces   |

**Rule:** If the user will hear this sound 50+ times per session, don't use it.

---

## Accessibility Requirements

### MANDATORY

1. **`prefers-reduced-motion` check** — respect the user's system preference

   ```tsx
   const prefersReducedMotion = window.matchMedia(
     "(prefers-reduced-motion: reduce)"
   ).matches;

   if (!prefersReducedMotion) {
     playSound();
   }
   ```

2. **Visual equivalent** — every audio cue must have a visual counterpart

   ```tsx
   // Sound + visual toast
   playSuccessSound();
   showToast("Payment confirmed");
   ```

3. **Volume control** — provide a way to adjust or mute

   ```tsx
   const [soundEnabled, setSoundEnabled] = useState(true);
   const [volume, setVolume] = useState(0.5);
   ```

4. **No auto-play** — sounds should only play in response to user actions or explicit notifications the user has opted into

---

## Web Audio API Basics

### Single Audio Context

Reuse one `AudioContext` — don't create new ones per sound:

```tsx
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}
```

### Resume Suspended Context

Browsers suspend `AudioContext` until a user gesture. Resume it on the first interaction:

```tsx
document.addEventListener(
  "click",
  () => {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      ctx.resume();
    }
  },
  { once: true }
);
```

### Clean Up Nodes

Audio nodes that aren't disconnected leak memory:

```tsx
function playClick() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);

  // Set up sound...
  oscillator.start();
  oscillator.stop(ctx.currentTime + 0.05);

  // Clean up after playback
  oscillator.onended = () => {
    oscillator.disconnect();
    gain.disconnect();
  };
}
```

---

## Sound Design Principles

### Default to Subtle

Interface sounds should be **barely noticeable** — felt more than heard. If a user looks up from their screen when a sound plays, it's too loud or too prominent.

```tsx
// Good default gain
gain.gain.setValueAtTime(0.15, ctx.currentTime); // 15% volume

// NOT this
gain.gain.setValueAtTime(0.8, ctx.currentTime); // Way too loud
```

### Synthesized vs Sampled

| Approach                        | Pros                                                | Cons                    | Use When                                       |
| ------------------------------- | --------------------------------------------------- | ----------------------- | ---------------------------------------------- |
| **Synthesized** (Web Audio API) | Tiny footprint, infinitely customizable, no loading | Harder to make natural  | Simple UI sounds (clicks, tones)               |
| **Sampled** (audio files)       | Natural, rich, easy to swap                         | File size, loading time | Complex sounds (success chimes, notifications) |

### Click Sound Recipe

```tsx
function playUIClick() {
  const ctx = getAudioContext();
  const oscillator = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  // Noise-like click via bandpass filter
  filter.type = "bandpass";
  filter.frequency.value = 4000; // 3000-6000Hz range for clicks
  filter.Q.value = 1.5;

  oscillator.type = "square";
  oscillator.frequency.value = 800;

  // Very short envelope
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.05);

  oscillator.onended = () => {
    oscillator.disconnect();
    filter.disconnect();
    gain.disconnect();
  };
}
```

### Envelope Rules

- **Never target zero** in `exponentialRampToValueAtTime` — use `0.001` instead (zero causes errors)
- **Set initial value** before ramping — otherwise the ramp starts from an undefined state
- **Use exponential decay** — sounds more natural than linear

---

## Preloading

For sampled sounds, preload during idle time:

```tsx
const soundCache = new Map<string, AudioBuffer>();

async function preloadSound(url: string) {
  const ctx = getAudioContext();
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
  soundCache.set(url, audioBuffer);
}

// Preload during idle
requestIdleCallback(() => {
  preloadSound("/sounds/success.mp3");
  preloadSound("/sounds/error.mp3");
});
```

---

## Quick Reference

```
USE SOUND FOR         → Confirmations, errors, notifications, completions
DON'T USE FOR         → Decoration, high-frequency actions, punishment
ACCESSIBILITY         → Visual equivalent (mandatory), volume control, respect prefers-reduced-motion
AUDIO CONTEXT         → Single instance, resume on first gesture
DEFAULT VOLUME        → 0.15 (subtle)
CLICK FREQUENCY       → 3000-6000Hz bandpass
ENVELOPE TARGET       → 0.001 (never zero)
CLEANUP               → Disconnect nodes after playback
PRELOAD               → requestIdleCallback for sampled sounds
```
