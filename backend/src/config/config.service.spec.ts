import { ConfigService } from '@nestjs/config'
import { Test } from '@nestjs/testing'
import { AppConfigService } from './config.service'

describe('AppConfigService', () => {
  describe('validate (static)', () => {
    it('returns the parsed config when PORT and DATABASE_URL are present', () => {
      const result = AppConfigService.validate({
        PORT: '3000',
        DATABASE_URL: 'file:./dev.db',
      })

      expect(result).toEqual({
        PORT: '3000',
        DATABASE_URL: 'file:./dev.db',
      })
    })

    it('throws when PORT is missing', () => {
      expect(() =>
        AppConfigService.validate({ DATABASE_URL: 'file:./dev.db' }),
      ).toThrow()
    })

    it('throws when DATABASE_URL is missing', () => {
      expect(() => AppConfigService.validate({ PORT: '3000' })).toThrow()
    })

    it('throws when DATABASE_URL is an empty string', () => {
      expect(() =>
        AppConfigService.validate({ PORT: '3000', DATABASE_URL: '' }),
      ).toThrow()
    })
  })

  describe('instance getters', () => {
    const buildSubject = async (
      values: Record<string, string>,
    ): Promise<AppConfigService> => {
      const get = jest.fn((key: string) => values[key])
      const moduleRef = await Test.createTestingModule({
        providers: [
          AppConfigService,
          { provide: ConfigService, useValue: { get } },
        ],
      }).compile()

      return moduleRef.get(AppConfigService)
    }

    it('port returns the PORT value coerced to a number', async () => {
      const subject = await buildSubject({
        PORT: '3000',
        DATABASE_URL: 'file:./dev.db',
      })

      expect(subject.port).toBe(3000)
    })
  })
})
