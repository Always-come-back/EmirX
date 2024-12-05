require('dotenv').config();
const { execSync } = require('child_process');
const readline = require('readline');

// discord.js kontrolü
try {
    require.resolve('discord.js');
    console.log('discord.js zaten yüklü!');
} catch (e) {
    console.log('discord.js bulunamadı, yükleniyor...');
    execSync('npm install discord.js', { stdio: 'inherit' });
}

// discord.js modülü
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

// Bot Ayarları
const PREFIX = '!ex';
let maintenanceMode = false; // Bakım modu başlangıçta kapalı
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

// Kullanıcıdan token almak için readline oluştur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Kullanıcıdan token sor
rl.question('Lütfen botunuzun tokenini girin: ', (token) => {
    if (!token) {
        console.error('Token verilmedi. Bot başlatılamıyor!');
        rl.close();
        process.exit(1);
    }

    // Bot hazır olduğunda
    client.once('ready', () => {
        console.log('Bot is online!');
        client.user.setActivity('EmirX | ismetemir_.', { type: 'WATCHING' });
    });

    // Komutlar
    client.on('messageCreate', async (message) => {
        if (message.author.bot) return;

        // Bakım modu kontrolü
        if (maintenanceMode && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('🚧 Bot bakımda. Şu anda komutlar devre dışı.');
        }

        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();

        // Yardım Menüsü
        if (command === 'yardım') {
            const embed = new EmbedBuilder()
                .setTitle('📋 EmirX Yardım Menüsü')
                .setDescription(`**Komutlar:**\n
                    🛠️ \`!exyardım\` - Yardım menüsünü gösterir.
                    🔨 \`!exban @kullanıcı [sebep]\` - Belirtilen kullanıcıyı yasaklar.
                    🦶 \`!extekme @kullanıcı\` - Belirtilen kullanıcıyı sunucudan atar.
                    🔇 \`!exsustur @kullanıcı [süre]\` - Kullanıcıyı belirtilen süre boyunca susturur.
                    🔊 \`!exsusturmayıkaldır @kullanıcı\` - Susturmayı kaldırır.
                    💎 \`!expremiumver @kullanıcı\` - Kullanıcıya premium verir.
                    🧹 \`!extemizle [sayı]\` - Belirtilen sayı kadar mesajı siler.`)
                .setColor('#00FF00')
                .setFooter({ text: 'EmirX Bot' });
            return message.channel.send({ embeds: [embed] });
        }

        // Diğer komutlar burada...

    });

    // Botu başlat
    client.login(token)
        .then(() => rl.close())
        .catch((err) => {
            console.error('Token hatalı veya bot başlatılamadı!', err);
            rl.close();
            process.exit(1);
        });
});
