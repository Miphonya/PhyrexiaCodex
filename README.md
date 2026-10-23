# šotm

Gestionnaire personnel de cartes Magic: The Gathering, statique, local-first et sans compte. Interface française inspirée de la porcelaine et des architectures biomécaniques, sous le nom humain **šotm**, avec l’emblème original et le nom phyrexian traité comme un mot-symbole séparé (`public/wordmark.svg`). Sans image disponible, le nom humain **šotm** est affiché. Le SVG du mot-symbole est une reprise vectorielle, pas le fichier original joint.

## Développement

Node.js 22.12+ ou 24, npm.

```sh
npm ci
npm run dev
npm test
npm run build
```

Les tâches cloud utilisent le checkout existant ; aucun worktree supplémentaire n’est nécessaire.

## Hébergement public

Le workflow `.github/workflows/deploy.yml` vérifie les tests et la compilation puis publie `dist` sur GitHub Pages lors d’un push sur `main`. Dans GitHub, sélectionner **Settings → Pages → Source → GitHub Actions**. Aucune publication n’a été effectuée pendant l’implémentation. La base Vite relative et le routage par hash supportent un chemin de dépôt tel que `/PhyrexiaCodex/`.

Ne jamais ajouter de sauvegarde personnelle, de jeton ou de fichier `.env` contenant des secrets au dépôt public. Il n’existe aucun secret requis et aucune clé Cardmarket côté client. Un dépôt public n’expose pas les données IndexedDB des visiteurs. Les appels Scryfall, ses images et le taux de change sont néanmoins des requêtes externes ; ce n’est pas une application dépourvue de toute communication réseau.

## Données et architecture

- `src/schemas/models.ts` : types stricts et validation Zod. Les lots possèdent un UUID stable et des caractéristiques indépendantes : impression Scryfall, langue, finition, état, signature, altération et notes.
- `src/db` : Dexie/IndexedDB, lots, catalogue, préférences et cache. Le Trade est un champ du lot, jamais une seconde collection.
- `src/services` : Scryfall indépendant de React, file de requêtes espacées de 120 ms, pagination, reprise limitée des HTTP 429/5xx, cache périssable et fournisseur de prix EUR/USD et conversion CHF datée.
- `src/pages` : extensions, détail de set, collection globale, ajout assisté et paramètres.
- `src/components` : composants de collection et de lots, capture caméra, primitives UI shadcn adaptées avec Radix Dialog et CVA.
- `src/stores` : état UI Zustand ; TanStack Query orchestre le chargement API et Dexie conserve les données.
- `src/styles.css` : tokens CSS de couleurs, typographie, raretés, surfaces, focus et transitions. Tous les écrans partagent ces composants. Thèmes porcelaine clair et sombre, navigation mobile, clavier et réduction des animations.

Les lots ne sont fusionnés explicitement que si toutes leurs caractéristiques, notes comprises, concordent. Les quantités physiques et Trade sont alors additionnées dans une transaction. Une modification Trade seule n’affecte jamais la quantité possédée.

## Sauvegardes

Dans Paramètres, exporter le JSON régulièrement : effacer les données du navigateur, changer d’origine ou d’appareil ne transfère pas la collection. L’export contient le schéma version 1, les lots, les préférences et les extensions suivies ; pas le catalogue ni les images.

L’import valide le document entier avant une transaction. La fusion fait un upsert par UUID : un réimport n’additionne pas les quantités et la version avec `updatedAt` le plus récent est conservée. Les lots avec des UUID différents restent distincts. Le remplacement complet nécessite une confirmation explicite. Les métadonnées manquantes après restauration peuvent être récupérées depuis « Toutes mes cartes » ; les lots restent visibles sans ces métadonnées.

## Cache et hors ligne

Les données IndexedDB déjà chargées peuvent être consultées sans réseau. En production HTTPS, un service worker garde le shell et les ressources JS/CSS de l’application pour permettre une réouverture hors ligne après une première visite réussie. Les processus de développement et les permissions caméra ne sont pas persistants.

Le cache des réponses API est limité à environ 25 Mo et évincé par ancienneté, avec une rétention maximale de 90 jours. Le catalogue garde au maximum 15 000 impressions non protégées par des lots possédés ; les cartes possédées sont conservées, ce qui peut dépasser cette limite. Les métadonnées de set se rafraîchissent selon le délai configuré et le catalogue d’un set selon le plus court des délais catalogue/prix. Les résultats de recherche restent en cache 24 h. Le bouton « Actualiser les prix » recharge les impressions possédées par groupes de 75.

