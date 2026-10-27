Set-Location $PSScriptRoot
foreach ($s in @('patch_bundle.mjs','gen_from_json.mjs','make_png.mjs')) {
  if (Test-Path $s) { node $s }
}
node bundle.mjs
node check.mjs