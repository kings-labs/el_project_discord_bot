// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuBuilder, InteractionResponseType } = require('discord.js');
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
	sendNewClientMessage(["Monday 9AM", "Wednesday 2PM", "Thursday 6PM"], 10, "Maths", "GCSE", 2, 1);
});

// Stores the number of classes pw; Need the variable in global scope to use it after.
let globalFrequency = 0;

/**
 * Sends a message displaying a new client annoucement to tutor's discord channel.
 * User has the possibility to select time slots via a button.
 * @param {Array} availabilities 
 * @param {number} money 
 * @param {String} subject 
 * @param {String} level 
 * @param {number} frequency
 * @param {number} classDuration
 */
function sendNewClientMessage(availabilities, money, subject, level, frequency, classDuration) {
	// Pass the frequency for it to be in global scope
	globalFrequency = frequency;

	// Get the channel to which it will send the annoucements
	const channel = client.channels.cache.get(mainChannelId);
	// Create message object 
	const msgEmbed = new EmbedBuilder()
		.setColor(0x7289DA)
		.setTitle('New Client Anouncement')
		.setDescription(`**Subject:** ${subject} \n**Level:** ${level} \n**Class(es) per week:** ${frequency} \n**Pay per class:** ${money} \n**Time slots:** ${availabilities.join(", ")}\n**Class duration**: ${classDuration} hour(s)`)
		.setTimestamp() 
		.setFooter({ text: 'Please select the date and time that fits you best and we will get back to you on the next steps.', iconURL:'https://i.imgur.com/i1k870R.png'});

	//Create a row object that will hold the select menu
	const row = new ActionRowBuilder();

	//Create Select Menu object
	const menu = new SelectMenuBuilder()
				.setCustomId("dateSelection")
				.setPlaceholder(`Please select ${globalFrequency} date option(s)`)
				.setMaxValues(frequency)

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

	// Add submit button inside new row
	const row2 = new ActionRowBuilder()
		.addComponents( 
			new ButtonBuilder()
				.setCustomId('submitButton')
				.setLabel('Submit request')
				.setStyle(ButtonStyle.Primary));
			
	// Sends both objects to channel
	channel.send({ embeds: [msgEmbed], components: [row,row2]});
}

// Stores the submission status
let answerSubmitted = false;
// This is the id of the tutor that submited the form
let answer = []; 
// This is his answer
let tutorId = undefined;

// When an interaction takes place, run this code
client.on('interactionCreate', async interaction => {

	if (interaction.customId === 'dateSelection') {

		tutorId = interaction.user.id; 
		answer = interaction.values; 
		await interaction.reply({content: "If you're done with your selection, please submit. You can still change your selection.", ephemeral: true})

	}

	if (interaction.customId === 'submitButton') {

		if (answer.length === 0 || answer.length !== globalFrequency) {
			 await interaction.reply({content: `Your request hasn't been sent. Please make sure to select ${globalFrequency} dates.`, ephemeral: true});
		}
		else if (answerSubmitted) {
			await interaction.reply({content: "You already submitted your request.", ephemeral: true});
		}
		else {
			answerSubmitted = true;
			await interaction.reply({content: "Your request has been sent", ephemeral: true});
			console.log({tutorId, answer});
		}
	}
});

