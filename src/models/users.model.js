export default class UserModel{
    constructor(id, name, email, mobile, password){
        this.id = id;
        this.name = name;
        this.email = email;
        this.mobile = mobile;
        this.password = password;
    }

    static add(name,email,mobile,password){
        const newUser = new UserModel(users.length + 1, name, email, mobile, password);
        users.push(newUser);
        console.log(users);
    }

    static isValidUser(email,password){
        const result = users.find((u) => u.email == email && u.password == password);
        return result;
    }

    static getById(id){
        return users.find((u) => u.id == id);
    }
}

const users = [];