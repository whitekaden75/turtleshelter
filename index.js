// the required libraries
let express = require("express");
let app = express();
let path = require("path");
const cors = require("cors");

let security = false;
let sudoSecurity = false;
const port = 3000;
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

//connecting it to PG
const knex = require("knex")({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "Suicidecraddle",
    database: "intex",
    port: 5432,
  },
});

app.get("/", (req, res) => res.render("index"));


app.get("/adminhome", (req, res) => {
  // Ensure the 'security' variable is being passed
  res.render("adminhome", { sudoSecurity, security });
});

app.get("/login", (req, res) => res.render("login"));

app.post("/login", async (req, res) => {
  const Username = req.body.Username;
  const Password = req.body.Password;

  try {
    const user = await knex("Admin")
      .select()
      .where("Username", Username)
      .andWhere("Password", Password)
      .first();

    if (user && user.UserTypeID == 1) {
      sudoSecurity = true;
      security = false;
    } else if (user) {
      security = true;
      sudoSecurity = false;
    } else {
      sudoSecurity = false;
      security = false;
    }

    res.redirect("/adminhome");
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Route to show the form for adding a new volunteer
app.get('/newvolunteer', (req, res) => {
  // Query to get the sewing levels
  knex('SewingLevel')  
      .select('SewingID', 'SewingLevel')
      .then(sewingLevels => {
          // Query to get the referral sources
          knex('ReferralSource')  
              .select('ReferralSourceID', 'ReferralSourceType')
              .then(referralSources => {
                  // Render the form and pass the fetched data to the template
                  res.render('newvolunteer', { sewingLevels, referralSources, successMessage: null });
              })
              .catch(error => {
                  console.error('Error fetching referral sources:', error);
                  res.status(500).send('Internal Server Error');
              });
      })
      .catch(error => {
          console.error('Error fetching sewing levels:', error);
          res.status(500).send('Internal Server Error');
      });
});

// Route to handle adding a new volunteer
app.post('/addvolunteer', (req, res) => {
  // Extract data from the form
  const VolFirstName = req.body.VolFirstName || '';
  const VolLastName = req.body.VolLastName || '';
  const VolEmail = req.body.VolEmail || '';
  const VolPhone = req.body.VolPhone || '';
  const HoursAvailable = req.body.HoursAvailable;
  const SewingID = parseInt(req.body.SewingID, 10); // Selected sewing level ID
  const ReferralSourceID = parseInt(req.body.ReferralSourceID, 10); // Selected referral source ID

  // Insert the new volunteer into the 'volunteers' table
  knex('Volunteer')  
      .insert({
          VolFirstName: VolFirstName.toUpperCase(),
          VolLastName: VolLastName.toUpperCase(),
          VolEmail: VolEmail,
          VolPhone: VolPhone,
          HoursAvailable: HoursAvailable,
          SewingID: SewingID,  // Store the sewing level ID
          ReferralSourceID: ReferralSourceID // Store the referral source ID
      })
      .then(() => {
          // Fetch sewing levels and referral sources to re-render the form
          knex('SewingLevel') 
              .select('SewingID', 'SewingLevel')
              .then(sewingLevels => {
                  knex('ReferralSource') 
                      .select('ReferralSourceID', 'ReferralSourceType')
                      .then(referralSources => {
                          res.render('newvolunteer', {
                              sewingLevels,
                              referralSources,
                              successMessage: 'New Volunteer Successfully Created!',
                              redirectTo: '/',
                          });
                      })
                      .catch(error => {
                          console.error('Error fetching referral sources:', error);
                          res.status(500).send('Internal Server Error');
                      });
              })
              .catch(error => {
                  console.error('Error fetching sewing levels:', error);
                  res.status(500).send('Internal Server Error');
              });
      })
      .catch(error => {
          console.error('Error adding volunteer:', error);
          res.status(500).send('Internal Server Error');
      });
});

// Route to view all volunteers
app.get('/viewvolunteers', (req, res) => {
  knex('Volunteer')
    .join('SewingLevel', 'SewingLevel.SewingID', '=', 'Volunteer.SewingID')
    .join('ReferralSource', 'ReferralSource.ReferralSourceID', '=', 'Volunteer.ReferralSourceID')
    .select('VolunteerID','VolFirstName', 'VolLastName', 'VolEmail', 'VolPhone', 'HoursAvailable', 'SewingLevel.SewingLevel', 'ReferralSource.ReferralSourceType', 'Volunteer.SewingID', 'Volunteer.ReferralSourceID')
    .then(volunteers => {
      res.render('viewvolunteers', { volunteers });
    })
    .catch(error => {
      console.error('Error fetching volunteers:', error);
      res.status(500).send('Internal Server Error');
    });
});
// Edit route (optional)
app.get('/editvolunteer/:id', (req, res) => {
  const volunteerID = req.params.id;
  knex('Volunteer')
    .join('SewingLevel', 'SewingLevel.SewingID', '=', 'Volunteer.SewingID')
    .join('ReferralSource', 'ReferralSource.ReferralSourceID', '=', 'Volunteer.ReferralSourceID')
    .select('VolunteerID','VolFirstName', 'VolLastName', 'VolEmail', 'VolPhone', 'HoursAvailable', 'SewingLevel.SewingLevel', 'ReferralSource.ReferralSourceType', 'Volunteer.SewingID', 'Volunteer.ReferralSourceID')
    .where('Volunteer.VolunteerID', volunteerID)
    .first()
    .then(Volunteer => {
      console.log(Volunteer);  // Log the data
      if (!Volunteer) {
        return res.status(404).send('Volunteer not found');
      }
      res.render('editvolunteer', { Volunteer });
    })
    .catch(error => {
      console.error('Error fetching volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/editvolunteer/:id', async (req, res) => {
  try {
    const id = req.params.id; // Get the VolunteerID from the URL
    const { VolFirstName, VolLastName, VolEmail, VolPhone, HoursAvailable, SewingID, ReferralSourceID } = req.body;

    // Update the volunteer's details in the database using knex
    await knex('Volunteer')
      .where('VolunteerID', id) // Ensure you're using the correct primary key
      .update({
        VolFirstName: VolFirstName.toUpperCase(),
        VolLastName: VolLastName.toUpperCase(),
        VolEmail,
        VolPhone,
        HoursAvailable,
        SewingID,
        ReferralSourceID,
      });

    // Redirect to the volunteer list page
    res.redirect('/viewvolunteers');
  } catch (err) {
    console.error('Error updating volunteer:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Delete route 
app.post('/deletevolunteer/:id', (req, res) => {
  const sewingID = req.params.id;
  knex('Volunteer')
    .where('SewingID', sewingID)
    .del()
    .then(() => {
      res.redirect('/viewvolunteers');  // Redirect to the volunteer list after deletion
    })
    .catch(error => {
      console.error('Error deleting volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

// View Event Request routes ------------------------
app.get('/viewEventRequests', (req, res) => {
  knex('EventRequests')
    .select()
    .then(events => {
      res.render('viewEventRequests', { events });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Reject an Event Request
app.post("/rejectRequest/:id", (req,res) => {
  knex("EventRequests").where("EventID", req.params.id).del()
  .then(requests => {
      res.redirect("/viewEventRequests");
  });
});

app.get('/reviewRequest/:eventID', (req, res) => {
  const eventID = req.params.eventID;
  // Fetch the event details from the database
  knex("EventRequests")
  .select()
  .where("EventID", eventID)
  .first()
  .then((request) => {
    knex("EventType")
    .select()
    .then(type => {
      res.render("reviewRequest", {type, request})
  });
  });
});

app.post('/reviewRequest', (req, res) => {
  const {
    finalEventDate, startTime, duration, address, city, state,
    firstName, lastName, phoneNumber, TypeID, shareStory, participants, TmNeeded, contactEmail, StatusID, groupName
  } = req.body;
  const EventID = parseInt(req.body.EventID, 10);

// Start a transaction
knex.transaction((trx) => {
  trx('Contact')
    .insert({
      ContactFirstName: firstName.toUpperCase(),
      ContactLastName: lastName.toUpperCase(),
      ContactPhone: phoneNumber,
      ContactEmail: contactEmail.toUpperCase(),
      GroupName : groupName.toUpperCase()
    })
    .returning('EventContactID') // Get the Contact ID
    .then(([contact]) => {
      if (!contact || !contact.EventContactID) {
        throw new Error('Error retrieving EventContactID');
      }

      // Insert into Events using the returned ContactID
      return trx('Events')
        .insert({
          EventDate: finalEventDate,
          StartTime: startTime,
          StatusID: StatusID,
          Duration: duration,
          EventAddress: address.toUpperCase(),
          EventCity: city.toUpperCase(),
          EventState: state.toUpperCase(),
          TypeID: TypeID,
          ExpectedParticipants: participants,
          TmNeeded: TmNeeded,
          JenStory: shareStory === 'on' ? true : false,
          EventContactID: contact.EventContactID // Use the Contact ID in the Events table
        });
    })
    .then(() => {
      // After inserting into Events, delete the corresponding record from EventRequests
      return trx('EventRequests')
        .where('EventID', EventID) // Assuming the EventID is passed from the form
        .del();
    })
    .then(() => {
      // Commit the transaction after successful deletion
      trx.commit();
      // Send success response with alert and redirect
      res.send(
        `<script>alert('Event successfully submitted!'); window.location.href = '/viewEventRequests';</script>`
      );
    })
    .catch((error) => {
      // In case of error, rollback the transaction
      trx.rollback();
      console.error(error);
      res.status(500).send('There was an error submitting the event.');
    });
  });
});

// Route to show the sign-up page with approved events
app.get('/signUp', (req, res) => {
  knex('Events')
    .join('Status', 'Events.StatusID', '=', 'Status.StatusID')
    .select()
    .where('Status.EventStatus', 'APPROVED')
    .then(events => {
      res.render('signUp', { events });
    })
    .catch(error => {
      console.error('Error fetching events:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Route to handle volunteer sign-ups for a specific event
app.post('/signUp/:id', (req, res) => {
  const eventId = req.params.id;
  
  knex('Events')
    .where('EventID', eventId)
    .select('TmSignedUp', 'TmNeeded')
    .then(event => {
      const eventData = event[0];

      // Check if the event has space for more volunteers
      if (eventData.TmSignedUp < eventData.TmNeeded) {
        // Update the TmSignedUp field
        knex('Events')
          .where('EventID', eventId)
          .update({
            TmSignedUp: eventData.TmSignedUp + 1
          })
          .then(() => {
            res.redirect('/signUp');
          })
          .catch(error => {
            console.error('Error signing up for the event:', error);
            res.status(500).send('Internal Server Error');
          });
      } else {
        res.status(400).send('No available slots for this event.');
      }
    })
    .catch(error => {
      console.error('Error fetching event data:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Route to display all events with optional status filtering
app.get('/viewAllEvents', (req, res) => {
  const statusFilter = req.query.status || ''; // Default to no filter

  // Build the base query
  const query = knex('Events')
    .join('Status', 'Events.StatusID', '=', 'Status.StatusID') // Join with Status table
    .join('Contact', 'Events.EventContactID', '=', 'Contact.EventContactID') // Join with Contact table
    .join('EventType', 'Events.TypeID', '=', 'EventType.TypeID') // Join with EventType table
    .modify((queryBuilder) => {
      if (statusFilter) {
        queryBuilder.where('Status.EventStatus', statusFilter); // Filter by EventStatus text
      }
    });

  // If "COMPLETED" status is selected, fetch additional columns
  if (statusFilter === 'COMPLETED') {
    query.select(
      'Events.EventID',
      'Contact.ContactFirstName',
      'Contact.ContactLastName',
      'Contact.ContactPhone',
      'Contact.GroupName',
      'Events.EventDate',
      'Events.EventAddress',
      'Events.EventCity',
      'Events.EventState',
      'Events.StartTime',
      'Events.Duration',
      'EventType.EventType',
      'Events.JenStory',
      'Events.ExpectedParticipants',
      'Events.ActualParticipants',
      'Events.Pockets',
      'Events.Vests',
      'Events.Collars',
      'Events.Envelopes',
      'Events.TotalProducts',
      'Events.TmNeeded',
      'Events.TmSignedUp',
      'Status.EventStatus'
    );
  } else {
    // For non-COMPLETED statuses, only select the basic columns
    query.select(
      'Events.EventID',
      'Contact.ContactFirstName',
      'Contact.ContactLastName',
      'Contact.ContactPhone',
      'Contact.GroupName',
      'Events.EventDate',
      'Events.EventAddress',
      'Events.EventCity',
      'Events.EventState',
      'Events.StartTime',
      'Events.Duration',
      'EventType.EventType',
      'Events.JenStory',
      'Events.ExpectedParticipants',
      'Status.EventStatus'
    );
  }

  // Execute the query
  query.then(events => {
    res.render('viewAllEvents', { events, selectedStatus: statusFilter });
  }).catch(error => {
    console.error('Error fetching events:', error);
    res.status(500).send('Internal Server Error');
  });
});

// edit Event route GET
app.get('/editEvent/:id', (req, res) => {
  const eventID = req.params.id; // Use EventID from the URL
  knex('Events')
      .join('Contact', 'Contact.EventContactID', '=', 'Events.EventContactID')
      .join('EventType', 'EventType.TypeID', '=', 'Events.TypeID')
      .join('Status', 'Status.StatusID', '=', 'Events.StatusID')
      .select()
      .where('Events.EventID', eventID) // Filter by EventID
      .then(event => {
          if (event.length > 0) {
              res.render('editEvent', { event: event[0] }); // Pass the first event to the template
          } else {
              res.status(404).send('Event not found');
          }
      })
      .catch(error => {
          console.error('Error fetching event:', error);
          res.status(500).send('Internal Server Error');
      });
});


// editEvent route POST
app.post('/editEvent/:id', async (req, res) => {
  try {
    const eventID = req.params.id; // Use EventID from the URL
    const {
      EventDate,
      EventAddress,
      EventCity,
      EventState,
      StartTime,
      Duration,
      JenStory,
      ExpectedParticipants,
      ActualParticipants,
      Pockets,
      Vests,
      Collars,
      Envelopes,
      TotalProducts,
      TmNeeded,
      TmSignedUp,
      StatusID,
      TypeID,
      EventContactID
    } = req.body;

    // Update the event details in the database using knex
    await knex('Events')
      .where('EventID', eventID)
      .update({
        EventDate,
        EventAddress,
        EventCity,
        EventState,
        StartTime,
        Duration,
        JenStory,
        ExpectedParticipants,
        ActualParticipants,
        Pockets,
        Vests,
        Collars,
        Envelopes,
        TotalProducts,
        TmNeeded,
        TmSignedUp,
        StatusID,
        TypeID,
        EventContactID,
      });

    // Redirect to the events list page
    res.redirect('/viewAllEvents');
  } catch (err) {
    console.error('Error updating event:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Event Request routes

app.get("/eventRequest", (req,res) => {
  knex("EventType")
  .select()
  .then(type => {
    res.render("eventRequest", {type})
  });
});

app.post("/eventRequest", (req, res) => {
  // Extract data from the form
  const proposedDate1 = req.body.proposedDate1 || null;
  const proposedDate2 = req.body.proposedDate2 || null;
  const proposedDate3 = req.body.proposedDate3 || null;
  let startTime = req.body.startTime;
  const duration = parseInt(req.body.duration, 10);
  const address = req.body.address;
  const city = req.body.city;
  const state = req.body.state;
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const phoneNumber = req.body.phoneNumber;
  const eventType = req.body.eventType;
  const shareStory = req.body.shareStory;
  const participants = parseInt(req.body.participants, 10);
  const ContactEmail = req.body.ContactEmail;
  const groupName = req.body.groupName

  // Append ":00" for seconds, if it's missing
  if (startTime && startTime.length === 5) {
    startTime += ":00"; // Add seconds
  }
  knex("EventRequests")
  .insert({
    EventDate1 : proposedDate1,
    EventDate2 : proposedDate2,
    EventDate3 : proposedDate3,
    StartTime : startTime,
    Duration : duration,
    EventAddress : address.toUpperCase(),
    EventCity : city.toUpperCase(),
    EventState : state.toUpperCase(),
    ContactFirstName : firstName.toUpperCase(),
    ContactLastName : lastName.toUpperCase(),
    ContactPhone : phoneNumber,
    EventType : eventType,
    JenStory : shareStory ? "true" : "false",
    Participants : participants,
    ContactEmail : ContactEmail,
    GroupName : groupName
  })
  .then(() => {
    res.redirect("/")
  })
});

// CONTACTS ------------
app.get("/manageContacts", (req, res) => {
  knex("Contact")
  .select()
  .then((contacts) => {
      res.render("manageContacts", { contacts })
  });
});

// Edit GET route 
app.get('/editContact/:id', (req, res) => {
  const EventContactID = req.params.id;
  knex('Contact')
    .select(
      'EventContactID',
      'ContactFirstName',
      'ContactLastName',
      'ContactPhone',
      'ContactEmail',
      'GroupName'
    )
    .where('EventContactID', EventContactID)
    .first()
    .then(contact => {
      res.render('editContact', { contact });
    })
    .catch(error => {
      console.error('Error fetching volunteer:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Edit POST route
app.post("/editContact/:id", (req, res) => {
  const ContactFirstName = req.body.ContactFirstName;
  const ContactLastName = req.body.ContactLastName;
  const ContactPhone = req.body.ContactPhone;
  const ContactEmail = req.body.ContactEmail;
  const GroupName = req.body.GroupName;
  const EventContactID = req.params.id; // Get the EventContactID from the URL parameter
  
  knex("Contact")
    .where("EventContactID", EventContactID)  // Specify which contact to update based on EventContactID
    .update({
      ContactFirstName: ContactFirstName,
      ContactLastName: ContactLastName,
      ContactPhone: ContactPhone,
      ContactEmail: ContactEmail,
      GroupName: GroupName
    })
    .then(() => {
      res.redirect("/manageContacts"); // Redirect to the contacts management page after updating
    })
    .catch((error) => {
      console.error('Error updating contact:', error);
      res.status(500).send('Internal Server Error');
    });
});

// Add Contact Get Route
app.get('/addContact', (req, res) => {
  res.render('addContact'); // Render the addContact page
});

app.post('/addContact', (req, res) => {
  const { ContactFirstName, ContactLastName, ContactPhone, ContactEmail, GroupName } = req.body;

  knex('Contact')
    .insert({
      ContactFirstName,
      ContactLastName,
      ContactPhone,
      ContactEmail,
      GroupName
    })
    .then(() => {
      res.redirect('/manageContacts'); // Redirect to the manage contacts page after adding
    })
    .catch((error) => {
      console.error('Error adding contact:', error);
      res.status(500).send('Internal Server Error');
    });
});


app.listen(port, () => console.log("listening"));

//  in terminal need to add npm install express knex pg cors

// const events = await knex('events').select('*');
// res.json(events);
