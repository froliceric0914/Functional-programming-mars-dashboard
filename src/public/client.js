// const { update } = require('immutable');
// const { set } = require('immutable');
// import './assets/stylesheets/resets.css';
// import './assets/stylesheets/index.css';
// import img from './assets/images/milky-way.jpeg';

let store = {
    user: { name: 'Student' },
    apod: '',
    roverNames: ['Curiosity', 'Opportunity', 'Spirit'],
    selectedRover: 'Curiosity',
    rovers: {},
    photos: {},
};
/* immutable state
let store = Immutable.Map({
    user: Immutable.Map({
        name: 'Student: Eric Zhao',
    }),
    apod: '',
    rovers: Immutable.List(['Curiosity', 'Opportunity', 'Spirit']),
    selectedRover: 'Curiosity',
    photo: '',
});

const updateState = function (state, newState) {
    (store = state.merge(newState)), render(root, store);
};
*/
// add our markup to the page

const root = document.getElementById('root');

//could be updated to immutable way
const updateStore = (store, newState) => {
    store = Object.assign(store, newState);
    render(root, store);
};

const render = async (root, state) => {
    root.innerHTML = App(state);
};

// create content

function onSelectNav(rover) {
    updateStore(store, { selectedRover: rover });
}
window.onSelectNav = onSelectNav;

const NavBar = (roverNames, selectedRover) => {
    //update the roveName by clicking

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

/* main part to be updated*/
const App = (state) => {
    // console.log('app state', state);

    let { roverNames, rovers, selectedRover, photos } = state;

    return `
        <header>${NavBar(roverNames, selectedRover)}</header>
        <main>
            ${Greeting(store.user.name)}
            <section>
                <h3>Put things on the page!</h3>
                <p>Here is an example section.</p>
                <p>
                    One of the most popular websites at NASA is the Astronomy Picture of the Day. In fact, this website is one of
                    the most popular websites across all federal agencies. It has the popular appeal of a Justin Bieber video.
                    This endpoint structures the APOD imagery and associated metadata so that it can be repurposed for other
                    applications. In addition, if the concept_tags parameter is set to True, then keywords derived from the image
                    explanation are returned. These keywords could be used as auto-generated hashtags for twitter or instagram feeds;
                    but generally help with discoverability of relevant imagery.
                </p>
                ${RoverData(rovers, selectedRover, photos)}
                </section>
                </main>
                <footer></footer>
                `;
    // ${ImageOfTheDay(apod)}

    /* <div>${LatestRoverPhotos(rovers, photos)}</div> */
};

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    render(root, store);
});

// ------------------------------------------------------  COMPONENTS

// Pure function that renders conditional information -- THIS IS JUST AN EXAMPLE, you can delete it.
const Greeting = (name) => {
    if (name) {
        return `
            <h1>Welcome, ${name}!</h1>
        `;
    }

    return `
        <h1>Hello!</h1>
    `;
};

//could add selectRover into the params
//get he launch date, landing date, name and status along with any other information about the rover.
//call the photo API
const RoverData = (rovers, selectedRover, photos) => {
    const rover = Object.keys(rovers).find((rover) => rover === selectedRover);
    //why need photos here? cuz the latest photo function will update the photo
    let roverToRender = store.rovers[rover];
    if (!rover) {
        getRoverData(selectedRover);
    }
    if (roverToRender) {
        return `<section>
        <div>      
        <p>Rover Name: ${rover}</p>
        <p>Launch date: ${roverToRender.launch_date}</p>
        <p></p>Landing date: ${roverToRender.landing_date}</p>
        </div>
        <div>${LatestRoverPhoto(roverToRender.name, photos)}</div>
    </section>`;
    }
    return `
        <section>
            <div> Loading infomation of rover ${selectedRover}... </div>
        </section>`;
};

const LatestRoverPhoto = (rover_name, photos) => {
    const roverPhoto = Object.keys(photos).find((key) => key === rover_name);

    if (!roverPhoto) {
        getLatestRoverPhotos(rover_name);
    }

    const selectedRoverPhotos = store.photos[rover_name];

    if (selectedRoverPhotos) {
        return `
            <section>
                <p>Check out some of ${rover_name}'s most recent photo:</p>
                <div class="photos">
                    ${selectedRoverPhotos
                        .map(
                            (photo) =>
                                `
                                <div>
                                    <img class="rover-img" src=${photo.img_src} width="300px" />
                                    <div>This photo was taken on earth day of ${photo.earth_date}</div>
                                </div>`
                        )
                        .join('')}
                </div>
            </section>
        `;
    }

    return `
        <section>
            <div> Loading Photos... </div>
        </section>`;
};

// ------------------------------------------------------  API CALLS

//add rover photo API call method
/*
1. get rover data
2. get latest rover photo
...
could be removed into helper function
need to be put on the 
*/

const getRoverData = (rover_name) => {
    //axios?
    //could add dev/prod env to decide on the fetch ip
    fetch(`http://localhost:3000/rovers/${rover_name}`)
        .then((res) => res.json())
        .then(({ photo_manifest }) => {
            //now everything are stored in store.rovers, but the values could be store in store[keys]
            updateStore(store, {
                rovers: {
                    ...store.rovers,
                    [rover_name]: {
                        launch_date: photo_manifest.launch_date,
                        landing_date: photo_manifest.landing_date,
                        name: photo_manifest.name,
                    },
                },
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
                    photos: {
                        ...store.photos,
                        [rover_name]: trimPhoto,
                    },
                });
            });
    } catch (errr) {
        console.log('get latest rover photos error', err);
    }
};

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state;

    fetch(`http://localhost:3000/apod`)
        .then((res) => res.json())
        .then((apod) => updateStore(store, { apod }));

    return data;
};

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    // If image does not already exist, or it is not from today -- request it again
    const today = new Date();
    const photodate = new Date(apod.date);
    console.log(photodate.getDate(), today.getDate());

    console.log(photodate.getDate() === today.getDate());
    if (!apod || apod.date === today.getDate()) {
        getImageOfTheDay(store);
    }

    // check if the photo of the day is actually type video!
    if (apod.media_type === 'video') {
        return `
            <p>See today's featured video <a href="${apod.url}">here</a></p>
            <p>${apod.title}</p>
            <p>${apod.explanation}</p>
        `;
    } else {
        return `
            // <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `;
    }
};
