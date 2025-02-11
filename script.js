document.addEventListener("DOMContentLoaded", function () {
  displayPolls();
  document
    .querySelector("#pollForm form")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      savePoll();
      let modal = bootstrap.Modal.getInstance(
        document.getElementById("pollForm")
      );
      modal.hide();
    });

  document
    .querySelector("#registerForm form")
    .addEventListener("submit", registerUser);
  document
    .querySelector("#loginForm form")
    .addEventListener("submit", loginUser);
});

let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");
let logInButton = document.getElementById("logIn");
let logOutButton = document.getElementById("logOut");
let userNameText = document.getElementById("userNameText");
let createPollButton = document.getElementById("createPoll");
let loggedIn = false;
let closePollForm = document.getElementById("closePollForm");

function showLoginForm() {
  document.getElementById("authModalLabel").innerText = "Kirjaudu";
  loginForm.style.display = "block";
  registerForm.style.display = "none";
  let modal = new bootstrap.Modal(document.getElementById("authModal"), {
    backdrop: false,
  });

  blurBackground();

  modal.show();
  document.body.classList.add("modal-open");
}

function showRegisterForm() {
  document.getElementById("authModalLabel").innerText = "Rekisteröidy";
  loginForm.style.display = "none";
  registerForm.style.display = "block";

  blurBackground();
}

function showPollForm() {
  let modal = new bootstrap.Modal(document.getElementById("pollForm"));
  modal.show();
}

function savePoll() {
  let title = document.getElementById("pollTitle").value.trim();
  let description = document.getElementById("pollDescription").value.trim();
  let options = [
    document.getElementById("option1").value.trim(),
    document.getElementById("option2").value.trim(),
    document.getElementById("option3").value.trim(),
    document.getElementById("option4").value.trim(),
    document.getElementById("option5").value.trim(),
  ].filter((opt) => opt.trim() !== "");

  console.log("Title:", title);
  console.log("Description:", description);
  console.log("Options:", options);

  if (!title || !description || options.length < 2) {
    alert("Täytä kaikki kentät ja lisää vähintään kaksi vaihtoehtoa!");
    return;
  }

  let username = userNameText.innerText;
  let users = JSON.parse(localStorage.getItem("users")) || {};
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let poll = { title, description, options };
  polls.push(poll);
  localStorage.setItem("polls", JSON.stringify(polls));

  let pollIndex = polls.length - 1;
  if (document.getElementById("autoFillVotes").checked) {
    let votes = JSON.parse(localStorage.getItem("votes")) || {};
    votes[pollIndex] = new Array(options.length).fill(0);

    for (let i = 0; i < 200; i++) {
      let randomOption = Math.floor(Math.random() * options.length);
      votes[pollIndex][randomOption]++;
    }

    localStorage.setItem("votes", JSON.stringify(votes));
  }

  document.getElementById("pollTitle").value = "";
  document.getElementById("pollDescription").value = "";
  document.getElementById("option1").value = "";
  document.getElementById("option2").value = "";
  document.getElementById("option3").value = "";
  document.getElementById("option4").value = "";
  document.getElementById("option5").value = "";

  displayPolls();

  if (document.getElementById("autoFillVotes").checked) {
    displayResults(pollIndex, null);
  }

  users[username].votedPolls.forEach((votedPoll) =>
    displayResults(votedPoll.voteIndex, votedPoll.selectedChoice)
  );

  let modal = bootstrap.Modal.getInstance(document.getElementById("pollForm"));
  modal.hide();
  removeBlur();
}

