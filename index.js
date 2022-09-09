// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuBuilder } = require('discord.js');
const { token, channelID, guildID } = require('./config.json');

// Create a new client instance
const client = new Client({ 

	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
	],
});

// Login to Discord with your client's token
client.login(token);

// When the client is ready, run this code (only once)
client.once('ready', () => { 
	console.log('Ready !');	
	sendNewClientMessage(["Monday 9AM", "Wednesday 2PM"], 10, "Maths", "GCSE", 3 );
});

/**
 * Sends a message displaying new client to tutors discord channel when it is called.
 * User has the possibility to select time slots via a button.
 * @param {Array} possibleDatesAndTimes 
 * @param {Integer} money 
 * @param {String} subject 
 * @param {String} level 
 * @param {Integer} frequency 
 */
function sendNewClientMessage(possibleDatesAndTimes, money, subject, level, frequency) {
	// Get the channel to which it will send the anoucements
	const channel = client.channels.cache.get(channelID);
	// Create message object 
	const msgEmbed = new EmbedBuilder()
		.setColor(0x7289DA)
		.setTitle('New Client Anouncement')
		.setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Times per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${possibleDatesAndTimes.join(", ")}.`)
		.setTimestamp() 
		.setFooter({ text: 'Please select the date and time that fits you best and we will get back to you on the next steps.', iconURL:'https://i.imgur.com/i1k870R.png'});
	// Create button object
	const row = new ActionRowBuilder()
		.addComponents(
			new ButtonBuilder()
				.setCustomId("select_time_slot")
				.setLabel("Select Time Slot")
				.setStyle(ButtonStyle.Success),
		);
	// Sends both objects to channel
	channel.send({ embeds: [msgEmbed], components: [row]});
}

// When an interation takes place, run this code
client.on('interactionCreate', async interaction => {
	// Whenever time slot button clicked run this
	if (interaction.customId === 'select_time_slot') {
		createDateModal(interaction); // Create the modal for the user to input his answer (form)
	}
	// When date modal is submitted, run this code
	if (interaction.customId === 'dateModal') {
		// Get the data entered by the user
		const dateSelected = interaction.fields.getTextInputValue('dateInput'); // This is where the answer is stored
		await interaction.reply({ content: 'Your submission was received successfully!' });
	}
	

});

/**
 * Create the form for the tutor to input its availabilities 
 * @param {ButtonInteraction} interaction 
 */
function createDateModal(interaction) {

	// Create the modal
	const modal = new ModalBuilder()
		.setCustomId('dateModal')
		.setTitle('Date Selction Form');
	
	// Add components to modal

	// Create the text input components
	const dateInput = new TextInputBuilder()
		.setCustomId('dateInput')
		// The label is the prompt the user sees for this input
		.setLabel("Please enter the time slots that suit you.")
		// set a placeholder string to prompt the user
		.setPlaceholder('Enter your dates here...')
		// Short means only a single line of text
		.setStyle(TextInputStyle.Paragraph);

	// An action row only holds one text input,
	// so you need one action row per text input.
	const firstActionRow = new ActionRowBuilder().addComponents(dateInput);

	// Add inputs to the modal
	modal.addComponents(firstActionRow);

	// Show the modal to the user
	interaction.showModal(modal);
}