var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');

var userSchema = new Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, minlength: 5, required: true}
},{ timestamps :true });


//presave hook. triggered before saving anything in db
userSchema.pre('save', function(next){
    // this condition will make sure that only if the password is supplied and it has been modified then only encrypt it
    // it will prevent useless encrypting of password when we are updating any other field of user. It will encrypt again only when it is changed
    if(this.password && this.isModified('password')){   
        bcrypt.hash(this.password , 10, (err, hashed) =>{
            if(err) return next(err);
            this.password = hashed;  
            return next();  //early return pattern
        });
    }else{
        return next();  //so that if password need not be encrypted, then directly move to next level of execution
    }
})


//defining a method on the userSchema for comparing the encrypted passwords.
//By defining it here, this function will be accessible everywhere where userSchema is used.
userSchema.methods.verifyPassword = function(password, cb) {    //password is the password which we receive and cb is the callback function which will be returned from this function
    bcrypt.compare(password, this.password, (err, result) => {
    return cb(err, result);     //the result is a boolean value : either true or false based on whether the passwords matched or not
    })
}




module.exports = mongoose.model("User",userSchema);