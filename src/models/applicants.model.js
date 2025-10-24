export default class ApplicantsModel {
    constructor(id, jobId, name, email, contact, resumepath) {
        this.id = id;
        this.jobId = jobId; // job the applicant applied for
        this.name = name;
        this.email = email;
        this.contact = contact;
        this.resumepath = resumepath || null;
        this.appliedOn = new Date().toLocaleString();
    }
}

// In-memory applicants store
export const applicants = [];