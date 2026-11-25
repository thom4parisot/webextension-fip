# Publier une version

La CI construit et publie la release GitHub à partir d'un tag. La soumission aux stores reste manuelle.

## 1. Préparer

- Les changements sont fusionnés dans `main`, et la CI est au vert.
- Dans `CHANGELOG.fr.md` et `CHANGELOG.en.md`, la section « Prochaine version » (« Next version ») devient `## Version X.Y.Z`.
  Le titre doit être exactement celui-ci dans `CHANGELOG.fr.md` : la CI en extrait le texte de la release, et échoue s'il manque.
- Mettre à jour les nouveautés de la [description du Chrome Web Store](#description-du-chrome-web-store), en français et en anglais.
- Tester l'extension à la main, avec `npm run build`, puis en chargeant `build/manifest.json` dans Firefox (`about:debugging#/runtime/this-firefox`) et dans Chrome (`chrome://extensions/`).

### Tests manuels, dans Firefox et dans Chrome

- [ ] lancer la radio, fermer le popup : la lecture continue plusieurs minutes ;
- [ ] le badge et le bouton de lecture suivent l'état (chargement, lecture, arrêt) ;
- [ ] changer de station et de qualité dans les options : le flux redémarre une seule fois ;
- [ ] couper puis rétablir le réseau : la coupure est signalée, puis la lecture reprend ;
- [ ] les titres diffusés s'affichent dans le popup ;
- [ ] se connecter à Last.fm dans les options, puis vérifier qu'un titre est scrobblé ;
- [ ] recharger l'extension : la station, la qualité et la session Last.fm sont conservées.

## 2. Créer la version

```bash
npm version minor
```

`patch` ou `major` selon les changements. Le script `version` reporte le numéro dans `src/manifest.json`, puis npm commite et crée le tag `vX.Y.Z`.

```bash
git push --follow-tags
```

## 3. Ce que fait la CI

Le workflow [`release.yml`](.github/workflows/release.yml) ne publie qu'à partir d'un tag. Le job `package` tourne dans l'environnement `Webstores`, qui détient les secrets Last.fm et n'accepte que les tags `v*`. Il :

1. construit `dist/webextension-fip-vX.Y.Z.zip` (l'extension) et `dist/webextension-fip-vX.Y.Z-source.zip` (les sources, pour AMO) ;
2. atteste la provenance des deux zips ;
3. crée la release GitHub avec les deux zips. Son texte reprend la section `## Version X.Y.Z` de `CHANGELOG.fr.md`, suivie de la liste des pull requests fusionnées.

Pour vérifier le zip publié :

```bash
gh release download vX.Y.Z --pattern 'webextension-fip-vX.Y.Z.zip' --dir "$TMPDIR"
```

```bash
gh attestation verify "$TMPDIR/webextension-fip-vX.Y.Z.zip" --repo thom4parisot/webextension-fip
```

## 4. Soumettre aux stores

Les deux stores reçoivent le même zip, téléchargé depuis la release GitHub.

- **Firefox Add-ons** : déposer `webextension-fip-vX.Y.Z.zip`, puis `webextension-fip-vX.Y.Z-source.zip` quand AMO demande les sources. Indiquer aux relecteurs la section [Build from source](README.md#build-from-source) du README.
- **Chrome Web Store** : déposer `webextension-fip-vX.Y.Z.zip`. Pour les « Verified uploads », `npm run package:crx` signe un CRX (macOS uniquement, clé dans le trousseau : voir [`scripts/package-crx.sh`](scripts/package-crx.sh)).

Les deux stores relisent chacun de leur côté. Si l'un demande un changement, il part dans une version `patch`, publiée sur les deux stores pour garder les mêmes numéros.

### Description du Chrome Web Store

Le Chrome Web Store refuse les descriptions qui répètent trop de mots-clés (infraction « Yellow Argon ») : chaque mot-clé doit apparaître moins de 5 fois, et la description ne doit pas citer plus de 5 marques ou sites.
La description ne présente donc que la dernière version, et renvoie vers le CHANGELOG complet.

Texte brut uniquement : le Chrome Web Store n'affiche pas le Markdown.

#### Français

```
Un moyen pratique et rapide d'écouter FIP depuis votre navigateur, sans publicité ni traceur.

Lancez la radio en un clic, choisissez votre webradio, consultez les titres diffusés et, si vous le souhaitez, scrobblez-les sur votre compte last.fm.

Nouveautés de la version 1.8.0 :
- la lecture continue une fois la fenêtre fermée
- le bouton de lecture indique le chargement du flux
- la lecture reprend d'elle-même après une coupure réseau
- plus aucune permission d'accès aux sites n'est demandée

Historique complet des versions :
https://github.com/thom4parisot/webextension-fip/blob/main/CHANGELOG.fr.md

Signaler un bug ou suggérer une idée :
https://github.com/thom4parisot/webextension-fip/issues
```

#### English

```
A quick and easy way to listen to FIP in your browser, with no ads and no trackers.

Start the radio in one click, pick your webradio, see the tracks on air and, if you like, scrobble them to your last.fm account.

What's new in version 1.8.0:
- playback keeps going once the popup is closed
- the playback button shows when the stream is loading
- playback resumes on its own after a network outage
- no site access permission is requested anymore

Full version history:
https://github.com/thom4parisot/webextension-fip/blob/main/CHANGELOG.en.md

Report a bug or suggest an idea:
https://github.com/thom4parisot/webextension-fip/issues
```

## 5. Après la publication

- Fermer les issues livrées.
- Ajouter une section « Prochaine version » (« Next version ») en tête des deux CHANGELOG.
