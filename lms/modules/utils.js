
'use strict';

function convertToPaisa(price) {

  
  let splittedValue = (price.split("."))

  let beforeDot = splittedValue[0]
  let afterDot = splittedValue[1]

  if ( afterDot == undefined ) {
    
    return price * 100
  
  }

  let lengthAfterDot = afterDot.length

  let diff = 2 - lengthAfterDot
  price = beforeDot + afterDot.substr(0, 2)

  if( diff > 0 ) {
    price = price * (Math.pow(10,diff))
  } 
  
  return price

}

exports.convertToPaisa = convertToPaisa
