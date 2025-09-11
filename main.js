"use strict";

const form = document.querySelector("#form");
const diceList = document.querySelector("#dices-list");

const addDiceBtn = form.querySelector("#dices-add-btn");
const startTestBtn = form.querySelector("#start-test");

// Інформація для тестування
const arrData = [];
const arrDataResults = [];
const settingsObj = {};
const commonResultsObj = {};

// Загальна кільікість типів дайсів для тестування
let commonDiceCount = 1;

// Розмітка поля налаштувань одного дайсу
const diceMarkUp = (count) => `
    <li>
    <fieldset id="dice-${count}" class="fieldset">
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

          <button id="d-${count}-mod-${count}-${modCount}__del-btn" class="btn btn-del" type="button" data-role="delete-item">x</button>
        </li>

`;

createDiceField(commonDiceCount);

addDiceBtn.addEventListener("click", () => {
  commonDiceCount++;
  createDiceField(commonDiceCount);
});

form.addEventListener("click", (e) => {
  if (e.target.dataset.role === "delete-item") {
    const btn = e.target;

    const el = btn.closest("li");
    el.remove();
  }
});

startTestBtn.addEventListener("click", () => {
  arrData.splice(0);
  arrDataResults.splice(0);

  const list = document.querySelector("#results-detail");

  list.innerHTML = "";

  getCommonSettings(form, settingsObj);

  getAllDiceData(form, commonDiceCount, arrData);

  setThrowMarkUp(settingsObj, arrData, list, arrDataResults);

  getResultsAnalize(settingsObj, arrDataResults, commonResultsObj);

  addMarkUpCommonResults(commonResultsObj);
});

// Отримання розмітки кидків
function setThrowMarkUp(obj, arrDataThrow, el, arrDataResults) {
  for (let i = 0; i < obj.testCount; i++) {
    const { markup, summ } = getOneThrowResult(arrDataThrow);

    el.insertAdjacentHTML("beforeend", markup);

    arrDataResults.push(summ);
  }
}

// Аналіз результатів
function getResultsAnalize(settingsObj, arr, resultsObj) {
  const { threshold, logic } = settingsObj;

  const resultsThrowArr = arr;
  let meanResults = undefined;

  if (logic > 0) {
    meanResults = Math.floor(arr.reduce((acc, i) => acc + i, 0) / arr.length);
  } else {
    meanResults = Math.ceil(arr.reduce((acc, i) => acc + i, 0) / arr.length);
  }

  const minResults = Math.min(...arr);
  const maxResults = Math.max(...arr);

  resultsObj["resultsThrowArr"] = resultsThrowArr;
  resultsObj["meanResults"] = meanResults;
  resultsObj["minResults"] = minResults;
  resultsObj["maxResults"] = maxResults;

  if (threshold > 0) {
    const successArr = arr.filter((i) => i * logic >= threshold * logic);
    const successPercent = (successArr.length / arr.length) * 100;
    let successMeanResults = undefined;

    if (logic > 0) {
      successMeanResults = Math.floor(
        successArr.reduce((acc, i) => acc + i, 0) / successArr.length
      );
    } else {
      successMeanResults = Math.ceil(
        successArr.reduce((acc, i) => acc + i, 0) / successArr.length
      );
    }

    resultsObj["threshold"] = true;
    resultsObj["successArr"] = successArr;
    resultsObj["successPercent"] = successPercent;
    resultsObj["successMeanResults"] = successMeanResults;
  }
}

// Додавання розмітки загальних результатів
function addMarkUpCommonResults(obj) {
  const {
    meanResults,
    minResults,
    maxResults,
    threshold,
    successArr,
    successPercent,
    successMeanResults,
  } = obj;

  const list = document.querySelector("#results-common");

  const markup = `
    <li>Середній результат кидків: ${meanResults}</li>
    <li>Мінімальний результат кидків: ${minResults}</li>
    <li>Максимальний результат кидків: ${maxResults}</li>
    ${
      threshold
        ? `  <li>Успішні кидки (%): ${successPercent}</li>
    <li>Середній успішний результат: ${successMeanResults}</li>
    `
        : ""
    }
  `;

  list.innerHTML = markup;
}

// Збір загальних результатів у об'єкт

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

