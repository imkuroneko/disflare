const cf_data = require('../../config/cloudflare.json');
const roles = require('../../config/roles.json');
const zonas = require('../../data/zonas.json');

const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('listar_dns')
        .setDescription('Listar registros DNS del dominio indicado')
        .addStringOption(option => option.setName('dominio').setDescription('El dominio a revisar').setRequired(true).addChoices(...Object.keys(zonas).map((key) => ({ 'name' : zonas[key], 'value' : key }))))
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const memberHasRole = interaction.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
            if(!memberHasRole.length) {
                return interaction.reply({ content: '🚨 **no tienes permiso para ejecutar este comando!**', ephemeral: true });
            }

            const dominio = interaction.options.getString('dominio');

            let res = await axios({
                method: 'get',
                url: `https://api.cloudflare.com/client/v4/zones/${dominio}/dns_records?order=type&page=1&`,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Auth-Email': cf_data.email_account,
                    'X-Auth-Key': cf_data.global_key
                }
            });

            if(!res.data.success) {
                return interaction.reply({ content: 'No se pudo obtener la información de las zonas~', ephemeral: true });
            }

            var dns = "";

            res.data.result.forEach((info) => {
                if(info.proxiable) {
                    if(info.proxied) {
                        proxied = '🟠';
                    } else {
                        proxied = '⚫';
                    }
                } else {
                    proxied = '⭕';
                }

                content = info.content;
                if(content.length > 70) { content = `[omitido]`; }

                switch(info.type) {
                    case 'A':       type = '  A   '; break;
                    case 'AAAA':    type = ' AAAA '; break;
                    case 'CNAME':   type = 'CNAME '; break;
                    case 'HTTPS':   type = 'HTTPS '; break;
                    case 'TXT':     type = ' TXT  '; break;
                    case 'SRV':     type = ' SRV  '; break;
                    case 'LOC':     type = ' LOC  '; break;
                    case 'MX':      type = ' MX   '; break;
                    case 'NS':      type = ' NS   '; break;
                    case 'CERT':    type = 'CERT  '; break;
                    case 'DNSKEY':  type = 'DNSKEY'; break;
                    case 'DS':      type = '  DS  '; break;
                    case 'NAPTR':   type = 'NAPTR '; break;
                    case 'SMIMEA':  type = 'SMIMEA'; break;
                    case 'SSHFP':   type = 'SSHFP '; break;
                    case 'SVCB':    type = ' SVCB '; break;
                    case 'TLSA':    type = ' TLSA '; break;
                    case 'URI':     type = ' URI  '; break;
                }

                dns += `${proxied} | ${type} | ${info.ttl} | ${info.name}⠀➜⠀${content}\n`;
            });

            return interaction.reply("```\n"+dns+"```");
        } catch (error) {
            console.error('[error] cmdSlash:purgar_cache |', error.message);
            return interaction.reply({ content: '😖 Hubo un inconveniente al ejecutar el comando, revisa la consola del servidor para saber mas', ephemeral: true });
        }
    }
};