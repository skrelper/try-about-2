/* ===========================
   PUT YOUR WORD LISTS HERE
=========================== */

const phrases = [
  "ASMRing",
  "birdcalling",
  "singing a song",
  "fussing",
  "crying",
  "quacking",
  "mumbling",
  "being a karen",
  "blabbering",
  "birdcalling",
  "crackin' a joke",
  "weeping",
  "vocalizing",
  "informing me",
  "bragging",
  "shouting",
  "asking a question",
  "rapping",
  "talking",
  "thinking out loud",
  "being rude",
  "describing a movie",
  "plotting",
  "hootin' 'n hollerin'",
  "whistling",
  "whispering",
  "murmuring",
  "humming",
  "making up a story",
  "speaking up",
  "whining",
  "yelling",
  "hiccuping",
  "complainin'",
  "groaning",
  "talking loudly"
];

/* ===========================
   CORE LOGIC BELOW
=========================== */

const phraseSlot = document.getElementById("phrase-slot");
const textureToggle = document.getElementById("texture-toggle");
const textureLayer = document.getElementById("texture-layer");
const textureLayerAlt = document.getElementById("texture-layer-alt");

const TEXTURE_STORAGE_KEY = "try-about-texture-enabled";
const textureLayers = [textureLayer, textureLayerAlt].filter(Boolean);
let activeTextureLayerIndex = 0;
let lastHue = Math.floor(Math.random() * 360);

function randomInRange(min, max) {
  return min + Math.random() * (max - min);
}

