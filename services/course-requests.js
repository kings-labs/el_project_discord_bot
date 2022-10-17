/**
 * This class is responsible for fetching and sending to the discord channel every new course requests.
 * It is also responsible for retrieving and storing the answers to each client announcement and sending them to the API.
 * 
 * @version 28/09/2022 
 */

// Require the necessary files
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import
const updateMessage = require('./message-update'); // Contains useful methods to update the messages shown to users
const jwtVerify = require('./jwt-verification'); // Used to update the JWT
// Import dependecies to work with CSV
const fsCsv = require("fs");
const csv = require("csvtojson"); // To read the csv file 
const { Parser } = require("json2csv");
const { apiUrlPrefix } = require('../config.json');

module.exports = {

    /**
     * Fetches all new course requests by making a GET HTTP request to the API.
     * For each new course requests, sends a new client announcement to the discord channel.
     * 
     * @param {object} channel the channel to which the message will be sent
     */
    getCourseRequests(channel) {
        const { jwt } = require('../config.json');	// The JWT for making secure API calls

		// The parameters of the HTTP request
		const params = {
        	headers : {'Authorization': `token: ${jwt}`}
        };

        const url = `${apiUrlPrefix}/new_course_requests`;

        // GET HTTP request
        fetch(url, params)
            .then(async res => {
                // if the jwt is invalid, get a new one and call this method again
                if (401 === res.status)	{
                    await jwtVerify.jwtSignin();
                    this.getCourseRequests(channel);
                // get the classes array and create the select menu with them
                } else if (200 === res.status)	{
                    const data = await res.json();
                    let arrayOfCourseRequests = data.result;

                arrayOfCourseRequests.forEach(courseRequest => {
                    sendNewClientAnnouncement(channel, courseRequest.ID, courseRequest.Subject, courseRequest.Frequency, courseRequest.LevelName, courseRequest.Money, courseRequest.Duration, courseRequest.dateOptions);
                });
            }})
            // Handle server errors
            .catch(error => {
                console.error(error);
            });
    },

    /**
     * Method that handles the selection of dates by the user.
     * @param {Interaction} interaction The interaction object.
     */
    async handleCourseDateSelection(interaction) {

        // The answers of all tutors that are stored inside the CSV in the form of an array
		const csvArray = await csv().fromFile("answers.csv");
		// Extract from the answer the announcement id
		const announcementId = interaction.values[0].split(",")[0];

		// Checks if the tutor has already an answer stored inside the CVS
		if (tutorMadeASelection(interaction.user.id, csvArray)) {
			updateMessage.alreadySelectedCourseOptionsMessage(interaction);
		} else {

			// Extract from the answer the ID of the dates selected.
			let answer = [];
			for (let i = 0; i < interaction.values.length; i++) {
				answer.push(interaction.values[i].split(",")[1]);
			}

            // Extract from the answer the dates selected.
			let dates = [];
			for (let i = 0; i < interaction.values.length; i++) {
				dates.push(interaction.values[i].split(",")[2]);
			}

			// Pushes the latest answer 
			csvArray.push({
				announcementId: announcementId,
				tutorId: interaction.user.id,
				IdsOfSelectedDates: answer.toString(),
                selectedDates: dates.toString(),
			});


			//Writes the modifications in the CSV file 
			fsCsv.writeFileSync("answers.csv", new Parser({
				fields: ["announcementId", "tutorId", "IdsOfSelectedDates", "selectedDates"]
			}).parse(csvArray));

			updateMessage.waitingForCourseSubmissionMessage(interaction);
		}
    },

    /**
     * Method that handles the submission of a tutor's answer to a course request
     * @param {Interaction} interaction 
     */
    async handleCourseRequestSubmission(interaction) {
        // The answers of all tutors that are stored inside the CSV in the form of an array
		const csvArray = await csv().fromFile("answers.csv");

        // If the tutor indeed made a selection, run this code.
		if (tutorMadeASelection(interaction.user.id, csvArray)) {

            // Stores the announcementId that is attached to the tutor that clicked the submit button as a number.
			let announcementId = undefined;
			// Stores the ids (numbers) of the dates selected by the user.
			let answerIds = [];
            // Stores the dates selected by the user (String).
            let answerDates = [];
			// Extract from the CSV the answer of the tutor that clicked the submit button.
			csvArray.forEach(answer => {
				if (answer.tutorId == interaction.user.id) {
                    announcementId = Number(answer.announcementId);
                    // Push all the ids of the dates selected in the answerIds array and converts the to numbers.
                    answerIds = answer.IdsOfSelectedDates.split(",").map(Number);
                    answerDates = answer.selectedDates;
				}
			});

			// POST request to API is created under tutorDemand route with tutorId, announcementId and date options IDs
            postTutorDemand(interaction, answerDates, interaction.user.id, announcementId, answerIds);

			// Delete the appropriate line in the CSV and write the new CSV state
			fsCsv.writeFileSync("answers.csv", new Parser({
				fields: ["announcementId", "tutorId", "IdsOfSelectedDates", "selectedDates"]
			}).parse(deleteTutorAnswer(interaction.user.id, csvArray)));

		} 
        else {
			updateMessage.noCourseDateSelectedMessage(interaction);
		}
    },

    /**
     * Method that handles the cancellation of a tutor's answer to a course request
     * @param {Interaction} interaction 
     */
    async handleCourseRequestCancellation(interaction)   {
        // The answers of all tutors that are stored inside the CSV in the form of an array
		const csvArray = await csv().fromFile("answers.csv");
        // If the tutor indeed made a selection, run this code.
		if (tutorMadeASelection(interaction.user.id, csvArray)) {

			// Stores the announcementId that is attached to the tutor that clicked the submit button as a number.
			let announcementId = undefined;
            // Stores the dates selected by the user (String).
            let answerDates = [];
			// Extract from the CSV the answer of the tutor that clicked the submit button.
			csvArray.forEach(answer => {
				if (answer.tutorId == interaction.user.id) {
                    announcementId = Number(answer.announcementId);
                    answerDates = answer.selectedDates;
				}
			});

			fsCsv.writeFileSync("answers.csv", new Parser({
				fields: ["announcementId", "tutorId", "IdsOfSelectedDates", "selectedDates"]
			}).parse(deleteTutorAnswer(interaction.user.id, csvArray)));

			updateMessage.courseRequestCancellationMessage(interaction, answerDates);
		} else {
			updateMessage.noCourseRequestActiveMessage(interaction);
		}
    },

    /**
     * Delete every row in the "answers" CSV
     */
    clearCSV()  {
        fsCsv.writeFileSync("answers.csv", new Parser({
            fields: ["announcementId", "tutorId", "IdsOfSelectedDates", "selectedDates"]
        }).parse([]));
    },

}

