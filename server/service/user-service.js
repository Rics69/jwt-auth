const UserModel = require('../model/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dto/user-dto')

class UserService {
    async registration(email, password) {
        const canditate = await UserModel.findOne({email})
        if (canditate) {
            throw new Error(`Пользователь с почтовым адресом ${email} уже существует!`)
        }

        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid.v4()

        const user = await UserModel.create({email, password: hashPassword, activationLink})
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        const userDto = new UserDto(user);
        const tokens = tokenService.generateTokens({...userDto})
        await tokenService.saveToken(userDto.id, tokens.refreshToken)

        return {
            ...tokens,
            user: userDto
        }
    }

    async activate(activationLink){
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            throw new Error('Неккоректная ссылка активации')
        }

        user.isActivated = true;
        await user.save()
    }
}

module.exports = new UserService()