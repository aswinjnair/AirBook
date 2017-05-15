const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');
const APIAI_TOKEN = "411f0f79f5584f85b62c193ebc4275ce";
const API_KEY = "AIzaSyAo4DkMcfZ6eFnN0nY3_PiPtNF8ch5ffW4";


const apiai= require("apiai");
const apiaiApp= apiai(APIAI_TOKEN);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

app.get('/webhook', (req, res) => {
  if (req.query['hub.mode'] && req.query['hub.verify_token'] === 'tuxedo_cat') {
    res.status(200).send(req.query['hub.challenge']);
  } else {
    res.status(403).end();
  }
});

/* Handling all messenges */
app.post('/webhook', (req, res) => {
  console.log(req.body);
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text) {
          sendMessage(event);
        }
      });
    });
    res.status(200).end();
  }
});




function sendMessage(event) {
  let sender = event.sender.id;
  let text = event.message.text;

  let apiai = apiaiApp.textRequest(text, {
    sessionId: 'tabby_cat'
  });

  apiai.on('response', (response) => {
    console.log(response)
    let aiText = response.result.fulfillment.speech;

    request({
      url: 'https://graph.facebook.com/v2.6/me/messages',
      qs: {access_token: "EAAFumyClZAYoBANRAE3ayTQxwI2fTtGvuVrCmWMatwLAZAKJdlqXbZCV1Nozfrzt6SkIRaUFZAaJ6cw54kTYfPGizXlRRhqk5Gfz0QPjlfij5JsQuu2DezsvzePsftZCd5IHJOaRdz7Ek4KQhTmrBRsZCixtNHxF7JwzTlyktXZCw0kDTNrAJXD"},
      method: 'POST',
      json: {
        recipient: {id: sender},
        message: {text: aiText}
      }
    }, (error, response) => {
      if (error) {
          console.log('Error sending message: ', error);
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
      }
    });
  });

  apiai.on('error', (error) => {
    console.log(error);
  });

  apiai.end();