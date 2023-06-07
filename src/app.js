import { Auth, getUser } from "./auth";
import { getUserFragments } from './api';

async function init() {
  // Get our UI elements
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout');
  const buttonContainer = document.querySelector('#button-container');
  const fragmentDisplayContainer = document.querySelector('#fragment-display-container');

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }
  // Do an authenticated request to the fragments API server and log the result
  getUserFragments(user);

  buttonContainer.innerHTML += `
  <button type="button" id="new-fragment">Create Fragment</button>
  <button type="button" id="fragment-id">View Fragment Ids</button>
  <button type="button" id="fragment-expanded">View Full Fragments</button>
  <button type="button" id="update-fragment">Update Fragment</button>
  <button type="button" id="delete-fragment">Delete Fragment</button>
  <br>
  `

  const createFragmentBtn = document.querySelector('#new-fragment');
  createFragmentBtn.onclick = () => {
    window.location.href = 'create-fragment.html';
  }

  const viewFragmentIdsBtn = document.querySelector('#fragment-id');
  viewFragmentIdsBtn.onclick = () => {
    fetch(`${process.env.API_URL}/v1/fragments`, {
      headers: user.authorizationHeaders()
    })
    .then(res => res.json())
    .then(data => {
      const fragments = data.fragments;
  
      let html = `
        <div class="card" style="border: 1px solid; border-radius: 10px">
          <h3>Fragment IDs:</h3>
          <ul>
      `;
      fragments.forEach(fragment => {
        html += `
            <li><p>${fragment}</p></li>
        `;
      });
      html += `
          </ul>
        </div>`
      fragmentDisplayContainer.innerHTML = html;
    })
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector('.username').innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;
}

// Wait for the DOM to be ready, then start the app
addEventListener('DOMContentLoaded', init);