function displayPolls() {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let container = document.querySelector(".container.mt-5 .row");
  container.innerHTML = "";

  polls.forEach((poll, index) => {
    let pollHTML = `
      <div class="col-12 col-md-6 col-lg-4"> <!-- Added padding and margin -->
        <div class="card border border-dark border-2 rounded rounded-3 p-3">
          <div class="card-body pb-1 pt-1 ps-1 pe-1">
            <div class="row border-bottom border-dark mb-3">
              <button onclick="removePoll(${index})" class="removePollButton btn btn-dark bg-transparent col-1 mb-3" name="removePoll" style="display:none">X</button>
              <div class="card-body-middle col pb-3">
                <h5 class="card-title text-center fw-bold">${poll.title}</h5>
                <p class="card-text text-center">${poll.description}</p>
              </div>
            </div>
            ${poll.options
              .map(
                (option, i) => `
              <div class="form-check">
                <input class="form-check-input me-3" type="radio" name="poll${index}" id="option${index}-${i}">
                <label class="form-check-label" for="option${index}-${i}">
                  ${option}
                </label>
              </div>
            `
              )
              .join("")}
              <div class="row m-0 p-0 mt-3 border-top border-dark">
                <label id="logInToSee" class="logInToSee text-white mt-3 text-center">Kirjaudu sisään äänestääksesi</label>
                <button onclick="vote(${index})" class="voteButton btn btn-dark border border-secondary rounded ps-1 pe-1 mt-3" style="display:none">Äänestä</button>
              </div>
          </div>
        </div>
      </div>`;

    container.insertAdjacentHTML("beforeend", pollHTML);
  });
  checkAdmin();
  let voteButtons = document.querySelectorAll(".voteButton");
  let logInToSeeTexts = document.querySelectorAll(".logInToSee");
  if (!loggedIn) {
    voteButtons.forEach((button) => (button.style.display = "none"));
    logInToSeeTexts.forEach((text) => (text.style.display = "block"));
  } else {
    voteButtons.forEach((button) => (button.style.display = "block"));
    logInToSeeTexts.forEach((text) => (text.style.display = "none"));
  }
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

  let username = userNameText.innerText;
  let users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[username].votedPolls) {
    users[username].votedPolls = [];
  }

  if (
    users[username].votedPolls.some(
      (votedPoll) => votedPoll.voteIndex === index
    )
  ) {
    alert("Olet jo äänestänyt tässä kyselyssä!");
    return;
  }

  let selectedIndex = parseInt(selectedOption.id.split("-")[1]);

  let votes = JSON.parse(localStorage.getItem("votes")) || {};
  if (!votes[index]) {
    votes[index] = new Array(polls[index].options.length).fill(0);
  }

  votes[index][selectedIndex] += 1;

  console.log("Ääniä +1 kohdassa ", votes[index]);
  console.log("Votes for poll index", index, ":", votes[index]);

  localStorage.setItem("votes", JSON.stringify(votes));

  users[username].votedPolls.push({
    voteIndex: index,
    selectedChoice: selectedIndex,
  });
  localStorage.setItem("users", JSON.stringify(users));

  displayResults(index, selectedIndex);
}

function displayResults(index, selectedIndex) {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let votes = JSON.parse(localStorage.getItem("votes")) || {};

  console.log("Displaying results for poll", index);

  if (!votes[index]) {
    console.log("No votes for poll", index);
    return;
  }

  let pollCard = document.querySelectorAll(".col-12.col-md-6.col-lg-4")[index];
  if (!pollCard) {
    console.log("Poll card not found for index", index);
    return;
  }

  let optionsContainer = pollCard.querySelector(".card-body");
  if (!optionsContainer) {
    console.log("Options container not found for poll", index);
    return;
  }

  if (optionsContainer.querySelector(".vote-results")) {
    console.log("Results already displayed for poll", index);
    return;
  }

  let voteButton = pollCard.querySelector(".voteButton");
  let formChecks = pollCard.querySelectorAll(".form-check");
  formChecks.forEach((formCheck) => formCheck.remove());
  if (voteButton) voteButton.remove();

  let totalVotes = votes[index].reduce((sum, count) => sum + count, 0) || 1;

  let resultsHTML = `<h6 class="fw-bold mt-3"></h6>`;

  polls[index].options.forEach((option, i) => {
    let count = votes[index][i] || 0;
    let percentage = ((count / totalVotes) * 100).toFixed(1);

    let progressBarColor = i === selectedIndex ? "bg-success" : "bg-dark";

    resultsHTML += `
      <div class="mt-2">
        <div class="progress row d-flex flex-column" style="background-color:rgb(52, 53, 54);"> <!-- Dark Gray Background -->
          <label class="progress-bar ${progressBarColor} text-white text-center" role="progressbar" 
            style="width: ${percentage}%; min-width: 20%; max-width: 100%;" 
            aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
            ${option}
          </label>
          <div class="progress-bar ${progressBarColor} text-white text-center fw-bold" role="progressbar" 
            style="width: ${percentage}%; min-width: 20%; max-width: 100%;" 
            aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100">
            ${percentage}% (${count})
          </div>
        </div>
      </div>
    `;
  });

  let totalVotesHTML = `
    <div class="row m-0 p-0 mt-3 border-top border-dark d-flex justify-content-end">
      <div class="totalVotes d-flex flex-column align-items-center border border-2 rounded rounded-3 border-secondary mt-3 h-75 p-2" style="width: 100px;">
        <span class="fw-bold">Ääniä:</span>
        <span>${totalVotes}</span>
      </div>
    </div>
  `;

  let resultsDiv = document.createElement("div");
  resultsDiv.classList.add("vote-results", "mt-3");
  resultsDiv.innerHTML = resultsHTML + totalVotesHTML;

  let borderDiv = pollCard.querySelector(".border-top");
  if (borderDiv) borderDiv.remove();

  optionsContainer.appendChild(resultsDiv);
}

