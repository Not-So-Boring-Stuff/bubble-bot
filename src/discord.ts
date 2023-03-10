import {
  REST,
  Routes,
  Client,
  Collection,
  Events,
  Interaction,
  GatewayIntentBits,
  Command,
  SlashCommandBuilder
} from 'discord.js';
import * as Commands from './commands';

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN as string;
const rest = new REST({ version: '10' }).setToken(DISCORD_BOT_TOKEN);

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;

// Create a new client instance.
export const Bubble: Client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

Bubble.commands = new Collection();

// When the client is ready, run this code (only once)
Bubble.once(Events.ClientReady, async (c) => {
  /* eslint-disable-next-line no-console */
  console.log(`Ready! Logged in as ${c.user.tag}`);

  try {
    const commandList: SlashCommandBuilder[] = [];
    const commands = Commands as { [key: string]: Command };
    Object.keys(commands).map((name: string) => {
      Bubble.commands?.set(name.toLowerCase(), commands[name]);
      commandList.push(commands[name].data.toJSON());
    });

    if (CLIENT_ID && GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), {
        body: commandList
      });
    }
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.log(error);
  }
});

Bubble.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    /* eslint-disable-next-line no-console */
    console.log(`No command matching ${interaction.commandName} was found.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    /* eslint-disable-next-line no-console */
    console.error(error);
    const errMessage = {
      content: 'There was an error while executing this command!',
      ephemeral: true
    };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errMessage);
    } else {
      await interaction.reply(errMessage);
    }
  }
});
