require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');
// const browserify = require('browserify');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../public')));

// app.get('/app.js', browserify('../public/bundle.js'));

// your API calls
// app.get('/rovers/:rover_name', async (req, res) => {
//     try {
//         // const earth_date = req.query.max_date;

//         let rovers_img = await fetch(
//             `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rover_name}/photos?earth_date=2015-6-3&api_key=${process.env.API_KEY}`
//         ).then((res) => res.json());
//         console.log('hello world');
//         res.send(rovers_img);
//     } catch (err) {
//         console.log('error: ', err);
//     }
// });

app.get('/rovers/:rover_name', async (req, res) => {
    try {
        let rover = await fetch(`
        https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.rover_name}?api_key=${process.env.API_KEY}
        `).then((res) => res.json());

        res.send(rover);
    } catch (err) {
        console.log('error: ', err);
    }
});

app.get('/rover_photo/:rover_name', async (req, res) => {
    try {
        // const earth_date = req.query.max_date;

        let rovers_img = await fetch(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${req.params.rover_name}/latest_photos?api_key=${process.env.API_KEY}`
        ).then((res) => res.json());
        res.send(rovers_img);
    } catch (err) {
        console.log('error: ', err);
    }
});

// example API call
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(
            `https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`
        ).then((res) => res.json());
        res.send({ image });
    } catch (err) {
        console.log('error:', err);
    }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
