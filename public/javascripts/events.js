  let events = [];

  document.addEventListener('DOMContentLoaded', function() {
    const user = {
      type: "",
      id: null
    };

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const userData = JSON.parse(xhr.responseText);
          user.type = userData.UserType;
          user.id = userData.UserID;

          if (user.type === 'admin' || user.type === 'manager') {
            document.getElementById('create-event-button').style.display = 'flex';
            document.getElementById('edit-event-button').style.display = 'flex';
          }

          loadEvents();
        } else {
          console.error("There was a problem with the request:", xhr.status);
        }
      }
    };

    xhr.open("GET", "/users/user", true);
    xhr.send();
  });
  function loadEvents() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const events = JSON.parse(this.responseText);
        //console.log(events);
        const eventContainer = document.getElementById('event-container');
        eventContainer.innerHTML = '';

        const rsvpXhttp = new XMLHttpRequest();
        rsvpXhttp.onreadystatechange = function() {
          if (this.readyState == 4 && this.status == 200) {
            const rsvpedEvents = JSON.parse(this.responseText);
            const rsvpedEventIDs = new Set(rsvpedEvents.map(event => event.EventID));

            events.forEach(event => {
              const eventElement = document.createElement('div');
              eventElement.classList.add('event');
              eventElement.dataset.id = event.EventID;
              event.rsvpStatus = rsvpedEventIDs.has(event.EventID);
              var [eventDate, eventStart] = event.EventTimestamp.split('T');
              var [eventDate2, eventEnd] = event.EventEndTimestamp.split('T');

              var [eventStartTime, extra] = eventStart.split('.');
              var [eventEndTime, extra2] = eventEnd.split('.');

              var address = event.HouseNumber + ', ' + event.StreetName + ', ' + event.City + ', '
              + event.State + ', ' + event.Postcode;

              eventElement.innerHTML = `
                <h3>${event.EventName}</h3>
                <p>Date: ${eventDate || 'N/A'}</p>
                <p>Time: ${eventStartTime || 'N/A'} - ${eventEndTime || 'N/A'}</p>
                <p>Address: ${address || 'N/A'}</p>
                <p>Description: ${event.EventDescription}</p>
              `;

              eventElement.addEventListener('click', () => {
                showEventDetails(event);
              });

              eventContainer.appendChild(eventElement);
            });

            updateUsersEvents();
          }
        };
        rsvpXhttp.open('GET', '/event/rsvped-events', true);
        rsvpXhttp.send();
      }
    };
    xhttp.open('GET', '/event/fetchevent', true);
    xhttp.send();
  }




  function showEventDetails(event) {
    const modal = document.getElementById('modal-1');


    var [eventDate, eventStart] = event.EventTimestamp.split('T');
    var [eventDate2, eventEnd] = event.EventEndTimestamp.split('T');

    var [eventStartTime, extra] = eventStart.split('.');
    var [eventEndTime, extra2] = eventEnd.split('.');

    var address = event.HouseNumber + ', ' + event.StreetName + ', ' + event.City + ', '
    + event.State + ', ' + event.Postcode;

    const eventDetails = `
      <div class="modal-body" style="margin-top: 30px;">
        <div class="modal-header">
          <h3>${event.EventName} - EventID - ${event.EventID}</h3>
          <button type="button" onclick="closeModal('modal-1')">&cross;</button>
        </div>
        <img src="images/placeholder-events.png" alt="event picture" />
        <div class="modal-content">
          <h2>${event.EventName}</h2>
          <h3>Date: ${eventDate || 'N/A'}</h3>
          <h3>Time: ${eventStartTime || 'N/A'} - ${eventEndTime || 'N/A'}</h3>
          <h3>Address: ${address || 'N/A'}</h3>
          <p>${event.EventDescription}</p>
          <label class="rsvp-button">
            <input type="checkbox" onchange="rsvpEvent(${event.EventID}, this.checked)" ${event.rsvpStatus ? 'checked' : ''} />
            <svg width="27" height="26" viewBox="0 0 27 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M26 13C26 19.5922 20.4395 25 13.5 25C6.56053 25 1 19.5922 1 13C1 6.40782 6.56053 1 13.5 1C20.4395 1 26 6.40782 26 13Z" fill="white" stroke="#1848A8" stroke-width="2" class="button-indicator" />
            </svg>
            RSVP
          </label>
        </div>
      </div>
    `;
    modal.innerHTML = eventDetails;
    openModal('modal-1');

    // openEditModal(1);
  }




  function createEvent() {
    const title = document.getElementById('title-input').value;
    const date = document.getElementById('date-input').value;
    const start = document.getElementById('start-input').value;
    const end = document.getElementById('end-input').value;
    const address = document.getElementById('address-input').value;
    const street_address = document.getElementById('address-input-edit').value;
    const city = document.getElementById('city-input-edit').value;
    const state = document.getElementById('state-input-edit').value;
    const postcode = document.getElementById('postcode-input-edit').value;
    const description = document.getElementById('body-input-event').value;



    fetch("/users/user")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();

    })
    .then((userData) => {
      this.branch=userData.BranchID;
      this.role = userData.UserType;
      console.log(this.branch,userData.BranchID);



      const eventData = {
        title: title,
        date: date,
        start: start,
        end: end,
        address: address,
        street_address: street_address,
        city: city,
        state:state,
        postcode: postcode,
        description: description,
        branchID: userData.BranchID
      };

      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {
            console.log('Event added successfully');
            loadEvents();
          } else {
            console.error('Failed to add event');
          }
        }
      };
      xhttp.open('POST', '/event/addevent', true);
      xhttp.setRequestHeader('Content-Type', 'application/json');
      xhttp.send(JSON.stringify(eventData));
    })
    .catch((error) => {
      console.error("Fetch eroorr", error);
      throw new Error("Network response was not ok");
    });



  }

  function publishAndClose() {
    createEvent();
    closeModal('modal-2');
  }

  function EditAndClose() {
    updateEvent();
    closeModal('modal-3');
  }

  function rsvpEvent(eventID, isAttending) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          console.log('RSVP status updated');
          const event = events.find(event => event.EventID === eventID);
          if (event) {
            event.rsvpStatus = isAttending;
          }
          updateUsersEvents();
        } else {
          console.error('Failed to update RSVP status');
        }
      }
    };
    xhttp.open('POST', '/event/rsvp', true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify({ eventID, isAttending }));
  }

  function updateUsersEvents() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
        const rsvpedEvents = JSON.parse(this.responseText);
        const userEvents = document.getElementById('user-events');
        userEvents.innerHTML = '';

        // console.log(rsvpedEvents.EventEndTimestamp);

        // var eventDate = rsvpedEvents.EventTimestamp;


        rsvpedEvents.forEach(event => {
          const eventItem = document.createElement('div');
          eventItem.innerHTML = `
            <h3 class="title">${event.EventName}</h3>
          `;
          userEvents.appendChild(eventItem);
        });
      }
    };
    xhttp.open('GET', '/event/rsvped-events', true);
    xhttp.send();
  }

  function openEditModal(eventID) {
    const event = events.find(event => event.EventID === eventID);
    if (!event) return;

    const editModal = document.getElementById('modal-3');
    const title = document.getElementById('title-input').value;
    const date = document.getElementById('date-input').value;
    const start = document.getElementById('start-input').value;
    const end = document.getElementById('end-input').value;
    const address = document.getElementById('address').value;
    const street_address = document.getElementById('address-edit').value;
    const city = document.getElementById('city-edit').value;
    const state = document.getElementById('state-edit').value;
    const postcode = document.getElementById('postcode-edit').value;
    const description = document.getElementById('body-event').value;

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save Changes';
    saveButton.type = 'button';
    saveButton.classList.add('submit-btn');
    saveButton.onclick = function() {
      updateEvent(eventID);
      closeModal('modal-2');
    };

    const modalContent = editModal.querySelector('.modal-content');
    modalContent.appendChild(saveButton);

    openModal('modal-2');
  }

  function updateEvent() {

    fetch("/users/user")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();

    })
    .then((userData) => {

      console.log("Branch", userData.BranchID);

      this.branch=userData.BranchID;
      this.role = userData.UserType;
      console.log(this.branch,userData.BranchID);

    var id = document.getElementById('id-input').value;
    id = Number(id);

    const title = document.getElementById('title').value;
    const date = document.getElementById('date').value;
    const start = document.getElementById('start').value;
    const end = document.getElementById('end').value;
    const address = document.getElementById('address').value;
    const street_address = document.getElementById('address-edit').value;
    const city = document.getElementById('city-edit').value;
    const state = document.getElementById('state-edit').value;
    const postcode = document.getElementById('postcode-edit').value;
    const description = document.getElementById('body-event').value;

    const eventData = {
      eventID: id,
      title: title,
      date: date,
      start: start,
      end: end,
      address: address,
      street_address: street_address,
      city: city,
      state:state,
      postcode: postcode,
      description: description,
      BranchID: userData.BranchID
    };

    console.log(eventData);

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4) {
        if (this.status == 200) {
          console.log('Event updated successfully');
          loadEvents();
        } else {
          console.error('Failed to update event');
        }
      }
    };
    xhttp.open('PUT', `/event/editevent/${userData.BranchID}`, true);
    xhttp.setRequestHeader('Content-Type', 'application/json');
    xhttp.send(JSON.stringify(eventData));



    })
    .catch((err) => {
      console.log(err);
    });



    // openModal('modal-2');
  }


  function openModal(modalId, eventID="-1") {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
  }

  function deleteEvent(element) {
    element.parentElement.remove();
  }