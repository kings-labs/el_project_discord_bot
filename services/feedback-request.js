/**
 * This script contains all the necessary methods for the submitting
 * a class feedback request by tutors. It operates in a specific channel
 * in the discord server called 'complete-a-class'. 
 */

// Require the necessary discord.js classes
const { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import

module.exports = {
	
	/**
	 * Send a message to the user with a select-menu to choose the class
	 * which they want to submit feedback for. It contains an HTTP GET
	 * request to get the classes info via our API.
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	async sendFeedbackMessage(interaction) 
	{
		// url of the API call to get this tutor's classes
		const url = "http://localhost:8080/tutor_classes/:discord_username";

		// An HTTP GET request
        fetch(url)
		.then(data=> {return data.json()})	// format the response
		.then(async classes => 
		{
			// The select menu object
			const menu = new SelectMenuBuilder()
				// Used to retrieve interactions later
				.setCustomId('feedbackClassSelected')
				// A placeholder string to prompt the user
				.setPlaceholder('Select the class');

			// Iterate an array which holds all the tutor's classes
			// and add them to the select-menu
			classes.forEach(element => {
				menu.addOptions(
					{
						label : element.name,
						description: `Student: ${element.student} || Class date: ${element.date}`,
						value : element.id
					}
				);
			});

			// The action row which will hold the select-menu
			const row = new ActionRowBuilder().addComponents(menu);

			// The message is shown as an embed instead of a regular message because it looks nicer
			const embed = new EmbedBuilder()
			// The color of the embed
			.setColor(0x1b541d)
			.setTitle('Select a class')
			.setDescription('Select the class which you wish to submit feedback for');

			try {
				// Send the message to the user
				await interaction.reply({ content: '', ephemeral: true, embeds: [embed], components: [row] });
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		})
		// Handle server errors
		.catch(error => {
			console.log(error);
			interaction.reply({ content: 'There was an error while communicating with the server!', ephemeral: true });
		});
    },

    /**
	 * Create a feedback form (modal) and show it to the user.
	 * !! The class ID section should not be edited by the user
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	async showFeedbackForm(interaction) 
	{
		// Retrieve the chosen class Id from the interaction
        const classId = interaction.values[0];

		// Create the modal object
		const modal = new ModalBuilder()
			.setCustomId('feedbackForm')
			.setTitle('Class Feedback Form');

		// Add components to modal

		// Create the feedback text input component
		const feedback = new TextInputBuilder()
			.setCustomId('feedback')
			.setLabel("Leave feedback of the student's performance")
			.setPlaceholder('The student is exceptional!')
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// This text input holds the class ID, which the user shouldn't change
		const classInfo = new TextInputBuilder()
			.setCustomId('classId')
			.setLabel(`Set as ${classId} unless instructed otherwise`)
			.setPlaceholder(`Set as ${classId}`)
			// This is the default value that will be inputted
			.setValue(classId)
			.setStyle(TextInputStyle.Short);

		// An action row only holds one text input,
		// so one action row per text input is needed.
		const firstActionRow = new ActionRowBuilder().addComponents(feedback);
		const secondActionRow = new ActionRowBuilder().addComponents(classInfo);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow);

		try {
            // Show the modal to the user
			await interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},

    /**
     * Handle the feedback form submission.
     * Extract the data (feedback & classId) from the interaction, then make an
     * HTTP POST request via the API to send the request to the server.
     * 
     * @param {Interaction} interaction The user interaction object
     */
    async feedbackFormSubmission(interaction)	{
        // Get the data entered by the user
        const feedback = interaction.fields.getTextInputValue('feedback');
        const selectedClassId = interaction.fields.getTextInputValue('classId');
        
        // Holds the extracted data in JSON format (to be sent to the API)
        const requestData = {
            classId: selectedClassId,
            note: feedback
        };

		// The parameters of the HTTP POST request
		const params = {
			method: "POST",
			body: JSON.stringify(requestData),
        	headers : {'Content-Type': 'application/json'}
        };

		// The API URL for submitting class feedback
		const url = "http://localhost:8080/feedback_creation";

		/**
		 * A sub function to update the original message sent to the
		 * user, either confirms if the request is sent or
		 * shows that there was an error.
		 * 
		 * @param {interaction} interaction The user interaction object
		 */
		async function updateMessage(interaction)	{
			try {
				// Update the user's request into a confirmation message
				const confirmationMessage = 'Your submission has been received successfully! \nYou will recieve an email about the status of your request when it is completed.';
				await interaction.update({ content: confirmationMessage, embeds: [], components: [] , ephemeral: true });
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}

		// An HTTP POST request
        fetch(url, params)
		// Update the message if there was no server error
		.then(updateMessage(interaction))
		// Handle server errors
		.catch(error => {
			console.log(error);
			interaction.reply({ content: 'There was an error while communicating with the server!', ephemeral: true });
		});
        
    },
}