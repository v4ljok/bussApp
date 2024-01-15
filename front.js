const SERVER = "http://localhost:8080/";

let regionNames = [];
let stopNames = [];
let userlat, userlon;
let busesNames = [];
let stop_ids = [];
var myDiv = document.getElementById('myDiv');

(async function () {
    await getUserCoordinates();
    await getUserRegion();
    await getRegionData();
    await getStops();
    await getId();
    await getBuses();
    renderBussBtn();
})();

const getRegionData = async function () {
    const address = SERVER + "getArea";
    const result = await fetch(address);
    const data = await result.json();
    regionNames = data;
    $("#piirkond").autocomplete({
        source: regionNames,
    });
};

async function getUserCoordinates() {
    const address = await fetch("http://ip-api.com/json/?fields=lat,lon");
    coordinates = await address.json();
    userlat = coordinates.lat;
    userlon = coordinates.lon;
}

async function getUserRegion() {
    if (userlat && userlon) {
        const address = `${SERVER}getCoordinates/${userlat}/${userlon}`;
        const result = await fetch(address);
        const data = await result.json();
        $("#piirkond").val(data[0].stop_area);
        $("#peatus").val(data[0].stop_name);
    } else {
        console.error("Invalid lat or lon values");
    }
}

piirkondBtn.addEventListener("click", async function () {
    peatus.value = "";
    deleteBtns();
    await getStops();
});

peatusBtn.addEventListener("click", async function () {
    deleteBtns();
    await getId();
    await getBuses();
    renderBussBtn();
});

async function getStops() {
    const region = piirkond.value;
    const address = `${SERVER}getStops/${region}`;
    const result = await fetch(address);
    const data = await result.json();
    stopNames = data;
    $("#peatus").autocomplete({
        source: stopNames,
    });
}

async function getId() {
    const stop = peatus.value;
    const address = `${SERVER}getId/${stop}`;
    const result = await fetch(address);
    const data = await result.json();
    stop_ids = data;
}

async function getBuses() {
    deleteBtns();
    busesBtns.innerHTML += `<button class="btn btn-primary" disabled><span class="spinner-grow spinner-grow-sm"></span>Loading..</button>`
    const stopid = stop_ids;
    for (const id of stopid) {
        const address = `${SERVER}getBuses/${id}`;
        const result = await fetch(address);
        const data = await result.json();
        busesNames = busesNames.concat(data)
    }
}

function deleteBtns() {
    var container = document.getElementById('busesBtns');
    var container2 = document.getElementById('saabumisteBtns');

    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    while (container2.firstChild) {
        container2.removeChild(container2.firstChild);
    }
}

function renderBussBtn() {
    deleteBtns();
    let buses = [...new Set(busesNames)];
    buses.sort(function(a, b) {
        let numA = parseInt(a, 10) || 0;
        let numB = parseInt(b, 10) || 0;
    
        if (numA !== numB) {
            return numA - numB;
        }
    
        return a.localeCompare(b);
    });

    if (buses.length !== 0) {
        buses.forEach(
            (element) =>
                (busesBtns.innerHTML += `<button id="${element}" type="button" class="btn btn-primary m-1">${element}</button>`)
        );
    } else {
        busesBtns.innerHTML += `<button id="btn" type="button" class="btn btn-warning" disabled>Info busside kohta antud peatuses puudub</button>`;
    }
}

let previousBtn = '';
busesBtns.addEventListener('click', function(event) {

    if (event.target.tagName === 'BUTTON') {

        var buttonId = event.target.id;

        getSaabumised(buttonId);
    }
});

async function getSaabumised(id) {
    deleteSaabumised();
    saabumisteBtns.innerHTML += `<button class="btn btn-primary" disabled><span class="spinner-grow spinner-grow-sm"></span>Loading..</button>`
    const time = getTime();
    const stop = peatus.value;
    const address = `${SERVER}getSaabumised/${id}/${stop}/${time}`;
    const result = await fetch(address);
    const data = await result.json();
    deleteSaabumised();
    renderSaabumisteBtn(data);
}

function deleteSaabumised() {
    var container2 = document.getElementById('saabumisteBtns');
    
    while (container2.firstChild) {
        container2.removeChild(container2.firstChild);
    }
}

function getTime() {

    var currentDate = new Date();

    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();

    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    var currentTime = hours + ':' + minutes + ':' + seconds;

    return currentTime;
}

function renderSaabumisteBtn(time) {
    
    if (time.length) {

        time = time.slice(0, 5);
        time.forEach(
            (element) =>
                (saabumisteBtns.innerHTML += `<button id="btn" type="button" class="btn btn-primary m-1" disabled>${element}</button>`)
        );
    } else {
        saabumisteBtns.innerHTML += `<button id="btn" type="button" class="btn btn-warning" disabled>Info antud bussi lähimate saabumiste kohta puudub</button>`;
    }
}