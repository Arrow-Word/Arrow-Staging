// Keeps this copy isolated when GitHub Pages uses the same domain as the live site.
(function () {
  const prefix = 'arrowword_staging:';
  const storage = Storage.prototype;
  const nativeGet = storage.getItem;
  const nativeSet = storage.setItem;
  const nativeRemove = storage.removeItem;
  const nativeKey = storage.key;
  const nativeLength = Object.getOwnPropertyDescriptor(storage, 'length').get;

  storage.getItem = function (key) {
    return nativeGet.call(this, prefix + String(key));
  };
  storage.setItem = function (key, value) {
    return nativeSet.call(this, prefix + String(key), value);
  };
  storage.removeItem = function (key) {
    return nativeRemove.call(this, prefix + String(key));
  };
  storage.clear = function () {
    for (let i = nativeLength.call(this) - 1; i >= 0; i -= 1) {
      const key = nativeKey.call(this, i);
      if (key && key.startsWith(prefix)) nativeRemove.call(this, key);
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    const blocked = async function () {
      throw new Error('Test site only: saving, publishing, and deleting are disabled. The live database was not changed.');
    };
    [
      'cloudPublishPuzzle',
      'cloudRemovePuzzle',
      'cloudSavePuzzles',
      'ghPublishPuzzle',
      'ghRemovePuzzle',
      'ghSavePuzzles',
      'sbSaveProgress',
      'sbSaveRating',
      'sbSaveTimeSpent',
      'sbSaveComment',
      'sbAdminSetRole'
    ].forEach(function (name) {
      if (typeof window[name] === 'function') window[name] = blocked;
    });

    // Open puzzles directly as a guest; no account sign-in is available here.
    if (typeof window.openSolver === 'function') {
      window.solveClicked = function (id) {
        sessionStorage.setItem('guest_mode', '1');
        window.openSolver(id);
      };
    }

    // The staging copy is for testing, so don't require the builder password.
    const builderLock = document.getElementById('builder-lock');
    if (builderLock) builderLock.remove();

    const banner = document.createElement('div');
    banner.setAttribute('role', 'status');
    banner.textContent = 'TEST SITE — guest mode only; puzzle publishing, account saves, comments and ratings are disabled.';
    banner.style.cssText = 'position:sticky;top:0;z-index:9999;box-sizing:border-box;width:100%;padding:8px 12px;background:#fff0bd;color:#4e3c00;border-bottom:1px solid #d8b94d;text-align:center;font:600 13px/1.35 system-ui,sans-serif;';
    document.body.insertBefore(banner, document.body.firstChild);
  });
})();
