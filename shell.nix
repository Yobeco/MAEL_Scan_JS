{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  packages = [ pkgs.python313 ];

  shellHook = ''
    echo "Serveur : python -m http.server 8000"
    echo "Puis ouvrir http://localhost:8000"
  '';
}
