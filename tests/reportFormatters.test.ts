import { describe, it, expect } from 'vitest'
import {
  formatDateLongSpanish,
  formatTimeTo12Hour,
  getDefaultOfficialReportMetadata
} from '../src/utils/reportFormatters'

describe('reportFormatters', () => {
  it('formats dates into long Spanish text correctly', () => {
    expect(formatDateLongSpanish('2026-03-25')).toBe('miércoles, 25 de marzo de 2026')
    expect(formatDateLongSpanish('2026-03-04')).toBe('miércoles, 4 de marzo de 2026')
    expect(formatDateLongSpanish('2026-03-29')).toBe('domingo, 29 de marzo de 2026')
  })

  it('formats 24h times into 12h AM/PM format matching BMSC reports', () => {
    expect(formatTimeTo12Hour('22:31:00')).toBe('10:31:00 p. m.')
    expect(formatTimeTo12Hour('13:12:00')).toBe('1:12:00 p. m.')
    expect(formatTimeTo12Hour('01:01:00')).toBe('1:01:00 a. m.')
    expect(formatTimeTo12Hour('12:30:00')).toBe('12:30:00 p. m.')
    expect(formatTimeTo12Hour('00:15:00')).toBe('12:15:00 a. m.')
  })

  it('generates correct default metadata for March 2026', () => {
    const meta = getDefaultOfficialReportMetadata(2026, 3)
    expect(meta.destinatarioNombre).toBe('Boris Osman Cazuriaga Cajias')
    expect(meta.remitenteCargo).toBe('Subgerente de Tecnología')
    expect(meta.referencia).toContain('marzo - 2026')
    expect(meta.redaccion).toContain('marzo de 2026')
    expect(meta.fechaEmision).toContain('Abril de 2026')
  })
})
