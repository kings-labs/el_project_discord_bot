// Require the necessary discord.js classes
const { ActionRowBuilder, EmbedBuilder, SelectMenuBuilder } = require('discord.js');

module.exports = {
	/**
	 * Send a message to the user with a select menu to choose a class.
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
					.setCustomId('feedbackClassSelected')
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
    }
}