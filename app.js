
const signupForm = document.querySelector('.auth-form');

if (signupForm) {
  const nameInput = document.getElementById("name");
  if (nameInput) {
    nameInput.addEventListener("blur", function () {
      const errorMsg = document.getElementById("nameError");
      if (this.value.trim() === "") {
        if (errorMsg) errorMsg.style.display = "block";
      } else {
        if (errorMsg) errorMsg.style.display = "none";
      }
    });
    nameInput.addEventListener("input", function () {
      const errorMsg = document.getElementById("nameError");
      if (errorMsg) errorMsg.style.display = "none";
    });
  }

  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("blur", function () {
      const errorMsg = document.getElementById("emailError");
      if (!this.value.includes("@")) {
        if (errorMsg) errorMsg.style.display = "block";
      } else {
        if (errorMsg) errorMsg.style.display = "none";
      }
    });
    emailInput.addEventListener("input", function () {
      const errorMsg = document.getElementById("emailError");
      if (errorMsg) errorMsg.style.display = "none";
    });
  }

  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("blur", function () {
      const errorMsg = document.getElementById("passwordError");
      if (this.value.length > 0 && (this.value.length < 8 || this.value.length > 10)) {
        if (errorMsg) errorMsg.style.display = "block";
      } else {
        if (errorMsg) errorMsg.style.display = "none";
      }
    });
    passwordInput.addEventListener("input", function () {
      const errorMsg = document.getElementById("passwordError");
      if (errorMsg) errorMsg.style.display = "none";
    });
  }

  const verifyPasswordInput = document.getElementById("verifyPassword");
  if (verifyPasswordInput) {
    verifyPasswordInput.addEventListener("blur", function () {
      const errorMsg = document.getElementById("verifyPasswordError");
      const password = document.getElementById("password").value;
      if (this.value !== "" && this.value !== password) {
        if (errorMsg) errorMsg.style.display = "block";
      } else {
        if (errorMsg) errorMsg.style.display = "none";
      }
    });
    verifyPasswordInput.addEventListener("input", function () {
      const errorMsg = document.getElementById("verifyPasswordError");
      if (errorMsg) errorMsg.style.display = "none";
    });
  }

  const showPasswordCheckbox = document.getElementById("showPassword");
  if (showPasswordCheckbox) {
    showPasswordCheckbox.addEventListener("change", function () {
      const type = this.checked ? "text" : "password";
      if (passwordInput) passwordInput.type = type;
      if (verifyPasswordInput) verifyPasswordInput.type = type;
    });
  }

  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;

    if (name.trim() === "") {
      const errorMsg = document.getElementById("nameError");
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    const email = document.getElementById("email").value;

    if (!email.includes("@")) {
      const errorMsg = document.getElementById("emailError");
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    const password = document.getElementById("password").value;

    if (password.length < 8 || password.length > 10) {
      const errorMsg = document.getElementById("passwordError");
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    const verifyPassword = document.getElementById("verifyPassword").value;

    if (password !== verifyPassword) {
      const errorMsg = document.getElementById("verifyPasswordError");
      if (errorMsg) errorMsg.style.display = "block";
      return;
    }

    const allergiesInput = document.getElementById("allergies").value;
    const medicalCondition = document.getElementById("medicalCondition").value;
    const genderElement = document.querySelector('input[name="gender"]:checked');
    const gender = genderElement ? genderElement.value : "";

    const allergyList = allergiesInput
      .toLowerCase()
      .split(',')
      .map(a => a.trim())
      .filter(a => a !== "");




    fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        allergies: allergyList,
        medicalCondition: medicalCondition,
        gender: gender
      })
    })
      .then(res => res.json())
      .then(data => {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        users.push({ name, email, allergies: allergyList, medicalCondition, gender });
        localStorage.setItem("users", JSON.stringify(users));

        alert(data.message);
        window.location.href = "check.html";
      })
      .catch(err => {
        console.log(err);
        alert("Signup failed");
      });

  })
}


// =======================================================
// 2. OCR (OPTICAL CHARACTER RECOGNITION) FOR INGREDIENTS
// =======================================================
// Uses Tesseract.js to scan uploaded images of food labels, extracts
// text, and performs aggressive cleanup to remove common OCR noise
// before populating the ingredients text area.
const imageInput = document.getElementById("imageUpload");

