import emergencyNumbers from '../../constants/emergencyNumbers.json';

describe('Notruf-Datenbank', () => {
    test('Alle Einträge enthalten mindestens Polizei, Feuerwehr und Rettung', () => {
        for (const [code, country] of Object.entries(emergencyNumbers)) {
            expect(country.police).toBeDefined();
            expect(country.ambulance).toBeDefined();
            expect(country.fire).toBeDefined();
            expect(code).toBeDefined();
        }
    });
    test('Datenzugriff dauert weniger als 2 Sekunden', () => {
        const start = Date.now();
        const dummy = emergencyNumbers['DE'];
        const duration = Date.now() - start;
        expect(dummy).toBeDefined();
        expect(duration).toBeLessThanOrEqual(2000);
    });
    test('Fallback (DEFAULT) enthält Notiz', () => {
        const fallback = emergencyNumbers['DEFAULT'];
        expect(fallback).toBeDefined();
        expect(fallback.note).toBeDefined();
        expect(typeof fallback.note).toBe('string');
    });
});
