/* eslint-disable max-len */
'use strict';

const fetch = require('node-fetch');
const aws = require('aws-sdk');

const names = [ 'ספיידרמן: אין דרך הביתה', 'התיבה ךרד ןיא :ןמרדייפס' ];

exports.handler = async () => {
    const response = await fetch('https://www.yesplanet.co.il/il/data-api-service/v1/10100/trailers/byCinemaId/1072');
    const json = await response.json();
    const movies = json.body;
    const movie = movies?.find(m =>
        names.includes(m.filmName)
        || m.filmLink.includes('spiderman')
        || m.filmLink.includes('spider-man')
        || m.filmId === '4601s2r',
    );
    const movieName = 'Spider-man No Way Home';
    const log = {
        'Movie Name': movieName,
        'Available for pre-order': !!movie,
        ...(movie && { 'Link': movie.filmLink, 'Location': 'Yes Planet' }),
    };

    const ses = new aws.SES();
    const params = {
        Destination: {
            ToAddresses: [ process.env.TO_ADDRESS ],
        },
        Message: {
            Body: {
                Text: { Data: JSON.stringify(log) },
            },
            Subject: { Data: `* 🚨 Hurry up! ${movieName} tickets goes on sale! 🚨 *` },
        },
        Source: process.env.FROM_ADDRESS,
    };

    console.log('%j', log);
    return movie ? ses.sendEmail(params).promise() : null;
};
