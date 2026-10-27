# HANDOFF -- Seraphim

> Base : unionizing/project-rain-oss (uni/autumn, discontinued).
> Repo : github.com/Frivolus/Seraphim -- public -- branche main.
> Derniere mise a jour : fin de batch 3.

## 1. Objectif
Script Deepwoken, base Project Rain OSS, destine a etre vendu avec une cle payante.
Cible : Volt (priorite), Synapse Z, Wave. Doit rester non detecte.
Le code est livre en FICHIERS. Le chat n'est qu'un canal de livraison.

## 2. REGLE N1 -- le repo est la source de verite
Avant de modifier un fichier, l'assistant DOIT le relire depuis :
  https://raw.githubusercontent.com/Frivolus/Seraphim/main/<chemin>
Ne jamais reecrire de memoire. Ne jamais renommer / restructurer sans raison.
Si le contexte est compresse : l'utilisateur colle CE fichier, et on reprend ici.

## 3. Chaine de build
- bundle.mjs  : bundler. Walk src/, closure des deps (require + list_modules),
                inlining de @assets/* en base64(zstd), ecrit dist/seraphim.lua.
- check.mjs   : liste modules/assets manquants. Doit dire (aucun) x2.
- build.ps1   : enchaine patch/gen/png/bundle/check.
- Node >= 22 requis (zstd natif). Sortie actuelle : 262 modules, 11 assets.

## 4. CONTRAT TECHNIQUE -- NE PAS CASSER
- require("@src/x") fourni par le bundle (builder_require). Le langage ne l'a pas.
- list_modules("features/*/*") = glob sur module_map. Indispensable au registry.
- inline_asset_b96("@assets/x") = lookup dans asset_map.
- LPH_*, AUTH_GET_CONSTANT, LRM_*, LPH_OBFUSCATED=false : definis en identity
  dans src/luarmor_init_script.lua.
- API Feature FIGEE : Feature:new(id, conn_signal, update_func).
  Champs : id, conn, update, current_connection, enabled, state.
  enable()/disable() surcharges par chaque feature.
  src/utility/ui/wrapper.lua connecte LUI-MEME feature.update sur feature.conn
  puis appelle enable()/disable() -> ne pas doubler la connexion.
- flags UI : aztup.flags[id] | toggles : aztup_toggles[id] | registry : aztup.features[id]
- Assets ecrits sur disque sous Seraphim/... (dossier de config executor).

## 5. PlaceIds supportes (allowlist dans src/init.lua)
4111023553, 5735553160, 6032399813, 6473861193, 6832944305, 8668476218,
86761619761103, 13891478131. Hors liste -> src/universal_fallback.lua.

## 6. Inventaire
| fichier | statut |
|---|---|
| bundle.mjs | OK |
| check.mjs | OK |
| build.ps1 | OK |
| patch_bundle.mjs / gen_from_json.mjs / make_png.mjs | OK (outils jetables, idempotents) |
| loader.lua (Volt) | OK |
| src/init.lua | OK (reecrit) |
| src/luarmor_init_script.lua | OK |
| src/features/loader.lua | OK |
| src/features/generic_feature.lua | OK |
| src/security/user_service.lua | OK (stub) |
| src/main_menu/loader.lua | OK (stub) |
| src/utility/setup_auto_load.lua | OK |
| src/universal_fallback.lua | OK |
| src/features/buttons/refresh.lua | OK |
| src/features/auto-parry/builder.lua | OK (stub) |
| src/features/auto-parry/data/custom_timings.lua | OK (stub) |
| src/features/misc/spotify_widget.lua | OK (stub) |
| group_members.lua / mantras.lua / deepwoken_meshes.lua | OK (generes depuis .json) |
| assets/brayden.png | OK (placeholder 64x64) |
| test en jeu | A FAIRE |
| rebrand | A FAIRE |
| src/security/bypass.lua | A FAIRE |
| key system | A FAIRE |

## 7. Journal
- batch 1 : import de la base OSS, structure repo.
- batch 2 : shims LPH, init reecrit, universal fallback, refresh.
- batch 3 : modules manquants, generateur JSON->Lua, png placeholder,
            fix du bug asset manquant qui produisait "undefined" dans le bundle.

## 8. Prochaine etape
Test en jeu : coller loader.lua dans Volt sur Deepwoken, relever la console.
Ensuite batch 4 = rebrand, batch 5 = cle payante.

## 9. Credits (obligatoires si payant / rebrand)
TempedOut, Soggy, Hon, Mint, Juan, Joseph, Q/2qrys & autumn/uni.
+ Blastbrean, Basil, V15/VermillionIts15, Ken/Winter, ILikeBananas69, 2qrys,
Wowzers, Citam, yv5, testeurs & staff.