function createTint(hue, alpha) {
  const saturation = randomInRange(38, 72).toFixed(0);
  const lightness = randomInRange(62, 78).toFixed(0);

  return `hsla(${hue.toFixed(0)}, ${saturation}%, ${lightness}%, ${alpha.toFixed(3)})`;
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hh = h / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r = 0;
  let g = 0;
  let b = 0;

  if (hh >= 0 && hh < 1) {
    r = c;
    g = x;
  } else if (hh >= 1 && hh < 2) {
    r = x;
    g = c;
  } else if (hh >= 2 && hh < 3) {
    g = c;
    b = x;
  } else if (hh >= 3 && hh < 4) {
    g = x;
    b = c;
  } else if (hh >= 4 && hh < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  const m = l - c / 2;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

function buildRandomTextureGradient() {
  const hueShift = randomInRange(16, 42);
  const direction = Math.random() > 0.5 ? 1 : -1;
  const baseHue = (lastHue + hueShift * direction + 360) % 360;
  lastHue = baseHue;

  const grid = 16;
  const canvas = document.createElement("canvas");
  canvas.width = grid;
  canvas.height = grid;
  const ctx = canvas.getContext("2d", { alpha: false });

  if (!ctx) {
    return `linear-gradient(135deg, ${createTint(baseHue, 0.3)}, ${createTint((baseHue + 120) % 360, 0.3)})`;
  }

  for (let y = 0; y < grid; y++) {
    for (let x = 0; x < grid; x++) {
      const nx = x / (grid - 1);
      const ny = y / (grid - 1);
      const wave =
        Math.sin((nx * Math.PI * 2) + randomInRange(-0.35, 0.35)) +
        Math.cos((ny * Math.PI * 2) + randomInRange(-0.35, 0.35));
      const swirl = Math.sin((nx + ny) * Math.PI * 2 + randomInRange(-0.5, 0.5));

      const hue = (baseHue + wave * 34 + swirl * 26 + nx * 72 + ny * 46 + 360) % 360;
      const sat = 0.56 + randomInRange(-0.07, 0.07);
      const light = 0.48 + randomInRange(-0.06, 0.06);
      const rgb = hslToRgb(hue, sat, light);

      ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  return `url(${canvas.toDataURL("image/png")})`;
}

function applyTextureGradient(layer) {
  if (!layer) return;
  layer.style.backgroundImage = buildRandomTextureGradient();
}

function transitionTexture() {
  if (textureLayers.length === 0 || document.body.classList.contains("texture-off")) return;

  const nextIndex = (activeTextureLayerIndex + 1) % textureLayers.length;
  const activeLayer = textureLayers[activeTextureLayerIndex];
  const nextLayer = textureLayers[nextIndex];

  applyTextureGradient(nextLayer);
  nextLayer.classList.add("visible");
  activeLayer.classList.remove("visible");
  activeTextureLayerIndex = nextIndex;
}

function setTextureEnabled(enabled) {
  document.body.classList.toggle("texture-off", !enabled);

  if (enabled && textureLayers.length > 0 && !textureLayers.some((layer) => layer.classList.contains("visible"))) {
    textureLayers[activeTextureLayerIndex].classList.add("visible");
  }

  if (textureToggle) {
    textureToggle.textContent = enabled ? "texture: on [1]" : "texture: off [1]";
  }

  localStorage.setItem(TEXTURE_STORAGE_KEY, String(enabled));
}

const savedTexturePref = localStorage.getItem(TEXTURE_STORAGE_KEY);
setTextureEnabled(savedTexturePref !== "false");

if (textureLayers.length > 0) {
  applyTextureGradient(textureLayers[0]);
  applyTextureGradient(textureLayers[1]);

  if (!document.body.classList.contains("texture-off")) {
    textureLayers[0].classList.add("visible");
  }
}

setInterval(transitionTexture, 8500);

if (textureToggle) {
  textureToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setTextureEnabled(document.body.classList.contains("texture-off"));
  });
}

const COPIES = 7;
const MIDDLE_COPY = Math.floor(COPIES / 2);
const ROW_HEIGHT = 84;

function updateWordOpacity(slot, absolutePosition) {
  Array.from(slot.children).forEach((child, index) => {
    const distance = Math.abs(index - absolutePosition);
    const distanceBand = Math.max(0, Math.round(distance));
    const opacity = 1 / Math.pow(2, distanceBand);
    const blurAmount = Math.min(distance * 0.5, 4.2);
    const verticalSkew = Math.min(distance * 1.1, 9);

    child.style.opacity = String(opacity);
    child.style.filter = `blur(${blurAmount}px)`;
    const offsetY = Math.sign(index - absolutePosition) * verticalSkew;
    const scale = distance < 0.6 ? 1.04 : 1;

    child.style.transform = `translateY(${offsetY}px) scale(${scale})`;
  });
}

function setSlotWidth(slot, words) {
  const longestWordLength = words.reduce(
    (longest, word) => Math.max(longest, word.length),
    0
  );

  slot.parentElement.style.width = `${longestWordLength + 1}ch`;
}

function populateSlot(slot, words) {
  slot.innerHTML = "";

  for (let i = 0; i < COPIES; i++) {
    words.forEach((word) => {
      const div = document.createElement("div");
      div.textContent = word;
      slot.appendChild(div);
    });
  }

  setSlotWidth(slot, words);

  const startAbsoluteIndex = MIDDLE_COPY * words.length;
  slot.dataset.position = String(startAbsoluteIndex);
  slot.style.transform = `translateY(-${startAbsoluteIndex * ROW_HEIGHT}px)`;

  Array.from(slot.children).forEach((child) => child.classList.remove("active"));
  slot.children[startAbsoluteIndex].classList.add("active");
  updateWordOpacity(slot, startAbsoluteIndex);
}

populateSlot(phraseSlot, phrases);

let spinning = false;

function spin(slot, words) {
  return new Promise((resolve) => {
    const wordsCount = words.length;
    const currentAbsolute = Number(slot.dataset.position || 0);
    const currentWordIndex = currentAbsolute % wordsCount;

    const targetWordIndex = Math.floor(Math.random() * wordsCount);
    const deltaToTarget =
      (targetWordIndex - currentWordIndex + wordsCount) % wordsCount;

    const extraFullTurns = (2 + Math.floor(Math.random() * 2)) * wordsCount;
    const targetAbsolute = currentAbsolute + extraFullTurns + deltaToTarget;
    const lowerBound = wordsCount;
    const upperBound = wordsCount * (COPIES - 1);
    let rebaseOffset = 0;

    const start = performance.now();
    const duration = 2400 + Math.random() * 700;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const virtualAbsolute =
        currentAbsolute + (targetAbsolute - currentAbsolute) * eased;
      let nextAbsolute = virtualAbsolute + rebaseOffset;

      while (nextAbsolute > upperBound) {
        rebaseOffset -= wordsCount;
        nextAbsolute -= wordsCount;
      }

      while (nextAbsolute < lowerBound) {
        rebaseOffset += wordsCount;
        nextAbsolute += wordsCount;
      }

      slot.style.transform = `translateY(-${nextAbsolute * ROW_HEIGHT}px)`;
      updateWordOpacity(slot, nextAbsolute);

      if (progress < 1) {
        requestAnimationFrame(animate);
        return;
      }

      Array.from(slot.children).forEach((child) => child.classList.remove("active"));

      const finalAbsolute = MIDDLE_COPY * wordsCount + targetWordIndex;
      slot.dataset.position = String(finalAbsolute);
      slot.style.transform = `translateY(-${finalAbsolute * ROW_HEIGHT}px)`;
      slot.children[finalAbsolute].classList.add("active");
      updateWordOpacity(slot, finalAbsolute);

      resolve();
    }

    requestAnimationFrame(animate);
  });
}

function triggerSpin() {
  if (spinning) return;
  spinning = true;

  transitionTexture();

  spin(phraseSlot, phrases).then(() => {
    spinning = false;
  });
}

/* trigger on spacebar */
document.addEventListener("keydown", (e) => {
  if (e.code === "Digit1") {
    e.preventDefault();
    setTextureEnabled(document.body.classList.contains("texture-off"));
    return;
  }

  if (e.code === "Space") {
    e.preventDefault();
    triggerSpin();
  }
});

/* trigger on click anywhere */
document.addEventListener("click", triggerSpin);
