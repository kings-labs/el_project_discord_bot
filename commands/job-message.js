// Require the necessary discord.js classes
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	// The command's name and description
	data: new SlashCommandBuilder()
		.setName('job')
		.setDescription('Shows users a mock job request'),

	// The command's functionality
	async execute(interaction, client) 
	{
        const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('register_interest')
					.setLabel('Register interest')
					.setStyle(ButtonStyle.Success),
		    );

        const embed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setTitle('New Job Announcement')
			.setDescription('Subject: AP Computer Science A \nLevel: Highschool Senior \nHours per week: 5H \nPay per class: $10');

        try {
            await interaction.reply({ content: '', ephemeral: true, embeds: [embed], components: [row] });
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
}