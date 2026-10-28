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
## 10. Journal detaille
- batch 4b : BUG globals perdues. src/globals.lua declare is_chime / is_depths /
  is_eastern / is_etrean / is_dungeon / place_name en `local`. Le bundler encapsule
  chaque module dans une fonction -> ces locals sont perdus. Republies en global
  dans src/luarmor_init_script.lua sous le marqueur SHARED_GLOBALS_PATCH.
  Consequence avant fix : chime_safety inactif, boutons Fake Void / TP To Roof /
  TP To Void absents.
- batch 4c : BUG regex bundler. La regex de dependances cherchait `require(`, donc
  `pcall(require, "...")` n'etait pas suivi -> 5 modules absents du bundle en
  SILENCE (luarmor_init_script, globals, luraph_sdk, setup_auto_load, tos).
  Sans globals.lua : pas de `services`, pas de macros. Regex corrigee, supporte
  desormais les deux formes.
- Methodo : apres chaque modif, verifier avec Select-String sur le fichier ET sur
  dist, ne pas se fier au message de succes d'un script.
- Etat : 267 modules, 11 assets, check.mjs (aucun), marqueur present dans dist.
---

## Journal �� Batch 5 : boot 100% propre (valid�� en jeu)

### Bugs corriges
1. `attempt to index nil with 'SetValue'` -> `ThemeManager:LoadDefault()` appele par
   `src/ui/tos.lua` AVANT toute creation de dropdown. Fix : garde `_tl` dans LoadDefault
   + fallback `ApplyTheme`. Commit 817dc93.
2. `ThemeUpdate()` masquait la table `aztup_options` avec un `local` du meme nom -> les
   couleurs ne se mettaient jamais a jour. Renomme en `fields`. Commit 817dc93.
3. `Invalid path` -> `custom_font.lua` utilisait encore les chemins `Project Rain/fonts/...`
   alors que init.lua ecrit dans `Seraphim/Fonts/...`. Rebrand global des chemins (28 fichiers).
   Commit 7d6aa6e.
4. Casse des noms de fichiers polices (`lexend.ttf` -> `Lexend.ttf`). Commit suivant.
5. TOS se reaffiche a chaque lancement : tos.lua ecrivait `tos_accepted_82126_0822UTC0.txt`
   alors que init.lua verifie `tos_accepted.txt`. tos.lua ecrit maintenant les deux.

### Etat
- Boot OK en jeu (Volt) : TOS, UI complete, hook, zero erreur console.
- Loader de test pointe bien sur raw.githubusercontent.com/Frivolus/Seraphim/main/dist/seraphim.lua
- Aucun appel d'auth (user_service = stub) -> aucun risque de blacklist.
- Workspace : uniquement `Seraphim/...` (Assets, Fonts, Deepwoken-Config, logs).

