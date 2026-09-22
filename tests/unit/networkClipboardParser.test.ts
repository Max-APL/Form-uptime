import { describe, it, expect } from 'vitest'
import {
  parseUptimePercentage,
  formatUptimePercent,
  DEFAULT_ENLACES,
  getNombreFieldLabel,
  getNombreFieldPlaceholder
} from '../../src/types/networkUptime'
import { parsePastedNetworkText } from '../../src/utils/networkClipboardParser'

describe('networkUptime helpers and parser', () => {
  it('defines exactly the 3 official types of enlaces', () => {
    expect(DEFAULT_ENLACES).toHaveLength(3)
    expect(DEFAULT_ENLACES).toEqual([
      'ENLACES WAN NACIONAL',
      'ENLACES AGENCIAS NACIONAL',
      'ENLACES ATMS NACIONAL'
    ])
  })

  it('maps each enlace type to its correct detail field label and placeholder', () => {
    // ENLACES WAN NACIONAL -> Proveedor
    expect(getNombreFieldLabel('ENLACES WAN NACIONAL')).toBe('Proveedor')
    expect(getNombreFieldPlaceholder('ENLACES WAN NACIONAL')).toContain('Proveedor')

    // ENLACES AGENCIAS NACIONAL -> Agencia
    expect(getNombreFieldLabel('ENLACES AGENCIAS NACIONAL')).toBe('Agencia')
    expect(getNombreFieldPlaceholder('ENLACES AGENCIAS NACIONAL')).toContain('Agencia')

    // ENLACES ATMS NACIONAL -> Nombre
    expect(getNombreFieldLabel('ENLACES ATMS NACIONAL')).toBe('Nombre')
    expect(getNombreFieldPlaceholder('ENLACES ATMS NACIONAL')).toContain('ATM')
  })

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

  it('parses tab-delimited Excel rows with headers (including PROVEEDOR)', () => {
    const tsv = `DEPARTAMENTO\tPROVEEDOR\tUPTIME MARZO %\tUPTIME ANUAL TOTAL %\nLA PAZ\tENTEL\t100%\t99.9980%\nSANTA CRUZ\tTIGO\t99.85%\t99.90%`
    const { records } = parsePastedNetworkText(tsv, 'ENLACES WAN NACIONAL')
    expect(records.length).toBe(2)
    expect(records[0].departamento).toBe('LA PAZ')
    expect(records[0].nombre).toBe('ENTEL')
    expect(records[0].uptimeMensual).toBe(100)
    expect(records[0].uptimeAnual).toBe(99.998)
    expect(records[1].departamento).toBe('SANTA CRUZ')
    expect(records[1].nombre).toBe('TIGO')
    expect(records[1].uptimeMensual).toBe(99.85)
  })

  it('parses positional Excel rows without headers (e.g. from Agencias / ATMs)', () => {
    const raw = `1\tTARIJA\tAg. Villa Fatima\t100%\t100%\n2\tTARIJA\tAg. Bermejo\t100%\t100%\n3\tTARIJA\tAg. YACUIBA\t99.98%\t99.98%`
    const { records } = parsePastedNetworkText(raw, 'ENLACES AGENCIAS NACIONAL')
    expect(records.length).toBe(3)
    expect(records[0].nombre).toBe('Ag. Villa Fatima')
    expect(records[0].departamento).toBe('TARIJA')
    expect(records[2].nombre).toBe('Ag. YACUIBA')
    expect(records[2].uptimeMensual).toBe(99.98)
  })
})
