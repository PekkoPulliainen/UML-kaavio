let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");
let logInButton = document.getElementById("logIn");
let logOutButton = document.getElementById("logOut");
let userNameText = document.getElementById("userNameText");
let createPollButton = document.getElementById("createPoll");
let loggedIn = false;

function showLoginForm() {
  document.getElementById("authModalLabel").innerText = "Kirjaudu";
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  modal = new bootstrap.Modal(document.getElementById("authModal"), {
    backdrop: false,
  });

  blurBackground();

  modal.show();
}

function showRegisterForm() {
  document.getElementById("authModalLabel").innerText = "Rekisteröidy";
  loginForm.style.display = "none";
  registerForm.style.display = "block";
  modal = new bootstrap.Modal(document.getElementById("authModal"), {
    backdrop: false,
  });

  blurBackground();

  modal.show();
}

function showPollForm() {
  let modal = new bootstrap.Modal(document.getElementById("pollForm"));
  modal.show();

  document
    .getElementById("pollForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      savePoll();
      modal.hide();
      voteButton.style.display = "block";
    });
}

function savePoll() {
  let title = document.getElementById("pollTitle").value;
  let description = document.getElementById("pollDescription").value;
  let options = [
    document.getElementById("option1").value,
    document.getElementById("option2").value,
    document.getElementById("option3").value,
    document.getElementById("option4").value,
    document.getElementById("option5").value,
  ].filter((opt) => opt.trim() !== "");

  let poll = { title, description, options };
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  polls.push(poll);
  localStorage.setItem("polls", JSON.stringify(polls));
  displayPolls();
}

function displayPolls() {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let container = document.querySelector(".container.mt-5 .row");
  container.innerHTML = "";

  polls.forEach((poll, index) => {
    let pollHTML = `
      <div class="col border border-dark">
        <div class="card">
          <div class="card-body">
            <div class="row border-bottom border-dark mb-3">
              <button onclick="removePoll(${index})" class="removePollButton btn btn-dark bg-transparent col-1" name="removePoll" style="display:none">X</button>
              <div class="card-body-middle col pb-3">
                <h5 class="card-title text-center fw-bold">${poll.title}</h5>
                <p class="card-text text-center">${poll.description}</p>
              </div>
            </div>
            ${poll.options
              .map(
                (option, i) => `
              <div class="form-check">
                <input class="form-check-input" type="radio" name="poll${index}" id="option${index}-${i}">
                <label class="form-check-label" for="option${index}-${i}">
                  ${option}
                </label>
              </div>
            `
              )
              .join("")}
              <div class="row m-0 p-0 mt-3 border-top border-dark">
                <label id="logInToSee" class="logInToSee text-white mt-3 text-center">Kirjaudu sisään äänestääksesi</label>
                <button onclick="vote(${index})" class="voteButton btn btn-dark mt-3" style="display:none">Äänestä</button>
              </div>
          </div>
        </div>
      </div>`;

    container.insertAdjacentHTML("beforeend", pollHTML);
  });
  checkAdmin();
}

function checkAdmin() {
  let username = document.getElementById("userNameText").innerText;
  let users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[username] && users[username].isAdmin) {
    console.log("Welcome admin!");
    document
      .getElementsByName("removePoll")
      .forEach((btn) => (btn.style.display = "inline"));
  }
}

function vote(index) {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let selectedOption = document.querySelector(
    `input[name='poll${index}']:checked`
  );
  if (!selectedOption) {
    alert("Valitse vaihtoehto ennen äänestämistä!");
    return;
  }

  let selectedIndex = parseInt(selectedOption.id.split("-")[1]);

  let votes = JSON.parse(localStorage.getItem("votes")) || {};
  if (!votes[index]) {
    votes[index] = new Array(polls[index].options.length).fill(0);
  }

  votes[index][selectedIndex] += 1;

  console.log("Ääniä +1 kohdassa ", votes[index]);

  localStorage.setItem("votes", JSON.stringify(votes));

  displayResults(index);
}

