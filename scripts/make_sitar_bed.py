"""Original soft tanpura drone and sparse sitar alap for path background."""
import numpy as np
from scipy.io import wavfile

SR = 44100
SECONDS = 32
SA = 196.0  # peaceful mandra Sa
t = np.arange(int(SR * SECONDS)) / SR


def tone(freq, tt, harmonics=10, tilt=1.6):
    y = np.zeros_like(tt)
    for k in range(1, harmonics + 1):
        y += (1.0 / k) ** tilt * np.sin(2 * np.pi * freq * k * tt + 0.15 * k)
    return np.tanh(y * 0.85)


def pluck(freq, start, length, harmonics=14):
    n = int(length * SR)
    if start + n > len(t):
        n = len(t) - start
    tt = np.arange(n) / SR
    env = np.exp(-tt * 1.35) * (1 - np.exp(-tt * 80))
    body = tone(freq, tt, harmonics=harmonics, tilt=1.15)
    # Bright jawari tick at the attack, then a warm string.
    tick = np.exp(-tt * 90) * np.sin(2 * np.pi * freq * 6 * tt)
    return (body * 0.72 + tick * 0.18) * env


drone = (
    0.34 * tone(SA, t, 8, 1.8)
    + 0.22 * tone(SA / 2, t, 6, 1.9)
    + 0.16 * tone(SA * 1.5, t, 6, 2.0)
    + 0.08 * tone(SA * 2, t, 5, 2.2)
)
# Four slow tanpura-like swells that meet exactly at the loop.
pulse = 0.82 + 0.18 * np.sin(2 * np.pi * t / 8.0) ** 2
drone *= pulse

# Yaman-flavoured alap, notes finish decaying before the seam.
scale = {
    "S": SA,
    "R": SA * 9 / 8,
    "G": SA * 5 / 4,
    "M": SA * 45 / 32,
    "P": SA * 3 / 2,
    "D": SA * 5 / 3,
    "N": SA * 15 / 8,
    "S2": SA * 2,
}
phrase = [
    (1.2, "S", 3.2),
    (5.0, "G", 3.0),
    (8.6, "P", 3.2),
    (12.4, "N", 2.6),
    (15.6, "D", 2.4),
    (18.6, "P", 3.0),
    (22.2, "M", 2.6),
    (25.2, "G", 2.8),
    (28.4, "R", 2.4),
]
sitar = np.zeros_like(drone)
for start, name, length in phrase:
    i = int(start * SR)
    note = pluck(scale[name], i, length)
    sitar[i : i + len(note)] += note

mix = drone * 0.55 + sitar * 0.42
# Small temple wash. Delays divide the loop so the tail matches the head.
for delay_s, gain in ((0.037, 0.22), (0.061, 0.12)):
    d = int(delay_s * SR)
    mix[d:] += gain * mix[:-d]
    mix[:d] += gain * mix[-d:]

peak = np.max(np.abs(mix))
mix = 0.32 * mix / max(peak, 1e-6)
audio = np.clip(mix, -1, 1)
wavfile.write("/tmp/sitar-path.wav", SR, (audio * 32767).astype(np.int16))
print("wrote wav", audio.shape, "peak", float(np.max(np.abs(audio))))
