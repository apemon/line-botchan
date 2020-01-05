import admin from 'firebase-admin'
import { LineUser } from '../types/user'
import { LineGroup } from '../types/group'

const serviceAccount = require('../../google-credentials.json')

class UserService {
    db: FirebaseFirestore.Firestore
    users: LineUser[]
    allows: Set<string>
    constructor() {
        // initialize firebase
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
        this.db = admin.firestore()
        this.allows = new Set()
        // auto-update users
        this.users = []
        this.db.collection('users').onSnapshot(snapshot => {
            this.users = []
            snapshot.docs.forEach(doc => {
                const user = doc.data() as LineUser
                this.users.push(user)
                this.allows.add(user.line_user_id)
            })
        })
        this.db.collection('groups').onSnapshot(snapshot => {
            snapshot.docs.forEach(doc => {
                const group = doc.data() as LineGroup
                this.allows.add(group.line_group_id)
            });
        })
    }

    listUser(): LineUser[] {
        return this.users
    }

    addUser(line_id: string, name: string, nickname: string) {
 
    }

    isAllow(id:string = ''): boolean {
        return this.allows.has(id)
    }
}

export default UserService