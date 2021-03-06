// const { update } = require('immutable');
const { Map, List, set } = require('immutable');

let store = Map({
    roverNames: List(['Curiosity', 'Opportunity', 'Spirit']),
    selectedRover: 'Curiosity',
    rovers: Map({}),
});

const updateStore = function (state, newState) {
    store = state.merge(newState);
    render(root, store);
};

// ------------------------------------------------------  API CALLS
const getRoverData = (rover_name) => {
    fetch(`http://localhost:3000/rovers/${rover_name}`)
        .then((res) => res.json())
        .then(({ photo_manifest }) => {
            updateStore(store, {
                rovers: set(store.toJS().rovers, rover_name, {
                    launch_date: photo_manifest.launch_date,
                    landing_date: photo_manifest.landing_date,
                    name: photo_manifest.name,
                }),
            });
        });
};

const getLatestRoverPhotos = async (rover_name) => {
    try {
        fetch(`http://localhost:3000/rover_photo/${rover_name}`)
            .then((res) => res.json())
            .then((data) => {
                const trimPhoto = data.latest_photos.slice(0, 1);
                updateStore(store, {
                    rovers: {
                        [rover_name]: set(
                            store.toJS().rovers[rover_name],
                            'photo',
                            trimPhoto
                        ),
                    },
                });
            });
    } catch (errr) {
        console.log('get latest rover photos error', err);
    }
};

// add our markup to the page
const root = document.getElementById('root');

const render = async (root, state) => {
    root.innerHTML = App(state);
};

// update the current rover by selecting on Navbar item
function onSelectNav(rover) {
    updateStore(store, { selectedRover: rover });
}
window.onSelectNav = onSelectNav;

const NavBar = (roverNames, selectedRover) => {
    return `
    <nav id="navbar">
    ${roverNames
        .map(
            (rover) =>
                `<a class="navbar-item ${
                    rover === selectedRover ? 'active' : ''
                }" id=${rover} onclick="onSelectNav(id)">${rover}</a>`
        )
        .join('')}
    </nav>
    `;
};

const App = (state) => {
    let { roverNames, rovers, selectedRover } = state.toJS();

    return `
        <header>${NavBar(roverNames, selectedRover)}</header>
            <main>
            <h1 class="greeting">Welcome to check the general infomation of Mars rovers</h1>
            <section>
                ${RoverData(rovers, selectedRover)}
            </section>
                </main>
        <footer>
        <p>This website is made by <span id="heart">&#9829;</span> and based on NASA open API service (<a href="https://api.nasa.gov/" target="_blank">https://api.nasa.gov/)</a></p> 
        <p>Developed and maintainedby Eric Zhao(github id: <a href="https://github.com/froliceric0914" target="_blank">froliceric0914</a>)</p>
        </footer>`;
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

// ------------------------------------------------------  COMPONENTS

const LatestRoverPhoto = (rover_name, rovers) => {
    const selectedRoverPhotos = rovers[rover_name].photo;

    if (!selectedRoverPhotos) {
        //call the photo api
        getLatestRoverPhotos(rover_name);

        return `
        <section>
            <div> Loading Photos... </div>
        </section>`;
    }

    return `
            <section class="photos-container">
                <p>Check the latest photo taken by the rover ${rover_name}:</p>
                <div>
                    ${selectedRoverPhotos
                        .map(
                            (photo) =>
                                `
                                <div class="rover-img-wrapper">
                                    <img class="rover-img" src=${photo.img_src} />
                                    <div>This photo was taken on earth day of ${photo.earth_date}</div>
                                </div>
                               `
                        )
                        .join('')}
                </div>
            </section>
        `;
};

const RoverData = (rovers, selectedRover) => {
    const rover = Object.keys(rovers).find((rover) => rover === selectedRover);
    const roverToRender = rovers[rover];

    if (!rover) {
        //call get rover data api
        getRoverData(selectedRover);
        return `
        <section>
            <div> Loading infomation of rover ${selectedRover}... </div>
        </section>`;
    }

    return `<section>
        <div class="dashboard"> 
            <div class="rover-info">
                ${LatestRoverPhoto(selectedRover, rovers)}
                <p>Rover Name: ${rover}</p>
                <p>Launch date: ${roverToRender.launch_date}</p>
                <p>Landing date: ${roverToRender.landing_date}</p>
            </div>
        </div>
    </section>`;
};
