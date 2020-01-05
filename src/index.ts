import 'dotenv/config'

import express, {Request, Response} from 'express'
import bodyParser from 'body-parser'
import { lineMiddleware } from './line'
import { webhookHandler } from './webhook'
import { errorHandler } from './middleware/error-handler'
import LeaveService from './service/leave-service'
import admin from 'firebase-admin'
import UserService from './service/user-service'
import { LineUser } from './types/user'

const serviceAccount = require('../google-credentials.json')



const {PORT = 8000} = process.env

function main() {
  // initialize firebase
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  })
  const db = admin.firestore()
  const userService = new UserService(db)
  userService.initialize()

  // initialize express
  const app = express()

  // set global variable
  app.set('userService', userService)

  // Setup LINE webhook endpoint.
  app.post('/webhook', lineMiddleware, webhookHandler)

  // Setup body-parser to parse URL encoded and JSON inputs.
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json())
  
  app.get('/', (_req: Request, res: Response) => {
    res.send({status: 'OK'})
  })

  app.get('/leave', async (_req: Request, res: Response) => {
    const service = new LeaveService()
    console.log('hey')
    await service.authorize()
    await service.getCalendar()
    res.send({status:'ok'})
  })

  // Handle error responses here.
  app.use(errorHandler)
  
  app.listen(PORT, () => {
    console.log(`Server started at 0.0.0.0:${PORT}`)
  })
}

try {
  main()
} catch (error) {
  console.error('Fatal Error:', error.message)
}
