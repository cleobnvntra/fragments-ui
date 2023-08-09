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
  <button type="button" id="fragment-id">Fragment Ids</button>
  <button type="button" id="fragment-expanded">Full Fragments</button>
  <br>
  `

  const createFragmentBtn = document.querySelector('#new-fragment');
  createFragmentBtn.onclick = async () => {
    window.location.href = 'create-fragment.html';
  }

  //Button element for Fragment Ids button
  //When the button is clicked, it fetches existing fragment ids and displays it to the user
  const viewFragmentIdsBtn = document.querySelector('#fragment-id');
  viewFragmentIdsBtn.onclick = () => {
    //GET request to API_URL/v1/fragments
    fetch(`${process.env.API_URL}/v1/fragments`, {
      headers: user.authorizationHeaders()
    })
    .then(res => res.json())
    .then(data => {
      const fragments = data.fragments;
      let html = ``;
      if (fragments.length == 0) {
        html = `
          <div style="border: 1px solid">
            <h1>Fragment list is empty. . .</h1>
          </div>
        `;
      }
      else {
        html = `
          <div style="border: 1px solid">
            <h3>Fragment IDs:</h3>
            <ul>
        `;
        fragments.forEach(fragment => {
          html += `
              <li>
                <span>${fragment}</span>
                <button type="button" style="float: right" id="viewinfo-${fragment}">View info</button>
                <button type="button" style="float: right" id="viewdata-${fragment}">View data</button>
              </li><br>
          `;
        });
        html += `
            </ul>
          </div>
        `;
      }
      fragmentDisplayContainer.innerHTML = html;

      //Onclick event listener for View data button
      //When clicked, it sends a GET request to the server to retrieve a fragment's
      //raw data based on the id parameter
      fragments.forEach(fragment => {
        const viewDataBtn = document.querySelector(`#viewdata-${fragment}`);
        viewDataBtn.onclick = () => {
          fetch(`${process.env.API_URL}/v1/fragments/${fragment}`, {
            headers: user.authorizationHeaders()
          })
          .then(data => {
            const type = data.headers.get('Content-Type')

            html = `
              <div style="border: 2px solid;">
                <h3>Fragment ${fragment}:</h3>
                <ul>
                  <li>type: ${type}</li>
            `;

            if (type.startsWith('image/')) {
              data.blob().then((image) => {
                const imgElement = document.createElement('img');
                imgElement.src = URL.createObjectURL(image)
  
                html += `
                    <img src="${imgElement.src}" alt="Image" />
                  </ul>
                </div>
                `;
                fragmentDisplayContainer.innerHTML = html;
              });
            }
            else {
              if (type.startsWith('text/')) {
                data.text().then((text) => {
                  html += `
                      <li>${text}</li>
                    </ul>
                  </div>
                  `;
              fragmentDisplayContainer.innerHTML = html;
                })
              }
              else {
                data.json().then((json) => {
                  html += `
                      <li>${json.data}</li>
                    </ul>
                  </div>
                  `;
                  fragmentDisplayContainer.innerHTML = html;
                });
              }
            }
          })
          .catch(err => {
            console.error(err);
          })
        }
      })

      //Onclick event listener for View info button
      //When clicked, it sends a GET request to the server to retrieve a fragment's
      //metadata based on the id parameter
      fragments.forEach(fragment => {
        const viewInfoBtn = document.querySelector(`#viewinfo-${fragment}`);
        viewInfoBtn.onclick = () => {
          fetch(`${process.env.API_URL}/v1/fragments/${fragment}/info`, {
            headers: user.authorizationHeaders()
          })
          .then(res => res.json())
          .then(data => {
            metadata = data.fragments;
            html = `
              <div style="border: 2px solid;">
                <div style="display: flex; justify-content: space-between;">
                  <h3>Fragment</h3>
                  <div id="update-container">
                    <button type="button" id="back">Go Back</button>
                    <button type="button" id="update-button">Edit</button>
                    <button type="button" id="convert-button">Convert</button>
                    <button type="button" id="delete-button">Del</button>
                  </div>
                </div>
                <ul>
                  <li>id: ${metadata.id}</li>
                  <li>ownerId: ${metadata.ownerId}</li>
                  <li>created: ${metadata.created}</li>
                  <li>updated: ${metadata.updated}</li>
                  <li>content-type: ${metadata.type}</li>
                  <li>size: ${metadata.size}</li>
                </ul>
              </div>
            `;
            fragmentDisplayContainer.innerHTML = html;

            //Onclick event listener for the edit button
            //When clicked, displays a single input form for the user
            const editBtn = document.querySelector('#update-button');
            editBtn.onclick = () => {
              const container = document.querySelector('#update-container');
              if (metadata.type.startsWith('image/')) {
                container.innerHTML = `
                <form id="update-form">
                  <input type="file" id="update" accept="${metadata.type}" style="width: 300px"></input>
                  <button type="submit" style="margin: 2px">Update</button>
                  <button type="reset" style="margin: 2px">Cancel</button>
                </form>
                `;
              }
              else {
                container.innerHTML = `
                <form id="update-form">
                  <input type="text" id="update" style="width: 300px"></input>
                  <button type="submit" style="margin: 2px">Update</button>
                  <button type="reset" style="margin: 2px">Cancel</button>
                </form>
                `;
              }
    
              //Submit handler for the edit form
              //The submitted input value is sent as a PUT request
              //The route accepts a fragment id which is used to get the fragment to be updated
              const form = document.querySelector('#update-form');
              form.addEventListener('submit', (event) => {
                event.preventDefault();
    
                let input;
                let data;
                if(metadata.type.startsWith('image/')) {
                  input = document.querySelector('#update');
                  const file = input.files[0];
                  
                  if (file.type !== metadata.type) {
                    alert('Cannot update to a different type!');
                    return;
                  }
                  data = new Blob([file], {type: metadata.type})
                }
                else {
                  input = document.querySelector('#update').value;
                  if (metadata.type === 'application/json') {
                    data = JSON.stringify(input);
                  }
                  else {
                    data = input;
                  }
                }
    
                //PUT request to API_URL/v1/fragments/:id
                fetch(`${process.env.API_URL}/v1/fragments/${metadata.id}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': metadata.type,
                    'Authorization': `Bearer ${user.idToken}`
                  },
                  body: data
                })
                .then(res => res.json())
                .then(data => {
                  viewFragmentIdsBtn.click();
                  console.log(data);
                })
                .catch(err => {
                  console.error(err);
                })
              });
            }

            //Onclick event listener for Convert button
            //When clicked, opens an input of possible conversion types
            //Converts the fragment to the selected type
            const convertBtn = document.querySelector('#convert-button');
            if (metadata.type === 'text/plain') {
              convertBtn.disabled = true;
            }

            convertBtn.onclick = () => {
              const container = document.querySelector('#update-container');
              if (metadata.type.startsWith('image/')) {
                container.innerHTML = `
                  <form id="convert-form">
                    <select id="convert-type">
                      <option value="png">image/png</option>
                      <option value="jpeg">image/jpeg</option>
                      <option value="webp">image/webp</option>
                      <option value="gif">image/gif</option>
                    </select><br>
                    <button type="submit" style="margin: 2px">Convert</button>
                  </form>
                `;
              }
              else {
                if (metadata.type === 'text/markdown') {
                  container.innerHTML = `
                    <form id="convert-form">
                      <select id="convert-type">
                        <option value="md">text/markdown</option>
                        <option value="html">text/html</option>
                        <option value="txt">text/plain</option>
                      </select><br>
                      <button type="submit" style="margin: 2px">Convert</button>
                    </form>
                  `;
                }
                else if (metadata.type === 'text/html') {
                  container.innerHTML = `
                    <form id="convert-form">
                      <select id="convert-type">
                        <option value="html">text/html</option>
                        <option value="txt">text/plain</option>
                      </select><br>
                      <button type="submit" style="margin: 2px">Convert</button>
                    </form>
                  `;
                }
                else if (metadata.type === 'application/json') {
                  container.innerHTML = `
                    <form id="convert-form">
                      <select id="convert-type">
                        <option value="json">application/json</option>
                        <option value="txt">text/plain</option>
                      </select><br>
                      <button type="submit" style="margin: 2px">Convert</button>
                    </form>
                  `;
                }
              }

              const form = document.querySelector('#convert-form');
              form.addEventListener('submit', (event) => {
                event.preventDefault();
                const ext = document.querySelector('#convert-type').value;
                fetch(`${process.env.API_URL}/v1/fragments/${metadata.id}.${ext}`, {
                  method: 'GET',
                  headers: user.authorizationHeaders()
                })
                .then(data => {
                  const type = data.headers.get('Content-Type')
                  html = `
                    <div style="border: 2px solid;">
                      <h3>Conversion success!</h3>
                      <ul>
                        <li>id: ${metadata.id}</li>
                        <li>type: ${type}</li>
                  `;
      
                  if (type.startsWith('image/')) {
                    data.blob().then((image) => {
                      const imgElement = document.createElement('img');
                      imgElement.src = URL.createObjectURL(image)
        
                      html += `
                          <img src="${imgElement.src}" alt="Image" />
                        </ul>
                      </div>
                      `;
                      fragmentDisplayContainer.innerHTML = html;
                    });
                  }
                  else {
                    if (type.startsWith('text/')) {
                      data.text().then((text) => {
                        html += `
                            <li>${text}</li>
                          </ul>
                        </div>
                        `;
                        fragmentDisplayContainer.innerHTML = html;
                      })
                    }
                    else {
                      data.json().then((json) => {
                        html += `
                            <li>${json}</li>
                          </ul>
                        </div>
                        `;
                        fragmentDisplayContainer.innerHTML = html;
                      });
                    }
                  }
                })
              })
            }
      
            //Onclick event listener for Del button
            //When clicked, it sends a DELETE request to the server with the id as a parameter
            //Deletes a specific fragment based on the requested id to be deleted
            const delBtn = document.querySelector('#delete-button');
            delBtn.onclick = () => {
              fetch(`${process.env.API_URL}/v1/fragments/${metadata.id}`, {
                method: 'DELETE',
                headers: user.authorizationHeaders()
              })
              .then(res => res.json())
              .then(data => {
                viewFragmentIdsBtn.click();
                console.log(data);
              })
              .catch(err => {
                console.error(err);
              })
            }
            
            const backBtn = document.querySelector('#back');
            backBtn.onclick = () => {
              viewFragmentIdsBtn.click();
            }
          })
          .catch(err => {
            console.error(err);
          });
        }
      });
    })
    .catch(err => {
      console.error(err);
    })
  }

  //Button element for Full Fragments button
  //When clicked, it fetches all existing fragments and displays all fragment's metadata to the user
  const viewFragmentsBtn = document.querySelector('#fragment-expanded');
  viewFragmentsBtn.onclick = () => {
    //GET request to API_URL/v1/fragments/?expand=1
    fetch(`${process.env.API_URL}/v1/fragments/?expand=1`, {
      headers: user.authorizationHeaders()
    })
    .then(res => res.json())
    .then(data => {
      const fragments = data.fragments;

      let html = ``;
      if (fragments.length == 0) {
        html = `
          <div style="border: 1px solid">
            <h1>Fragment list is empty. . .</h1>
          </div>
        `;
      }
      fragments.forEach(fragment => {
        html += `
          <div style="border: 2px solid;">
            <div style="display: flex; justify-content: space-between;">
              <h3>Fragment:</h3>
              <div id="delete-container-${fragment.id}">
                <button type="button" id="del-${fragment.id}">Del</button>
              </div>
            </div>
            <ul>
              <li>id: ${fragment.id}</li>
              <li>ownerId: ${fragment.ownerId}</li>
              <li>created: ${fragment.created}</li>
              <li>updated: ${fragment.updated}</li>
              <li>content-type: ${fragment.type}</li>
              <li>size: ${fragment.size}</li>
            </ul>
          </div>
        `;
      })
      fragmentDisplayContainer.innerHTML = html;

      fragments.forEach(fragment => {
        //Onclick event listener for Del button
        //When clicked, it sends a DELETE request to the server with the id as a parameter
        //Deletes a specific fragment based on the requested id to be deleted
        const delBtn = document.querySelector(`#del-${fragment.id}`);
        delBtn.onclick = () => {
          fetch(`${process.env.API_URL}/v1/fragments/${fragment.id}`, {
            method: 'DELETE',
            headers: user.authorizationHeaders()
          })
          .then(res => res.json())
          .then(data => {
            viewFragmentsBtn.click();
            console.log(data);
          })
          .catch(err => {
            console.error(err);
          })
        }
      })
    })
    .catch(err => {
      console.error(err);
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