# fragments-ui

A web app UI that interacts with the fragments server which utilizes AWS services.

# Supported features

# 1. Creation
## Create Fragment
- Supports creation of fragments of different types.

| Name          | Type              |
| ------------- | ----------------- |
| Text Plain    | `text/plain`      |
| Text Html     | `text/html`       |
| Text Markdown | `text/md`         |
| JSON          | `application/json`|
| PNG Image     | `image/png`       |
| JPEG Image    | `image/jpeg`      |
| WebP Image    | `image/webp`      |
| GIF Image     | `image/gif`       |

- An input field is provided to the user to create the fragment. The input type of the field is determined by the selected Content-Type.<br>
ex: A text/* or application/json type will display a text input type, while an image/* type will display a file input type.<br>

![Alt text](./screenshots/create-types.PNG?raw=true)
<br>

<u>text input type for text/* content-type:</u><br>
![Alt text](./screenshots/text-input.PNG?raw=true)
<br>

<u>file input type for image/* content-type:</u><br>
![Alt text](./screenshots/file-input.PNG?raw=true)
<br>

- When a user creates a new fragment, the app makes a POST request via fetch to the fragments server.
```sh
POST API_URL/v1/fragments
```

# 2. Retrieval
## View Fragment Ids
- Retrieves a list of ids of the user's existing fragments. A GET request is made to the fragments server.
```sh
GET API_URL/v1/fragments
```
![Alt text](./screenshots/fragment-ids.PNG?raw=true)

### View Data
- Retrieves the raw data of the selected fragment and displays it for the user. A GET request is made via fetch to the fragments server.
```sh
GET API_URL/v1/fragments/:id
```
![Alt text](./screenshots/view-data.PNG?raw=true)

### View Info
- Retrieves the metadata of the selected fragment and displays it for the user. A GET request is made via fetch to the fragments server.
```sh
GET API_URL/v1/fragments/:id/info
```
![Alt text](./screenshots/view-info.PNG?raw=true)

## Full Fragments
- Retrieves the metadata of all the existing fragments of the user and displays it for the user. A GET request is made via fetch to the fragments server.
```sh
GET API_URL/v1/fragments?expand=1
```
![Alt text](./screenshots/get-expanded.PNG?raw=true)

# 3. Updating
## Edit
- Opens up an input type depending on the fragment's current type.<br>
Fragments that have application/json or text/* types will open up a text input type, while image/* types will open up a file input type.

<u>text input type for text/* content-type:</u><br>
![Alt text](./screenshots/edit-text.PNG?raw=true)

<u>file input type for image/* content-type:</u><br>
![Alt text](./screenshots/edit-file.PNG?raw=true)

- On submit (Update), it sends a PUT request via fetch to the fragments server. A content-type check is made before sending the request. A user is <u><b>NOT</b></u> allowed to update the existing fragment into a different content-type.
```sh
PUT API_URL/v1/fragments/:id
```

# 4. Conversion
## Convert
- Opens up a drop down menu for the user to select which Content-Type should the current fragment be converted to.

![Alt text](./screenshots/convert-fragment.PNG?raw=true)

- On submit (Convert), it sends a GET request via fetch to the fragments server to convert and retrieve the converted fragment to be displayed.
```sh
GET API_URL/v1/fragments/:id.ext
```
- Users are only able to convert fragment types with their valid conversions:

| Type               | Valid Conversion Extensions     |
| ------------------ | ------------------------------- |
| `text/plain`       | `.txt`                          |
| `text/markdown`    | `.md`, `.html`, `.txt`          |
| `text/html`        | `.html`, `.txt`                 |
| `application/json` | `.json`, `.txt`                 |
| `image/png`        | `.png`, `.jpeg`, `.webp`, `.gif`|
| `image/jpeg`       | `.png`, `.jpeg`, `.webp`, `.gif`|
| `image/webp`       | `.png`, `.jpeg`, `.webp`, `.gif`|
| `image/gif`        | `.png`, `.jpeg`, `.webp`, `.gif`|

# 5. Deletion
## Delete
- Deletes the fragment and its data completely. The fragment's raw data and metadata are deleted from where it is stored. It sends a DELETE request via fetch to the fragments server.
```sh
DELETE API_URL/v1/fragments/:id
```

![Alt text](./screenshots/Delete.PNG?raw=true)
