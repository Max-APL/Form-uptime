import { describe, it, expect } from 'vitest'
import {
  DEFAULT_ACH_TIPOS,
  DEFAULT_MLD_TIPOS,
  normalizeAchTipo,
  parseAchAmount,
  formatCurrencyBs,
  formatQuantity
} from '../../src/types/achStatistics'
import { parsePastedAchText } from '../../src/utils/achClipboardParser'

describe('ACH Estadísticas types and clipboard parser', () => {
  it('defines default ACH transaction and resolution types as Abonos and Debitos', () => {
    expect(DEFAULT_ACH_TIPOS).toEqual(['Abonos', 'Debitos'])
  })

  it('defines exclusive Banco Central (MLD) types as Abonos and Debitos', () => {
    expect(DEFAULT_MLD_TIPOS).toEqual(['Abonos', 'Debitos'])
  })

  it('correctly parses various currency and number string formats including hyphen for zero', () => {
    expect(parseAchAmount('845200.50')).toBe(845200.5)
    expect(parseAchAmount('Bs 845.200,50')).toBe(845200.5)
    expect(parseAchAmount('40.367,60')).toBe(40367.6)
    expect(parseAchAmount('-')).toBe(0)
    expect(parseAchAmount('–')).toBe(0)
    expect(parseAchAmount('1,420,500.00')).toBe(1420500)
    expect(parseAchAmount('1.420.500,75')).toBe(1420500.75)
    expect(parseAchAmount(1500)).toBe(1500)
    expect(parseAchAmount('')).toBe(0)
    expect(parseAchAmount('invalid')).toBe(0)
  })

  it('formats Bolivianos currency and quantities in Spanish locale', () => {
    const formattedCur = formatCurrencyBs(1420500.5)
    expect(formattedCur).toContain('Bs')
    expect(formattedCur).toContain('1.420.500,50')

    const formattedQty = formatQuantity(15420)
    expect(formattedQty).toBe('15.420')
  })

  it('parses tab-delimited Excel rows matching real bank format', () => {
    const tsv = [
      'FECHA\tTIPO\tCANTIDAD\tMONTO\tTIPO MLD\tCANT MLD\tMONTO MLD',
      '9/1/2026\tAbonos\t4\t40.367,60\tAbonos\t\t',
      '9/1/2026\tDebitos\t0\t-\tDebitos\t\t',
      '9/2/2026\tAbonos\t391\t692.106,54\tAbonos\t1\t100,00',
      '9/2/2026\tDebitos\t1\t110,00\tDebitos\t2\t10.500,00'
    ].join('\n')

    const { records } = parsePastedAchText(tsv, '2026-09-01')
    expect(records).toHaveLength(4)

    // Row 1
    expect(records[0].fecha).toBe('2026-09-01')
    expect(records[0].tipo).toBe('Abonos')
    expect(records[0].cantidad).toBe(4)
    expect(records[0].monto).toBe(40367.6)
    expect(records[0].tipoMld).toBe('Abonos')
    expect(records[0].cantidadMld).toBe(0)
    expect(records[0].montoMld).toBe(0)

    // Row 2
    expect(records[1].fecha).toBe('2026-09-01')
    expect(records[1].tipo).toBe('Debitos')
    expect(records[1].cantidad).toBe(0)
    expect(records[1].monto).toBe(0)
    expect(records[1].tipoMld).toBe('Debitos')

    // Row 3
    expect(records[2].fecha).toBe('2026-09-02')
    expect(records[2].tipo).toBe('Abonos')
    expect(records[2].cantidad).toBe(391)
    expect(records[2].monto).toBe(692106.54)
    expect(records[2].tipoMld).toBe('Abonos')
    expect(records[2].cantidadMld).toBe(1)
    expect(records[2].montoMld).toBe(100)

    // Row 4
    expect(records[3].fecha).toBe('2026-09-02')
    expect(records[3].tipo).toBe('Debitos')
    expect(records[3].cantidad).toBe(1)
    expect(records[3].monto).toBe(110)
    expect(records[3].tipoMld).toBe('Debitos')
    expect(records[3].cantidadMld).toBe(2)
    expect(records[3].montoMld).toBe(10500)
  })

  it('ignores rows marked as EJEMPLO', () => {
    const tsv = [
      'FECHA\tTIPO ACH\tCANTIDAD ACH\tMONTO ACH\tTIPO MLD\tCANTIDAD MLD\tMONTO MLD\tREVISION',
      '2026-08-31\t(EJEMPLO) TRANSFERENCIA ENTRANTE\t154\t845200.50\t(EJEMPLO) LIQUIDACION MLD\t25\t132000.00\t1',
      '2026-08-31\tTRANSFERENCIA ENTRANTE REAL\t200\t1500000.00\tLIQUIDACION MLD REAL\t40\t300000.00\t1'
    ].join('\n')

    const { records } = parsePastedAchText(tsv, '2026-08-31')
    expect(records).toHaveLength(1)
    expect(records[0].tipo).toBe('TRANSFERENCIA ENTRANTE REAL')
    expect(records[0].cantidad).toBe(200)
  })

  it('parses positional columns when headers are absent', () => {
    const tsv = [
      '2026-08-15\tTRANSFERENCIA SALIENTE\t85\t450000.25\t\t0\t0\t1'
    ].join('\n')

    const { records } = parsePastedAchText(tsv, '2026-08-15')
    expect(records).toHaveLength(1)
    expect(records[0].fecha).toBe('2026-08-15')
    expect(records[0].tipo).toBe('TRANSFERENCIA SALIENTE')
    expect(records[0].cantidad).toBe(85)
    expect(records[0].monto).toBe(450000.25)
    expect(records[0].tipoMld).toBe('')
    expect(records[0].cantidadMld).toBe(0)
    expect(records[0].revision).toBe(1)
  })

  it('normalizes common variations of Abonos and Debitos while preserving custom types', () => {
    expect(normalizeAchTipo('abono')).toBe('Abonos')
    expect(normalizeAchTipo('ABONOS')).toBe('Abonos')
    expect(normalizeAchTipo('debito')).toBe('Debitos')
    expect(normalizeAchTipo('débitos')).toBe('Debitos')
    expect(normalizeAchTipo('DEBITOS MLD')).toBe('Debitos')
    expect(normalizeAchTipo('Devoluciones')).toBe('Devoluciones')
    expect(normalizeAchTipo('')).toBe('')
  })
})
