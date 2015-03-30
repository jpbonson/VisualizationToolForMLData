#!/usr/bin/env python
# vim:ts=4:sts=4:sw=4:et:wrap:ai:fileencoding=utf-8:

import ast
import os
import json
from os import listdir
from os.path import isfile, join
from flask import Flask, jsonify, render_template, request
from app.models.feature_filtering import FeatureFiltering

"""
Settings
"""
app = Flask(__name__)
app.config.from_object(__name__)

FILEPATH = "static/data/"
DATASETS = []

@app.route('/')
def index():
    fullpath = os.path.dirname(os.path.abspath(__file__))+"/"+FILEPATH
    DATASETS = [f for f in listdir(fullpath) if isfile(join(fullpath,f))]
    return render_template('index.html', filepath=FILEPATH, datasets=DATASETS)

@app.route('/automatic_filter', methods=['POST'])
def automatic_filter():
    app.logger.debug("Executing automatic filtering")
    algorithm_type = request.form.get("algorithm_type")
    threshold = float(request.form.get("threshold"))
    datafile = request.form.get("datafile")
    feature_filtering = FeatureFiltering(app, os.path.dirname(os.path.abspath(__file__))+"/"+datafile)
    mask = feature_filtering.run(algorithm_type, threshold)
    array = [int(x) for x in mask]
    if len(array) == 0:
        result = {'result': False, 'msg': "The algorithm filtered out all attributes. Choose other parameters or another method."}
    elif all(x==True for x in mask):
        result = {'result': False, 'msg': "The algorithm filtered no attributes. Choose other parameters or another method."}
    else:
        result = {'result': True, 'msg': str(array)}
    return jsonify(result)

"""
Run application
"""
if __name__ == '__main__':
    app.debug = True
    app.run()

# TODO (Optional):
# - fine-tune the histograms for greater zooms
# - refatorar CSS para a scatter matrix
# - refatorar CSS do star plot para ir para o arquivo .css
# - option to choose the size of the scatter matrix, so it can be better visualized for datasets with lots of features
# - filtering feature for classes, so the data for some classes could be hidden to remove noise
# - dynamic histograms that change the quantity of bars depending on the zoom
# - updated the histograms to use stacked bars, so each bar will have the quantity per range and per class
# - atualizar zoom para ser possivel clicar em uma mini-versao da scatter matrix (?)
# - fazer star plot funcionar para dados com valores negativos (?)
# - atualizar README para usar o projeto de portfolio (colocar link do linkedln no pdf do projeto)

# DONE (Main):
# - implement zooming + UI adaptation
# - implement automatic filtering + UI adaptation
# - implement the star plot (+ selection especifica do star plot)
# - star plot working with filtering
# - star plot working with selection in the scatter matrix

# DONE (Optional):
# - foi tomado cuidado para que a interacao das features entre si nao gerassem bugs (por exemplo, zoom em (0,1) seguido da filtragem da linha 0)
# - option to upload .csv files with datasets to the system (or select the filename from a list in the folder)

# bugs corrigidos:
# - o eixo x estava invertido
# - instabilidade no schema de cores dos charts