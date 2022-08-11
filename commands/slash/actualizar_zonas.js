const cf_data = require('../../config/cloudflare.json');
const roles = require('../../config/roles.json');

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('actualizar_zonas')
        .setDescription('Actualizar la caché de zonas (necesario al registrar o eliminar un dominio de la cuenta)')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const memberHasRole = interaction.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
            if(!memberHasRole.length) {
                return interaction.reply({ content: '🚨 **no tienes permiso para ejecutar este comando!**', ephemeral: true });
            }

            let res = await axios({
                method: 'get',
                url: 'https://api.cloudflare.com/client/v4/zones',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Email': cf_data.email_account,
                    'X-Auth-Key': cf_data.global_key
                }
            });

            if(!res.data.success) {
                return interaction.reply({ content: 'No se pudo obtener la información de las zonas~', ephemeral: true });
            }

            var zonas = [];
            res.data.result.forEach((info) => {
                if(info.status == 'active' || info.status == 'pending' || info.status == 'initializing') {
                    zonas.push({ 'id' : info.id, 'dominio' : info.name });
                }
            });

            fs.writeFile('./data/zonas.json', JSON.stringify(zonas), 'utf8', function (err) {
                if(err) {
                    console.log("An error occured while writing JSON Object to File.");
                    return console.log(err.message);
                }
                interaction.reply('🌥 Caché de dominios actualizada exitosamente... el bot se reiniciará');
            });

            setTimeout(() => { process.exit(); }, 2500);

        } catch (error) {
            console.error('[error] cmdSlash:zonas |', error.message);
            return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
        }
    }
};