Les images utilisent le cache HTTP du navigateur ; elles ne sont pas systématiquement stockées dans IndexedDB et leur disponibilité hors ligne n’est pas garantie. Le shell conserve au maximum 50 ressources. Vider le cache du catalogue ne supprime jamais les lots ou les préférences. Le quota réel dépend du navigateur, et une demande de stockage persistant est proposée dans les paramètres.

## API externes et limites

Domaines requis : `api.scryfall.com`, `cards.scryfall.io`, `svgs.scryfall.io` ; `cdn.jsdelivr.net` pour le taux EUR → CHF.

La liste des extensions provient de Scryfall ; le compteur affiche les impressions distinctes possédées rapportées au `card_count` du set, et non le nombre de cartes Oracle uniques. Ce dénominateur peut inclure des variantes ou des produits qui ne figurent pas dans le filtre papier : il s’agit d’un indicateur de catalogue, pas d’une définition universelle de complétion.

La recherche supporte la syntaxe Scryfall, l’autocomplétion, les impressions et le chargement des pages suivantes. Les filtres s’appliquent aux résultats chargés. Les lots peuvent indiquer leur langue ; la recherche `lang:fr` permet de choisir explicitement une impression localisée. Les prix sont indicatifs, datés dans le catalogue local, et ne reflètent pas l’état, les signatures ou les altérations. Les prix etched sont indisponibles si Scryfall ne fournit pas de champ EUR adapté. Aucun prix manquant n’est inventé.

La caméra ou une image JPEG/PNG/WebP fournit une photo temporaire à Tesseract.js, exécuté dans un Web Worker local. Les modèles français et anglais sont fournis par le site. Le texte reconnu doit être vérifié et corrigé avant une recherche Scryfall, puis l’impression et l’ajout doivent être confirmés manuellement. Scryfall ne reconnaît aucune image : seuls les champs de recherche validés lui sont envoyés. Le recadrage manuel et un fournisseur Cardmarket officiel ne sont pas intégrés. Il n’y a ni scraping ni synchronisation distante.

Magic: The Gathering et les images de cartes appartiennent à Wizards of the Coast. Données et images fournies par Scryfall. Application indépendante, non affiliée à ces sociétés.

## Vérification

`npm test` exerce les contraintes des lots, le Trade, la compatibilité de fusion, la progression par impression, la validation des imports, le réimport idempotent, la conservation des données au nettoyage, les prix absents, les images recto verso, les erreurs API, la pagination et le cache hors ligne. `npm run build` vérifie les types TypeScript et produit les ressources statiques.

### Validation de cette implémentation

Les 44 tests Vitest et la compilation de production ont passé. Un parcours navigateur sur les véritables réponses Scryfall a chargé les 479 impressions papier de ONE (pagination incluse), leurs images, une recherche « Elesh Norn set:one », et la mise à jour des prix via `/cards/collection`. Ajout de trois exemplaires, édition de la quantité Trade, thèmes, export, réimport sans doublon, absence de débordement mobile et rechargement hors ligne de la production ont été vérifiés sans exception JavaScript.

Dans la machine cloud, le navigateur automatisé ne fait pas confiance au certificat du proxy. Le parcours réel a donc utilisé un adaptateur de test relayant les requêtes par `curl`, avec validation TLS et certificats système conservés. Les réponses provenaient de Scryfall, sans fixtures. Cet adaptateur ne fait pas partie de l’application ; les visiteurs utilisent directement `fetch` dans leur navigateur. La capture caméra réelle nécessite un appareil et une autorisation utilisateur ; elle n’a pas été validée sur du matériel physique. La publication GitHub Pages reste à effectuer.

## Devises, suivi et ajout par liste

Le sélecteur des paramètres propose CHF (par défaut), EUR et USD ; il n’apparaît pas dans la barre supérieure. La devise est aussi choisie lors de la première configuration. EUR/USD utilisent les champs Scryfall de la finition demandée ; CHF convertit le prix EUR avec le taux quotidien de la Currency API de Fawaz Ahmed distribuée via jsDelivr. La source, la date et le taux figurent dans les paramètres. Le taux est conservé dans les préférences et dans les sauvegardes ; les données sont rafraîchies au maximum une fois par 24 heures, sauf demande explicite. Hors ligne ou en cas d’erreur, le dernier taux est conservé et son ancienneté signalée. Sans taux ou prix fiable, le résultat est N/A. Les totaux et le tri par valeur utilisent la devise sélectionnée.

Le bouton « Extensions suivies uniquement » est mémorisé dans IndexedDB : navigation et rechargement ne le réinitialisent pas. Dans le détail d’une extension, les impressions non possédées sont grisées et marquées « Manquante ». Le filtre « Possession » propose toutes, possédées et manquantes.

Dans Ajouter / Scanner, collez une carte par ligne :

```text
1 Elesh Norn, Mother of Machines (ONE) 10 *F*
2 Elesh Norn, Mother of Machines (ONE) 10
```

