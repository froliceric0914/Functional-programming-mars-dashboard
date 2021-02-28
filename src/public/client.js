// const { update } = require('immutable');

let store = {
    user: { name: 'Student' },
    apod: '',
    roverName: ['Curiosity', 'Opportunity', 'Spirit'],
    rovers: {},
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

const LatestRoverPhotos = (rover_name, photos) => {
    const rover = Object.keys(photos).find((photo) => photo === rover_name);
    if (!rover) {
        getLatestRoverPhotos(rover_name);
    }

    const roverPhotos = store.photos[rover_name];
    return `<section>
        <div class="photos">
            ${roverPhotos.map(
                (photo) => `<img class="rover-img" src=${photo.img_src}>`
            )}
        </div>
    </section>`;
};

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

/* main part to be updated*/
const App = (state) => {
    let { rovers, apod } = state;

    return `
        <header></header>
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
                ${ImageOfTheDay(apod)}
                <div>${LatestRoverPhotos(rovers, photos)}</div>
            </section>
        </main>
        <footer></footer>
    `;
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

// Example of a pure function that renders infomation requested from the backend
const ImageOfTheDay = (apod) => {
    console.log('apod', apod);
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
            <img src="${apod.image.url}" height="350px" width="100%" />
            <p>${apod.image.explanation}</p>
        `;
    }
};

// ------------------------------------------------------  API CALLS

// Example API call
const getImageOfTheDay = (state) => {
    let { apod } = state;
    console.log('state', state);

    fetch(`http://localhost:3000/apod`)
        .then((res) => res.json())
        .then((apod) => updateStore(store, { apod }));

    return data;
};

//add rover photo render method
/*
1. get rover data
2. get latest rover photo
*/

// const getRoverData = (rover_name) => {
//     //axios?
//     //could add dev/prod env to decide on the fetch ip
//     fetch(`http://localhost:3000/rovers/${rover_name}`)
//         .then((res) => res.json())
//         .then((data) => {
//             console.log('rover data', data);
//             updateStore(store, {
//                 ...,
//             })
//         });
// };

const getLatestRoverPhotos = async (rover_name) => {
    try {
        fetch(`http://localhost:3000/rover_photos/${rover_name}`)
            .then((res) => res.json())
            .then(({ latest_photo, ...props }) => {
                console.log('hello res.props', props);
                updateStore(store, {
                    photos: {
                        ...store.photos,
                        [rover_name]: [...latest_photos],
                    },
                });
            });
    } catch (errr) {
        console.log('get latest rover photos error', err);
    }
};
