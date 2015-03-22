#!/usr/bin/env python
# vim:ts=4:sts=4:sw=4:et:wrap:ai:fileencoding=utf-8:

import ast
from flask import Flask, jsonify
from flask import render_template
from flask import request
from flask import session, redirect, url_for, escape
import json

"""
Settings
"""
app = Flask(__name__)
app.config.from_object(__name__)

@app.route('/')
def index():
    data_file = "static/data/iris.csv"
    return render_template('index.html', data_file=data_file)

"""
Run application
"""
if __name__ == '__main__':
    # app.debug = True
    app.run()

# TODOs:
# 
# Main Task List Summary:
# - implement automatic filtering + UI adaptation (usar ajax, e achar maneira de passar array entre cliente e server)
# - fine-tune the histograms for greater zooms
# - implement the star plot
# - star plot working with selection
# - star plot working with filtering

# Optional Task List Summary:
# - refatorar CSS para a scatter matrix
# - option to choose the size of the scatter matrix, so it can be better visualized for datasets with lots of features
# - option to upload .csv files with datasets to the system
# - filtering feature for classes, so the data for some classes could be hidden to remove noise
# - dynamic histograms that change the quantity of bars depending on the zoom
# - updated the histograms to use stacked bars, so each bar will have the quantity per range and per class
# - automatic feature extraction
# - atualizar zoom para ser possivel clicar em uma mini-versao da scatter matrix

# no star chart, comecar tentando entender e usar as bibliotecas
# priorizar mais o select do que o filter
# se nao estiver dando certo, substituir o star chart por um histograma


# DONE:
# - implement zooming + UI adaptation

# bugs corrigidos:
# - o eixo x estava invertido
# - instabilidade no schema de cores dos charts

# - foi tomado cuidado para que a interacao das features entre si nao gerassem bugs (por exemplo, zoom em (0,1) seguido da filtragem da linha 0)