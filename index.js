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
	sendNewClientMessage(["Monday 9AM", "Wednesday 2PM"], 10, "Maths", "GCSE", 2 );
});

/**
 * Sends a message displaying a new client annoucement to tutor's discord channel.
 * User has the possibility to select time slots via a button.
 * @param {Array} possibleDatesAndTimes 
 * @param {number} money 
 * @param {String} subject 
 * @param {String} level 
 * @param {number} frequency 
 */
function sendNewClientMessage(possibleDatesAndTimes, money, subject, level, frequency) {
	// Get the channel to which it will send the annoucements
	const channel = client.channels.cache.get(mainChannelId);
	// Create message object 
	const msgEmbed = new EmbedBuilder()
		.setColor(0x7289DA)
		.setTitle('New Client Anouncement')
		.setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Times per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${possibleDatesAndTimes.join(", ")}.`)
		.setTimestamp() 
		.setFooter({ text: 'Please select the date and time that fits you best and we will get back to you on the next steps.', iconURL:'https://i.imgur.com/i1k870R.png'});

	const arrayOfRows = [];

	for (let i = 1; i <= frequency; i++ ) {

		let row = new ActionRowBuilder();

		const menu = new SelectMenuBuilder()
					.setCustomId(i.toString())
					.setPlaceholder('Please select date option ' + i.toString())
			
		possibleDatesAndTimes.forEach((val, index) => {
			menu.addOptions(
				{
					"label": val,
					value: index.toString()
				}
				)
			}
		)

		row.addComponents(menu);

		arrayOfRows.push(row);
	}
	
	// Below is the block of code for the buttons option
    // const row = new ActionRowBuilder();
	// possibleDatesAndTimes.forEach((val, index) => {
	// 	row.addComponents(
	// 		new ButtonBuilder()
	// 			.setCustomId(index.toString())
	// 			.setLabel(val)
	// 			.setStyle(ButtonStyle.Primary),
	// 	);
	// });
		
	// Sends both objects to channel
	channel.send({ embeds: [msgEmbed], components: arrayOfRows});
}


// When an interation takes place, run this code
client.on('interactionCreate', async interaction => {
	// Whenever time slot button clicked run this
	if (interaction.customId === 'select_time_slot') {
		//createDateModal(interaction); // Create the modal for the user to input his answer (form)
	}


});

