const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const axios = require('axios');
const { body, param, validationResult } = require('express-validator');


// Middleware to check if the user is an admin or manager
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && (req.user.type === 'admin' || req.user.type === 'manager')) {
    console.log("IS ADMIN");
    return next();
  }
  console.log("IS NOT ADMIN");
  console.log(req.user.type);
  return res.status(403).send('Forbidden');
}

// Middleware to parse JSON bodies
router.use(bodyParser.json());

// Fetch events
router.get('/fetchevent', (req, res) => {
  const query = 'SELECT * FROM Events INNER JOIN Address ON Events.AddressID = Address.AddressID';
  req.pool.query(query, (error, results) => {

    console.log(results);

    if (error) {
      console.error('Failed to fetch events:', error);
      res.status(500).send('Failed to fetch events');
      return;
    }
    res.json(results);
  });
});

// Add event
router.post('/addevent', isAdmin,

  [
    body('address').trim().escape().not().isEmpty(),
    body('street_address').trim().escape().not().isEmpty(),
    body('city').trim().escape().not().isEmpty(),
    body('state').trim().escape().not().isEmpty(),
    body('postcode').trim().escape().not().isEmpty(),
    body('date').trim().escape().not().isEmpty(),
    body('start').trim().escape().not().isEmpty(),
    body('end').trim().escape().not().isEmpty(),
    body('title').trim().escape().not().isEmpty(),
    body('description').trim().escape().not().isEmpty(),
    body('branchID').trim().escape().not().isEmpty()
  ],

  (req, res) => {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Inputs. Try Again").status(400);
      return;
    }

  const eventData = req.body;
  const now = eventData.date + ' ' + eventData.start + ':00';
  const end = eventData.date + ' ' + eventData.end + ':00';

  console.log("NOW: ", eventData);

  console.log("LATER: ", end);

  console.log("LATER: ", end);

  const query1 = `
  INSERT INTO Address (HouseNumber, StreetName, City, State, Postcode)
  VALUES (?, ?, ?, ?, ?)
`;

  const locationParams = [
    eventData.address,
    eventData.street_address,
    eventData.city,
    eventData.state,
    eventData.postcode
  ];


  const query = `
    INSERT INTO Events (EventName, EventDescription, AttendeeLimit, Visibility, BranchID, EventTimestamp, EventEndTimestamp, AddressID)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;


  req.pool.getConnection(function(err, connection) {
    if (err) {
      console.log(err);
      res.sendStatus(500);
      return;
    }

    req.pool.query(query1, locationParams, (error, results) => {
      if (error) {
        console.error('Failed to add event:', error);
        res.status(500).send('Failed to add event');
        return;
      }

      const addressID = results.insertId;

      const params = [
        eventData.title,
        eventData.description,
        100,
        0,
        eventData.branchID,
        now,
        end,
        addressID
      ];


      req.pool.query(query, params, (err, result) => {
        if (err) {
          console.error('Failed to add event:', err);
          res.status(500).send('Failed to add event');
          return;
        }

          var queryEmail = 'SELECT EmailAddress FROM User WHERE ReceiveEmailEvents = true AND BranchID = ?';

          req.pool.query(queryEmail, eventData.branchID, function(err, result) {
            connection.release();

            var email = [];

            if(result !== null) {
              var d = result;
              for(let i = 0; i < d.length; i++) {
                email.push(d[i].EmailAddress);
              }
              // email.push("test");
              console.log("THIS IS EMAILS", email);

              var sendingData = {
                emails: email,
                subject: eventData.title,
                text: eventData.description,
                timestamp: now
              };


              console.log(sendingData);

              axios.post('http://localhost:8080/contact/events', sendingData)
                .then(response => {
                    console.log("Axios response: ", response.data);
                    res.send(response.data);
                }).catch (error => {
                    console.log(error);
                    res.status(500);
              });

            }

          });




        // res.send("Successfully added");
      });


      // connection.release();
    });
  });
});

router.post('/rsvp', (req, res) => {
  const { eventID, isAttending } = req.body;
  const userID = req.user.id;

  if (isAttending) {
    const rsvpQuery = `
      INSERT INTO EventUserLink (UserID, EventID)
      VALUES (?, ?)
    `;
    req.pool.query(rsvpQuery, [userID, eventID], (rsvpError) => {
      if (rsvpError) {
        console.error('Failed to add RSVP:', rsvpError);
        res.status(500).send('Failed to update RSVP status');
        return;
      }
      res.status(200).send('RSVP status updated');
    });
  } else {
    const rsvpDeleteQuery = `
      DELETE FROM EventUserLink
      WHERE EventID = ? AND UserID = ?
    `;
    req.pool.query(rsvpDeleteQuery, [eventID, userID], (rsvpDeleteError) => {
      if (rsvpDeleteError) {
        console.error('Failed to delete RSVP:', rsvpDeleteError);
        res.status(500).send('Failed to update RSVP status');
        return;
      }
      res.status(200).send('RSVP status updated');
    });
  }
});

router.delete('/rsvp/:eventID',

  [
    param('eventID').trim().escape().not().isEmpty()
  ],

  (req, res) => {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Inputs. Try Again").status(400);
      return;
    }

  const eventID = req.params.eventID;
  const userID = req.user.id;

  const rsvpDeleteQuery = `
    DELETE FROM EventUserLink
    WHERE EventID = ? AND UserID = ?
  `;
  req.pool.query(rsvpDeleteQuery, [eventID, userID], (rsvpDeleteError) => {
    if (rsvpDeleteError) {
      console.error('Failed to delete RSVP:', rsvpDeleteError);
      res.status(500).send('Failed to delete RSVP');
      return;
    }
    res.status(200).send('RSVP deleted successfully');
  });
});

router.get('/rsvped-events', (req, res) => {
  const userID = req.user.id;
  const query = `
    SELECT * FROM Events
    JOIN EventUserLink ON Events.EventID = EventUserLink.EventID
    WHERE EventUserLink.UserID = ?
  `;

  req.pool.query(query, [userID], (error, results) => {
    if (error) {
      console.error('Failed to fetch RSVPed events:', error);
      res.status(500).send('Failed to fetch RSVPed events');
      return;
    }

    res.json(results);
  });
});

router.put('/editevent/:eventID', isAdmin,

  [
    body('address').trim().escape().not().isEmpty(),
    body('street_address').trim().escape().not().isEmpty(),
    body('city').trim().escape().not().isEmpty(),
    body('state').trim().escape().not().isEmpty(),
    body('postcode').trim().escape().not().isEmpty(),
    body('title').trim().escape().not().isEmpty(),
    body('description').trim().escape().not().isEmpty(),
  ],

  (req, res) => {

    if(!validationResult(req).isEmpty()) {
      res.send("Invalid Inputs. Try Again").status(400);
      return;
    }

  const eventID = req.params.eventID;
  const eventData = req.body;
  const now = eventData.date + ' ' + eventData.start + ':00';
  const end = eventData.date + ' ' + eventData.end + ':00';

  console.log("NOW: ", eventData);

  console.log("LATER: ", end);


  console.log("THIS IS EVENT: ", req.body);

  const query1 = `UPDATE Address INNER JOIN Events ON Address.AddressID = Events.AddressID SET Address.HouseNumber = ?, Address.StreetName = ?, Address.City = ?, Address.State = ?, Address.Postcode = ? WHERE Events.EventID = ?`;

  // const query2 = `
  //   INSERT INTO Events (EventName, EventDescription, AttendeeLimit, Visibility, BranchID, EventTimestamp, EventEndTimestamp, AddressID)
  //   VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  // `;


  const query = `
    UPDATE Events
    SET EventName = ?, EventDescription = ?, AttendeeLimit = ?, Visibility = ?, EventTimestamp = ?, EventEndTimestamp = ?
    WHERE EventID = ?
  `;


  const addressParams = [
    eventData.address,
    eventData.street_address,
    eventData.city,
    eventData.state,
    eventData.postcode,
    eventData.eventID
  ];



  const params = [
    eventData.title,
    eventData.description,
    100,
    1,
    now,
    end,
    eventData.eventID
    ];

    console.log("ADDRESS: ", params);
  req.pool.query(query1, addressParams, (error, results) => {
    if (error) {
      console.error('Failed to edit event:', error);
      res.status(500).send('Failed to edit event');
      return;
    }

    req.pool.query(query, params, (err, result) => {
      if (err) {
        console.error('Failed to edit event:', err);
        res.status(500).send('Failed to edit event');
        return;
      }

      res.status(200).send('Event updated successfully');
    });

  });
});

router.get('/fetchevent/:eventID', (req, res) => {

  const eventID = req.params.eventID;
  const query = 'SELECT * FROM Events WHERE EventID = ?';

  req.pool.query(query, [eventID], (error, results) => {
    if (error) {
      console.error('Failed to fetch event:', error);
      res.status(500).send('Failed to fetch event');
      return;
    }
    res.json(results[0]);
  });
});

router.get('/fetcheventuser:/eventID', (req, res) => {


  const eventID = req.params.eventID;
  const query = `SELECT GivenName, LastName, EmailAddress FROM User INNER JOIN EventsUserLink ON User.UserID = EventsUserLink.UserID
  WHERE EventID = ?`;

  req.pool.query(query, [eventID], (error, results) => {
    if (error) {
      console.error('Failed to fetch users:', error);
      res.status(500).send('Failed to fetch event');
      return;
    }

    res.json(results[0]);
  });
});

module.exports = router;