/**
 * Sends a message displaying a new client annoucement to discord.
 * User has the ability to select time slots via a select-menu.
 * @param {object} channel The channel to which the method will send the course requests to.
 * @param {number} announcementId The id of the announcement.
 * @param {Array} dateOptions All the date options for a particular course request with their ID. ex: [{"ID":20,"String":"Friday 11am"},{"ID":21,"String":"Monday 1pm"}]
 * @param {number} money The pay that the tutor will get for doing the class.
 * @param {String} subject The subject of the class.
 * @param {String} level The level of the class (A-Levels, GCSE ...)
 * @param {number} frequency The number of times per week the class will hold
 * @param {number} classDuration The duration of each session in hours.
 */
function sendNewClientAnnouncement(channel, announcementId, subject, frequency, level, money, classDuration, dateOptions) {

    // Store data inside dateOptions in appropriate variables
    const dates = [];
    dateOptions.forEach((date) => {
        dates.push(date.String);
    });

    // Create message object 
    const msgEmbed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle('New Client Anouncement')
        .setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Class(es) per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${dates.join(", ")}\n**Class duration**: ${classDuration} hour(s)`)
        .setTimestamp()
        .setFooter({
            text: 'Please select the date and time that fits you best and we will get back to you on the next steps.',
            iconURL: 'https://i.imgur.com/i1k870R.png'
        });

    //Create a row object that will hold the select menu
    const row = new ActionRowBuilder();

    //Create Select Menu object
    const menu = new SelectMenuBuilder()
        .setCustomId("courseDateSelected")
        .setPlaceholder(`Please select ${frequency} date option(s)`)
        .setMinValues(frequency)
        .setMaxValues(frequency)

    //Loop through the dates' list and display every date in select menu 
    dateOptions.forEach((dateAndTimeObject) => {
        menu.addOptions({
            "label": dateAndTimeObject.String,
            "value": `${announcementId},${dateAndTimeObject.ID}, ${dateAndTimeObject.String}`
        })
    });

    //Add menu to row
    row.addComponents(menu);

    // Add submit button inside new row
    const row2 = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId("submitCourseRequest")
            .setLabel('Submit request')
            .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
            .setCustomId("cancelCourseRequest")
            .setLabel('Cancel request')
            .setStyle(ButtonStyle.Danger),

        );

    // Sends both objects to channel
    channel.send({
        embeds: [msgEmbed],
        components: [row, row2]
    });
}

/**
 * Searches through the csv file if there already is an answer for a particular tutor. 
 * 
 * @param {Number} tutorId The id of the tutor we're looking for.
 * @param {Array} csvArray The array that contains all the tutors' answers.
 * @returns true if the tutor has been found, false otherwise.
 */
function tutorMadeASelection(tutorId, csvArray) {

    if (csvArray.length == 0) return false;

    let isFound = false;

    csvArray.forEach(answer => {
        if (answer.tutorId == tutorId) {
            isFound = true;
        }
    });

    return isFound;
}

/**
 * Delete the object of a particular tutor inside the csv array.
 * 
 * @param {number} tutorId The id of the tutor from whom we are going to delete the answer.
 * @param {Array} csvArray The array that contains the element we want to delete. 
 * @returns The updated version of the csv array.
 */
function deleteTutorAnswer(tutorId, csvArray) {

    let answerToDelete = undefined;

    // Find the object to delete and assign it to answerToDelete variable
    csvArray.every(answer => {

        if (answer.tutorId == tutorId) {
            answerToDelete = answer;
            return false;
        }

        return true;
    });

    // Get the index of the object to delete
    const indexOfElementToDelete = csvArray.indexOf(answerToDelete); 
    // only splice array when item is found
    if (indexOfElementToDelete > -1) { 
        csvArray.splice(indexOfElementToDelete, 1); // 2nd parameter means remove one item only
    }

    return csvArray;
}


/**
 * Post the tutor demand to the server via an HTTP Post Request.
 * 
 * 
 * @param {*} interaction The interaction currently active
 * @param {*} answers The answer of the tutor in the form of a string of dates
 * @param {*} discordId The discordID of the tutor
 * @param {*} courseRequestId The ID of the course request concerned
 * @param {*} datesSelected A list holding the IDs of the dates selected
 */
function postTutorDemand(interaction, answers, discordId, courseRequestId, datesSelected) {

    const { jwt } = require('../config.json');	// The JWT for making secure API calls

    const url = `${apiUrlPrefix}/tutor_demand`;

    const requestData = {
        discordID: discordId,
        courseRequestID: courseRequestId,
        dateOptions: datesSelected
    }

    // The parameters of the HTTP POST request
    const params = {
        method: "POST",
        headers : {
            'Content-Type': 'application/json',
            'Authorization': `token: ${jwt}`
        },
        body: JSON.stringify(requestData)
    };

    // An HTTP POST request
    fetch(url, params)
		.then(async res => {
		    // Update the message if there isn't any error
			if (res.status === 200)	{
				updateMessage.courseRequestConfirmationMessage(interaction, answers);
			}
            // if the jwt is invalid, get a new one and call this method again
			else if (401 === res.status)	{
				await jwtVerify.jwtSignin();
				postTutorDemand(interaction, answers, discordId, courseRequestId, datesSelected);
			}
            // if the course request has been approved to another tutor
			else if (410 === res.status)	{
				updateMessage.courseRequestTaken(interaction);
			}
		})
		// Handle server errors
		.catch(async error => {
			console.error(error);
			try {
				updateMessage.serverErrorMessage(interaction);
			} catch (interactionRepliedError) {
				console.error(interactionRepliedError);
			}
		});
}