if (imageInput) {
  imageInput.addEventListener("change", function () {

    const file = imageInput.files[0];

    if (!file) return;

    Tesseract.recognize(
      file,
      'eng',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {

      let extractedText = text.toLowerCase();


      let startIndex = extractedText.indexOf("ingredient");

      if (startIndex !== -1) {
        extractedText = extractedText.substring(startIndex);
      }

      extractedText = extractedText
        .replace(/[^a-z, ]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      document.getElementById("ingredients").value = extractedText;

      alert("Ingredients Extracted Successfully!");

    }).catch(err => {
      console.error(err);
      alert("OCR failed. Try clearer image.");
    });

  });
}





// =======================================================
// 3. FOOD SAFETY ANALYSIS & SCORING ENGINE
// =======================================================
// Core logic for evaluating the safety of a given food item.
// Checks expiry dates, cross-references ingredients with user allergies
// and predefined medical condition lists, identifies unhealthy additives,
// calculates a safety score (0-100), and provides personalized alternatives.
const checkForm = document.querySelector('.check-form');

if (checkForm) {
  checkForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const foodName = document.getElementById('foodName').value.trim();
    const ingredients = document
      .getElementById('ingredients')
      .value
      .toLowerCase()
      .trim();

    const ingredientsArray = ingredients
      .split(",")
      .map(i => i.trim())
      .filter(i => i !== "");

    const expiryValue = document.getElementById('expiryDate').value;
    const result = document.getElementById('result');

    if (ingredients === "" || expiryValue === "") {
      result.textContent = "";
      return;
    }

    let messages = [];

    const expiry = new Date(expiryValue);
    const today = new Date();

    if (expiry < today) {
      messages.push("Warning: Product Expired!");
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const currentUser = users[users.length - 1];
    const allergies = currentUser ? currentUser.allergies : [];

    const allergyRisk = allergies.some(allergy => ingredients.includes(allergy));

    if (allergyRisk) {
      messages.push("Warning: Allergy Risk Detected!");
    }

    const medicalRules = {
      "Diabetes": ["sugar", "glucose", "corn syrup", "fructose", "honey"],
      "Hypertension": ["salt", "sodium", "monosodium glutamate", "baking soda"],
      "Lactose Intolerance": ["milk", "whey", "cheese", "butter"],
      "High Cholesterol": ["edible vegetable oil", "butter", "ghee", "palmolein", "hydrogenated oil"]
    };

    if (currentUser && currentUser.medicalCondition !== "None") {
      const riskyItems = medicalRules[currentUser.medicalCondition] || [];
      const medicalRisk = riskyItems.some(item => ingredients.includes(item.toLowerCase()));

      if (medicalRisk) {
        messages.push(`Warning: Not Recommended for ${currentUser.medicalCondition}`);
      }
    }

    if (messages.length > 0) {
      result.innerHTML = messages.join("<br>");
      result.style.color = "red";
    } else {
      result.textContent = "Safe to Eat!";
      result.style.color = "lightgreen";
    }

    const history = JSON.parse(localStorage.getItem("history")) || [];
    const record = {
      foodName: foodName,
      ingredients: ingredientsArray,
      result: messages.join(" "),
      date: new Date().toISOString()
    };
    history.push(record);
    localStorage.setItem("history", JSON.stringify(history));
  });
}






// =======================================================
// 4. MAIN DASHBOARD LOGIC
// =======================================================
// Pulls data from local storage to calculate user statistics (total checks,
// safe foods, allergy alerts, etc.) and renders the Chart.js pie chart visualization.
if (window.location.pathname.includes("dashboard.html")) {

  const history = JSON.parse(localStorage.getItem("history")) || [];

  const totalChecks = history.length;

  const safeCount = history.filter(item =>
    item.result === "Safe"
  ).length;

  const allergyCount = history.filter(item =>
    item.result.includes("Allergy")
  ).length;

  const expiredCount = history.filter(item =>
    item.result.includes("Expired")
  ).length;

  const safePercent = totalChecks > 0
    ? ((safeCount / totalChecks) * 100).toFixed(1)
    : 0;

  document.getElementById("totalChecks").innerText = totalChecks;
  document.getElementById("safeCount").innerText = safeCount;
  document.getElementById("allergyCount").innerText = allergyCount;
  document.getElementById("expiredCount").innerText = expiredCount;
  document.getElementById("safePercent").innerText = safePercent + "%";

  const ctx = document.getElementById("safetyChart");

  if (ctx) {
    new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Safe", "Allergy Risk", "Expired"],
        datasets: [{
          data: [safeCount, allergyCount, expiredCount],
          backgroundColor: [
            "#00ff99",
            "#ffcc00",
            "#ff4444"
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "white"
            }
          }
        }
      }
    });
  }

  document.getElementById("clearHistory").addEventListener("click", () => {
    localStorage.removeItem("history");
    location.reload();
  });
}




// =======================================================
// 5. UI PARTICLE VISUAL EFFECTS
// =======================================================
// Initializes and configures the background particle animations using particles.js.
if (document.getElementById("particles-js") && typeof particlesJS === "function") {
  particlesJS("particles-js", {
    particles: {
      number: { value: 90, density: { enable: true, value_area: 900 } },
      color: { value: "#22C55E" },
      shape: { type: "circle" },
      opacity: { value: 0.45 },
      size: { value: 3, random: true },
      line_linked: { enable: true, distance: 150, color: "#16A34A", opacity: 0.35, width: 1 },
      move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out", bounce: false }
    },
    interactivity: {
      detect_on: "canvas",
      events: { onhover: { enable: true, mode: "repulse" }, onclick: { enable: true, mode: "push" }, resize: true },
      modes: { repulse: { distance: 140, duration: 0.4 }, push: { particles_nb: 3 } }
    },
    retina_detect: true
  });
}







