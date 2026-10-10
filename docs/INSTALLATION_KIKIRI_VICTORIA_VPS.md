# Kikiri German Victoria — Installation validée sur VPS Ubuntu et génération MP3

> **Objectif :** reproduire l'installation du modèle **original** `kikiri-tts/kikiri-german-victoria` avec le fork allemand Kokoro/Misaki, produire un paragraphe en WAV puis MP3 et récupérer l'audio sur un PC Windows via SSH.
>
> **Configuration réellement testée :** Ubuntu 24.04, Python 3.12, CPU x86_64 (4 vCPU), 4 Go de RAM, sans GPU. PyTorch `2.14.1+cpu`, NumPy `2.5.3`, Kokoro `0.9.4` (fork Kikiri), Misaki `0.9.4` (fork `semidark`).
>
> **Important :** utiliser le modèle original PyTorch, **pas** la conversion ONNX INT8. Les commandes ci-dessous sont celles qui ont abouti. Elles supposent une session SSH ayant les droits nécessaires pour écrire sous `/opt` (dans le test, compte `root`).

## 1. Installer les outils système

```bash
sudo apt update
sudo apt install -y \
  python3-venv python3-pip git curl ffmpeg \
  espeak-ng libespeak-ng1
```

Vérification facultative :

```bash
python3 --version
ffmpeg -version | head -n 1
free -h
```

## 2. Télécharger le modèle **original** Victoria

Source : https://huggingface.co/kikiri-tts/kikiri-german-victoria

```bash
mkdir -p /opt/kikiri-victoria/voices
cd /opt/kikiri-victoria

BASE="https://huggingface.co/kikiri-tts/kikiri-german-victoria/resolve/main"

curl -fL --retry 3 \
  -o kikiri_german_victoria_ep10.pth \
  "$BASE/kikiri_german_victoria_ep10.pth"

curl -fL --retry 3 \
  -o voices/victoria.pt \
  "$BASE/voices/victoria.pt"

ls -lh kikiri_german_victoria_ep10.pth voices/victoria.pt
```

Tailles constatées : modèle **313 Mo** (affichage `ls -lh`) ; voix **512 Ko**.

## 3. Créer l'environnement Python et installer PyTorch CPU

```bash
cd /opt/kikiri-victoria
python3 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
python -m pip install numpy soundfile kokoro
```

Le `kokoro` installé ici sert de base ; il sera remplacé par le fork allemand à l'étape 5.

Vérification :

```bash
python -c 'import torch, numpy, soundfile; from kokoro import KPipeline; print("PyTorch:", torch.__version__, "| CUDA:", torch.cuda.is_available(), "| NumPy:", numpy.__version__)'
```

Résultat observé : **PyTorch 2.14.1+cpu**, CUDA `False`, NumPy `2.5.3`.

## 4. Récupérer les sources et sous-modules officiels Kikiri

Source : https://github.com/semidark/kikiri-tts

```bash
cd /opt/kikiri-victoria
git clone --recurse-submodules \
  https://github.com/semidark/kikiri-tts.git kikiri-source

git -C kikiri-source submodule status
```

Le dépôt comprend notamment `kokoro/`, `StyleTTS2/`, `scripts/test_inference.py` et `training/config.json`. **StyleTTS2 est récupéré par le clonage, mais le test d'inférence utilise Kokoro.**

## 5. Installer les **forks allemands** Kokoro et Misaki

L'ordre est important : installer le fork Kokoro puis réinstaller **Misaki depuis GitHub en dernier**, sans résolution automatique des dépendances, pour éviter le retour à une version de Misaki qui ne fournit pas `misaki.de`.

```bash
cd /opt/kikiri-victoria
source .venv/bin/activate

python -m pip install --no-deps -e ./kikiri-source/kokoro

python -m pip uninstall -y misaki
python -m pip install --no-deps \
  'git+https://github.com/semidark/misaki.git'
```

Vérifier que **l'allemand** est effectivement présent :

```bash
python - <<'PY'
import inspect
from kokoro import KPipeline
from misaki.de import DEG2P

print("Kokoro actif :", inspect.getfile(KPipeline))
print("Misaki allemand : OK (DEG2P)")
print("KPipeline :", inspect.signature(KPipeline))
PY
```

Le chemin Kokoro doit pointer vers :

```text
/opt/kikiri-victoria/kikiri-source/kokoro/kokoro/pipeline.py
```

Le fork reconnaît la langue allemande par **`lang_code="d"`** (et non `"de"` dans cette API).

> Ne pas réinstaller ensuite `kokoro` depuis PyPI sans précaution : cela risque d'écraser les forks compatibles.

## 6. Vérifier l'original avec le script officiel

C'est **le test réellement réussi** avec les poids Victoria et le voicepack Victoria :

```bash
cd /opt/kikiri-victoria
source .venv/bin/activate

OMP_NUM_THREADS=2 MKL_NUM_THREADS=2 \
python -u kikiri-source/scripts/test_inference.py \
  --model /opt/kikiri-victoria/kikiri_german_victoria_ep10.pth \
  --voicepack /opt/kikiri-victoria/voices/victoria.pt \
  --config /opt/kikiri-victoria/kikiri-source/training/config.json \
  --output-dir /opt/kikiri-victoria/output \
  --device cpu
```

Vérification :

```bash
ls -lh /opt/kikiri-victoria/output/
free -h
```

**Résultat observé :** 14 WAV créés (`test_01.wav` à `test_07.wav`, `override_01.wav` à `override_07.wav`). La RAM disponible après le test était d'environ **2,2 Go**.

## 7. Générer **un paragraphe entier** avec Victoria originale

