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
        const exist = users.find((u) => u.email == email || u.mobile == mobile);
        if(!exist){
            users.push(newUser);
            console.log(users);
            return true;
        } else{
            return false;
        }
    }

    static isValidUser(email,password){
        const result = users.find((u) => u.email == email && u.password == password);
        return result;
    }

    static getUser(email,password){
        return users.find((u) => u.email == email && u.password == password);
    }
}

const users = [
    {
        id: 1,
        name: "Ajay Koli",
        email: "ajaymkoli.544@gmail.com",
        mobile: "8767674098",
        password: "2318@Ajay",
    },
];