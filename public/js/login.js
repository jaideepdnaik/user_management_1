document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(this);
    const response = await fetch('/doLogin', {
        method: 'POST',
        body: JSON.stringify({
            username: formData.get('username'),
            password: formData.get('password')
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log("Got my data");
    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = `/loginSuccess?user=${encodeURIComponent(JSON.stringify(data.user))}`;
    } else {
        alert(data.message);
    }
});
