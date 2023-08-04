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
    const contentTypeEvent = document.querySelector("#content-type");
    const txtRegex = /^text\//;

    let contentType;
    const inputContainer = document.querySelector("#input-container");
    contentTypeEvent.addEventListener('change', () => {
        contentType = document.querySelector("#content-type").value;
        if (txtRegex.test(contentType) || contentType === 'application/json') {
            inputContainer.innerHTML = `
                <label for="new-fragment">Enter text:</label>
                <input type="text" id="new-fragment" name="new-fragment">
            `;
        }
        else {
            inputContainer.innerHTML = `
                <label for="new-fragment">Choose file:</label>
                <input type="file" id="new-fragment" name="new-fragment">
            `;
        }
    })

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        let input = document.querySelector("#new-fragment").value;
        console.log(contentType)

        if (contentType === 'application/json') {
            input = JSON.stringify(input);
        }

        fetch(`${process.env.API_URL}/v1/fragments`, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Authorization': `Bearer ${user.idToken}`
            },
            body: input
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