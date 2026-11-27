// Passerelle légère vers Firestore (API REST), utilisée par le site et par Glimmer Maze.
// - get(chemin) : lit un document public (réglages, annonce, contenu du site)
// - count(collection, champs) : ajoute +n à des compteurs du jour (statistiques anonymes)
// - send(collection, données) : crée un document (message de contact)
(function () {
  var C = window.STUDIOM_FIREBASE || {};
  var on = !!(C.projectId && C.apiKey);
  var root = 'projects/' + C.projectId + '/databases/(default)/documents';
  var api = 'https://firestore.googleapis.com/v1/' + root;

  function decode(v) {
    if (!v) return null;
    if ('stringValue' in v) return v.stringValue;
    if ('integerValue' in v) return Number(v.integerValue);
    if ('doubleValue' in v) return v.doubleValue;
    if ('booleanValue' in v) return v.booleanValue;
    if ('timestampValue' in v) return v.timestampValue;
    if ('mapValue' in v) { var o = {}, f = v.mapValue.fields || {}; for (var k in f) o[k] = decode(f[k]); return o; }
    if ('arrayValue' in v) return (v.arrayValue.values || []).map(decode);
    return null;
  }
  function encode(x) {
    if (x === null || x === undefined) return { nullValue: null };
    if (typeof x === 'boolean') return { booleanValue: x };
    if (typeof x === 'number') return Number.isInteger(x) ? { integerValue: String(x) } : { doubleValue: x };
    if (typeof x === 'string') return { stringValue: x };
    if (Array.isArray(x)) return { arrayValue: { values: x.map(encode) } };
    var f = {}; for (var k in x) f[k] = encode(x[k]); return { mapValue: { fields: f } };
  }
  var clean = function (k) { return String(k).replace(/[^A-Za-z0-9_.]/g, '_'); };
  var today = function () { return new Date().toISOString().slice(0, 10); };
  function commit(writes, keepalive) {
    return fetch(api + ':commit?key=' + C.apiKey, {
      method: 'POST', keepalive: !!keepalive, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ writes: writes })
    });
  }

  var pending = {}, timer = 0;
  function flush(keepalive) {
    clearTimeout(timer);
    var docs = Object.keys(pending);
    if (!docs.length) return;
    var writes = docs.map(function (d) {
      return { transform: { document: root + '/' + d, fieldTransforms: Object.keys(pending[d]).map(function (k) {
        return { fieldPath: k, increment: { integerValue: String(pending[d][k]) } };
      }) } };
    });
    pending = {};
    commit(writes, keepalive).catch(function () {});
  }

  window.StudiomFB = {
    enabled: on,
    get: function (path) {
      if (!on) return Promise.resolve(null);
      return fetch(api + '/' + path + '?key=' + C.apiKey)
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { return j && j.fields ? decode({ mapValue: { fields: j.fields } }) : null; })
        .catch(function () { return null; });
    },
    count: function (collection, fields) {
      if (!on) return;
      var d = collection + '/' + today();
      pending[d] = pending[d] || {};
      for (var k in fields) { var c = clean(k); pending[d][c] = (pending[d][c] || 0) + fields[k]; }
      clearTimeout(timer); timer = setTimeout(flush, 2500);
    },
    // Vrai une seule fois par jour et par appareil (pour compter les visiteurs uniques)
    firstToday: function (key) {
      try {
        var k = 'sfb-day-' + key, d = today();
        if (localStorage.getItem(k) === d) return false;
        localStorage.setItem(k, d); return true;
      } catch (e) { return false; }
    },
    send: function (collection, data) {
      if (!on) return Promise.reject(new Error('off'));
      var id = ''; var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      for (var i = 0; i < 20; i++) id += a[Math.floor(Math.random() * a.length)];
      var fields = {}; for (var k in data) fields[k] = encode(data[k]);
      return commit([{ update: { name: root + '/' + collection + '/' + id, fields: fields },
        updateTransforms: [{ fieldPath: 'createdAt', setToServerValue: 'REQUEST_TIME' }],
        currentDocument: { exists: false } }]).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return id; });
    },
    flush: flush
  };
  addEventListener('visibilitychange', function () { if (document.hidden) flush(true); });
  addEventListener('pagehide', function () { flush(true); });
})();
