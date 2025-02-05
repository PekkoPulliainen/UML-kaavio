let loginForm = document.getElementById("loginForm");
let registerForm = document.getElementById("registerForm");
let logInButton = document.getElementById("logIn");
let logOutButton = document.getElementById("logOut");
let userNameText = document.getElementById("userNameText");
let createPollButton = document.getElementById("createPoll");

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
  alert("Olet kirjautunut ulos.");
}

document
  .querySelector("#registerForm form")
  .addEventListener("submit", registerUser);
document.querySelector("#loginForm form").addEventListener("submit", loginUser);
