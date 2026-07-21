{
  description = "Desktop player for Monochrome music with Discord RPC";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        monochrome-player = pkgs.stdenv.mkDerivation {
          pname = "monochrome-player";
          version = "1.1.1";

          src = self;

          nativeBuildInputs = with pkgs; [ nodejs_22 typescript makeWrapper bun ];

          buildInputs = with pkgs; [ electron ];

          buildPhase = ''
            rm -f bun.lock
            bun install --ignore-scripts
            bun run tsc
          '';

          installPhase = ''
            mkdir -p $out/{lib/monochrome-player,bin,share/icons/hicolor/256x256/apps,share/applications}

            cp -r dist-electron $out/lib/monochrome-player/
            cp -r assets $out/lib/monochrome-player/
            cp package.json $out/lib/monochrome-player/

            makeWrapper ${pkgs.electron}/bin/electron $out/bin/monochrome-player \
              --add-flags $out/lib/monochrome-player

            cp assets/icon.png $out/share/icons/hicolor/256x256/apps/monochrome-player.png

            cat > $out/share/applications/monochrome-player.desktop << DESKTOP_EOF
          [Desktop Entry]
          Name=Monochrome Player
          Comment=Desktop wrapper for monochrome.tf with Discord Rich Presence
          Exec=$out/bin/monochrome-player %U
          Icon=monochrome-player
          Type=Application
          Categories=Audio;Music;Player;
          MimeType=x-scheme-handler/monochrome-player;
          StartupWMClass=Monochrome Player
          Terminal=false
          DESKTOP_EOF
          '';

          meta = with pkgs.lib; {
            description = "Minimal desktop wrapper for monochrome.tf with Discord Rich Presence";
            homepage = "https://github.com/kmmiio99o/Monochrome-PC";
            license = licenses.mit;
            platforms = platforms.linux;
            maintainers = [];
          };
        };
      in
      {
        packages = {
          default = monochrome-player;
          monochrome-player = monochrome-player;
        };

        apps.default = {
          type = "app";
          program = "${monochrome-player}/bin/monochrome-player";
        };
      }
    );
}
