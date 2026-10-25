(function () {
  const CHAVE_CEP = 'akifit_cep';

  const limparCep = (valor) => String(valor || '').replace(/\D/g, '');
  const cepValido = (valor) => /^\d{8}$/.test(valor);

  const minutos = (hhmm) => {
    const partes = String(hhmm).split(':').map(Number);
    return partes[0] * 60 + (partes[1] || 0);
  };

  const statusAgora = (horarios, agora) => {
    if (!Array.isArray(horarios) || horarios.length === 0) return null;
    const momento = agora || new Date();
    const hoje = horarios.find((h) => Number(h.dia) === momento.getDay());
    if (!hoje || (hoje.abre === '00:00' && hoje.fecha === '00:00')) return { aberta: false };
    if (hoje.abre === '00:00' && hoje.fecha === '23:59') return { aberta: true };
    const atual = momento.getHours() * 60 + momento.getMinutes();
    return { aberta: atual >= minutos(hoje.abre) && atual < minutos(hoje.fecha) };
  };

  const cepUsuario = () => {
    try {
      const salvo = localStorage.getItem(CHAVE_CEP);
      if (cepValido(salvo)) return salvo;
    } catch (e) { }
    const usuario = window.Auth && Auth.getUser();
    const doPerfil = usuario ? limparCep(usuario.cep) : '';
    return cepValido(doPerfil) ? doPerfil : null;
  };

  const salvarCep = (valor) => {
    const cep = limparCep(valor);
    if (!cepValido(cep)) return false;
    try {
      localStorage.setItem(CHAVE_CEP, cep);
    } catch (e) { }
    return true;
  };

  const coordenadasDoCep = (cep) => {
    const prefixo = cep.substring(0, 2);
    if (prefixo === '71') return { lat: -15.83, lon: -48.02 };
    if (prefixo === '70') return { lat: -15.79, lon: -47.88 };
    if (prefixo === '72') return { lat: -15.81, lon: -48.11 };
    return { lat: -15.8, lon: -47.9 };
  };

  const distanciaKm = (latitude, longitude, cep) => {
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || !cepValido(cep)) return null;
    const origem = coordenadasDoCep(cep);
    const rad = Math.PI / 180;
    const dLat = (latitude - origem.lat) * rad;
    const dLon = (longitude - origem.lon) * rad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(origem.lat * rad) * Math.cos(latitude * rad) * Math.sin(dLon / 2) ** 2;
    return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
  };

  const formatarKm = (km) => km.toFixed(1).replace('.', ',') + ' km';

  window.Localizacao = Object.freeze({ statusAgora, cepUsuario, salvarCep, distanciaKm, formatarKm, limparCep });
})();