// Створення поля модифікатора
function createDiceModField(highEl, count) {
  const diceModeList = highEl.querySelector(`#d-${count}__mod-list`);

  if (diceModeList.classList.contains("hidden")) {
    diceModeList.classList.remove("hidden");
  }

  const modCount = diceModeList.querySelectorAll("li").length;

  diceModeList.insertAdjacentHTML(
    "beforeend",
    diceModMarckUp(count, modCount + 1)
  );
}

// Отримання загальних налаштувань тесту
function getCommonSettings(el, obj) {
  const testCount = el.querySelector("#test-count").value;
  const threshold = el.querySelector("#threshold").value;
  const logic = el.querySelector("#logic-calc input:checked").value;

  obj["testCount"] = Number(testCount);
  obj["threshold"] = Number(threshold);
  obj["logic"] = Number(logic);
}

// Отримання інформації для кидку всіх дйсів
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

  for (const item of arrProp) {
    const searchName = item[0];
    const propName = item[1];

    if (item.length < 3) {
      getData(dice, searchName, diceData, propName);
    } else {
      //   const mod = {};
      const modsArr = [];

      //   getDataSub(dice, searchName, mod, count);
      getDataSub(dice, searchName, modsArr, count);

      diceData["mods"] = modsArr;
    }
  }

  arr.push(diceData);
}

// Пошук та отримання даних з поля введення
function getData(highEl, searchName, obj, propName) {
  const el = highEl.querySelector(searchName);

  obj[propName] = Number(el.value);
}

// Пошук та отримання даних з поля введення модимодифікаторі
function getDataSub(highEl, searchName, arr, count) {
  const el = highEl.querySelector(searchName);

  const arrListItem = el.querySelectorAll("li");

  let modCount = 0;

  for (const item of arrListItem) {
    const arrInput = item.querySelectorAll("input");

    modCount = modCount + 1;

    const arrSubProp = [
      [`#d-${count}-mod-${count}-${modCount}__name`, "modName"],
      [`#d-${count}-mod-${count}-${modCount}__value`, "modValue"],
    ];

    const subObj = {};

    for (const i of arrInput) {
      for (const prop of arrSubProp) {
        const searchName = prop[0];
        const propName = prop[1];

        const el = item.querySelector(searchName);

        subObj[propName] = el.value;
      }
    }
    arr.push(subObj);
  }
}

// отримання випадкового числа
function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Отримання результату одного кидку тесту
function getOneThrowResult(arr) {
  const resultMarkUpArr = [];
  const sumResults = [];

  //   Перебір окремого типу дайсів
  for (const i of arr) {
    const { diceType, diceCount, diceThrow, mods } = i;

    const sumResultsMarkUp = [];
    const modString = [];

    // Перебір кожного кидку дайсу
    for (let i = 0; i < diceCount; i++) {
      let throwResult = 0;
      let string = null;

      if (diceThrow < 0) {
        const firstThrowResalt = getRandom(1, diceType);
        const secondThrowResalt = getRandom(1, diceType);

        string = ` (${firstThrowResalt}, ${secondThrowResalt})`;

        throwResult = Math.min(firstThrowResalt, secondThrowResalt);
      }

      if (diceThrow > 0) {
        const firstThrowResalt = getRandom(1, diceType);
        const secondThrowResalt = getRandom(1, diceType);

        string = ` (${firstThrowResalt}, ${secondThrowResalt})`;

        throwResult = Math.max(firstThrowResalt, secondThrowResalt);
      }

      if (diceThrow === 0) {
        throwResult = getRandom(1, diceType);
      }

      sumResults.push(throwResult);
      sumResultsMarkUp.push(`${throwResult}${string ? string : ""}`);
    }

    if (mods.length > 0) {
      modString.push("");
    }

    for (const mod of mods) {
      const name = mod.modName;
      const value = mod.modValue;

      const string = `${value} (${name})`;

      sumResults.push(Number(value));
      modString.push(string);
    }

    const markUpString = `(${diceCount}d${diceType}) ${sumResultsMarkUp.join(
      " + "
    )}${modString.join(" + ")}`;

    resultMarkUpArr.push(markUpString);
  }

  const summ = sumResults.reduce((acc, num) => acc + num, 0);

  const markup = `<li>${summ}, ${resultMarkUpArr.join(" + ")}</li>`;

  return { markup, summ };
}
