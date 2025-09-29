export default class JobModel {
    constructor(id, jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobposted, applicants){
        this.id = id;
        this.jobcategory = jobcategory;
        this.jobdesignation = jobdesignation;
        this.joblocation = joblocation;
        this.companyname = companyname;
        this.salary = salary;
        this.applyby = applyby;
        this.skillsrequired = [];
        this.numberofopenings = numberofopenings;
        this.jobposted = jobposted;
        this.applicants = [];
    }

    add(jobcategory, jobdesignation, joblocation, companyname, salary, applyby, skillsrequired, numberofopenings, jobposted, applicants){

    }
}

const jobs = [];