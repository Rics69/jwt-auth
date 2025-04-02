const UserModel = require('../model/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')

class UserService {
    async registration(email, password) {
        const canditate = await UserModel.findOne({email})
        if (canditate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует!`)
        }

        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()
        const user = await UserModel.create({email, password: hashPassword, activationLink})
    }
}

module.exports = new UserService()