import { Message } from "discord.js";
import { BrayanBot } from "../Modules/Structures/BrayanBot";
import { EventListener } from "../Modules/Structures/Handlers/Events";
import Utils from "../Modules/Utils";

export default new EventListener("messageCreate", async (bot: BrayanBot, message: Message) => {
    const { config } = bot.configs;

    let prefixUsed: string | undefined;
    if(message.content && Array.isArray(config?.Settings.Prefix)) {
        prefixUsed = config?.Settings.Prefix.find(prefix => message.content.toLowerCase().startsWith(prefix.toLowerCase())) as string;
    } else if(message.content && typeof config?.Settings.Prefix == "string") {
        prefixUsed = config?.Settings.Prefix;
    }

    if(prefixUsed) {
        if(config?.Settings.IgnoreBots && message.author.bot) return; 
        
        const msg = message.content.split(" ");
        const command = msg[0].toLowerCase().replace(prefixUsed, "");
        const args = msg.slice(1);

        const cmd = bot.commands.get(command);
        if(!cmd) return;

        if(cmd.commandData.Permission && !Utils.hasPermission(cmd.commandData.Permission, message.member!)) {
            return message.reply(Utils.setupMessage({
                configPath: bot.configs.lang?.Miscellaneous.InvalidPermissions!,
                variables: Utils.userVariables(message.member!)
            }))
        }

        await cmd.runLegacy?.call(this, bot, message, args, prefixUsed, cmd)
    }
})