`*F*` signifie foil, `*E*` etched ; l’absence de marqueur signifie non-foil. Les astérisques échappés `\*F\*` sont également acceptés. Les impressions sont résolues par extension et numéro en appels groupés de 75 maximum (les impressions anglaises déjà en cache sont réutilisées). L’aperçu vérifie le nom et la disponibilité de la finition. Une erreur bloque tout l’ajout. Choisissez un état commun, puis confirmez : chaque ligne crée un lot avec la langue par défaut choisie dans les paramètres, sans signature ni altération et avec Trade à zéro. Maximum 1 000 lignes par analyse. Une même confirmation ne peut pas être exécutée deux fois ; analyser à nouveau une liste crée volontairement de nouveaux exemplaires. Pour restaurer une sauvegarde sans doublons, utilisez l’import JSON des paramètres.

Les anciennes préférences et sauvegardes version 1 reçoivent automatiquement les nouveaux paramètres par défaut sans effacer la collection.

## Première configuration et interface simplifiée

Au premier lancement de cette version sur un navigateur, cinq étapes présentent le fonctionnement local, permettent de choisir apparence, devise et langue des nouveaux exemplaires, puis expliquent les modes de reconnaissance Base et +. Les choix sont enregistrés ensemble à la dernière étape. Une fois terminé, l’onboarding ne réapparaît pas après un rechargement. Les utilisateurs des versions précédentes passent une fois par ce nouvel accueil en conservant leurs lots et leurs paramètres existants. Importer une ancienne sauvegarde ne relance pas un onboarding déjà terminé.

La langue des nouveaux lots est réglable dans les paramètres (français par défaut), présélectionnée dans l’éditeur et appliquée aux listes. Elle ne change ni les lots existants, ni les noms ou images Scryfall ; les exemplaires physiques et le catalogue ont des langues distinctes. L’éditeur permet de modifier la langue pour un lot précis.

Le détail d’une extension trie par numéro de carte avec un ordre naturel (`1`, `2`, `10`, `10a`). Les contrôles visibles se limitent à la recherche, la possession, la rareté et le tri. Couleur et type restent accessibles dans « Plus de filtres ». Le filtre d’extension est directement visible dans Toutes mes cartes, avec le nom et le code de chaque extension. Dans les recherches, il reste dans les options avancées lorsqu’il y a plusieurs éditions. Il n’est pas affiché dans le catalogue d’une extension unique. Aucun filtre de finition n’est affiché ; la finition reste un attribut modifiable à l’ajout. La barre d’ajout propose Nom → Photo → Lot. Un seul formulaire est affiché à la fois et la dernière méthode utilisée est conservée dans les préférences locales et les sauvegardes.

La page Trade affiche uniquement « Soon… ». Les quantités Trade existantes sont conservées dans les lots et les sauvegardes pour une reprise ultérieure de cette fonction.

## Ajout par photo et OCR local

`npm ci` exécute `scripts/prepare-ocr.mjs` : il copie le worker, les quatre variantes du cœur WebAssembly et les modèles français/anglais des paquets npm verrouillés vers `public/ocr/` (dossier généré et ignoré par Git). La compilation les inclut dans `dist/ocr/`. Aucune clé ni dépendance à un service de reconnaissance externe n’est nécessaire pour le mode Base. Les fichiers occupent environ 21 Mo dans le site compilé ; le navigateur ne charge que le cœur adapté à son appareil et les deux modèles au premier usage.

Dans Ajouter / Scanner, les trois boutons Nom, Photo et Lot changent la méthode active et mémorisent ce choix. Photo précède Lot ; on peut importer une image ou ouvrir la caméra. La lecture affiche son avancement et peut être annulée. Le worker OCR est terminé après lecture ou annulation ; la caméra est arrêtée lorsqu’on quitte cette méthode. Les photos ne sont pas enregistrées par šotm dans IndexedDB, dans les sauvegardes ou sur un serveur. Le mode + facultatif transmet uniquement la photo sélectionnée au fournisseur après confirmation explicite.

L’OCR propose un nom et, lorsqu’ils sont lisibles, un numéro et un code d’extension. Ce sont des suggestions faillibles, notamment pour les reflets, les photographies inclinées, les traitements foil et les cadres alternatifs. Les modèles couvrent le français et l’anglais, pas l’écriture phyrexiane ni toutes les langues de cartes. Le score indique la confiance du moteur sur le texte, pas une certitude d’identification. L’utilisateur peut tout corriger ; une recherche explicite sur Scryfall précède toujours l’ajout manuel d’un lot. La reconnaissance visuelle du mode + reste également une proposition à vérifier.

