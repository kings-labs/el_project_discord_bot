/**
 * This script contains all the necessary methods for submitting
 * a class rescheduling request by tutors. It operates in a specific channel
 * in the discord server called 'reschedule-a-class'. 
 */

// Require the necessary discord.js classes
const { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ButtonBuilder, ButtonStyle } = require('discord.js');
const { reschedulingChannelId, apiUrlPrefix } = require('../config.json');
const updateMessage = require('./message-update');  // Contains useful methods to update the messages shown to users
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import

module.exports = {
	
	/**
	 * Send a message to the user with a select-menu to choose the class
	 * which they want to reschedule. It contains an HTTP GET
	 * request to get the classes info via our API.
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	async sendReschedulingMessage(interaction) 
	{
		// url of the API call to get this tutor's classes
		const url = `${apiUrlPrefix}/tutor_classes/${interaction.user.id}`;

		// An HTTP GET request
        fetch(url)
		.then(data=> {return data.json()})	// format the response
		.then(async classes => 
		{
            // Check if the tutor has any active classes
            if (0 === classes.length)   {
                updateMessage.noAvailableClassesMessage(interaction);
                return;
            }

			// The select menu object
			const menu = new SelectMenuBuilder()
				// Used to retrieve interactions later
				.setCustomId('reschedulingClassSelected')
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
			.setColor(0xff6600)
			.setTitle('Select a class')
			.setDescription('Select the class which you wish to reschedule');

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
			console.error(error);
            updateMessage.serverErrorMessage(interaction);
		});
    },

    /**
	 * Create a rescheduling form (modal) and show it to the user.
	 * !! The class ID section should not be edited by the user
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	async showReschedulingForm(interaction) 
	{
		// Retrieve the chosen class Id from the interaction
        const classId = interaction.values[0];

		// Create the modal object
		const modal = new ModalBuilder()
			.setCustomId('reschedulingForm')
			.setTitle('Class Rescheduling Form');

		// Add components to modal

		// Create the rescheduling reason input component
		const reason = new TextInputBuilder()
			.setCustomId('reschedulingReason')
			.setLabel("Why would you like to reschedule this class?")
			.setPlaceholder('I am feeling sick :(')
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

        // This text input holds the new date suggested by the tutor in MM/DD/YYYY format
		const newDate = new TextInputBuilder()
            .setCustomId('newDate')
            .setLabel(`Suggest a new date in MM/DD/YYYY format`)
            .setPlaceholder(`MM/DD/YYYY`)
            .setMinLength(10)
            .setMaxLength(10)
            .setStyle(TextInputStyle.Short);

		// This text input holds the class ID, which the user shouldn't change
		const classInfo = new TextInputBuilder()
			.setCustomId('reschedulingClassId')
			.setLabel(`Leave as ${classId} unless instructed otherwise`)
			.setPlaceholder(`Set as ${classId}`)
			// This is the default value that will be inputted
			.setValue(classId)
			.setStyle(TextInputStyle.Short);

		// An action row only holds one text input,
		// so one action row per text input is needed.
		const firstActionRow = new ActionRowBuilder().addComponents(reason);
		const secondActionRow = new ActionRowBuilder().addComponents(newDate);
		const thirdActionRow = new ActionRowBuilder().addComponents(classInfo);

		// Add inputs to the modal
		modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

		try {
            // Show the modal to the user
			await interaction.showModal(modal);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	},

    /**
     * Handle the rescheduling form submission.
     * Extract the data (reason, newDate & classId) from the interaction, then make an
     * HTTP POST request via the API to send the request to the server.
     * 
     * @param {Interaction} interaction The user interaction object
     */
    async reschedulingFormSubmission(interaction)	{
        // Get the data entered by the user
        const reschedulingReason = interaction.fields.getTextInputValue('reschedulingReason');
        const newDate = interaction.fields.getTextInputValue('newDate');
        const selectedClassId = interaction.fields.getTextInputValue('reschedulingClassId');
        
        // Holds the extracted data in JSON format (to be sent to the API)
        const requestData = {
            class_ID: selectedClassId,
            reason: reschedulingReason,
            new_date: newDate
        };

		// The parameters of the HTTP POST request
		const params = {
			method: "POST",
			body: JSON.stringify(requestData),
        	headers : {'Content-Type': 'application/json'}
        };

		// The API URL for submitting a class rescheduling request
		const url = `${apiUrlPrefix}/rescheduling_request`;

		// An HTTP POST request
        fetch(url, params)
		.then(res => {
		    // Update the message if there isn't any error
			if (200 === res.status)	{
				updateMessage.newDateConfirmationMessage(interaction, newDate);
			}
            // Update the message if the user entered an invalid class ID
            else if (412 === res.status)    {
                updateMessage.invalidClassIdMessage(interaction);
            }
            // Update the message if the user entered an invalid date format
            else if (408 === res.status)    {
                updateMessage.invalidDateFormatMessage(interaction);
            }
            // Update the message if the user has already submitted a request
            else if (406 == res.status) {
                updateMessage.pendingRequestMessage(interaction);
            }
			// Update the message if the user entered a date in the past
            else if (402 === res.status)    {
                updateMessage.datePassedMessage(interaction);
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
    },

	/**
	 * Create the message in the rescheduling channel which starts the
	 * requesting rescheduling process.
	 * IT SHOULD ONLY BE SENT ONCE!
	 * 
	 * @param {Client} client the bot's client object
	 */
	createInitialMessage(client)	{
		// Get the rescheduling channel to which it will send the message
		const reschedulingChannel = client.channels.cache.get(reschedulingChannelId);

		// Create the message as an embed because it looks nicer than a regular message 
		const msgEmbed = new EmbedBuilder()
		.setColor(0xffcc1f)
		.setTitle('Reschedule a class')
		.setDescription(`**Click on the button below to start**`);

		// The action row which holds the button
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('startRescheduling')
					.setLabel('HERE')
					.setStyle(ButtonStyle.Success),
			);

		// Send the message to the rescheduling channel
		reschedulingChannel.send({ embeds: [msgEmbed], components: [row]});
	}

}