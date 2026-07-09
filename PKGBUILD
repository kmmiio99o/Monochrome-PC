# Maintainer: Monochrome Player <monochrome-player@users.noreply.github.com>
# Contributor: monochrome-player

pkgname=monochrome-player-bin
pkgver=1.0.0
pkgrel=1
pkgdesc="A minimalist desktop wrapper for monochrome.tf with Discord Rich Presence, tray controls, and media keys."
arch=("x86_64")
url="https://github.com/kmmiio99o/Monochrome-PC"
license=("MIT")
depends=("electron" "libxss" "nss" "gtk3" "libnotify" "xdg-utils" "libsecret" "libappindicator-gtk3")
makedepends=("nodejs" "npm" "git")
source=("$pkgname-$pkgver.tar.gz::https://github.com/kmmiio99o/Monochrome-PC/archive/refs/tags/v$pkgver.tar.gz")
sha256sums=("SKIP")

build() {
  cd "$srcdir/Monochrome-PC-$pkgver"
  npm install
  npx tsc
}

package() {
  cd "$srcdir/Monochrome-PC-$pkgver"

  install -dm755 "$pkgdir/usr/lib/monochrome-player"
  cp -r dist-electron "$pkgdir/usr/lib/monochrome-player/"
  cp -r assets "$pkgdir/usr/lib/monochrome-player/"
  cp package.json "$pkgdir/usr/lib/monochrome-player/"

  install -dm755 "$pkgdir/usr/bin"
  cat > "$pkgdir/usr/bin/monochrome-player" << EOF
#!/bin/sh
exec /usr/bin/electron /usr/lib/monochrome-player "\$@"
EOF
  chmod +x "$pkgdir/usr/bin/monochrome-player"

  install -Dm644 assets/icon.png "$pkgdir/usr/share/icons/hicolor/256x256/apps/monochrome-player.png"

  install -dm755 "$pkgdir/usr/share/applications"
  cat > "$pkgdir/usr/share/applications/monochrome-player.desktop" << EOF
[Desktop Entry]
Name=Monochrome Player
Comment=$pkgdesc
Exec=monochrome-player %U
Icon=monochrome-player
Type=Application
Categories=Audio;Music;Player;
MimeType=x-scheme-handler/monochrome-player;
StartupWMClass=Monochrome Player
Terminal=false
EOF
}
