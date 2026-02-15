/* =========================
   SIGNUP PAGE LOGIC
========================= */

const signupForm = document.querySelector('.auth-form');

if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const allergiesInput = document.getElementById("allergies").value;

    const allergyList = allergiesInput
      .toLowerCase()
      .split(',')
      .map(a => a.trim())
      .filter(a => a !== "");

    // 1️⃣ Get existing users array from localStorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    // 2️⃣ Add new user object to array
    users.push({
      name: name,
      email: email,
      password: password,
      allergies: allergyList
    });

    // 3️⃣ Save updated array back to localStorage
    localStorage.setItem("users", JSON.stringify(users));

    alert("Account Created Successfully!");
    window.location.href = "check.html";
  });
}






/* =========================
   CHECK PAGE LOGIC
========================= */

const checkForm = document.querySelector('.check-form');

if (checkForm) {
  checkForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const ingredients = document
      .getElementById('ingredients')
      .value
      .toLowerCase()
      .trim();

    const expiryValue = document.getElementById('expiryDate').value;
    const result = document.getElementById('result');

    // 🛑 STOP if nothing entered
    if (ingredients === "" || expiryValue === "") {
      result.textContent = "";
      return;
    }

    let messages = [];

    const expiry = new Date(expiryValue);
    const today = new Date();

    if (expiry < today) {
      messages.push("⚠️ Product Expired!");
    }

const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users[users.length - 1];
    const allergies = currentUser ? currentUser.allergies : [];

    const riskFound = allergies.some(allergy =>
      ingredients.includes(allergy)
    );

    if (riskFound) {
      messages.push("⚠️ Allergy Risk Detected!");
    }

    if (messages.length > 0) {
      result.innerHTML = messages.join("<br>");
      result.style.color = "red";
    } else {
      result.textContent = "✅ Safe to Eat!";
      result.style.color = "lightgreen";
    }
  });
}





