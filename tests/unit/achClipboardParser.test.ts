import { describe, it, expect } from 'vitest'
import {
  DEFAULT_ACH_TIPOS,
  DEFAULT_MLD_TIPOS,
  parseAchAmount,
  formatCurrencyBs,
  formatQuantity
} from '../../src/types/achStatistics'
import { parsePastedAchText } from '../../src/utils/achClipboardParser'

describe('ACH Estadísticas types and clipboard parser', () => {
  it('defines default ACH transaction and resolution types', () => {
    expect(DEFAULT_ACH_TIPOS.length).toBeGreaterThan(0)
    expect(DEFAULT_ACH_TIPOS).toContain('TRANSFERENCIA ENTRANTE')
    expect(DEFAULT_ACH_TIPOS).toContain('TRANSFERENCIA SALIENTE')
    expect(DEFAULT_ACH_TIPOS).toContain('DEVOLUCION DE FONDOS (CAIDA ACH)')
  })

  it('defines exclusive Banco Central (MLD) types', () => {
    expect(DEFAULT_MLD_TIPOS.length).toBeGreaterThan(0)
    expect(DEFAULT_MLD_TIPOS).toContain('LIQUIDACION MLD')
    expect(DEFAULT_MLD_TIPOS).toContain('REGULARIZACION MLD BCB')
  })

  it('correctly parses various currency and number string formats', () => {
    expect(parseAchAmount('845200.50')).toBe(845200.5)
    expect(parseAchAmount('Bs 845.200,50')).toBe(845200.5)
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

  it('parses tab-delimited Excel rows with full 8 headers', () => {
    const tsv = [
      'FECHA\tTIPO ACH\tCANTIDAD ACH\tMONTO ACH (BS.)\tTIPO MLD (BCB)\tCANTIDAD MLD\tMONTO MLD (BS.)\tREVISION',
      '2026-08-31\tTRANSFERENCIA ENTRANTE\t150\t845200.50\tLIQUIDACION MLD\t25\t132000.00\t1',
      '2026-08-31\tDEVOLUCION DE FONDOS (CAIDA ACH)\t10\t54000.00\tREGULARIZACION MLD BCB\t5\t27000.00\t0'
    ].join('\n')

    const { records } = parsePastedAchText(tsv, '2026-08-31')
    expect(records).toHaveLength(2)

    // Row 1
    expect(records[0].fecha).toBe('2026-08-31')
    expect(records[0].tipo).toBe('TRANSFERENCIA ENTRANTE')
    expect(records[0].cantidad).toBe(150)
    expect(records[0].monto).toBe(845200.5)
    expect(records[0].tipoMld).toBe('LIQUIDACION MLD')
    expect(records[0].cantidadMld).toBe(25)
    expect(records[0].montoMld).toBe(132000)
    expect(records[0].revision).toBe(1)

    // Row 2
    expect(records[1].tipo).toBe('DEVOLUCION DE FONDOS (CAIDA ACH)')
    expect(records[1].cantidad).toBe(10)
    expect(records[1].monto).toBe(54000)
    expect(records[1].revision).toBe(0)
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
})