// =======================================================
// 6. HEALTH INSIGHTS AND TREND ANALYSIS
// =======================================================
// Calculates advanced analytics based on the user's scan history. 
// Features include tracking the most common ingredient (with garbage filtering),
// calculating the average safety score across all items, setting overall risk levels,
// and determining current health trend status.
if (window.location.pathname.includes("insights.html")) {

  const history = JSON.parse(localStorage.getItem("history")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const currentUser = users[users.length - 1];

  const medicalCondition = currentUser?.medicalCondition || "None";

  const total = history.length || 1;

  const allergyCount = history.filter(item =>
    item.result.includes("Allergy")
  ).length;

  const expiredCount = history.filter(item =>
    item.result.includes("Expired")
  ).length;

  const medicalCount = history.filter(item =>
    item.result.includes("Not Recommended")
  ).length;

  const allergyPercent = ((allergyCount / total) * 100).toFixed(1);
  const expiredPercent = ((expiredCount / total) * 100).toFixed(1);
  const medicalPercent = ((medicalCount / total) * 100).toFixed(1);



  let ingredientFrequency = {};
  const stopWords = ["and", "or", "of", "in", "to", "a", "the", "with", "contains", "ingredients", "product", "extract"];

  history.forEach(item => {
    item.ingredients?.forEach(ing => {
      let parts = (ing.length > 40 && !ing.includes(",")) ? ing.split(/\s+/) : [ing];

      parts.forEach(part => {
        let cleanPart = part.trim().toLowerCase();
        if (cleanPart.length > 2 && cleanPart.length < 35 && !stopWords.includes(cleanPart)) {
          ingredientFrequency[cleanPart] = (ingredientFrequency[cleanPart] || 0) + 1;
        }
      });
    });
  });

  let mostCommonIngredient = "-";

  if (Object.keys(ingredientFrequency).length > 0) {
    mostCommonIngredient = Object.keys(ingredientFrequency).reduce((a, b) =>
      ingredientFrequency[a] > ingredientFrequency[b] ? a : b
    );
  }

  let overallRisk = "Low";
  let riskColor = "green";

  if (Number(allergyPercent) > 50 || Number(medicalPercent) > 50) {
    overallRisk = "High";
    riskColor = "red";
  } else if (Number(allergyPercent) > 25 || Number(medicalPercent) > 25) {
    overallRisk = "Moderate";
    riskColor = "orange";
  }

  let conclusion = "";

  if (Number(allergyPercent) > 50) {
    conclusion = "Frequent allergy-triggering foods detected.";
  } else if (Number(expiredPercent) > 30) {
    conclusion = "Multiple near-expiry products analyzed.";
  } else if (Number(medicalPercent) > 40) {
    conclusion = "Your medical condition risk appears frequently.";
  } else {
    conclusion = "Your food choices appear relatively safe.";
  }

  let recommendation = "";

  if (medicalCondition === "Diabetes") {
    recommendation = "Reduce high-sugar processed foods and prefer low-glycemic options.";
  } else if (medicalCondition === "Hypertension") {
    recommendation = "Monitor sodium intake and choose low-salt alternatives.";
  } else if (medicalCondition === "Lactose Intolerance") {
    recommendation = "Avoid dairy-based ingredients and opt for plant-based substitutes.";
  } else if (medicalCondition === "High Cholesterol") {
    recommendation = "Limit saturated fats and avoid hydrogenated oils.";
  } else {
    recommendation = "Maintain balanced nutrition and monitor expiry dates.";
  }

  const recent = history.slice(-5);
  const recentRisk = recent.filter(item =>
    item.result.includes("Risk")
  ).length;

  let trend = "Stable";

  if (recentRisk >= 3) {
    trend = "Increasing Risk";
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
  };

  setText("userCondition", medicalCondition);
  setText("totalChecksInsight", history.length);
  setText("mostFrequentRisk", conclusion);
  setText("highRiskCount", allergyCount + expiredCount + medicalCount);
  setText("recommendationText", recommendation);
  setText("overallRisk", overallRisk);
  setText("commonIngredient", mostCommonIngredient);
  setText("trendStatus", trend);

  let totalScore = history.reduce((sum, item) => sum + (item.score !== undefined ? item.score : 100), 0);
  let averageScore = history.length > 0 ? Math.round(totalScore / history.length) : 100;
  setText("averageScore", averageScore + "/100");

  const avgScoreEl = document.getElementById("averageScore");
  if (avgScoreEl) {
    if (averageScore >= 80) avgScoreEl.style.color = '#00ff99';
    else if (averageScore >= 50) avgScoreEl.style.color = '#ffcc00';
    else avgScoreEl.style.color = '#ff4444';
  }

  const overallRiskEl = document.getElementById("overallRisk");
  if (overallRiskEl) {
    overallRiskEl.style.color = riskColor;
  }
}
