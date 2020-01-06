const calculationService = require('./calculation-service')
const { sendMessage } = require('./sqs-messaging/sqs-send-message')
const config = require('../config')

async function messageAction (claim, sender) {
  try {
    const value = calculationService.calculate(claim)
    await sender.sendMessage({ claimId: claim.claimId, value })
  } catch (error) {
    console.log('error sending message', error)
  }
}
const sqsCalculationMessageAction = async (message) => {
  const {
    sqsPaymentQueueConfig: {
      url: queueUrl,
      publishCredentials: {
        accessKeyId,
        secretAccessKey
      }
    }
  } = config
  const value = calculationService.calculate(message)
  if (queueUrl !== '' && accessKeyId !== '' && secretAccessKey !== '') {
    sendMessage({
      accessKeyId,
      messageBody: JSON.stringify({ claimId: message.claimId, value }),
      queueUrl,
      secretAccessKey
    })
  } else {
    console.log('No SQS message sent as env vars aren\'t set up')
  }
}
const paymentQueueConfig = () => config.sqsPaymentQueueConfig
module.exports = { messageAction, sqsCalculationMessageAction, paymentQueueConfig }
