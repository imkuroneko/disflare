const cf_data = require('../../config/cloudflare.json');
const roles = require('../../config/roles.json');

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('zonas')
        .setDescription('Ver zonas registradas')
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
                var status = '';
                switch(info.status) {
                    case 'active': status = 'Activo'; break;
                    case 'pending': status = 'Pendiente'; break;
                    case 'initializing': status = 'Inicializando'; break;
                    case 'moved': status = 'Migrado'; break;
                    case 'deleted': status = 'Eliminado'; break;
                    case 'deactivated': status = 'Desactivado'; break;
                }
                zonas.push({
                    name: 'Dominio: '+info.name,
                    value: "```yaml"+
                        "\nID: "+info.id+
                        "\nPlan: "+info.plan.name+
                        "\nEstado: "+status+
                        "\nOrig Reg: "+info.original_registrar+
                        "\nOrig DNS: "+info.original_dnshost+
                        "\nDNS Cloudflare: "+info.name_servers.join("; ")+
                    "```"
                });
            });

            return interaction.reply({ embeds: [{
                color: 0xf58540,
                title: `🔍 Dominios registrados en Cloudflare`,
                fields: zonas
            }] });
        } catch (error) {
            console.error('[error] cmdSlash:zonas |', error.message);
            return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
        }
    }
};