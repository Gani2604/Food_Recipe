document.addEventListener("DOMContentLoaded", function() {
    // DOM elements
    const authContainer = document.getElementById("auth-container");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const showLoginLink = document.getElementById("show-login");
    const showRegisterLink = document.getElementById("show-register");
    const recipeContainer = document.getElementById("recipe-container");
    const searchBtn = document.getElementById("search-btn");
    const getPreviousSearchesBtn = document.getElementById("get-previous-searches-btn");
    const previousSearchesDiv = document.getElementById("previous-searches");
    const resultDiv = document.getElementById("result");

    // Switch to login form
    showLoginLink.addEventListener("click", function(event) {
        event.preventDefault();
        registerForm.style.display = "none";
        loginForm.style.display = "block";
    });

    // Switch to register form
    showRegisterLink.addEventListener("click", function(event) {
        event.preventDefault();
        loginForm.style.display = "none";
        registerForm.style.display = "block";
    });

    // Handle login
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("login-username").value;
        const password = document.getElementById("login-password").value;
        fetch("backend/login.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `username=${username}&password=${password}`
        })
        .then(response => response.text())
        .then(data => {
            if (data === "Login successful") {
                authContainer.style.display = "none";
                recipeContainer.style.display = "block";
            } else {
                alert(data);
            }
        });
    });

    // Handle registration
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = document.getElementById("register-username").value;
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        fetch("backend/register.php", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `username=${username}&email=${email}&password=${password}`
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            if (data === "Registration successful") {
                registerForm.style.display = "none";
                loginForm.style.display = "block";
            }
        });
    });

    // Event listener for the "Previous Searches" button
    getPreviousSearchesBtn.addEventListener("click", loadPreviousSearches);

    // Function to load and display previous searches
    function loadPreviousSearches() {
        fetch('backend/get_searches.php')
            .then(response => response.json())
            .then(data => {
                previousSearchesDiv.style.display = 'block';
                previousSearchesDiv.innerHTML = '';
                data.forEach(search => {
                    const searchDiv = document.createElement('div');
                    searchDiv.className = 'search-item';
                    searchDiv.innerHTML = `
                        <h4 class="search-term" data-term="${search.search_term}">${search.search_term}</h4>
                        <small>${search.search_date}</small>
                    `;
                    previousSearchesDiv.appendChild(searchDiv);
                });

                // Add event listeners to each search term
                document.querySelectorAll('.search-term').forEach(item => {
                    item.addEventListener('click', function() {
                        const term = this.getAttribute('data-term');
                        searchRecipe(term);
                    });
                });
            });
    }

    // Function to search and display the recipe
    function searchRecipe(term) {
        fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`)
            .then(response => response.json())
            .then(data => {
                let myMeal = data.meals[0];
                let count = 1;
                let ingredients = [];
                for (let i in myMeal) {
                    let ingredient = "";
                    let measure = "";
                    if (i.startsWith("strIngredient") && myMeal[i]) {
                        ingredient = myMeal[i];
                        measure = myMeal[`strMeasure` + count];
                        count += 1;
                        ingredients.push(`${measure} ${ingredient}`);
                    }
                }
                resultDiv.innerHTML = `
                    <img src=${myMeal.strMealThumb}>
                    <div class="details">
                        <h2>${myMeal.strMeal}</h2>
                        <h4>${myMeal.strArea}</h4>
                    </div>
                    <div id="ingredient-con"></div>
                    <div id="recipe">
                        <button id="hide-recipe">X</button>
                        <pre id="instructions">${myMeal.strInstructions}</pre>
                    </div>
                    <button id="show-recipe">View Recipe</button>
                `;
                let ingredientCon = document.getElementById("ingredient-con");
                let parent = document.createElement("ul");
                let recipe = document.getElementById("recipe");
                let hideRecipe = document.getElementById("hide-recipe");
                let showRecipe = document.getElementById("show-recipe");

                ingredients.forEach((i) => {
                    let child = document.createElement("li");
                    child.innerText = i;
                    parent.appendChild(child);
                    ingredientCon.appendChild(parent);
                });

                hideRecipe.addEventListener("click", () => {
                    recipe.style.display = "none";
                });
                showRecipe.addEventListener("click", () => {
                    recipe.style.display = "block";
                });

                // Save the search in the database
                fetch("backend/search.php", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `search_term=${term}&result=${myMeal.strMeal}`
                });
            })
            .catch(() => {
                resultDiv.innerHTML = `<h3>Invalid Input</h3>`;
            });
    }

    // Search button click event
    searchBtn.addEventListener("click", () => {
        let userInp = document.getElementById("user-inp").value;
        if (userInp.length == 0) {
            resultDiv.innerHTML = `<h3>Input Field Cannot Be Empty</h3>`;
        } else {
            searchRecipe(userInp);
        }
    });
});