### A FAIRE (par ordre)
1. Porter `src/security/bypass.lua` (27704 o) depuis beyondthetowers/project-rain (absent de l'OSS).
2. Notre `src/features/hooking.lua` (18210 o) est TRONQUE vs la reference (22430 o) -> comparer/completer.
3. Verifier `src/utility/trace.lua` (absent chez nous) : dependance probable de bypass/hooking.
4. Notre `src/features/loader.lua` (870 o) est un stub vs 15675 o en reference.
5. Rebrand texte TOS (mention luarmor -> Panda Auth plus tard).
6. Panda Auth sur `user_service.validate()`.
7. Tester Noclip / Speed / Fly en jeu.

### Regle anti-compression
Le repo GitHub est la source de verite. TOUJOURS relire les fichiers depuis le repo
avant de les modifier, ne jamais les reecrire de memoire.

---

## Journal �� Batch 6 : anti-detection portee

### Porte depuis beyondthetowers/project-rain (fork frutiger)
- src/security/bypass.lua (27704 o) : detection du KeyHandler PAR FORME, plus de
  constante heaven_key. Un seul chokepoint __namecall, drop silencieux (retour nil,
  pas de coroutine.yield), newcclosure sur les slots C, tags namespaces, clamps de
  plausibilite. Autonome (aucun require de nos modules).
- src/utility/trace.lua (2035 o) : log fichier, actif seulement si
  Seraphim/logs/TRACE_ON.txt existe. Chemins rebrandes Frutiger -> Seraphim.
- src/features/hooking.lua remplace par la version 22430 o : plus de scan
  #tbl == 13 and tbl[9] == heaven_key, plus de kick si KeyHandler absent.

### Pourquoi c'etait le point critique
La constante heaven_key est re-tiree a chaque update du jeu -> le scan ne matche plus,
KeyHandler ne se resout jamais, et init.lua kick le joueur. Le bypass ne se faisait pas
"detecter", il se faisait invalider par son propre chemin fail-loud.

### Etat
- 269 modules / 11 assets, check.mjs (aucun) manquant. Boot OK en jeu, pas de kick.
- Commit f3dc8df.

### A FAIRE
1. Verifier en jeu que bypass resout le KeyHandler (log: [kh] grabbed remotes & enc_f).
2. Tester Noclip / Speed / Fly / Auto-parry.
3. Panda Auth sur user_service.validate().
4. src/features/loader.lua : notre stub 870 o vs 15675 o en reference (a evaluer).
5. Rebrand restant : watermark, titre fenetre, texte Privacy du TOS.

### Repli
git revert --no-edit HEAD && git push restaure l'etat precedent.

---

## Journal �� Batch 7 : rebrand final + credits

### Fait
- Libelle fenetre, titre fenetre et watermark -> "Seraphim" (plus de "pr nextgen").
- Onglet "Config" repare : son nom "Config" manquait dans creation_order de src/ui/ui.lua,
  donc le module src/ui/tabs/ui.lua ne se construisait JAMAIS (boutons fast-flags et
  filtre allies inaccessibles). Ajoute a creation_order.
- Credits ajoutes (condition de licence Oni) :
  - en jeu : groupbox "Credits" dans l'onglet Config (src/ui/tabs/ui.lua:create_credits)
  - README.md : section Credits
  - texte : "base: Project Rain (open-sourced by autumn / unionizing)" +
    "TempedOut, Soggy, Hon, Mint, Juan, Joseph, Q/2qrys & Oni"
- Commit 1db8fc1. 269 modules / 11 assets, check.mjs (aucun).

### Condition de licence
Oni : credits obligatoires si fork payant / rebrand / reutilisation significative.
-> satisfait. A conserver dans toute distribution.

### A FAIRE
1. Tester Noclip / Speed / Fly / auto-parry (validation du port bypass).
2. Texte Privacy du TOS : mentions binwoken.sh / HWID a aligner sur la realite
   (vrai seulement quand Panda Auth sera branche).
3. Optionnel : "nextgen" -> rien, et tags "pr_" -> "srf_" dans bypass.mint_tag.
4. Panda Auth sur user_service.validate() (apres, pas urgent).

---

## Journal �� Batch 8 : VALIDATION COMPLETE EN JEU

### Valide
- Boot complet, TOS, UI, onglets, credits affiches (Config + TOS).
- Hooks installes : 1x __namecall, 1x __newindex, camera popper. Aucun kick.
- bypass.resolve_keyhandler() -> "[kh] grabbed remotes & enc_f" (detection PAR FORME, plus
  de constante heaven_key). C'est la resilience aux updates du jeu.
- Features testees et fonctionnelles : Noclip, Speed, Fly, auto-parry.
  => preuve que KeyHandler se resout ET que le filtre ne mange pas de trafic legitime.

### Garde-fou ajoute
- src/luarmor_init_script.lua : env.LPH_OBFUSCATED = env.LPH_OBFUSCATED or false
  (avant : ecrasement inconditionnel a false -> si obfuscation Luraph/IronBrew, le TOS
  restait a 5s au lieu de 45s et luraph_sdk se chargeait a tort).

### Etat du projet : FONCTIONNEL
Rebrand complet (dossiers, watermark, titre, TOS, tags), credits en place (condition de
licence Oni satisfaite : Config + TOS + init.lua + README + CREDITS.md), anti-detection
portee et validee, 269 modules / 11 assets.

### Backlog restant (non bloquant)
1. Panda Auth sur user_service.validate() + fenetre de cle (reporte par le user).
2. src/features/loader.lua : notre stub 870 o vs 15675 o en reference (a evaluer).
3. Cosmetique : PR_BREAKER_IGNORE / PR_PLAYER_CONTAINER / pr_bindable -> SRF_*.
4. TOS : texte Privacy volontairement conserve (deviendra vrai avec Panda Auth).
5. Preparer l'obfuscation (Luraph/IronBrew) quand la vente approchera : relire le shim
   luarmor_init_script (Luraph genere sa propre init).

### Prochaine etape logique
Le script marche. La suite c'est l'empaquetage : hebergement (Panda VSS ou GitHub raw) +
cle payante. Le reste est du confort.

---

## Journal -- Batch 9 : chaîne d'obfuscation Luraph v15 (validée)

### Ce qui a été construit
- `to51.mjs` : transpileur Luau -> Lua 5.1, étape OBLIGATOIRE du build.
  Passe un vrai lexeur Lua (rien dans les chaînes/commentaires n'est touché), puis :
  `continue` -> `do break end` dans un `repeat ... until true` autour du corps de boucle
  (drapeau local si la boucle a aussi un `break` d'origine) ; `a += b` -> `a = a + b` ;
  annotations de type supprimées (retour, paramètres, `local`, `for`, alias `type`) ;
  `export` supprimé ; if-expressions -> `(cond and a or b)` ; `;` inséré entre `end)()`
  et une ligne commençant par `(` (ambiguïté 5.1), en excluant les en-têtes de fonction.
  Il VALIDE sa sortie avec luaparse en 5.1 et restaure l'original si ça échoue.
- Macros v14 -> attributs v15 : `LPH_NO_VIRTUALIZE` -> `LPH_ATTRIBUTES(VM(NONE))`,
  `LPH_JIT`/`LPH_JIT_MAX` -> `LPH_ATTRIBUTES(PRESET(FAST))`, `LPH_NO_UPVALUES` -> `NO_UPVALUES`.
- Obfuscation réussie sur Panda (Luraph v15), publication, test avec clé : OK.

### Ordre de build -- NE PAS INVERSER
`node bundle.mjs` PUIS `node to51.mjs`. `to51.mjs` n'est PAS idempotent (les `break`
déjà enveloppés seraient re-enveloppés, les macros déjà converties ne le seraient plus).

### Pièges documentés (Luraph v15)
1. TOUT identifiant `LPH_*` inconnu fait échouer le build ("could not process this script").
   Les macros v14 ne sont pas tolérées. Toute nouvelle macro doit exister en v15.
2. `Compatibility Mode` DÉSACTIVE des fonctionnalités de syntaxe -> le laisser DÉCOCHÉ
   sur cible Roblox/Luau. Il a masqué le vrai problème pendant plusieurs essais.
3. `__namecall` n'est PAS invoqué dans le code virtualisé, et `hookfunction` casse sur les
   upvalues. C'est pourquoi bypass/hooking gardent `VM(NONE)` : ne pas les retirer.
4. En jeu non obfusqué, `LPH_ATTRIBUTES`/`VM`/`PRESET`/`NONE`/`FAST`/`NO_UPVALUES` sont
   nil -> shims à injecter avant `loadstring`, ou à terme dans le fichier sous
   `if not LPH_OBFUSCATED then` (recommandation de la doc Luraph).
5. Réglages Panda : v15, Compatibility OFF, VM Compression ON, Intense VM Structure ON,
   Hardcode Globals ON, Disable Error Handling OFF.

### Etat
- 269 modules / 11 assets. `luaparse` 5.1 OK, `luau-compile` OK, boot en jeu OK,
  build Panda OK, test avec clé OK.
- Sauvegarde Luau de référence : `dist/_seraphim.luau.lua` (générée par to51, ne pas publier).

### Outils locaux
- `luau/` (binaires officiels luau-lang) : `luau-compile` sert de garde-fou avant push.
- `luaparse` (npm, --no-save) : porte de validation 5.1.

### Backlog restant
1. `src/features/loader.lua` : stub 870 o vs 15675 o en référence.
2. Cosmetique : `PR_BREAKER_IGNORE` / `PR_PLAYER_CONTAINER` / `pr_bindable` -> `SRF_*`.
3. Shims LPH permanents sous `if not LPH_OBFUSCATED then` (évite l'injection manuelle).
4. TOS : texte Privacy à aligner quand Panda Auth sera branché.