function removePoll(index) {
  let polls = JSON.parse(localStorage.getItem("polls")) || [];
  let votes = JSON.parse(localStorage.getItem("votes")) || {};

  polls.splice(index, 1);
  delete votes[index];

  let updatedVotes = {};
  Object.keys(votes).forEach((key, i) => {
    let newIndex = parseInt(key);
    if (newIndex > index) {
      newIndex--;
    }
    updatedVotes[newIndex] = votes[key];
  });

  localStorage.setItem("polls", JSON.stringify(polls));
  localStorage.setItem("votes", JSON.stringify(updatedVotes));

  let users = JSON.parse(localStorage.getItem("users")) || {};
  for (let username in users) {
    if (users[username].votedPolls) {
      users[username].votedPolls = users[username].votedPolls.filter(
        (poll) => poll.voteIndex !== index
      );
      users[username].votedPolls.forEach((poll) => {
        if (poll.voteIndex > index) {
          poll.voteIndex--;
        }
      });
    }
  }
  localStorage.setItem("users", JSON.stringify(users));

  displayPolls();
  users[userNameText.innerText].votedPolls.forEach((votedPoll) =>
    displayResults(votedPoll.voteIndex, votedPoll.selectedChoice)
  );
}

function blurBackground() {
  let elements = document.body.children;
  for (let element of elements) {
    if (element.id !== "authModal" && element.id !== "pollForm") {
      element.style.filter = "blur(5px)";
    }
  }
}

function removeBlur() {
  let elements = document.body.children;
  for (let element of elements) {
    element.style.filter = "";
    element.removeAttribute("inert");
  }
  document.body.classList.remove("modal-open");
}

document
  .getElementById("authModal")
  .addEventListener("hidden.bs.modal", removeBlur);

document
  .getElementById("pollForm")
  .addEventListener("hidden.vs.modal", removeBlur);

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

  let modal = bootstrap.Modal.getInstance(document.getElementById("authModal"));
  modal.hide();
  removeBlur();
  showLoginForm();
}

function loginUser(event) {
  event.preventDefault();

  let username = document.getElementById("loginUser").value;
  let password = document.getElementById("loginPassword").value;

  let users = JSON.parse(localStorage.getItem("users")) || {};
  let polls = JSON.parse(localStorage.getItem("polls")) || [];

  if (users[username] && users[username].password === password) {
    alert(`Tervetuloa, ${username}!`);
    userNameText.innerText = username;
    userNameText.style.display = "block";
    logInButton.style.display = "none";
    logOutButton.style.display = "block";
    if (users[username].isAdmin) {
      createPollButton.style.display = "block";
    }

    let modal = bootstrap.Modal.getInstance(
      document.getElementById("authModal")
    );
    modal.hide();
    removeBlur();
    logSwitch();
    checkAdmin();

    if (users[username].votedPolls) {
      users[username].votedPolls.forEach((votedPoll) => {
        if (votedPoll.voteIndex < polls.length) {
          displayResults(votedPoll.voteIndex, votedPoll.selectedChoice);
        }
      });
    }
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
  displayPolls();
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
