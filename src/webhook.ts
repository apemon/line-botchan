import {Request, Response} from 'express'
import {WebhookRequestBody} from '@line/bot-sdk'

import {client} from './line'
import { Bot } from './bot/Bot'
import { defaultContext } from './bot/BotContext'

export async function webhookHandler(req: Request, _res: Response) {
  try {
    const {events} = req.body as WebhookRequestBody

    console.debug('Events Count:', events.length)

    for (let event of events) {
        const {userId} = event.source
        if (!userId) continue

        console.debug('>', event)

        if (event.type !== 'message') continue
        if (event.message.type !== 'text') continue

        const {text} = event.message
        console.log('text:', text)

        const response = await Bot(text, defaultContext)

        await client.pushMessage(userId, {
            type: 'text',
            text: response.message
        })
      
    }
  } catch (error) {
    console.error(error.message)
  }
}
