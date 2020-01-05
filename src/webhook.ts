import 'dotenv/config'
import winston from 'winston'
import {LoggingWinston} from '@google-cloud/logging-winston'
import {Request, Response} from 'express'
import {WebhookRequestBody, Group} from '@line/bot-sdk'
import sleep from 'sleep'

import {client} from './line'
import { Bot } from './bot/Bot'
import { defaultContext } from './bot/BotContext'
import UserService from './service/user-service'
import { LineUser } from 'types/user'

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

console.log(NODE_ENV)
if(NODE_ENV === 'production') {
  logger.add(stackdriverLogging)
}

export async function webhookHandler(req: Request, _res: Response) {
  try {
    const userService:UserService = req.app.get('userService')
    const {events} = req.body as WebhookRequestBody
    console.debug('Events Count:', events.length)
    for (let event of events) {
        console.log(event)
        if(event.type === 'join') {
          logger.info('',event)
          // greeting
          if(event.source.type !== 'group')
            continue
          const to = event.source.groupId
          await chat(to, 'สวัสดีครับ ยินดีที่ได้รู้จักทุกคนฮับ ขอผมลงทะเบียน line group นี้ก่อนนะฮับ')
          await userService.addGroup({allow:true,line_group_id: to})
          sleep.sleep(1)
          await chat(to, 'เนื่องจากเจ้านายเขางบจำกัด ไม่ยอมจ่ายค่า account premium ให้ ทำให้ผมไม่สามารถทำความรู้จักกับทุกคนใน group ได้ รบกวนทุกคนลงทะเบียนกันเองไปก่อนนะครับ')
          sleep.sleep(1)
          await chat(to, 'พูดว่า ลงทะเบียน ตามด้วยชื่อ และชื่อเล่นได้เลยครับ เช่น')
          sleep.sleep(1)
          await chat(to, 'ลงทะเบียน Oh โอ๋')
        } else if (event.type === 'leave') {
          logger.info('',event)
        } else if (event.type === 'memberJoined') {
          logger.info('',event)
          // @TODO auto enroll
        } else if (event.type === 'memberLeft') {
          logger.info('',event)
        } else if (event.type === 'message') {
          if (event.message.type !== 'text') continue

          if(event.source.type === 'user') {
            const to = event.source.userId
            if(!userService.isAllow(to)) {
              await chat(to, 'แม่สอนว่าไม่ให้พูดกับคนแปลกหน้าฮับ')
              continue
            }
          } else if(event.source.type === 'group') {
            const {groupId, userId} = event.source
            if(!userService.isAllow(groupId))
              continue
            const {text} = event.message
            // detech message
            if(text.includes('ลงทะเบียน')) {
              const parts:string[] = text.split(' ')
              if(parts.length != 3) {
                logger.info(text, event)
                continue
              }
              const user: LineUser = {
                line_user_id: userId,
                name: parts[1],
                nickname: parts[2],
                holiday_availables: {
                  extra: 0,
                  personal: 10,
                  sick: 30,
                  vacation: 10
                }
              }
              const result = await userService.addUser(user)
              if(result)
                chat(groupId, 'ลงทะเบียนเรียบร้อย ยินดีที่ได้รู้จัก ' + user.nickname + ' ฮับ')
              else
                chat(groupId, 'รู้จักกันอยู่แล้วอ่ะ')
            }
            // const response = await Bot(text, defaultContext)
          }
        } else continue
    }
  } catch (error) {
    console.error(error)
  }
}

async function chat(to:string, text:string) {
  await client.pushMessage(to, {
    type: 'text',
    text: text
  })
}
