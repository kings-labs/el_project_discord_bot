// Require the necessary discord.js classes
const { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import

module.exports = {
	
	/**
	 * Send a message to the user with a select menu to choose a class.
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
			const menu = new SelectMenuBuilder()
				// Used to retrieve interactions later
				.setCustomId('feedbackClassSelected')
				// A placeholder string to prompt the user
				.setPlaceholder('Select the class');

			// Iterate through the array which holds the tutor's classes
			classes.forEach(element => {
				menu.addOptions(
					{
						label : element.name,
						description: `Student: ${element.student} || Class date: ${element.date}`,
						value : element.id
					}
				);
			});

			// The action row which will hold the select menu
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
	 * Create a form (modal) and show it to users. The form has three text inputs:
	 * 1- To take the user's full name
	 * 2- To take more info about the user
	 * 3- The class ID is saved hare to be included in the interaction to be passed on
	 * !! The class ID section should not be edited by the user !!
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	async showFeedbackForm(interaction) 
	{
        const classId = interaction.values[0];

		// Create the modal object
		const modal = new ModalBuilder()
			.setCustomId('feedbackForm')
			.setTitle('Class Feedback Form');

		// Add components to modal

		// Create the text input component for taking more info about the user
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
     * Handle the test modal submission (forms submission).
     * Extract all of the data from the interaction, then make an
     * HTTP POST request with the API.
     * 
     * The API part is now commented out because there's no route for
     * this test function.
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
		const params = {
			method: "POST",
			body: JSON.stringify(requestData),
        	headers : {'Content-Type': 'application/json'}
        };
		const url = "http://localhost:8080/feedback_creation";

        fetch(url, params)
		.then(res => {console.log("0"); return res.json()})
    	.then(async json => {
			console.log(json);
			console.log("1");
			try {
				console.log("2");
				// Update the user's request into a confirmation message
				const confirmationMessage = 'Your submission has been received successfully! \nYou will recieve an email about the status of your request when it is completed.';
				await interaction.update({ content: confirmationMessage, embeds: [], components: [] , ephemeral: true });
				
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

	// DELETEEEEEEEEEEEE
	testing()
	{
		// Holds the extracted data in JSON format (to be sent to the API)
        const requestData = {
            classId: "999999",
            note: "I am a baddie"
        };
        const params = {
			method: "POST",
			body: JSON.stringify(requestData),
        	headers : {'Content-Type': 'application/json'}
        };
		const url = "http://localhost:8080/feedback_creation";

        fetch(url, params)
		.then(res => res.json())
		.then(json => console.log(json))
		.catch(err => console.log(err));
	}
}