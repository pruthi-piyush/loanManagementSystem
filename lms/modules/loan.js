
'use strict';

class Loan {

  constructor() {
    
    this.customerId = null
    this.agentId = null
    this.referenceId = null
    this.rateOfInterest = null
    this.status = null
    this.creationTime = null
    this.updationTime = null
    this.tenure = null
    this.amount = null
    this.emi = null

  }

  setCustomerId(customerId) {
    this.customerId = customerId
  }

  setAgentId(agentId) {
    this.agentId = agentId
  }

  setRateOfInterest(roi) {
    this.rateOfInterest = roi
  }

  setTenure(tenure) {
    this.tenure = tenure
  }

  setAmount(amount) {
    this.amount = amount
  }

  setCreationTime(time) {
    this.creationTime = time
  }

  setUpdationTime(time) {
    this.updationTime = time
  }

  setStatus(status) {
    this.status = status
  }

  setReferenceId(referenceId) {
    this.referenceId = referenceId
  }

  setEmi(emi) {
    this.emi = emi
  }

  getEmi() {
    return this.emi
  }

  getReferenceId() {
    return this.referenceId
  }

  getCreationTime() {
    return this.creationTime
  }

  getUpdationTime() {
    return this.updationTime
  }

  getRateOfInterest() {
    return this.rateOfInterest
  }

  getTenure() {
    return this.tenure
  }

  getStatus() {
    return this.status
  }

  getCustomerId() {
    return this.customerId
  }

  getAgentId() {
    return this.agentId
  }

  getAmount() {
    return this.amount
  }

  dump() {
    console.log("Agent Id", this.agentId)
    console.log("Customer Id", this.customerId)
    console.log("Status", this.status)
    console.log("Amount", this.amount)
    console.log("Tenure", this.tenure)
    console.log("Emi", this.emi)
    console.log("Roi", this.rateOfInterest)
    console.log("Creation Time", this.creationTime)
    console.log("Updation Time", this.updationTime)
    console.log("Reference Id", this.referenceId)
  }
}

module.exports = Loan
