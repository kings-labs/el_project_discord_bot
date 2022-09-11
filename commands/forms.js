// Require the necessary discord.js classes
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');

module.exports = {
	// The command's name and description
	data: new SlashCommandBuilder()
		.setName('forms')
		.setDescription('Shows users a form to complete'),

	// The command's functionality
	async execute(interaction) 
	{
		// DELETE THIS!!!!!!
		const classId = "11223344";

		// Create the modal
		const modal = new ModalBuilder()
			.setCustomId('testModal')
			.setTitle('Customizable Form');

		// Add components to modal

		// Create the text input component for taking the user's name
		const nameInput = new TextInputBuilder()
			.setCustomId('nameInput')
		    // The label is the prompt the user sees for this input
			.setLabel("What's your full name?")
			// set a placeholder string to prompt the user
			.setPlaceholder('Ali Sirgue')
		    // Short means only a single line of text
			.setStyle(TextInputStyle.Short);

		// Create the text input component for taking more info about the user
		const aboutSelfInput = new TextInputBuilder()
			.setCustomId('aboutSelfInput')
			.setLabel("Why do you want to take this job?")
			// set a placeholder string to prompt the user
			.setPlaceholder('I like teaching!')
		    // Paragraph means multiple lines of text.
			.setStyle(TextInputStyle.Paragraph);

		// Create the text input component for taking more info about the user
		const classInfo = new TextInputBuilder()
			.setCustomId('classInfo')
			.setLabel(`Leave this as (${classId}) to run successfully`)
			// set a placeholder string to prompt the user
			.setPlaceholder(`Type ${classId}`)
			.setValue(classId)
			.setStyle(TextInputStyle.Short);


		// An action row only holds one text input,
		// so you need one action row per text input.
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