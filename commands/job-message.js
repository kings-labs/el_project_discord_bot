// Require the necessary discord.js classes
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, SlashCommandBuilder } = require('discord.js');

module.exports = {
	// The command's name and description
	data: new SlashCommandBuilder()
		.setName('job')
		.setDescription('Shows users a mock job request'),

	// The command's functionality
	async execute(interaction) 
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

		await interaction.reply({ content: '', ephemeral: true, embeds: [embed], components: [row] });
    },
    
    // A listener for the user's response (if they click the button)
    async listenForReply(client)
    {
        client.on('interactionCreate', interaction => {
	
            // Do not continue if the interaction isn't a button or isn't 'register_interest'
            if (!interaction.isButton() || !(interaction.customId === 'register_interest')) return;
            
            // fetch the 'forms' command in the Collection and assign it to the variable chosenCommand
            const chosenCommand = interaction.client.commands.get('forms');
        
            // call the command's .execute() method, and pass in the interaction variable as its argument.
            try {
                chosenCommand.execute(interaction);
            } catch (error) {
                console.error(error);
                interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        });
    }
}