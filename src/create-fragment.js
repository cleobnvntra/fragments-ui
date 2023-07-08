import { getUser } from "./auth";

async function init() {
    const user = await getUser();
    if(!user) {
        window.location.href='/';
    }

    const cancelBtn = document.querySelector("#cancel-btn");
    cancelBtn.onclick = () => {
        window.location.href='/';
    }

    const form = document.querySelector("#form")

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        const input = document.querySelector("#new-fragment").value;
        const contentType = document.querySelector("#content-type").value;
        console.log(contentType)

        fetch(`${process.env.API_URL}/v1/fragments`, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Authorization': `Bearer ${user.idToken}`
            },
            body: input
        })
        .then(res => {
            console.log(res.headers.get('Location'));
            return res.json()})
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