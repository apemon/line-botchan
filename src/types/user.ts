export interface LineUser {
    name:string,
    nickname:string,
    line_user_id?:string,
    holiday_availables?: UserHolidayAvailables
}

export interface UserHolidayAvailables {
    extra:number,
    personal:number,
    sick:number,
    vacation:number
}