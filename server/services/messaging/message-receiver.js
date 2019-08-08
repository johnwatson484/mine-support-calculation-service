const rheaPromise = require('rhea-promise')
const { getReceiverConfig } = require('./config-helper')
const MessagerBase = require('./messager-base')

class MessageReceiver extends MessagerBase {
  constructor (config) {
    super(config)
    this.name = 'reciever-payment-service'
    this.connection = new rheaPromise.Connection(config)
    this.receiverConfig = getReceiverConfig(this.name, config)
  }

  registerEvents (receiver, action) {
    receiver.on(rheaPromise.ReceiverEvents.message, async (context) => {
      console.log(`${this.name} received message`, context.message.body)
      try {
        const message = JSON.parse(context.message.body)
        await action(message)
      } catch (ex) {
        console.error(`${this.name} error with message`, ex)
      }
    })

    receiver.on(rheaPromise.ReceiverEvents.receiverError, (context) => {
      const receiverError = context.receiver && context.receiver.error
      if (receiverError) {
        console.error(`${this.name} receipt error`, receiverError)
      }
    })
  }

  async setupReceiver (action) {
    const receiver = await this.connection.createReceiver(this.receiverConfig)
    this.registerEvents(receiver, action)
  }
}

module.exports = MessageReceiver
