import {ETHER_CURRENCIES, Currency, Token } from '@skylaunch/sdk'

export function currencyId(currency: Currency): string {
  if(ETHER_CURRENCIES.includes(currency)) return String(currency.name)
  if (currency instanceof Token) return currency.address
  throw new Error('invalid currency')
}