Créer un script qui charge exactement le même modèle et la même voix que le test officiel. On donne **tout le paragraphe en une fois** à `KPipeline` ; le pipeline peut lui-même retourner plusieurs segments. Ces segments sont concaténés dans l'ordre dans un **seul WAV**.

```bash
cd /opt/kikiri-victoria
source .venv/bin/activate

cat > victoria-original.py <<'PY'
import time
from pathlib import Path

import numpy as np
import torch
import soundfile as sf
from kokoro import KModel, KPipeline

torch.set_num_threads(2)

BASE = Path("/opt/kikiri-victoria")
MODEL = BASE / "kikiri_german_victoria_ep10.pth"
VOICE = BASE / "voices/victoria.pt"
CONFIG = BASE / "kikiri-source/training/config.json"
OUTPUT = BASE / "output/victoria-original-paragraphe.wav"

text = (
    "Guten Morgen! Schön, dass du heute hier bist. "
    "Gestern bin ich früh aufgestanden, weil ich einen wichtigen Termin in München hatte. "
    "Obwohl es draußen ziemlich kalt war, bin ich mit dem Fahrrad zum Bahnhof gefahren. "
    "Unterwegs habe ich eine freundliche Frau getroffen, die mich gefragt hat: "
    "Entschuldigung, könnten Sie mir bitte erklären, wie ich zum nächsten Krankenhaus komme? "
    "Natürlich habe ich ihr geholfen. "
    "Danach habe ich mir einen heißen Kaffee gekauft und ein frisches Brötchen gegessen. "
    "Weißt du, was mich besonders überrascht hat? "
    "Plötzlich fing es an zu schneien! "
    "Trotzdem war es ein wunderschöner Tag."
)

start = time.time()
print("Chargement Victoria originale...", flush=True)
model = KModel(
    repo_id="hexgrad/Kokoro-82M",
    config=str(CONFIG),
    model=str(MODEL),
)
model.eval()

pipeline = KPipeline(
    lang_code="d",
    repo_id="hexgrad/Kokoro-82M",
    model=model,
    device="cpu",
)

voice = torch.load(
    str(VOICE),
    map_location="cpu",
    weights_only=True,
)

print("Génération du paragraphe...", flush=True)
segments = []

with torch.inference_mode():
    for index, (graphemes, phonemes, audio) in enumerate(
        pipeline(text, voice=voice, speed=1.0),
        start=1,
    ):
        print(f"Segment {index}: {graphemes}", flush=True)
        if isinstance(audio, torch.Tensor):
            audio = audio.detach().cpu().numpy()
        segments.append(np.asarray(audio).reshape(-1))

if not segments:
    raise RuntimeError("Aucun audio généré")

combined = np.concatenate(segments)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
sf.write(str(OUTPUT), combined, 24000)

print(f"Fichier : {OUTPUT}", flush=True)
print(f"Durée : {len(combined) / 24000:.2f} secondes", flush=True)
print(f"Temps total : {time.time() - start:.2f} secondes", flush=True)
PY

OMP_NUM_THREADS=2 MKL_NUM_THREADS=2 python -u victoria-original.py
```

**Résultat du test réussi :** 2 segments générés automatiquement ; WAV de **37,15 secondes** en **29,08 secondes** de traitement total.

## 8. Convertir le WAV en MP3

```bash
cd /opt/kikiri-victoria

ffmpeg -y -loglevel error \
  -i output/victoria-original-paragraphe.wav \
  -codec:a libmp3lame \
  -b:a 96k \
  output/victoria-original-paragraphe.mp3

ls -lh output/victoria-original-paragraphe.mp3
```

Le résultat est un MP3 mono adapté au test d'écoute. Le bitrate **96 kb/s** a été retenu pour évaluer confortablement la qualité de la voix.

## 9. Récupérer le MP3 sur un PC Windows via SSH

**Sur le PC Windows**, ouvrir **PowerShell local** (pas dans la session SSH déjà connectée au VPS).

```powershell
scp root@IP_DE_TON_VPS:/opt/kikiri-victoria/output/victoria-original-paragraphe.mp3 "$env:USERPROFILE\Downloads\victoria-original-paragraphe.mp3"
```

Remplacer `IP_DE_TON_VPS` par la vraie adresse du serveur. Pour un port SSH personnalisé, ajouter `-P PORT` à `scp` ; pour une clé SSH particulière, ajouter `-i CHEMIN_VERS_LA_CLE`.

Ouvrir ensuite le MP3 dans **Téléchargements** et comparer la prononciation, la ponctuation et le rythme à la démo : https://huggingface.co/kikiri-tts/kikiri-german-victoria

## Récapitulatif de l'installation validée

| Élément | Configuration fonctionnelle |
|---|---|
| Modèle | `kikiri-tts/kikiri-german-victoria` (poids `.pth` originaux) |
| Voix | `voices/victoria.pt` |
| Moteur | Fork `semidark/kokoro` inclus comme sous-module de `semidark/kikiri-tts` |
| G2P allemand | Fork `semidark/misaki` avec `misaki.de.DEG2P` |
| Langue Kokoro | `lang_code="d"` |
| Calcul | PyTorch CPU, 2 threads |
| Génération | `KPipeline(text, voice=voice, speed=1.0)` |
| Sortie WAV | `output/victoria-original-paragraphe.wav` (24 kHz) |
| Sortie MP3 | `output/victoria-original-paragraphe.mp3` (96 kb/s) |
| Récupération | `scp` depuis PowerShell Windows |

**Note de reproductibilité :** les dépôts GitHub et paquets Python évoluent. Pour une reproduction exacte sur un autre VPS, figer les commits des sous-modules et les versions Python/PyTorch/Misaki après installation. Les étapes ci-dessus documentent le parcours qui a fonctionné sur le VPS testé ; elles ne constituent pas un script de déploiement de production.
