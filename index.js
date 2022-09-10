const front = document.querySelector('.front');
const cards = document.querySelectorAll('.card');
const win = document.querySelector('.winCount');
const fail = document.querySelector('.failCount');
const reactionImg = document.querySelector('.reaction');
const resetBtn = document.querySelector('.btn-reset');
const matchResult = document.querySelector('.match-result');
const resultText = document.querySelector('.result-text');
let isFlipped = false;
let firstCard, secondCard;
let resultCount = {
    winCount: 0,
    failCount: 0
}

cards.forEach((card) => card.addEventListener('click', flip));

function result() {
    return new Promise((resolve, reject) => {
        if(firstCard.dataset.text == secondCard.dataset.text) {
            setTimeout(() => {
                resolve('cards matched!');
            }, 1500);
        } else {
            setTimeout(() => {
                reject('cards did not match!');
            }, 1500);
        }
    })
}
    // shuffles card position
function shuffle() {
    cards.forEach((card) => card.style.order = Math.round(Math.random() * 16));
}
    // reset all values
function reset() {
    firstCard.classList.remove('flip');
    secondCard.classList.remove('flip');
    isFlipped = false;
    firstCard = null;
    secondCard = null;
    cards.forEach((card) => card.addEventListener('click', flip));
}
    // check cards after selecting
async function check() {
    try {
        const output = await result();
        resultCount.winCount++;
        setStorage();
        setStorage();
        const storageData = getStorage();
        win.innerHTML = storageData.winCount;
        checkResult();
        resultCard('win')
        reset();
        init();
        shuffle();
    } catch(error) {
        console.log(error);
        resultCount.failCount++;
        setStorage();
        const storageData = getStorage();
        fail.innerHTML = storageData.failCount;
        checkResult();
        resultCard('lose')
        reset();
    }
}
    // flip cards on select
function flip() {
    this.classList.add('flip');
    if(!isFlipped) {
        isFlipped = true;
        firstCard = this;
    } 
    if(this != firstCard) {
        secondCard = this;
        cards.forEach((card) => card.removeEventListener('click', flip));
        check();
    }
}

function checkResult(result) {
    const storageData = getStorage();
    if (storageData != null) {
        const winDiff = storageData.winCount - storageData.failCount;
        const loseDiff = storageData.failCount - storageData.winCount;
        
        if ( (storageData.failCount > storageData.winCount) &&  (loseDiff > 0) )
            reactionImg.setAttribute('src', 'images/sad-cat.png');
        if ( (storageData.failCount > storageData.winCount) &&  (loseDiff > 5) )
            reactionImg.setAttribute('src', 'images/crying-cat.png');
        if ( (storageData.winCount > storageData.failCount) &&  (winDiff > 0) )
            reactionImg.setAttribute('src', 'images/happy-cat.png');
        if ( (storageData.winCount > storageData.failCount) &&  (winDiff > 5) )
            reactionImg.setAttribute('src', 'images/amazed-cat.png');
    }
}

function resultCard(result) {
    if (result == 'win') {
        matchResult.querySelector('img').setAttribute('src', 'images/happy-cat.png');
        resultText.textContent = 'Yay! did it';
    } else {
        matchResult.querySelector('img').setAttribute('src', 'images/sad-cat.png');
        resultText.textContent = 'Oww! try again';
    }
    matchResult.style.display = 'block';
    setTimeout(() => {
        matchResult.style.display = 'none';
    }, 1200);
}

function setStorage() { 
    localStorage.setItem("resultCount", JSON.stringify(resultCount));
}

function getStorage() {
    const dataFromStorage = localStorage.getItem("resultCount");
    const formattedData = JSON.parse(dataFromStorage);
    return formattedData ? formattedData : null;
}

async function getData() {
    const response = await fetch('https://api.thecatapi.com/v1/images/search?format=json&limit=4');
    const data = await response.json();
    
    let count = 0;
    cards.forEach(card => {
        count > 3 ? count = 0 : count;
        const attr = card.setAttribute('data-text', data[count].id);

        const cardFront = card.querySelector('.front');
        cardFront.setAttribute('src', data[count].url);
        count++;
    })
}

async function init() {
    await getData();
    shuffle();
    checkResult();
    const storageData = getStorage();
    if (storageData !== null) {
        resultCount.winCount = storageData.winCount;
        resultCount.failCount = storageData.failCount;
        win.innerHTML = resultCount.winCount;
        fail.innerHTML = resultCount.failCount;
    }
}

resetBtn.addEventListener('click', function() {
    setTimeout(() => {
        localStorage.clear();
        location.reload();
    }, 50)
})

window.load = init();
