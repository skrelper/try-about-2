/* ===========================
   PUT YOUR WORD LISTS HERE
=========================== */

const phrases = [
  "hissing like a snake",
  "speaking like there's food in your mouth",
  "apologizing for something from long ago",
  "talking in an Australian accent",
  "whispering the lyrics to a song",
  "affirming your aspirations",
  "listing pros and cons of two dinner places",
  "narrating your worst experience ever",
  "critiquing your boss",
  "accepting an award",
  "imitating a movie character",
  "cackling like a witch",
  "spelling out supercalifragilisticexpialidocious",
  "reading off a nighttime story from memory",
  "making the sounds of your favorite animal",
  "laughing like SpongeBob",
  "listing 5 of your favorite foods",
  "beatboxing",
  "dropping some knowledge",
  "performing a stand-up comedy set",
  "accusing someone of stealing from you",
  "repeating the same word over and over again",
  "groaning like an ogre",
  "yelling your fast food order",
  "giving yourself a pep talk",
  "singing a song you can't stand",
  "talking gibberish",
  "auctioneering",
  "listing onomatopoeias",
  "mimicking one of your friends",
  "closing your eyes and describing what you see",
  "making up a compound word",
  "giving an inspirational speech",
  "neighing like a horse",
  "speaking your truth",
  "telling a dad joke",
  "calling out your enemy",
  "talking about a time you felt joy",
  "describing your favorite toy as a kid",
  "speaking a tongue twister",
  "pouring your heart out to someone",
  "revealing your deepest, darkest secret",
  "barking like a dog",
  "try stating the alphabet backwards",
  "try counting your brain cells",
  "thinking out loud",
  "describing the plot of a movie",
  "plotting a top-secret operation",
  "coming up with a cheerleader chant",
  "hootin' an' hollerin'",
  "whistling to the best of your ability",
  "making whale noises",
  "describing your identity",
  "recalling a childhood memory",
  "saying what you believe in",
  "creating the weirdest sound possible",
  "holding the highest note you can",
  "being as annoying as possible",
  "meowing and purring like a cat",
  "talking about an interest of yours",
  "listing a few of your favorite things",
  "snapping a rhythm and humming to it",
  "complaining about something on your mind",
  "birdcalling",
  "giggling with more and more power",
  "laughing while talking about laughing"
];

/* ===========================
   CORE LOGIC BELOW
=========================== */

const phraseSlot = document.getElementById("phrase-slot");
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
