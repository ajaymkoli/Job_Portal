export default class ApplicantsModel {
    constructor(applicantid, name, email, contact, resumepath){
        this.applicantid = applicantid;
        this.name = name;
        this.email = email;
        this.contact = contact;
        this.resumepath = resumepath;
    }
}

export const applicants = [];