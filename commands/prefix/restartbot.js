const roles = require('../../config/roles.json');

exports.run = (client, message, args) => {
    try {

        const memberHasRole = message.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
        if(!memberHasRole.length) {
            return message.reply("🚨 **no tienes permiso para ejecutar este comando!**");
        }

        process.exit();

    } catch (error) {
        console.error('[error] cmdPrefix:restartbot |',error.message);
    }
}