/**
 * This script handles updating the JWT to make the API calls secure.
 */

require("dotenv").config();

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args)); // node-fetch import
const { apiUrlPrefix } = require("../config.json");
// following imports are used for writing to file
const fs = require("node:fs");
const configFile = require("../config.json");

module.exports = {
  /**
   * Update the JWT using the sign in credentials
   */
  async jwtSignin() {
    // Holds the extracted data in JSON format (to be sent to the API)
    const requestData = {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    };

    // The parameters of the HTTP POST request
    const params = {
      method: "POST",
      body: JSON.stringify(requestData),
      headers: { "Content-Type": "application/json" },
    };

    // The API URL for updating the JWT
    const url = `${apiUrlPrefix}/login`;

    // Added a promise with a 2 second timeout to make the code wait
    return new Promise((resolve) =>
      setTimeout(
        resolve,
        2000,

        // An HTTP POST request
        fetch(url, params)
          .then(async (res) => {
            // Update the token if the sign in credentials are valid
            if (200 === res.status) {
              const data = await res.json();
              updateJwt(data.token);
            }
            // Show invalid credentials error
            else if (401 === res.status) {
              console.log("Invalid credentials!");
            }
          })
          // Handle request errors
          .catch(async (error) => {
            console.error(error);
          })
      )
    );
  },
};

/**
 * Update the file holding the current JWT to hold the newly created JWT.
 *
 * @param {string} token the JWT
 */
function updateJwt(token) {
  // Update the local file's JWT
  configFile.jwt = token;

  // Write the updated local copy to file
  fs.writeFile("config.json", JSON.stringify(configFile, null, 2), (err) => {
    if (err) {
      return console.log(err);
    }
    console.log("new JWT written to file successfully");
  });
}
