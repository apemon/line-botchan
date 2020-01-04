export interface BotContext {
    echo: (text:string) => Promise<string>
}

export interface BotResponse {
    action: string,
    message: string
}

export const defaultContext: BotContext = {
    async echo(text:string) {
        return text
    }
}