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