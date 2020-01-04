import { BotContext, defaultContext, BotResponse } from './BotContext';

export async function Bot(text:string, context:BotContext = defaultContext): Promise<BotResponse> {
    const result = await context.echo(text)
    const response = {
        action: 'text',
        message: result
    }
    return response
}