"""Génère app/index.html (l'appli Studiom installable) à partir de index.html (le site).

L'appli installée vit à /app/ pour ne pas capturer les autres pages du domaine (Glimmer Maze, pages légales).
Après chaque modification de index.html : python3 build-app.py, puis commit des deux fichiers.
"""
import pathlib
here = pathlib.Path(__file__).parent
s = (here / 'index.html').read_text(encoding='utf-8')
def rep(a, b):
    global s
    assert s.count(a) == 1, a
    s = s.replace(a, b)
# Le site (/) n'est pas installable lui-même : son bouton mène à /app/
rep('<link rel="canonical" href="https://graciaso685-prog.github.io/">', '<link rel="canonical" href="https://graciaso685-prog.github.io/">\n<link rel="manifest" href="/manifest.webmanifest">')
rep('<a id="install" class="install-link" href="/app/" data-i="install"></a>',
    '<button type="button" id="install" hidden data-i="install"></button>')
rep('<!-- APP_FLAG -->', '<script>window.STUDIOM_APP = true;</script>')
out = here / 'app' / 'index.html'
out.parent.mkdir(exist_ok=True)
out.write_text('<!-- Généré par build-app.py à partir de index.html : ne pas modifier directement. -->\n' + s, encoding='utf-8')
print('app/index.html généré')
