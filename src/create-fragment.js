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

    let contentType = document.querySelector("#content-type").value;
    const inputContainer = document.querySelector("#input-container");
    //Event listener for drop down form
    //Displays the appropriate input type depending on the content-type
    //to be created.
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

        let input;
        let data;
        if (contentType.startsWith('image/')) {
            input = document.querySelector("#new-fragment");
            const file = input.files[0];
            data = new Blob([file], {type: 'image/png'});
            
        }
        else {
            input = document.querySelector("#new-fragment").value;
            if (contentType === 'application/json') {
                data = JSON.stringify(input);
            }
            else {
                data = input;
            }
        }

        fetch(`${process.env.API_URL}/v1/fragments`, {
            method: 'POST',
            headers: {
                'Content-Type': contentType,
                'Authorization': `Bearer ${user.idToken}`
            },
            body: data
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