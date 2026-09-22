import { describe, it, expect } from 'vitest'
import { parseUptimePercentage, formatUptimePercent } from '../../src/types/networkUptime'
import { parsePastedNetworkText } from '../../src/utils/networkClipboardParser'

describe('networkUptime helpers and parser', () => {
  it('parses various percentage string formats correctly', () => {
    expect(parseUptimePercentage('99.97%')).toBe(99.97)
    expect(parseUptimePercentage('99,8045%')).toBe(99.8045)
    expect(parseUptimePercentage(100)).toBe(100)
    expect(parseUptimePercentage('100.00')).toBe(100)
    expect(parseUptimePercentage('invalid')).toBe(100)
  })

  it('formats decimals to Spanish percent strings', () => {
    expect(formatUptimePercent(99.9756)).toBe('99,9756%')
    expect(formatUptimePercent(100)).toBe('100,0000%')
  })

  it('parses tab-delimited Excel rows with headers', () => {
    const tsv = `DEPARTAMENTO\tNOMBRE\tUPTIME MARZO %\tUPTIME ANUAL TOTAL %\nLA PAZ\tTIGO ONLINE\t100%\t99.9980%\nSANTA CRUZ\tCOTAS\t99.85%\t99.90%`
    const { records } = parsePastedNetworkText(tsv, 'ENLACES SD-WAN')
    expect(records.length).toBe(2)
    expect(records[0].departamento).toBe('LA PAZ')
    expect(records[0].nombre).toBe('TIGO ONLINE')
    expect(records[0].uptimeMensual).toBe(100)
    expect(records[0].uptimeAnual).toBe(99.998)
    expect(records[1].departamento).toBe('SANTA CRUZ')
    expect(records[1].uptimeMensual).toBe(99.85)
  })

  it('parses positional Excel rows without headers (e.g. from Agencias / ATMs)', () => {
    const raw = `1\tTARIJA\tAg. Villa Fatima\t100%\t100%\n2\tTARIJA\tAg. Bermejo\t100%\t100%\n3\tTARIJA\tAg. YACUIBA\t99.98%\t99.98%`
    const { records } = parsePastedNetworkText(raw, 'ENLACES AGENCIAS')
    expect(records.length).toBe(3)
    expect(records[0].nombre).toBe('Ag. Villa Fatima')
    expect(records[0].departamento).toBe('TARIJA')
    expect(records[2].nombre).toBe('Ag. YACUIBA')
    expect(records[2].uptimeMensual).toBe(99.98)
  })
})
