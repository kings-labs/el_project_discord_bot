// Require the necessary discord.js classes
const { Client, GatewayIntentBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, SelectMenuBuilder, InteractionResponseType } = require('discord.js');
const { token, mainChannelId, guildId } = require('./config.json');

// Import dependecies to work with CSV
const fs = require("fs");
const csv = require("csvtojson"); // To read the csv file 
const { Parser } = require("json2csv"); // To write the csv file

// Create a new client instance
const client = new Client({ 
	intents: [
		GatewayIntentBits.Guilds,
	],
});

// When the client is ready, run this code (only once)
client.once('ready', () => { 
	console.log('Ready !');	
	sendNewClientMessage(["Monday 9AM", "Wednesday 2PM", "Thursday 6PM"], 10, "Maths", "GCSE", 2, 1);
	//sendNewClientMessage(["Monday 9AM", "Wednesday 2PM", "Thursday 6PM"], 10, "CS", "Uni", 1, 2);
});

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
				.setPlaceholder(`Please select ${frequency} date option(s)`)
				.setMinValues(frequency)
				.setMaxValues(frequency)

	//Loop through the availabilities' list and display every ability to tutor via select menu 
	availabilities.forEach((val) => {
		menu.addOptions(
			{
				"label": val,
				"value": val
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


client.on('interactionCreate', async interaction => {

	if (interaction.customId === 'dateSelection') {
		// The answers of all tutors that are stored inside the CSV in the form of an array
		const answers = await csv().fromFile("answers.csv");
		// Checks if the tutor has already an answer stored inside then CVS
		if (tutorIdInCSV(interaction.user.id, answers)) {
			// Option: Please make sur to submit your other answer before selecting this one.
			deleteTutorAnswer(interaction.user.id, answers); // deletes his answer
		} 
		// Pushes the latest answer 
		answers.push({ tutorId: interaction.user.id, selection: interaction.values.toString() });

		//Writes the modifications in the CSV file 
		fs.writeFileSync("answers.csv", new Parser({fields: ["tutorId", "selection"] }).parse(answers));

		interaction.reply({ content: "If you're done with your selection, please submit. You can still change your selection.", ephemeral: true })
	}


	if (interaction.customId === 'submitButton') {

		// POST request to API is created with tutorId and selection under tutorDemand route


		interaction.reply({content: "Your request has been sent. Please don't request again.", ephemeral: true});
	}

});

function tutorIdInCSV(tutorId, csvArray) {

	if (csvArray.length == 0) return false;

	let isFound = false;

	csvArray.forEach(answer => {
		if (answer.tutorId == tutorId) {
			isFound = true;
		}
	});
	return isFound;
}

function deleteTutorAnswer(tutorId, csvArray) {
	let tutorAnswerObject = undefined;

	// Find the object to delete and assign it to tutorAnswerObject variable
	csvArray.every(answer => {
		if (answer.tutorId == tutorId) {
			tutorAnswerObject = answer;
		 return false;
		}
		return true;
	});

	const indexOfElementToDelete = csvArray.indexOf(tutorAnswerObject); // Get the idex of the object to delete
	if (indexOfElementToDelete > -1) { // only splice array when item is found
	csvArray.splice(indexOfElementToDelete, 1); // 2nd parameter means remove one item only
	}

	return csvArray;
}


// Login to Discord with your client's token
client.login(token);



// // This is the id of the tutor that submited the form
// let answer = []; 
// //This is the id of the tuto that submitted 
// let tutorId = undefined;
// // This list contains all the tutors Id that submited the form
// let allTutors = [];
// // List containing all the submissions in the form of objects 
// let courseRequestAnswers = [];

// // When an interaction takes place, run this code
// client.on('interactionCreate', async interaction => {

// 	// if interaction is the select menu, run this 
// 	if (interaction.customId === 'dateSelection') {
// 		answer = interaction.values;  // get the answer's value
// 		await interaction.reply({content: "If you're done with your selection, please submit. You can still change your selection.", ephemeral: true})
// 	}

// 	// if interaction is the submit button, run this 
// 	if (interaction.customId === 'submitButton') {

// 		tutorId = interaction.user.id

// 		courseRequestAnswers.push({tutorId, answer})

// 		if (allTutors.includes(interaction.user.id)) {
// 			await interaction.reply({content: "You already submitted your request.", ephemeral: true});
// 		}
// 		else {
// 			await interaction.reply({content: "Your request has been sent", ephemeral: true});
// 			allTutors.push(tutorId);
// 			console.log(courseRequestAnswers);
// 		}
// 	}


// });

// Problem: when 2 announcement are submitted, only one is saved (the latest)

