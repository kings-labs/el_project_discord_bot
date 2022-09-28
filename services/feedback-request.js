/**
 * This script contains all the necessary methods for the submitting
 * a class feedback request by tutors. It operates in a specific channel
 * in the discord server called 'leave-a-feedback'. 
 */

// Require the necessary discord.js classes
const { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const { feedbackChannelId, apiUrlPrefix } = require('../config.json');
const updateMessage = require('./message-update');  // Contains useful methods to update the messages shown to users
const jwtVerify = require('./jwt-verification'); // Used to update the JWT
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import

module.exports = {
	
	/**
	 * Send a message to the user with a select-menu to choose the class
	 * which they want to submit feedback for. It contains an HTTP GET
	 * request to get the classes info via our API.
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	sendFeedbackMessage(interaction) 
	{
		const { jwt } = require('../config.json');	// The JWT for making secure API calls

		// The parameters of the HTTP request
		const params = {
        	headers : {'Authorization': `token: ${jwt}`}
        };

		// url of the API call to get this tutor's classes
		// const url = `${apiUrlPrefix}/tutor_classes/${interaction.user.id}`;
		const url = `${apiUrlPrefix}/tutor_classes/discordALİ`;


		// An HTTP GET request
        fetch(url, params)
		.then(async res => {
			// if the jwt is invalid, get a new one and call this method again
			if (401 === res.status)	{
				await jwtVerify.jwtSignin();
				// interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				this.sendFeedbackMessage(interaction);
			// get the classes array and create the select menu with them
			} else if (200 === res.status)	{
				const classes = await res.json();
				createSelectMenuOptions(classes);
			}
		})
		// Handle server errors
		.catch(error => {
			console.error(error);
			updateMessage.serverErrorMessage(interaction);
		});

		/**
		 * Create the message that holds the select menu which tutors use
		 * to submit feedback for a class.
		 * 
		 * @param {Array} classes The active classes for the tutor
		 */
		async function createSelectMenuOptions(classes)	{
			// Check if the tutor has any active classes
            if (0 === classes.length)   {
                updateMessage.noAvailableClassesMessage(interaction);
                return;
            }

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
						value : String(element.id)
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
		};
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
			.setCustomId('feedbackClassId')
			.setLabel(`Leave as ${classId} unless instructed otherwise`)
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
        const givenFeedback = interaction.fields.getTextInputValue('feedback');
        const selectedClassId = interaction.fields.getTextInputValue('feedbackClassId');
        
        // Holds the extracted data in JSON format (to be sent to the API)
        const requestData = {
            class_ID: selectedClassId,
            feedback: givenFeedback
        };

		const { jwt } = require('../config.json');	// The JWT for making secure API calls

		// The parameters of the HTTP POST request
		const params = {
			method: "POST",
			body: JSON.stringify(requestData),
        	headers : {
				'Content-Type': 'application/json',
				'Authorization': `token: ${jwt}`
			}
        };

		// The API URL for submitting class feedback
		const url = `${apiUrlPrefix}/feedback_creation`;

		// An HTTP POST request
        fetch(url, params)
		.then(async res => {
		    // Update the message if there isn't any error
			if (200 === res.status)	{
				updateMessage.confirmationMessage(interaction);
			}
			// if the jwt is invalid, get a new one and call this method again
			else if (401 === res.status)	{
				await jwtVerify.jwtSignin();
				this.feedbackFormSubmission(interaction);
			}
			// Update the message if the user entered an invalid class ID
			 else if (412 === res.status)    {
                updateMessage.invalidClassIdMessage(interaction);
            }
            // Update the message if the user has already submitted a request
            else if (406 == res.status) {
                updateMessage.pendingRequestMessage(interaction);
            }
		})
		// Handle server errors
		.catch(async error => {
			console.error(error);
			// Catch the error resulting from trying to reply to an already replied to interaction
			try {
				updateMessage.serverErrorMessage(interaction);
			} catch (interactionRepliedError) {
				console.error(interactionRepliedError);
			}
		});
    },

	/**
	 * Create the message in the feedback channel which starts the
	 * submitting feedback process.
	 * IT SHOULD ONLY BE SENT ONCE!
	 * 
	 * @param {Client} client the bot's client object
	 */
	createInitialMessage(client)	{
		// Get the feedback channel to which it will send the message
		const feedbackChannel = client.channels.cache.get(feedbackChannelId);

		// Create the message as an embed because it looks nicer than a regular message 
		const msgEmbed = new EmbedBuilder()
		.setColor(0xffcc1f)
		.setTitle('Submit feedback for a class')
		.setDescription(`**Click on the button below to start**`);

		// The action row which holds the button
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('startFeedback')
					.setLabel('HERE')
					.setStyle(ButtonStyle.Success),
			);

		// Send the message to the feedback channel
		feedbackChannel.send({ embeds: [msgEmbed], components: [row]});
	}

}