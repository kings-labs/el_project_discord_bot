const fetch = (...args) => import('node-fetch').then(({
    default: fetch
}) => fetch(...args)); // node-fetch import, it's basically a way of loading (instantiating) node-fetch
const {
    DMChannel
} = require('discord.js');
const {
    apiUrlPrefix
} = require('../config.json');
const { EmbedBuilder } = require('discord.js');
const jwtVerify = require('./jwt-verification'); // Used to update the JWT

module.exports = {

    getPrivateMessages(client) {
  
        const { jwt } = require('../config.json');	// The JWT for making secure API calls

		// The parameters of the HTTP request
		const params = {
        	headers : {'Authorization': `token: ${jwt}`}
        };

        const url = `${apiUrlPrefix}/private_messages`;

        fetch(url, params)
            .then(async res => {
                // if the jwt is invalid, get a new one and call this method again
                if (401 === res.status) {
                    await jwtVerify.jwtSignin();
                    this.getPrivateMessages(client);
                    // get the classes array and create the select menu with them
                } else if (200 === res.status) {
                    const data = await res.json();
                    let arrayOfPrivateMessages = data.messages;
                    arrayOfPrivateMessages.forEach(element => {
                        sendPrivateMessage(client, element.discordID, element.message);
                    });
                }
            })
            // Handle server errors
            .catch(error => {
                console.error(error);
            });
    },
}

/**
 * Sends a private message to a particular tutor concerning an update about one of his classes.
 * @param {*} client 
 * @param {*} discordID 
 * @param {*} messageContent 
 */
async function sendPrivateMessage (client, discordID, messageContent){

    // Create the frame of the message
    const msgEmbed = new EmbedBuilder()
        .setColor(0x7289DA)
        .setTitle("New Update !")
        .setDescription(messageContent)
        .setTimestamp()
        .setFooter({
            text: 'If you have any issue with this update please contact admin.',
            iconURL: 'https://i.imgur.com/i1k870R.png'
    });

    // Retrieve the user to whom the message is to be send
    const user = await client.users.fetch(discordID);

    // sends the message
    user.send({embeds: [msgEmbed]})
        .catch(e => {
            console.log(`The user '${user.username}' may have disabled the DM option in Discord.`)
        })
}