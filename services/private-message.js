const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));	// node-fetch import
const { apiUrlPrefix } = require('../config.json');

module.exports = {

    getPrivateMessages() {
        const url = `${apiUrlPrefix}/private_messages`;
        
        fetch(url, params)
        .then(async res => {
            // if the jwt is invalid, get a new one and call this method again
            if (401 === res.status)	{
                await jwtVerify.jwtSignin();
                this.getPrivateMessages(channel);
            // get the classes array and create the select menu with them
            } 
            else if (200 === res.status)	{
                const data = await res.json();
                let arrayOfCourseRequests = data.result;

                arrayOfCourseRequests.forEach(privateMesssage => {
                    sendPrivateMessage(privateMessage.discordID, privateMesssage.message);
                });
            }
        })
        // Handle server errors
        .catch(error => {
            console.error(error);
        });
    },
}


function sendPrivateMessage() {
        
}

