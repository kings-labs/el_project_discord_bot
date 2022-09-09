// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuBuilder } = require('discord.js');
const { token, mainChannelId, guildId } = require('./config.json');

// Create a new client instance
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
	],
});

// Login to Discord with your client's token
client.login(token);

// When the client is ready, run this code (only once)
client.once('ready', () => { 
	console.log('Ready !');	
	sendNewClientMessage(["Monday 9AM", "Wednesday 2PM", "Thursday 6PM"], 10, "Maths", "GCSE", 2 );
});

/**
 * Sends a message displaying a new client annoucement to tutor's discord channel.
 * User has the possibility to select time slots via a button.
 * @param {Array} availabilities 
 * @param {number} money 
 * @param {String} subject 
 * @param {String} level 
 * @param {number} frequency 
 */
function sendNewClientMessage(availabilities, money, subject, level, frequency) {
	// Get the channel to which it will send the annoucements
	const channel = client.channels.cache.get(mainChannelId);
	// Create message object 
	const msgEmbed = new EmbedBuilder()
		.setColor(0x7289DA)
		.setTitle('New Client Anouncement')
		.setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Times per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${availabilities.join(", ")}.`)
		.setTimestamp() 
		.setFooter({ text: 'Please select the date and time that fits you best and we will get back to you on the next steps.', iconURL:'https://i.imgur.com/i1k870R.png'});

	//Create a row object that will hold the select menu
	const row = new ActionRowBuilder();

	//Create Select Menu object
	const menu = new SelectMenuBuilder()
				.setCustomId("dateSelection")
				.setPlaceholder('Please select date option')
				.setMaxValues(frequency);

	//Loop through the availabilities' list and display every ability to tutor via select menu 
	availabilities.forEach((val, index) => {
		menu.addOptions(
			{
				"label": val,
				value: val
			}
		)
	});

	//Add menu to row
	row.addComponents(menu);
		
	// Sends both objects to channel
	channel.send({ embeds: [msgEmbed], components: [row]});
}


// When an interaction takes place, run this code
client.on('interactionCreate', interaction => {

	if (interaction.customId === 'dateSelection') {
		
		const tutorId = interaction.user.id; // This is the tutor that submited the form
		const answer = interaction.values; // This is his answer

		interaction.reply({content: "Your request has been sent", ephemeral: true});

		console.log({tutorId, answer});

	}
});

