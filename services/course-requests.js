const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import
const updateMessage = require('./message-update');  // Contains useful methods to update the messages shown to users
const { apiUrlPrefix } = require('../config.json');

module.exports = {

    /**
     * Fetches all new course requests by making a GET HTTP request to the API.
     * For each new course requests, sends a new client announcement to the discord channel.
     */
    getCourseRequests() {
        const url = `${apiUrlPrefix}/new_course_requests`;

        // GET HTTP request
        fetch(url)
            .then(response => response.json())
            .then(data => {

                let arrayOfCourseRequests = data.result;

                arrayOfCourseRequests.forEach(courseRequest => {
                    sendNewClientMessage(courseRequest.Subject, courseRequest.Frequency, courseRequest.LevelName, courseRequest.Money, courseRequest.Duration, courseRequest.DateOptions);
                });
            })
            // Handle server errors
            .catch(error => {
                console.error(error);
                updateMessage.serverErrorMessage(interaction);
            });
    },

    /**
     * Sends a message displaying a new client annoucement to tutor's discord channel.
     * User has the possibility to select time slots via a button.
     * @param {Array} availabilities 
     * @param {number} money 
     * @param {String} subject 
     * @param {number} level 
     * @param {number} frequency
     * @param {number} classDuration
     */
    sendNewClientMessage(subject, frequency, level, money, classDuration, availabilities) {
        console.log("NOT YET IMPLEMENTED");
    }
}