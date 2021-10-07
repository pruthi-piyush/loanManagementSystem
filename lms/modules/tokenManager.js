
'use strict';

const fs   = require('fs')
const jwt  = require('jsonwebtoken')


class TokenManager {

  constructor() {

    // this secret should be picked from cold storage 
    this.secret = 'f(>S9@([$yjt~n3Br6P%{,95>2};eV#yB<_3X;5XFE:f3zBG7;W!~!FPW(cDZ/4L'

  }

  generate(payload) {

    let token = jwt.sign(payload, this.secret)

    console.log("TOKEN :" , token)
    return token

  }

  verify(token) {
  
    let decoded = jwt.verify(token, this.secret)

    console.log("DECOCED : ", decoded)
    return decoded

  }

  static getInstance() {

    if( null == this._instance ) {
      this._instance = new TokenManager()
    }

    return this._instance

  }

}


module.exports = TokenManager
