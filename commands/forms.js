// Require the necessary discord.js classes
const { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SlashCommandBuilder } = require('discord.js');
const { Modal, TextInputComponent, SelectMenuComponent } = require('discord-modals'); // The Modal class from discord-modals library

module.exports = {
	// The command's name and description
	data: new SlashCommandBuilder()
		.setName('forms')
		.setDescription('Shows users a form to complete'),

	// The command's functionality
	async execute(interaction, client) 
	{
		const discordModals = require('discord-modals'); // Define the discord-modals package

		// discord-modals needs the client in order to interact with modals
		discordModals(client); 

		const modal = new Modal() // We create a Modal
		.setCustomId('testModal')
		.setTitle('Customizable Form')
		.addComponents(
			new TextInputComponent() // We create a Text Input Component
				.setCustomId('nameInput')
				// The label is the prompt the user sees for this input
				.setLabel("What's your full name?")
				// set a placeholder string to prompt the user
				.setPlaceholder('Ali Sirgue')
				// Short means only a single line of text
				.setStyle('SHORT')
				// true if the user has to fill it
				.setRequired(true),

			// new SelectMenuComponent() // We create a Select Menu Component
			// 	.setCustomId('timeSelect')
			// 	.setPlaceholder('Select your preferred time/date for the first class')
			// 	.addOptions(
			// 		{
			// 			label: 'option_one',
			// 			description: 'Friday 3PM, September 22',
			// 			value: 'Friday',
			// 		},
			// 		{
			// 			label: 'option_two',
			// 			description: 'Saturday 2PM, September 23',
			// 			value: 'Saturday',
			// 		},
			// 	),
		);

		try {
            // Show the modal to the user
			discordModals.showModal(modal, {
				client: client, // Client to show the Modal through the Discord API.
				interaction: interaction, // Show the modal with interaction data.
			});
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
	}
};