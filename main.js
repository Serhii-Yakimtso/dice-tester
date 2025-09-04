"use strict";

const form = document.querySelector("#form");
const diceList = document.querySelector("#dices-list");

const addDiceBtn = form.querySelector("#dices-add-btn");
const startTestBtn = form.querySelector("#start-test");

// Інформація для тестування
const arrData = [];

// Загальна кільікість типів дайсів для тестування
let commonDiceCount = 1;

// Розмітка поля налаштувань одного дайсу
const diceMarkUp = (count) => `
    <li>
    <fieldset id="dice-${count}" class="fieldset" data-dice="dice">
        <legend>Дайс №${count}</legend>

        <fieldset class="flex-wrapper">
        <legend>Дайс</legend>

        <div class="flex-col-rev">
            <label for="d-${count}__dice-type">Тип дайсу</label>

            <select
            id="d-${count}__dice-type"
            class="select"
            name="dice-type"
            >
            <option value="2">1d2</option>
            <option value="4">1d4</option>
            <option value="6">1d6</option>
            <option value="8">1d8</option>
            <option value="10">1d10</option>
            <option value="12">1d12</option>
            <option value="20" selected>1d20</option>
            <option value="100">1d100</option>
            </select>
        </div>

        <div class="flex-col-rev">
            <label for="d-${count}__dice-count"
            >Кількість кидків дайсу</label
            >
            <input
            type="number"
            class="input input-count"
            id="d-${count}__dice-count"
            name="dice-count"
            min="0"
            max="100"
            step="1"
            value="1"
            />
        </div>
        </fieldset>

        <fieldset id="d-${count}__dice-throw" class="flex-col">
            <legend>Кидок</legend>

            <label
                ><input type="radio" name="d-${count}__throw" value="1" /> з перевагою
            </label>

            <label
                ><input
                type="radio"
                name="d-${count}__throw"
                value="0"
                checked
                /> звичайний
            </label>

            <label
                ><input type="radio" name="d-${count}__throw" value="-1" /> з
                перешкодою
            </label>
        </fieldset>

        <fieldset  class="flex-col">
            <legend>Модифікатори</legend>
            <ul id="d-${count}__mod-list" class="flex-col hidden"></ul>
            <button class="btn" id="d-${count}__mods__add" type="button">Додати модифікатор</button>
        </fieldset>
    </fieldset>
    </li>
`;

const diceModMarckUp = (count, modCount) => `
        <li id="d-${count}__mod-${count}-${modCount}" class="flex-wrapper">
          <div class="flex-col-rev">
            <label for="d-${count}-mod-${count}-${modCount}__name">Назва</label>
            <input
              type="text"
              class="input input-mod-name"
              id="d-${count}-mod-${count}-${modCount}__name"
              name="input-mod-name"
            />
          </div>

          <div class="flex-col-rev">
            <label for="d-${count}-mod-${count}-${modCount}__value">Значення</label>
            <input
              type="number"
              class="input input-mod-value"
              id="d-${count}-mod-${count}-${modCount}__value"
              name="input-mod-value"
              min="0"
              max="100"
              step="1"
              value="0"
            />
          </div>

          <button class="btn btn-del" type="button">x</button>
        </li>

`;

createDiceField(commonDiceCount);

addDiceBtn.addEventListener("click", () => {
  commonDiceCount++;
  createDiceField(commonDiceCount);
});

startTestBtn.addEventListener("click", () => {
  arrData.splice(0);

  getAllDiceData(form, commonDiceCount, arrData);
});

// Створення поля налаштувань одного дайсу
function createDiceField(commonDiceCount) {
  diceList.insertAdjacentHTML("beforeend", diceMarkUp(commonDiceCount));

  const addDiceModBtn = diceList.querySelector(
    `#d-${commonDiceCount}__mods__add`
  );

  addDiceModBtn.addEventListener("click", () => {
    createDiceModField(diceList, commonDiceCount);
  });
}

function createDiceModField(highEl, count) {
  const diceModeList = highEl.querySelector(`#d-${count}__mod-list`);

  if (diceModeList.classList.contains("hidden")) {
    diceModeList.classList.remove("hidden");
  }

  const modCount = diceModeList.querySelectorAll("li").length;
  console.log(modCount);

  diceModeList.insertAdjacentHTML(
    "beforeend",
    diceModMarckUp(count, modCount + 1)
  );
}

function getAllDiceData(form, countDice, arrData) {
  for (let i = 1; i <= countDice; i++) {
    getDiceData(form, i, arrData);
  }
}

// Отримання інформації для кидку одного типу дайсу
function getDiceData(el, count, arr) {
  const dice = el.querySelector(`#dice-${count}`);

  const diceData = {};

  const arrProp = [
    [`#d-${count}__dice-type`, "diceType"],
    [`#d-${count}__dice-count`, "diceCount"],
    [`#d-${count}__dice-throw input:checked`, "diceThrow"],
    [`#d-${count}__mod-list`, "mods", "sub"],
  ];

  console.log(arrProp);

  for (const item of arrProp) {
    const searchName = item[0];
    const propName = item[1];

    if (!item[2]) {
      getData(dice, searchName, diceData, propName);
    } else {
      // getDataSub(dice, searchName, diceData, arrSubProp);
    }
  }

  arr.push(diceData);
  console.log(arr);
}

// Пошук та отримання даних з поля введення
function getData(highEl, searchName, obj, propName) {
  const el = highEl.querySelector(searchName);
  console.log(el);

  obj[propName] = el.value;
}

// function getDataSub(highEl, searchName, obj, arrSubProp) {
//   const el = highEl.querySelector(searchName);
//   const arrItem = el.querySelectorAll("li");

//   for (const item of arrItem) {
//     const arrInput = item.querySelectorAll("input");
//     console.log(arrInput);

//     const arrSubProp = [
//       [`#d-${count}-mod-${count}-${modCount}__name`, "modName"],
//       [`#d-${count}-mod-${count}-${modCount}__value`, "modValue"],
//     ];

//     for (const i of arrInput) {
//       const searchName = arrSubProp[0];
//       const propName = arrSubProp[1];

//       console.log(i);
//     }
//   }

// }
