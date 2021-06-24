import fp from 'fastify-plugin'
import mongo from 'mongodb'

let client: mongo.MongoClient

type Options = { uri: string }
export default fp<Options>(async (srv, opts) => {
  client = await mongo.connect(opts.uri, { useUnifiedTopology: true })
  srv.addHook('onClose', async () => await client.close())
})

export const createModel = <T>(name: string) => {
  return {
    get coll () {
      return client.db().collection<T>(name)
    },

    async create (doc: T) {
      // @ts-expect-error todo:
      return await this.coll.insertOne(doc)
    },
  }
}
