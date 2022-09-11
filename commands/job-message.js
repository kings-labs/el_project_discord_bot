/**
 * This script is the /job slash command. It sends a mock message
 * to the user (only the user who requested it can see it), and prompts
 * them to select the class which they intend to submit a request on. The user is then shown
 * a form (The code for this is in index.js because it deals with a client interaction)
 * to take further information and submit the request.
 * 
 * This command is added only to test ticket 04, so should be removed later on.
 */

// Require the necessary discord.js classes
const { ActionRowBuilder, EmbedBuilder, SlashCommandBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
	// The command's name, which the user will use and a description
	data: new SlashCommandBuilder()
		.setName('job')
		.setDescription('Shows users a mock job request'),

	/**
	 * Send a message to the user with a select menu to choose a class.
	 * Note that the choices are now hardcoded. Another ticket deals with this.
	 * 
	 * @param {Interaction} interaction The user interaction object
	 */
	async execute(interaction) 
	{
		// The action row which will hold the select menu
        const row = new ActionRowBuilder()
			.addComponents(
				// The select menu to choose a class
				new SelectMenuBuilder()
					// Used to retrieve interactions later
					.setCustomId('classSelect')
					// A placeholder string to prompt the user
					.setPlaceholder('Select the class')
					// The options themselves
					.addOptions(
						{
							label: 'Math GCSE',
							description: 'On Thursday 3PM',
							value: '11223344',
						},
						{
							label: 'Computer Science A',
							description: 'On Friday 2PM',
							value: '55667788',
						},
					),
		    );

		// The message is shown as an embed instead of a regular message because it looks nicer
        const embed = new EmbedBuilder()
			// The color of the embed
			.setColor(0x0099FF)
			.setTitle('Customizable')
			.setDescription('Select the class that you wish to complete the action with');

        try {
			// Send the message to the user
            await interaction.reply({ content: '', ephemeral: true, embeds: [embed], components: [row] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}