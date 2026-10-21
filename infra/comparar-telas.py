"""Monta comparações reais sem alterar as referências ou as capturas de origem.

Executar após capturar-telas.mjs, com Python e Pillow. As molduras e os dados
das referências diferem da execução; não calcular similaridade como prova de aceite.
"""
from pathlib import Path
import json
import os
from PIL import Image, ImageDraw, ImageFont, ImageOps

raiz = Path(__file__).resolve().parents[1]
evidencias = raiz / os.environ.get('CAPTURE_OUTPUT_DIRECTORY', 'docs/evidencias/visual')
destino = evidencias / 'comparacoes'
destino.mkdir(parents=True, exist_ok=True)
manifesto = json.loads((evidencias / 'capturas.json').read_text(encoding='utf-8'))
fonte_windows = Path('C:/Windows/Fonts/arial.ttf')
fonte = ImageFont.truetype(str(fonte_windows), 18) if fonte_windows.exists() else ImageFont.load_default()
grupos = {'app': [], 'web': [], 'atividade': []}
for captura in sorted(manifesto['capturas'], key=lambda item: item['tela']):
    nome = captura['tela']
    grupo = nome.split('_')[0]
    if grupo == 'extra':
        continue  # Telas adicionais têm evidência própria; não inventar protótipo ausente.
    referencia = raiz / 'referencias_codex/telas' / f'{nome}.png'
    if not referencia.is_file():
        raise FileNotFoundError(f'Referência ausente: {nome}')
    largura, altura = (500, 352) if grupo == 'web' else (260, 520)
    par = Image.new('RGB', (largura * 2 + 36, altura + 76), '#eaf1f9')
    desenho = ImageDraw.Draw(par)
    desenho.text((12, 6), nome, fill='#00376b', font=fonte)
    for indice, (arquivo, titulo) in enumerate([(referencia, 'Referência'), (evidencias / captura['arquivo'], 'Implementação real')]):
        desenho.text((12 + indice * (largura + 12), 32), titulo, fill='#00376b', font=fonte)
        imagem = Image.open(arquivo).convert('RGB')
        imagem = ImageOps.contain(imagem, (largura, altura), Image.Resampling.LANCZOS)
        par.paste(imagem, (12 + indice * (largura + 12) + (largura - imagem.width)//2, 62 + (altura - imagem.height)//2))
    par.save(destino / f'{nome}.png')
    grupos[grupo].append(par)
for grupo, pares in grupos.items():
    largura, altura = pares[0].size
    colunas = 2
    linhas = (len(pares) + colunas - 1) // colunas
    painel = Image.new('RGB', (largura * colunas, altura * linhas), '#ffffff')
    for indice, par in enumerate(pares):
        painel.paste(par, ((indice % colunas) * largura, (indice // colunas) * altura))
    painel.save(destino / f'painel_{grupo}.png')
print(f'{sum(len(pares) for pares in grupos.values())} pares e 3 painéis gerados; nenhuma captura nativa fabricada.')
