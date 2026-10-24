const ID_MAXIMO = 2147483647;

const idAcademia = (valor) => {
  if (typeof valor === 'number') {
    if (!Number.isSafeInteger(valor)) return null;
    valor = String(valor);
  }
  if (typeof valor !== 'string' || !/^[1-9]\d{0,9}$/.test(valor)) return null;
  const numero = Number(valor);
  return numero <= ID_MAXIMO ? numero : null;
};

module.exports = { idAcademia, ID_MAXIMO };
