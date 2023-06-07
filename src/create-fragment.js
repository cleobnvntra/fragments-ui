import { getUser } from "./auth";

async function init() {
    const user = await getUser();
    if(!user) {
        window.location.href='/';
    }

    const form = document.querySelector('#form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const inputValue = document.getElementById('new-fragment').value;

        fetch(`${process.env.API_URL}/v1/fragments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
                'Authorization': `Bearer ${user.idToken}`
            },
            body: inputValue
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
        })
        .catch(err => {
            console.error(err);
        })
        form.reset();
    })

    form.reset();
}

addEventListener('DOMContentLoaded', init);