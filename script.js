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
  if (selectedOption) {
    alert("Äänesi on rekisteröity!");
  } else {
    alert("Valitse vaihtoehto ennen äänestämistä!");
  }
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
