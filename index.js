const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished"
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png" // 梅花
];

const view = {
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];

    return `<p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `;
  },

  getCardElement(index) {
    return `<div data-index="${index}" class="card back">
    </div>`;
  },

  displayCards(indexes) {
    const cards = document.querySelector("#cards");
    cards.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },

  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      card.classList.add("back");
      card.innerHTML = null;
    });
  },

  pairedCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },

  renderScore(score) {
    document.querySelector(".score").innerText = `Score: ${score}`;
  },

  renderTriedTimes(times) {
    document.querySelector(".tried").innerText = `You've tried: ${times} times`;
  },

  renderWrongAnimation(...cards) {
    cards.forEach((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (e) => {
          card.classList.remove("wrong");
        },
        {
          once: true
        }
      );
    });
  },

  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times.</p>
    `;
    const header = document.querySelector("#header");
    header.before(div);
  }
};

const model = {
  revolvedCards: [],

  isRevolvedCardsMatched() {
    return (
      Number(this.revolvedCards[0].dataset.index) % 13 ===
      Number(this.revolvedCards[1].dataset.index) % 13
    );
  },

  score: 0,
  triedTimes: 0
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,

  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },

  dispatchCardAction(card) {
    if (!card.classList.contains("back")) return;

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card);
        model.revolvedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;

      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revolvedCards.push(card);
        view.renderTriedTimes(++model.triedTimes);

        if (model.isRevolvedCardsMatched()) {
          this.currentState = GAME_STATE.CardsMatched;
          view.renderScore((model.score += 10));
          view.pairedCards(...model.revolvedCards);
          model.revolvedCards = [];

          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }

          this.currentState = GAME_STATE.FirstCardAwaits;
        } else {
          view.renderWrongAnimation(...model.revolvedCards);
          this.currentState = GAME_STATE.CardsMatchFailed;
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("current", this.currentState);
  },

  resetCards() {
    view.flipCards(...model.revolvedCards);
    model.revolvedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  }
};

const utility = {
  getRandomNumberArray(count) {
    let number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index]
      ];
    }
    return number;
  }
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
