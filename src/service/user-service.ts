import { LineUser } from '../types/user'
import { LineGroup } from '../types/group'
import { } from 'firebase-admin'

class UserService {
    db: FirebaseFirestore.Firestore
    users: LineUser[]
    allows: Set<string>
    admin:any
    constructor(db:FirebaseFirestore.Firestore) {
        // initialize firebase
        this.db = db
        this.users = []
        this.allows = new Set()
    }

    // auto-update users
    initialize() {
        this.db.collection('users').onSnapshot(snapshot => {
            this.users = []
            snapshot.docs.forEach(doc => {
                const user = doc.data() as LineUser
                this.users.push(user)
                this.allows.add(user.line_user_id!)
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

    async addUser(user:LineUser): Promise<boolean> {
        // check existing
        const docs = await this.db.collection('users').where('line_user_id', '==', user.line_user_id).get()
        if(docs.size != 0)
            return false
        await this.db.collection('users').add(user)
        return true
    }

    async addGroup(group:LineGroup) {
        await this.db.collection('groups').add(group)
    }

    isAllow(id:string = ''): boolean {
        return this.allows.has(id)
    }
}

export default UserService