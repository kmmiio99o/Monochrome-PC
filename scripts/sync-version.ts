import * as fs from "fs";
import * as path from "path";

const ROOT = path.resolve(__dirname, "..");
const version = fs.readFileSync(path.join(ROOT, "VERSION"), "utf8").trim();
const pkgname = "monochrome-player-bin";

const pkgPath = path.join(ROOT, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.version = version;
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.warn("package.json -> " + version);

const flakePath = path.join(ROOT, "flake.nix");
let flake = fs.readFileSync(flakePath, "utf8");
flake = flake.replace(/version = ".*?";/g, `version = "${version}";`);
fs.writeFileSync(flakePath, flake);
console.warn("flake.nix -> " + version);

const pkgbuildPath = path.join(ROOT, "PKGBUILD");
let pkgbuild = fs.readFileSync(pkgbuildPath, "utf8");
pkgbuild = pkgbuild.replace(/^pkgver=.*$/m, `pkgver=${version}`);
fs.writeFileSync(pkgbuildPath, pkgbuild);
console.warn("PKGBUILD -> " + version);

const srcinfoPath = path.join(ROOT, ".SRCINFO");
let srcinfo = fs.readFileSync(srcinfoPath, "utf8");
srcinfo = srcinfo.replace(/^\tpkgver = .*$/m, `\tpkgver = ${version}`);
srcinfo = srcinfo.replace(new RegExp(pkgname + "-\\d+\\.\\d+\\.\\d+", "g"), pkgname + "-" + version);
srcinfo = srcinfo.replace(/v\d+\.\d+\.\d+/g, "v" + version);
fs.writeFileSync(srcinfoPath, srcinfo);
console.warn(".SRCINFO -> " + version);