En production, les ressources OCR utilisées sont conservées dans un Cache Storage séparé, limité à 12 fichiers statiques ; aucune photo personnelle n’y est mise. La lecture peut donc fonctionner hors ligne après un premier chargement complet. Les résultats Scryfall non encore chargés et les images de catalogue nécessitent toujours une connexion. Vider les données du site supprime ces ressources et la collection locale ; exportez vos sauvegardes.

Le changement de nom conserve volontairement l’identifiant IndexedDB historique `phyrexian-vault` et le schéma de sauvegarde version 1, afin de retrouver les collections existantes à la même origine. Le dépôt et le chemin GitHub Pages ne sont pas renommés.

Le parcours navigateur a exécuté le vrai moteur sur l’image non modifiée d’Elesh Norn, identifié son nom, puis testé la correction et la recherche réelle Scryfall avant ajout explicite. La lecture a été répétée avec succès hors ligne après rechargement. Le test a aussi vérifié les trois méthodes, leur persistance, l’arrêt d’une caméra simulée et le fonctionnement sous `/PhyrexiaCodex/`. Une caméra physique de téléphone ou Mac reste à vérifier sur l’appareil de l’utilisateur.

## Reconnaissance Base / + et confidentialité

**Base** est le comportement par défaut, gratuit côté application et sans clé : OCR Tesseract dans le navigateur. La photo reste sur l’appareil. Le service Scryfall reçoit uniquement les champs de recherche que l’utilisateur valide. Une explication apparaît au premier usage de la photo, dans la cinquième étape de l’onboarding et dans les paramètres.

**+** est optionnel : une analyse de l’image complète via OpenAI Responses (`gpt-4.1-mini`). Dans les paramètres, l’utilisateur saisit sa propre clé API et active le mode pour la session. La clé est conservée uniquement dans un store Zustand non persistant : ni IndexedDB, ni localStorage, ni sessionStorage, ni export JSON, ni code du dépôt. Recharger l’onglet ou cliquer « Oublier ma clé » la supprime. L’activation ne vérifie pas les identifiants et n’effectue aucun appel facturable.

Dans Photo, la lecture locale reste automatique. Si une clé est disponible, le bouton « Analyser l’image avec + » ouvre une confirmation précisant que la photo est envoyée à OpenAI et que l’usage peut être facturé. Aucune analyse externe n’a lieu sans cette confirmation pour la photo courante. La requête cible exclusivement `https://api.openai.com/v1/responses`, sans cookies ni redirection autorisée, avec `store: false` et une sortie JSON structurée. Cette option n’est pas une garantie d’absence de rétention chez le fournisseur : ses conditions s’appliquent. La clé est envoyée uniquement dans l’en-tête Authorization à ce fournisseur, pas dans le texte adressé au modèle. La collection complète n’est jamais transmise. Le mode + nécessite Internet et l’autorisation de ce domaine dans les réseaux restreints.

Une clé utilisée dans une app statique reste accessible au navigateur de son utilisateur ; il n’est pas possible de la cacher au code qui l’utilise. Cette fonctionnalité est donc réservée à une instance de confiance avec une clé personnelle, et non à une clé partagée publiée dans le frontend. Les clés ne doivent jamais être collées dans le dépôt ni dans les messages de chat.

Les tests ont vérifié le contrat de requête et les erreurs sans fuite de clé, ainsi que le consentement dans un navigateur avec une réponse fournisseur simulée. L’appel réel au fournisseur n’a pas été testé faute de clé personnelle. Les traitements OCR locaux et les requêtes Scryfall ont été validés avec les vraies données.

## Mobile et réinitialisation

L’interface mobile privilégie les zones tactiles, des champs de taille lisible sans zoom forcé, un en-tête compact, une navigation basse flottante avec marges de zone sûre, des extensions présentées en cartes horizontales et des dialogues en panneaux bas. Dans Toutes mes cartes, la gestion détaillée des lots reste accessible dans « Gérer mes exemplaires » pour laisser la grille au premier plan. Le nom phyrexian et l’ancien emblème sont des éléments distincts ; une police pourra remplacer le mot-symbole si son fichier est fourni.

Les paramètres permettent de réinitialiser la collection locale. Le dialogue propose d’abord un export JSON et exige une confirmation explicite avant l’effacement. Une transaction supprime lots (y compris Trade), catalogue, réponses API et préférences ; la clé de l’onglet et les données de requêtes en mémoire sont aussi oubliées. Le cache OCR est nettoyé lorsque le navigateur le permet, mais le shell statique est conservé pour pouvoir afficher l’onboarding même hors ligne. L’onboarding recommence ensuite. Les autres appareils et le compte API du fournisseur ne sont pas modifiés ; une clé oubliée par l’app n’est pas révoquée chez le fournisseur.
