const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    execute(client) {

        try {
            client.user.setPresence({
                activities: [{ name: "the cloud 🌥", type: ActivityType.Watching }],
                status: 'dnd',
            });
        } catch(error) {
            console.error('[error] event:ready |', error.message);
        }
        console.log('[init] Bot operativo!');
    }
};