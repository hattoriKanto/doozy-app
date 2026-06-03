import {
  type INestApplication,
  Injectable,
  type OnModuleInit,
} from '@nestjs/common'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaClient } from '../@generated/prisma-client/client'
import { AppConfigService } from '../config/config.service'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(readonly config: AppConfigService) {
    const url = config.databaseUrl

    super({
      adapter: new PrismaBetterSqlite3({ url }),
    })
  }

  async onModuleInit(): Promise<void> {
    await this.$connect()
  }

  enableShutdownHooks(app: INestApplication): void {
    process.on('beforeExit', () => {
      app.close().catch((e: unknown) => console.error(e))
    })
  }
}
