'use strict';

const HASHING_ROUNDS = 1000
const SALT_SIZE = 64
const crypto = require('crypto')

class CryptoOperations {

  constructor() {
  }

  async getRandomSalt(length = SALT_SIZE) {

    return await crypto.randomBytes(length/2)

  }

  async getPbkdf2Hash(password, salt) {
   
    return new Promise( (resolve, reject) => {
      crypto.pbkdf2(password, salt, HASHING_ROUNDS, 32, 'sha256', (err, derivedKey) => {
      resolve(derivedKey)
      })
    })
  
  }

  async getHashedPassword(password) {

    // do some salting first
    let salt = await this.getRandomSalt()
    salt = salt.toString('hex')

    let hashedPassword = await this.getPbkdf2Hash(password, salt)
    hashedPassword = hashedPassword.toString('hex')

    return { hashedPassword : hashedPassword, salt : salt }

  }

  async verifyPassword(password, salt, legitPassword) {

    let hashedPassword = await this.getPbkdf2Hash(password, salt)
    hashedPassword = hashedPassword.toString('hex')

    if( hashedPassword !== legitPassword ) {
      console.log("Password Mismatch")
      console.log("Legit Password", legitPassword)
      console.log("Hashed Password", hashedPassword)
      return false
    }

    return true
  
  }

  static getInstance() {
    if( null == this._instance ) {
      this._instance = new CryptoOperations()
    }

    return this._instance
  }

}



module.exports = CryptoOperations
