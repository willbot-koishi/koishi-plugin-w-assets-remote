import { Context, z, Random, Quester } from 'koishi'
import RemoteAssets from 'koishi-plugin-assets-remote'

import { createHmac } from 'node:crypto'

declare module 'koishi' {
    interface Context {
        assetsAlt: RemoteAltAssets
    }
}

class RemoteAltAssets extends RemoteAssets {
    static name = 'w-assets-remote'

    constructor(ctx: Context, config: RemoteAltAssets.Config) {
        super(ctx, config)
        ctx.set('assetsAlt', this)
    }

    public async uploadFile(file: Blob | Buffer | string, name: string): Promise<string> {
        const params: Record<string, string> = {}

        if (this.config.secret) {
            params.salt = Random.id()
            params.sign = createHmac('sha1', this.config.secret).update(name + params.salt).digest('hex')
        }

        const formData = new FormData()
        const fileBlob: Blob = file instanceof Blob ? file : new Blob([ file ])
        formData.append('asset', fileBlob, name)

        const path = await this.http.put('', formData, { params })

        return path
    }
}

namespace RemoteAltAssets {
    export interface Config extends RemoteAssets.Config {}

    export const Config: z<Config> = z(JSON.parse(JSON.stringify(RemoteAssets.Config)))
}

export default RemoteAltAssets