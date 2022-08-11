const { token } = require('../../config/bot.json');
const roles = require('../../config/roles.json');

const { Client, GatewayIntentBits, Partials, SlashCommandBuilder } = require("discord.js");
const cpuStat = require("cpu-stat");
const os = require("os");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('Ver información del bot y el servidor.')
        .setDMPermission(false),
    async execute(interaction) {
        try {
            const memberHasRole = interaction.member.roles.cache.filter((role) => roles.includes(role.id)).map((role) => role.id);
            if(!memberHasRole.length) {
                return interaction.reply({ content: '🚨 **no tienes permiso para ejecutar este comando!**', ephemeral: true });
            }

            const djsversion = require("discord.js").version;

            const client2 = new Client({
                intents: [ GatewayIntentBits.GuildMessages ],
                partials: [ Partials.Message ]
            });

            client2.login(token);
            client2.on('ready', () => {
                var ping = client2.ws.ping;
                var uptime = client2.uptime;

                cpuStat.usagePercent(function (e, percent, s) {
                    return interaction.reply({ embeds: [{
                        color: 0xf58540,
                        title: '💻 Información del bot y estado del servidor',
                        fields: [
                            { name: '🤖 NodeJS', value: "```"+process.version+"```" },
                            { name: '👾 Discord.JS', value: "```v"+djsversion+"```" },
                            { name: '🏸 API Latency', value: "```"+ping+"ms```" },
                            { name: '⌚️ Uptime', value: "```"+duration(uptime).map(i=>i).join(", ")+"```" },
                            { name: '🧮 Consumo Memoria', value: "```"+(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)+" de "+(os.totalmem() / 1024 / 1024).toFixed(2)+"Mb```" },
                            { name: '🤖 Consumo CPU', value: "```"+percent.toFixed(2)+"%```" },
                            { name: '💻 Sistema Operativo', value: "```"+os.platform()+" ("+os.arch()+")```" },
                        ],
                    }] });
                });

                client2.destroy();
            });

            function duration(duration, useMilli = false) {
                let remain = duration;
                let days = Math.floor(remain / (1000 * 60 * 60 * 24));
                remain = remain % (1000 * 60 * 60 * 24);
                let hours = Math.floor(remain / (1000 * 60 * 60));
                remain = remain % (1000 * 60 * 60);
                let minutes = Math.floor(remain / (1000 * 60));
                remain = remain % (1000 * 60);
                let seconds = Math.floor(remain / (1000));
                remain = remain % (1000);
                let milliseconds = remain;
                let time = { days, hours, minutes, seconds, milliseconds };
                let parts = []

                if(time.days) { parts.push(time.days + ' Día'+(time.days !== 1 ? 's' : '')); }
                if(time.hours) { parts.push(time.hours + ' Hora'+(time.hours !== 1 ? 's' : '')); }
                if(time.minutes) { parts.push(time.minutes + ' Minuto'+(time.minutes !== 1 ? 's' : '')); }
                if(time.seconds) { parts.push(time.seconds + ' Segundo'+(time.seconds !== 1 ? 's' : '')); }
                if(useMilli && time.milliseconds) { parts.push(time.milliseconds + ' ms'); }

                if(parts.length === 0) {
                    return [ 'recientemente' ]
                } else {
                    return parts
                }
            }
        } catch (error) {
            console.error('[error] cmdSlash:bot |', error.message);
        }
    }
};