function displayResults(index) {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let votes = JSON.parse(localStorage.getItem("votes")) || {};

  if (!votes[index]) {
    return; // No votes yet
  }

  let pollCard = document.querySelectorAll(".col.border.border-dark")[index];
  let optionsContainer = pollCard.querySelector(".card-body");

  // Remove existing voting elements
  let voteButton = pollCard.querySelector(".voteButton");
  let formChecks = pollCard.querySelectorAll(".form-check");

  if (voteButton) voteButton.remove();
  formChecks.forEach((el) => el.remove());

  // Calculate total votes
  let totalVotes = votes[index].reduce((sum, count) => sum + count, 0) || 1;

  let resultsHTML = `<h6 class="fw-bold mt-3"></h6>`;

  polls[index].options.forEach((option, i) => {
    let count = votes[index][i] || 0;
    let percentage = ((count / totalVotes) * 100).toFixed(1);

    resultsHTML += `
      <div class="mt-2">
  <div class="progress row d-flex flex-column"; background-color: #6c757d;"> <!-- Dark Gray Background -->
    <label class="progress-bar bg-dark text-white text-center" role="progressbar" 
           style="width: ${percentage}%; min-width: 15%; max-width: 100%;" 
           aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
      ${option}
    </label>
    <div class="progress-bar bg-dark text-white text-center fw-bold" role="progressbar" 
         style="width: ${percentage}%; min-width: 15%; max-width: 100%;" 
         aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
      ${percentage}% (${count})
    </div>
    </div>
  </div>

    `;
  });

  // Create a single total votes button below the results
  let totalVotesHTML = `
    <div class="row m-0 p-0 mt-3 border-top border-dark d-flex justify-content-end">
      <div class="totalVotes d-flex flex-column align-items-center border border-1 rounded border-white mt-3 h-75 p-2" style="width: 100px;">
        <span class="fw-bold">Ääniä:</span>
        <span>${totalVotes}</span>
      </div>
    </div>
    `;

  let resultsDiv = document.createElement("div");
  resultsDiv.classList.add("vote-results", "mt-3");
  resultsDiv.innerHTML = resultsHTML + totalVotesHTML; // Append total votes here

  // Remove extra border-top if it exists
  let borderDiv = pollCard.querySelector(".border-top");
  if (borderDiv) borderDiv.remove();

  // Append results where the vote options used to be
  optionsContainer.appendChild(resultsDiv);
}

function removePoll(index) {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  polls.splice(index, 1);
  localStorage.setItem("polls", JSON.stringify(polls));
  displayPolls();
}

// Display polls on page load
document.addEventListener("DOMContentLoaded", displayPolls);

function blurBackground() {
  let elements = document.body.children;
  for (let element of elements) {
    if (element.id !== "authModal") {
      element.style.filter = "blur(5px)";
    }
  }
}

document
  .getElementById("authModal")
  .addEventListener("hidden.bs.modal", function () {
    let elements = document.body.children;
    for (let element of elements) {
      element.style.filter = "";
    }
  });

function registerUser(event) {
  event.preventDefault();

  let username = document.getElementById("registerUser").value;
  let password = document.getElementById("registerPassword").value;
  let confirmPassword = document.getElementById("confirmPassword").value;
  let isAdmin = document.getElementById("adminCheck").checked;

  if (!username || !password || !confirmPassword) {
    alert("Täytä kaikki kentät!");
    return;
  }

  if (password !== confirmPassword) {
    alert("Salasanat eivät täsmää!");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username]) {
    alert("Käyttäjätunnus on jo käytössä!");
    return;
  }

  users[username] = { password: password, isAdmin: isAdmin };
  localStorage.setItem("users", JSON.stringify(users));

  alert("Rekisteröinti onnistui!");
  showLoginForm();
}

function loginUser(event) {
  event.preventDefault();

  let username = document.getElementById("loginUser").value;
  let password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (users[username] && users[username].password === password) {
    alert(`Tervetuloa, ${username}!`);
    userNameText.innerText = username;
    userNameText.style.display = "block";
    logInButton.style.display = "none";
    logOutButton.style.display = "block";
    if (users[username].isAdmin) {
      createPollButton.style.display = "block";
    }

    modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
    modal.hide();
    logSwitch();
    checkAdmin();
  } else {
    alert("Väärä käyttäjätunnus tai salasana!");
  }
}

function logOut() {
  userNameText.innerText = "Placeholder";
  userNameText.style.display = "none";
  logInButton.style.display = "block";
  logOutButton.style.display = "none";
  createPollButton.style.display = "none";
  logSwitch();
  alert("Olet kirjautunut ulos.");
}

function logSwitch() {
  let voteButtons = document.querySelectorAll(".voteButton");
  let logInToSeeTexts = document.querySelectorAll(".logInToSee");
  if (loggedIn) {
    loggedIn = false;
    voteButtons.forEach((button) => (button.style.display = "none"));
    logInToSeeTexts.forEach((text) => (text.style.display = "block"));
  } else {
    loggedIn = true;
    voteButtons.forEach((button) => (button.style.display = "block"));
    logInToSeeTexts.forEach((text) => (text.style.display = "none"));
  }
}

document
  .querySelector("#registerForm form")
  .addEventListener("submit", registerUser);
document.querySelector("#loginForm form").addEventListener("submit", loginUser);
