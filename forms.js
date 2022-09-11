/**
 * This script shows users a form (modal) to complete.
 * It is only for testing ticket 04, so should be removed later on.
 */

// Require the necessary discord.js classes
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {

	/**
	 * Create a form (modal) and show it to users. The form has three text inputs:
	 * 1- To take the user's full name
	 * 2- To take more info about the user
	 * 3- The class ID is saved hare to be included in the interaction to be passed on
	 * !! The class ID section should not be edited by the user !!
	 * 
	 * @param {Interaction} interaction The user interaction object
	 * @param {string} classId The unique ID of the class to make the action on
	 */
	async execute(interaction, classId) 
	{
		// Create the modal object
		const modal = new ModalBuilder()
			.setCustomId('testModal')
			.setTitle('Customizable Form');

		// Add components to modal

		// Create the text input component for taking the user's name
		const nameInput = new TextInputBuilder()
			// Used to retrieve interactions later
			.setCustomId('nameInput')
		    // The label is the prompt the user sees for this input
			.setLabel("What's your full name?")
			// A placeholder string to prompt the user
			.setPlaceholder('Ali Sirgue')
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		// Create the text input component for taking more info about the user
		const aboutSelfInput = new TextInputBuilder()
			.setCustomId('aboutSelfInput')
			.setLabel("Why do you want to take this job?")
			.setPlaceholder('I like teaching!')
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// This text input holds the class ID, which the user shouldn't change
		const classInfo = new TextInputBuilder()
			.setCustomId('classInfo')
			.setLabel(`Leave this as (${classId}) to run successfully`)
			.setPlaceholder(`Type ${classId}`)
			// This is the default value that will be inputted
			.setValue(classId)
			.setStyle(TextInputStyle.Short);


		// An action row only holds one text input,
		// so one action row per text input is needed.
		const firstActionRow = new ActionRowBuilder().addComponents(nameInput);
		const secondActionRow = new ActionRowBuilder().addComponents(aboutSelfInput);
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
	}
};