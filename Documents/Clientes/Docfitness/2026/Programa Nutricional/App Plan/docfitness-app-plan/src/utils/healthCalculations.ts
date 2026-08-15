export function calcularIMC(peso: number, estatura: number): number | null {
  if (!peso || !estatura || estatura <= 0 || peso <= 0) return null;
  const estaturaM = estatura / 100;
  return peso / (estaturaM * estaturaM);
}

export function calcularTMB(peso: number, estatura: number, edad: number, sexo: 'M' | 'F'): number | null {
  if (!peso || !estatura || !edad || peso <= 0 || estatura <= 0 || edad <= 0) return null;
  if (sexo === 'M') {
    return 10 * peso + 6.25 * estatura - 5 * edad + 5;
  }
  return 10 * peso + 6.25 * estatura - 5 * edad - 161;
}

export function clasificarIMC(imc: number): string {
  if (imc < 18.5) return 'Bajo peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidad I';
  if (imc < 40) return 'Obesidad II';
  return 'Obesidad III';
}
