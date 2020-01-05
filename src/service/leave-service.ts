import 'dotenv/config'
import {google} from 'googleapis'

const {GOOGLE_CALENDAR_ID} = process.env

const serviceAccount = require('../../google-credentials.json')

class LeaveService {
    auth:any
    
    constructor() {
        
    }

    async authorize() {
        this.auth = new google.auth.JWT(
            serviceAccount.client_email,
            '',
            serviceAccount.private_key,
            ['https://www.googleapis.com/auth/calendar']
        )
    }

    async getCalendar() {
        const calendar = google.calendar('v3')
        const list = await calendar.events.list({
            calendarId: GOOGLE_CALENDAR_ID ,
            auth: this.auth
        })
        console.log(list.data)
    }
}

export default LeaveService