{
  description = "Description for the project";

  inputs = {
    flake-parts.url = "github:hercules-ci/flake-parts";
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = inputs@{ flake-parts, ... }:
    flake-parts.lib.mkFlake { inherit inputs; } {
      systems = [ "x86_64-linux" "x86_64-darwin" ];
      perSystem = { pkgs, ... }: {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [ 
            (python313.withPackages (pypkgs: with pypkgs; [
              django
              djangorestframework
              drf-spectacular
              pytest
              pytest-django
              pytest-cov
              coverage
              django-cors-headers

            ]))
              nodejs
          ];
        };
      };
    };
}
