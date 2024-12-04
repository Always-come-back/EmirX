const { execSync } = require('child_process');

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
let maintenanceMode = false;  // Bakım modu başlangıçta kapalı

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setActivity('EmirX | ismetemir_.', { type: 'WATCHING' });
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // Bakım modu aktifse sadece admin komutları çalışacak
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
            .setDescription(`
            **Komutlar:**
            🛠️ \`!exyardım\` - Yardım menüsünü gösterir.
            🔨 \`!exban @kullanıcı [sebep]\` - Belirtilen kullanıcıyı yasaklar.
            🦶 \`!extekme @kullanıcı\` - Belirtilen kullanıcıyı sunucudan atar.
            🔇 \`!exsustur @kullanıcı [süre]\` - Kullanıcıyı belirtilen süre boyunca susturur.
            🔊 \`!exsusturmayıkaldır @kullanıcı\` - Susturmayı kaldırır.
            💎 \`!expremiumver @kullanıcı\` - Kullanıcıya premium verir.
            🧹 \`!extemizle [sayı]\` - Belirtilen sayı kadar mesajı siler.
            `)
            .setColor('#00FF00')
            .setFooter({ text: 'EmirX Bot' });

        return message.channel.send({ embeds: [embed] });
    }

    // Temizle Komutu
    if (command === 'temizle') {
        const amount = parseInt(args[0], 10); // Girilen sayıyı al
        if (isNaN(amount)) {
            return message.reply('Lütfen silmek istediğiniz mesaj sayısını belirtin. 🧹');
        }
        if (amount < 1 || amount > 1000) {
            return message.reply('Lütfen 1 ile 1000 arasında bir sayı girin. 🔢');
        }

        // Mesajları sil
        try {
            await message.channel.bulkDelete(amount, true);
            const confirmation = await message.channel.send(`✅ ${amount} mesaj başarıyla silindi!`);
            setTimeout(() => confirmation.delete(), 5000); // Mesajı 5 saniye sonra sil
        } catch (err) {
            console.error(err);
            message.reply('Mesajları silerken bir hata oluştu.');
        }
    }

    // Bakım Modu Kontrolü
    if (command === 'bakım') {
        if (!message.member.permissions.has('ADMINISTRATOR')) {
            return message.reply('Bu komutu kullanmak için yönetici olmanız gerekir. ❌');
        }

        maintenanceMode = !maintenanceMode;
        const status = maintenanceMode ? '🛠️ Bot bakım moduna alındı.' : '✅ Bakım modu kapatıldı, bot normal kullanıma geçti.';
        return message.channel.send(status);
    }

    // Debug Komutu
    if (command === 'debug') {
        const ping = client.ws.ping;
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Debug Bilgileri')
            .setDescription(`📶 Ping: ${ping}ms\n⚠️ Durum: ${maintenanceMode ? 'Bakım Modunda' : 'Normal'}`)
            .setColor('#FF0000');

        return message.channel.send({ embeds: [embed] });
    }
});

// Botu başlat
client.login('YOUR_BOT_TOKEN');
