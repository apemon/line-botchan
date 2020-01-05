import 'dotenv/config'
import winston from 'winston'
import {LoggingWinston} from '@google-cloud/logging-winston'
import {Request, Response} from 'express'
import {WebhookRequestBody} from '@line/bot-sdk'

import {client} from './line'
import { Bot } from './bot/Bot'
import { defaultContext } from './bot/BotContext'
import UserService from './service/user-service'

const {NODE_ENV} = process.env
const serviceAccount = require('../google-credentials.json')

const stackdriverLogging = new LoggingWinston({
  credentials: serviceAccount,
  projectId: serviceAccount.project_id,
  logName: 'line_event'
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console()
  ]
})

const userService = new UserService()
const blankAddress = '000000'

console.log(NODE_ENV)
if(NODE_ENV === 'production') {
  logger.add(stackdriverLogging)
}

export async function webhookHandler(req: Request, _res: Response) {
  try {
    const {events} = req.body as WebhookRequestBody
    console.debug('Events Count:', events.length)
    for (let event of events) {
        if(event.type === 'join' || event.type === 'leave' || event.type === 'memberJoined' || event.type === 'memberLeft') {
            // log event
            logger.info('',event)
            continue
        }
        if(event.type != 'message')
            continue
        let to = blankAddress
        if(event.source.type === 'group') {
          to = event.source.groupId
          if(!userService.isAllow(to)) {
            await client.pushMessage(to, {
              type: 'text',
              text: 'แม่สอนว่าไม่ให้พูดกับคนแปลกหน้าฮับ'
            })
            continue
          }
        } else if(event.source.type === 'user') {
          to = event.source.userId
          if(!userService.isAllow(to)) {
            await client.pushMessage(to, {
              type: 'text',
              text: 'แม่สอนว่าไม่ให้พูดกับคนแปลกหน้าฮับ'
            })
            continue
          }
        }
            
        if (!to) continue

        if (event.type !== 'message') continue
        if (event.message.type !== 'text') continue

        const {text} = event.message
        console.log('text:', text)
        logger.info(event.message.text.toString(), event)

        const response = await Bot(text, defaultContext)

        await client.pushMessage(to, {
            type: 'text',
            text: response.message
        })
    }
  } catch (error) {
    console.error(error)
  }
}
