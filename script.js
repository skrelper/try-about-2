/* ===========================
   PUT YOUR WORD LISTS HERE
=========================== */

const verbs = [
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

const topics = [
  "the ocean",
  "government secrets",
  "ancient machinery",
  "green apples",
  "impossible happiness",
  "your childhood memories",
  "how to make a friend",
  "spoiled brats",
  "your biggest pet peeve",
  "photography",
  "the worst feeling ever",
  "childhood memories",
  "how to laugh",
  "the saddest song ever",
  "romance movies",
  "your dream date",
  "pronouns",
  "what you see right now",
  "accounting",
  "the phone you own",
  "your lockscreen",
  "your dream job",
  "things that you hate",
  "a love story",
  "the economic state of the world",
  "what happiness looks like",
  "the color of sadness",
  "what you do when you're bored",
  "historical landmarks",
  "the best candy bar ever",
  "ear protection at concerts",
  "therapy",
  "art school",
  "whatever you want",
  "your identity",
  "religion",
  "a collapsing universe"
];

/* ===========================
   CORE LOGIC BELOW
=========================== */

const verbSlot = document.getElementById("verb-slot");
const topicSlot = document.getElementById("topic-slot");

const COPIES = 7;
const MIDDLE_COPY = Math.floor(COPIES / 2);
const ROW_HEIGHT = 84;

function updateWordOpacity(slot, absolutePosition) {
  Array.from(slot.children).forEach((child, index) => {
    const distance = Math.abs(index - absolutePosition);

    if (distance < 0.5) {
      child.style.opacity = "1";
    } else if (distance < 1.5) {
      child.style.opacity = "0.45";
    } else {
      child.style.opacity = "0.15";
    }
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

populateSlot(verbSlot, verbs);
populateSlot(topicSlot, topics);

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

    const start = performance.now();
    const duration = 2400 + Math.random() * 700;

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function animate(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const nextAbsolute =
        currentAbsolute + (targetAbsolute - currentAbsolute) * eased;

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

  Promise.all([spin(verbSlot, verbs), spin(topicSlot, topics)]).then(() => {
    spinning = false;
  });
}

/* trigger on spacebar */
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    triggerSpin();
  }
});

/* trigger on click anywhere */
document.addEventListener("click", triggerSpin);
