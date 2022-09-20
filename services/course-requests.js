/**
 * This class is responsible for fetching and sending to the discord channel every new course requests.
 * It is also responsible for retrieving and storing the answers to each client announcement and sending them to the API.
 * 
 * @version 20/09/2022 
 */

// Require the necessary files
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SelectMenuBuilder } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import
const updateMessage = require('./message-update'); // Contains useful methods to update the messages shown to users
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
     * @param {object} channel 
     */
    getCourseRequests(channel) {
        const url = `${apiUrlPrefix}/new_course_requests`;

        // GET HTTP request
        fetch(url)
            .then(response => response.json())
            .then(data => {

                let arrayOfCourseRequests = data.result;

                arrayOfCourseRequests.forEach(courseRequest => {
                    this.sendNewClientMessage(channel, courseRequest.Subject, courseRequest.Frequency, courseRequest.LevelName, courseRequest.Money, courseRequest.Duration, courseRequest.DateOptions);
                });
            })
            // Handle server errors
            .catch(error => {
                console.error(error);
            });
    },

    /**
     * Sends a message displaying a new client annoucement to discord.
     * User has the ability to select time slots via a select-menu.
     * @param {object} channel The channel to which the method will send the course requests to.
     * @param {Array} availabilities All the date options for a particular course request.
     * @param {number} money The pay that the tutor will get for doing the class.
     * @param {String} subject The subject of the class.
     * @param {String} level The level of the class (A-Levels, GCSE ...)
     * @param {number} frequency The number of times per week the class will hold
     * @param {number} classDuration The duration of each session in hours.
     */
    sendNewClientMessage(channel, announcementId, availabilities, money, subject, level, frequency, classDuration) {

        // Create message object 
        const msgEmbed = new EmbedBuilder()
            .setColor(0x7289DA)
            .setTitle('New Client Anouncement')
            .setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Class(es) per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${availabilities.join(", ")}\n**Class duration**: ${classDuration} hour(s)`)
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

        //Loop through the availabilities' list and display every ability to tutor via select menu 
        availabilities.forEach((dateAndTime) => {
            menu.addOptions({
                "label": dateAndTime,
                "value": `${announcementId},${dateAndTime}`
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

			// Extract from the answer only the days and times that we store inside the array answer
			let answer = [];
			for (let i = 0; i < interaction.values.length; i++) {
				answer.push(interaction.values[i].split(",")[1]);
			}
            
			// Pushes the latest answer 
			csvArray.push({
				announcementId: announcementId,
				tutorId: interaction.user.id,
				selection: answer.toString()
			});


			//Writes the modifications in the CSV file 
			fsCsv.writeFileSync("answers.csv", new Parser({
				fields: ["announcementId", "tutorId", "selection"]
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

			// Stores the announcementId that is attached to the tutor that clicked the submit button.
			let announcementId = undefined;
			// Stores the selection of the user that clicked the submit button.
			let answerValue = undefined;
			// Extract from the CSV the announcementId of the submit button that has been clicked.
			csvArray.forEach(answer => {
				if (answer.tutorId == interaction.user.id) {
					announcementId = answer.announcementId;
					answerValue = answer.selection;
				}
			});

			// POST request to API is created with tutorId and selection under tutorDemand route with announcementId

			updateMessage.courseRequestConfirmationMessage(interaction, answerValue);

			// Delete the appropriate line in the CSV and write the new CSV state
			fsCsv.writeFileSync("answers.csv", new Parser({
				fields: ["announcementId", "tutorId", "selection"]
			}).parse(deleteTutorAnswer(interaction.user.id, csvArray)));
		} else {
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

			// Stores the announcementId that is attached to the tutor that clicked the submit button.
			let announcementId = undefined;
			// Stores the selection of the user that clicked the submit button.
			let answerValue = undefined;
			// Extract from the CSV the announcementId of the submit button that has been clicked.
			csvArray.forEach(answer => {
				if (answer.tutorId == interaction.user.id) {
					announcementId = answer.announcementId;
					answerValue = answer.selection;
				}
			});

			fsCsv.writeFileSync("answers.csv", new Parser({
				fields: ["announcementId", "tutorId", "selection"]
			}).parse(deleteTutorAnswer(interaction.user.id, csvArray)));

			updateMessage.courseRequestCancellationMessage(interaction, answerValue);
		} else {
			updateMessage.noCourseRequestActiveMessage(interaction);
		}
    },

    /**
     * Delete every row in the "answers" CSV
     */
    clearCSV()  {
        fsCsv.writeFileSync("answers.csv", new Parser({
            fields: ["announcementId", "tutorId", "selection"]
        }).parse([]));
    },

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