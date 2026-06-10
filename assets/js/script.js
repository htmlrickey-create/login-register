const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener("click", () =>{
    container.classList.add("active");
});
loginBtn.addEventListener("click", () =>{
    container.classList.remove("active");
});


const toggles = document.querySelectorAll(".password-toggle");

toggles.forEach(toggle => {

    toggle.addEventListener("click", () => {

        const input = document.getElementById(
            toggle.dataset.target
        );

        if(input.type === "password"){
            input.type = "text";

            toggle.classList.remove("fa-eye");
            toggle.classList.add("fa-eye-slash");
        }else{
            input.type = "password";

            toggle.classList.remove("fa-eye-slash");
            toggle.classList.add("fa-eye");
        }

    });

});

document.getElementById("loginForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("loginPassword").value;

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email,
            password
        })
    });

    const data = await response.json();

    if (!data.success) {
        document.getElementById("error").textContent =
            data.message;
    } else {
        window.location.href = data.redirect;
    }
});
